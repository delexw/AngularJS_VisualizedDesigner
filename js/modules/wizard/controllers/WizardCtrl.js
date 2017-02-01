define(function () {
    return ['$scope', '$q', 'DEBUG', 'resourceService', 'ngDialog', wizardCtrl];
    function wizardCtrl($scope, $q, DEBUG, resourceService, ngDialog) {
        $scope.stock = {
            vehicles: [],
            tracks: [],
            facilities: [],
            personnel: [],
        }

        $scope.controls = {
            saveBtn: {
                isDisabled: false
            }
        };

        $scope.crm = {
            p: {
                id: ''
            }
        };

        /*for tip*/
        var tip = {
            info: {
                enable: false,
                message: ''
            },
            loading: {
                enable: false,
                message: ''
            }
        };

        //check the global varaible 'DEBUG' to determine whether start debugger
        if (DEBUG) {
            debugger
        }

        $scope._beforeSave = function () {
            /*CRM query string object*/
            var crmQuery = {
                typename: '',
                type: '',
                id: '',
                orgname: '',
                userlcid: '',
                orglcid: '',
                Init: function (search) {
                    var main = this;
                    var subSearch = search.substr(1);
                    _.each(subSearch.split('&'), function (expression) {
                        var seg = expression.split('=');
                        main[seg[0]] = seg[1];
                    });
                    return main;
                }
            }

            var query = crmQuery.Init(window.location.search);
            if (query.id === '') {
                throw new Error('To enable this content, save the record');
            }
            else {
                //remove %7b and %7d
                query.id = query.id.substr(3, query.id.length - 6);
                $scope.crm = {
                    p: query
                };
            }
            return query;
        }

        // this function loads the stock items (currently from fixed data structure)
        var load = function () {
            try {
                //#####
                //In dev enviorment especially only frontend, don't run _beforeSave() and retrieve data from server
                //#####

                //$scope._beforeSave();
                // place any code here to load the stock items, then transform them to
                // this schema and save within $scope.stock
                //var promise = resourceService.instance.retrieveAll();
                //promise.then(function (data) {
                    //$scope.stock.vehicles = _.find(data, 'vehicles').vehicles;
                    //$scope.stock.tracks = _.find(data, 'tracks').tracks;
                    //$scope.stock.facilities = _.find(data, 'facilities').facilities;
                    //$scope.stock.personnel = _.find(data, 'personnel').personnel;
                    //$scope.Init();
                //}, function (error) { alert(error); });

                //var p = resourceService.instance.loadAllResouceGroup();
                //resourceService.instance.retrieveVehicles(p);
                // to load application data, do the opposite process to saving
                // if you don't supply any of the variables, sensible defaults are in place

                // $scope.day.start = *; (star is moment.js time)
                // $scope.day.end = *; (star is moment.js time)
                // $scope.eventSession = $scope.convertConfigurationFromListFormat(*); (star is event session object in list format)
                // $scope.sessions = _.map(*,$scope.convertConfigurationFromListFormat); (star is session object array in list format)
            }
            catch (error) {
                ngDialog.open({
                    template: '../js/modules/wizard/templates/tip.html',
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    controller: ['$scope', function ($scope) {
                        tip.info = {
                            enable: true,
                            message: error.message
                        }
                        tip.loading = {
                            enable: false,
                            message: ''
                        }

                        $scope.tip = tip;
                    }]
                })
            }

        };
        load();



        $scope._afterSave = function () {
            /*reload Event Package edit page*/
            window.parent.location.reload();
        }
        // this function saves the configuration
        $scope.save = function () {

            try {
                $scope.controls.saveBtn.isDisabled = true;

                ngDialog.open({
                    template: '../js/modules/wizard/templates/tip.html',
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    controller: ['$scope', function ($scope) {
                        tip.info = {
                            enable: false,
                            message: ''
                        }
                        tip.loading = {
                            enable: true,
                            message: 'Working...'
                        }
                        $scope.tip = tip;
                    }]
                })

                var queryParams = $scope.crm.p;
                console.log('saving');

                // in this variable you can find the event start
                //console.log($scope.day.start);
                // in this variable you can find the event end
                //console.log($scope.day.end);
                // within this variable, event resources configuration is stored
                //console.log($scope.eventSession);
                // within this variable, all session resources configuration is stored
                // stock items are referenced by key (=resourceNo?)
                //console.log($scope.sessions);

                // to get session information in list format, you must pass it
                // through function convertConfigurationToListFormat()
                var listFormatEventSession = $scope.convertConfigurationToListFormat($scope.eventSession);
                //console.log($scope.convertConfigurationToListFormat($scope.eventSession));
                // to have all sessions in this format, you can have them all converted like this
                var listFormatSessions = _.map($scope.sessions, $scope.convertConfigurationToListFormat);

                //listFormatSessions.unshift($scope.eventSession);

                console.log(JSON.stringify(listFormatEventSession));
                console.log(JSON.stringify(listFormatSessions));

                /*prepare dynamics crm objects*/
                var crmContext = resourceService.instance.crmContext();
                /*get bunisess unit id first*/
                var preData = $q.all([
                    resourceService.instance.retrieveBusinessUnitFromCurrentUser(crmContext.getUserId()),
                    resourceService.instance.retrieveEntityMetaData('ConstraintBasedGroup')
                ])
                preData.then(function (pre) {
                    var bid = pre[0];
                    var resgpMetaData = pre[1];
                    //var sections = [];
                    //var services = [];
                    var resourceSpec = [];
                    var groups = [];
                    /*
                     * Create sections
                     */
                    /*
                     * prepare section entity
                     */
                    _.each(listFormatSessions, function (session) {
                        /*constructer resource specification entity for section*/
                        resourceSpec.push({
                            Name: 'Selection Rule' /*default name*/,
                            EffortRequired: 1/* minimun required effort*/,
                            ObjectiveExpression: '<Expression><Body>udf "Random"(factory,resource,appointment,request,leftoffset,rightoffset)</Body><Parameters><Parameter name="factory" /><Parameter name="resource" /><Parameter name="appointment" /><Parameter name="request" /><Parameter name="leftoffset" /><Parameter name="rightoffset" /></Parameters><Properties EvaluationInterval="P0D" evaluationcost="0" /></Expression>' /*default value if resources have not been added*/,
                            RequiredCount: -1/*root resource required, -1 indicates required all */,
                            SameSite: true /*all resources come from same site*/,
                            BusinessUnitId: { Id: bid, LogicalName: 'businessunit' },
                            ObjectTypeCode: 'constraintbasedgroup',
                            /*one resourceSpec to many services*/
                            resource_spec_services: [{
                                Duration: session.duration * 60 /*minutes*/,
                                Name: session.name + ' - Service',
                                InitialStatusCode: { Value: 6 } /*In Progress*/,
                                Granularity: 'FREQ=MINUTELY;INTERVAL=15;' /*default: start activity every 15 mins?*/,
                                AnchorOffset: resourceSpec.length === 0 ? $scope.day.start.diff(moment().startOf('day'), 'minutes') :
                                    resourceSpec[resourceSpec.length - 1].resource_spec_services[resourceSpec[resourceSpec.length - 1].resource_spec_services.length - 1].AnchorOffset +
                                    resourceSpec[resourceSpec.length - 1].resource_spec_services[resourceSpec[resourceSpec.length - 1].resource_spec_services.length - 1].Duration/*start at, use previous one's AnchorOffset + previous session's duration as current service's AnchorOffset*/,
                                IsSchedulable: true,
                                IsVisible: true,
                                /*one service to many event sections*/
                                cf_service_cf_eventsection_SectionOwningService: [{
                                    cf_ExecutionNumber: _.indexOf(listFormatSessions, session) + 1,
                                    cf_name: session.name,
                                    cf_ParentPackageId: { Id: queryParams.id, LogicalName: 'cf_eventpackage' }
                                }]
                            }]
                        });

                        /*constructer resource group entity*/
                        /*one group to many resource specifications*/
                        groups.push({
                            BusinessUnitId: { Id: bid, LogicalName: 'businessunit' },
                            Constraints: '<Constraints><Constraint><Expression><Body>false</Body><Parameters><Parameter name="resource" /></Parameters></Expression></Constraint></Constraints>'/*default if no associated resources*/,
                            GroupTypeCode: { Value: 2 }/*hidden type*/,
                            Name: 'Selection Rule'/*default name*/
                        })
                    });

                    var sectionPromise = $scope._createEntity(groups, resourceSpec);
                    var sectionFinalPromise = null;
                    if (sectionPromise != null) {
                        sectionFinalPromise = sectionPromise.then(function (newResourceSpec) {
                            var _sectionFinalPromise = [];
                            _.each(newResourceSpec, function (resourceSpecObject) {
                                /*create required resources for service*/
                                var createRequiredServicePromise = $scope.createRequiredResourcesForService(listFormatSessions[resourceSpecObject[0]], bid).then(function (ids) {
                                    var updator = new resourceService.instance.updator('ConstraintBasedGroup');
                                    return updator.update(resourceSpecObject[1].GroupObjectId, {
                                        Constraints: $scope._convertConfigurationToResourceGroupConstraintsXml(ids)
                                    });
                                });

                                _sectionFinalPromise.push(createRequiredServicePromise);
                            })

                            return $q.all(_sectionFinalPromise);
                        });
                    }

                    /*
                     * Create event service
                     */
                    /*
                     * prepare event service entity
                     */
                    var resourceSpecForPackage = [];
                    var groupsForPackage = [];
                    groupsForPackage.push({
                        BusinessUnitId: { Id: bid, LogicalName: 'businessunit' },
                        Constraints: '<Constraints><Constraint><Expression><Body>false</Body><Parameters><Parameter name="resource" /></Parameters></Expression></Constraint></Constraints>'/*default if no associated resources*/,
                        GroupTypeCode: { Value: 2 }/*hidden type*/,
                        Name: 'Selection Rule'/*default name*/
                    });
                    resourceSpecForPackage.push({
                        Name: 'Selection Rule' /*default name*/,
                        EffortRequired: 1/* minimun required effort*/,
                        ObjectiveExpression: '<Expression><Body>udf "Random"(factory,resource,appointment,request,leftoffset,rightoffset)</Body><Parameters><Parameter name="factory" /><Parameter name="resource" /><Parameter name="appointment" /><Parameter name="request" /><Parameter name="leftoffset" /><Parameter name="rightoffset" /></Parameters><Properties EvaluationInterval="P0D" evaluationcost="0" /></Expression>' /*default value if resources have not been added*/,
                        RequiredCount: -1/*root resource required, -1 indicates required all */,
                        SameSite: true /*all resources come from same site*/,
                        BusinessUnitId: { Id: bid, LogicalName: 'businessunit' },
                        ObjectTypeCode: 'constraintbasedgroup',
                        /*one resourceSpec to many services*/
                        resource_spec_services: [{
                            Duration: listFormatEventSession.duration * 60 /*minutes*/,
                            Name: listFormatEventSession.name + ' - Service',
                            InitialStatusCode: { Value: 6 } /*In Progress*/,
                            Granularity: 'FREQ=MINUTELY;INTERVAL=15;' /*default: start activity every 15 mins?*/,
                            AnchorOffset: $scope.day.start.diff(moment().startOf('day'), 'minutes'),
                            IsSchedulable: true,
                            IsVisible: true
                        }]
                    });

                    var eventPromise = $scope._createEntity(groupsForPackage, resourceSpecForPackage);
                    var eventFinalPromise = null
                    if (eventPromise !== null) {
                        eventFinalPromise = eventPromise.then(function (newResourceSpec) {
                            /*update event package with event package service id*/
                            /*only has one resource specification*/
                            var getServiceUri = newResourceSpec[0][1].resource_spec_services.__deferred.uri
                            var updateEventPromise = resourceService.instance.retrieveEntity(getServiceUri).then(function (service) {
                                var updator = new resourceService.instance.updator('cf_eventpackage');
                                return updator.update(queryParams.id, {
                                    /*only has one service*/
                                    cf_PackageOwningService: { Id: service.data.d.results[0].ServiceId, LogicalName: 'service' }
                                });
                            })

                            /*create required resources for service*/
                            var createRequiredServicePromise = $scope.createRequiredResourcesForService(listFormatEventSession, bid).then(function (ids) {
                                var updator = new resourceService.instance.updator('ConstraintBasedGroup');
                                return updator.update(newResourceSpec[0][1].GroupObjectId, {
                                    Constraints: $scope._convertConfigurationToResourceGroupConstraintsXml(ids)
                                });
                            });

                            return $q.all([updateEventPromise, createRequiredServicePromise]);
                        });
                    }

                    $q.all([sectionFinalPromise, eventFinalPromise]).then(function (data) {
                        /*don't need care about data*/
                        $scope._afterSave();
                    })


                }, function (error) {
                    alert(error);
                });
            }
            catch (error) {
                alert(error.message);
            }
            // to do the reverse process (while loading for example), use it like this
            // var mapFormat = _.map(listFormat,$scope.convertConfigurationFromListFormat);
        };

        $scope._convertConfigurationToResourceGroupConstraintsXml = function (resourceIds) {
            var _constraintsBody = '';
            var _tail = ' || ';
            if (resourceIds.length > 0) {
                _constraintsBody = '';
                _.each(resourceIds, function (id) {
                    _constraintsBody = _constraintsBody + 'resource["Id"] == {' + id + '}' + _tail;
                })
                _constraintsBody = _constraintsBody.substr(0, _constraintsBody.length - _tail.length);
            }
            else {
                _constraintsBody = 'false';

            }
            var _constraintsBodyXml = '<Body>' + _constraintsBody + '</Body>';
            var _constraintsXml = '<Constraints><Constraint><Expression>' + _constraintsBodyXml + '<Parameters><Parameter name="resource" /></Parameters></Expression></Constraint></Constraints>';
            return _constraintsXml;
        }

        $scope.createRequiredResourcesForService = function (configuration, businessUnitId) {
            /*new structor for required resource hirerachy*/
            /*e.g group[0]'s childNode is _childNotes[0]
             *    group[0]'s associated ResourceSpec is resourceSpec[0]
             */
            var root = {
                group: [],/*contains ConstraintBasedGroup entities*/
                resourceSpec: [],/*contains ResourceSpec entities with each of which each of ConstraintBasedGroup is associated*/
                resourceIds: []/*current root(ConstraintBasedGroup)'s Constraints*/,
                _childNotes: []/*contains one or more subnode which's structor is same as root, one group is asscoited with on subnode with same index of array*/
            };

            $scope._convertConfigurationToResourceGroups(root, configuration.configuration.vehicles, businessUnitId);
            $scope._convertConfigurationToResourceGroups(root, configuration.configuration.tracks, businessUnitId);
            $scope._convertConfigurationToResourceGroups(root, configuration.configuration.facilities, businessUnitId);
            $scope._convertConfigurationToResourceGroups(root, configuration.configuration.personnel, businessUnitId);

            var groupCreator = new resourceService.instance.creator('ConstraintBasedGroup');
            var resourceSepcCreator = new resourceService.instance.creator('ResourceSpec');
            _.each(root.group, function (g, index) {
                /*
                Create group
                */
                //var indexPromise = $q.when(index);
                g.Constraints = $scope._convertConfigurationToResourceGroupConstraintsXml(root._childNotes[index].resourceIds);
            })

            var groupPromises = groupCreator.create(root.group);

            var specPromises = groupPromises.then(function (groups) {
                //var _specPromises = [];
                _.each(groups, function (groupObject) {
                    /*
                    Create specification
                    */
                    root.resourceSpec[groupObject[0]].GroupObjectId = groupObject[1].ConstraintBasedGroupId;
                    //_specPromises.push(resourceSepcCreator.create([root.resourceSpec[groupObject[0]]]));
                })
                return resourceSepcCreator.create(root.resourceSpec);
                //return $q.all(_specPromises);
            })

            var resourcePromises = specPromises.then(function (resourceSpecs) {
                var _resourcePromises = [];
                _.each(resourceSpecs, function (specObject) {
                    /*
                    retrieve resource with sepecification id
                    */
                    _resourcePromises.push(resourceService.instance.retrieveOneWithAllColumns(specObject[1].ResourceSpecId, 'Resource'));
                })

                return $q.all(_resourcePromises);
            })

            var resourceIdsPromises = resourcePromises.then(function (resources) {
                _.each(resources, function (resourceObj) {
                    root.resourceIds.push(resourceObj.ResourceId);
                })

                return root.resourceIds;
            })

            return resourceIdsPromises;
        }

        $scope._convertConfigurationToResourceGroups = function (parentGroup, configurations, businessUnitId) {

            _.each(configurations, function (f) {
                /*leaf node dosen't contain property hasSelected*/
                if (f.hasSelected) {
                    var pGroup = {
                        BusinessUnitId: { Id: businessUnitId, LogicalName: 'businessunit' },
                        Constraints: ''/*default if no associated resources*/,
                        GroupTypeCode: { Value: 2 }/*hidden type*/,
                        Name: 'Selection Rule'/*default name*/
                    };
                    var resourceSpec = {
                        Name: 'Selection Rule' /*default name*/,
                        EffortRequired: 1/* minimun required effort*/,
                        ObjectiveExpression: '<Expression><Body>udf "Random"(factory,resource,appointment,request,leftoffset,rightoffset)</Body><Parameters><Parameter name="factory" /><Parameter name="resource" /><Parameter name="appointment" /><Parameter name="request" /><Parameter name="leftoffset" /><Parameter name="rightoffset" /></Parameters><Properties EvaluationInterval="P0D" evaluationcost="0" /></Expression>' /*default value if resources have not been added*/,
                        RequiredCount: f.count/*root resource required, -1 indicates required all */,
                        SameSite: true /*all resources come from same site*/,
                        BusinessUnitId: { Id: businessUnitId, LogicalName: 'businessunit' },
                        ObjectTypeCode: 'constraintbasedgroup'
                    }
                    parentGroup.resourceSpec.push(resourceSpec);
                    parentGroup.group.push(pGroup);

                    var childNode = {
                        group: [],
                        resourceSpec: [],
                        resourceIds: [],
                        _childNotes: {}
                    };
                    parentGroup._childNotes.push(childNode);

                    /*vehicle node*/
                    if (f.models) {
                        $scope._convertConfigurationToResourceGroups(childNode, f.models, businessUnitId);
                    }
                        /*facility or personnel node*/
                    else if (f.specific) {
                        if (f.type && f.type === 'generic') {
                            /*personnel*/
                            $scope._convertConfigurationToResourceGroups(childNode, [{ key: f.key, value: true }], businessUnitId);
                        }
                        else {
                            $scope._convertConfigurationToResourceGroups(childNode, f.specific, businessUnitId);
                        }
                    }
                }
                else {
                    /*track node or other leaf nodes*/
                    /*leaf node is seletcted*/
                    if (f.value === true) {
                        parentGroup.resourceIds.push(f.key);
                    }
                }

            });

        }

        $scope._createEntity = function (groups, resourceSpec) {
            /*Create resource group first since dosen't support use deep insert for ResourceSpec*/
            if (groups.length > 0 && resourceSpec.length > 0) {
                var groupCreator = new resourceService.instance.creator('ConstraintBasedGroup');
                return groupCreator.create(groups).then(function (newGroups) {
                    _.each(newGroups, function (newGroup) {
                        resourceSpec[newGroup[0]].GroupObjectId = newGroup[1].ConstraintBasedGroupId;
                    })
                    var resourceSepcCreator = new resourceService.instance.creator('ResourceSpec');
                    return resourceSepcCreator.create(resourceSpec)
                }, function (error) {
                    alert(error);
                })
            }
            return null;
        }

        $scope.convertConfigurationFromListFormat = function (configuration) {
            var cfg = _.cloneDeep(configuration);

            var vehicleMap = {};
            _.each(cfg.configuration.vehicles, function (vehicle) {
                vehicleMap[vehicle.key] = {
                    count: vehicle.count,
                    allModels: vehicle.allModels,
                    models: {}
                };
                _.each(vehicle.models, function (model) {
                    vehicleMap[vehicle.key].models[model.key] = model.value;
                });
            });
            cfg.configuration.vehicles = vehicleMap;

            var tracksMap = {};
            _.each(cfg.configuration.tracks, function (track) {
                tracksMap[track.key] = track.value;
            });
            cfg.configuration.tracks = tracksMap;

            var facilityMap = {};
            _.each(cfg.configuration.facilities, function (facility) {
                facilityMap[facility.key] = {
                    count: facility.count,
                    allSpecific: facility.allSpecific,
                    specific: {}
                };
                _.each(facility.specific, function (specific) {
                    facilityMap[facility.key].specific[specific.key] = specific.value;
                });
            });
            cfg.configuration.facilities = facilityMap;

            var personMap = {};
            _.each(cfg.configuration.personnel, function (person) {
                personMap[person.key] = {
                    count: person.count,
                    allSpecific: person.allSpecific,
                    specific: {}
                };
                _.each(person.specific, function (specific) {
                    personMap[person.key].specific[specific.key] = specific.value;
                });
            });
            cfg.configuration.personnel = personMap;

            return cfg;
        };

        $scope.convertConfigurationToListFormat = function (configuration) {
            var cfg = _.cloneDeep(configuration);

            var vehicleList = [];
            _.each(cfg.configuration.vehicles, function (vehicle, key) {
                var vehicleListItem = {
                    key: key,
                    count: vehicle.count,
                    allModels: vehicle.allModels,
                    hasSelected: false,
                    models: []
                };
                _.each(vehicle.models, function (model, key2) {
                    vehicleListItem.models.push({
                        key: key2,
                        value: model
                    });

                    if (!vehicleListItem.hasSelected && model) {
                        vehicleListItem.hasSelected = true;
                    }
                });
                vehicleList.push(vehicleListItem);
            });
            cfg.configuration.vehicles = vehicleList;

            var tracksList = [];
            _.each(cfg.configuration.tracks, function (track, key) {
                tracksList.push({
                    key: key,
                    value: track
                });
            });
            cfg.configuration.tracks = tracksList;

            var facilityList = [];
            _.each(cfg.configuration.facilities, function (facility, key) {
                var facilityListItem = {
                    key: key,
                    count: facility.count,
                    allSpecific: facility.allSpecific,
                    hasSelected: false,
                    specific: []
                };
                _.each(facility.specific, function (model, key2) {
                    facilityListItem.specific.push({
                        key: key2,
                        value: model
                    });

                    if (!facilityListItem.hasSelected && model) {
                        facilityListItem.hasSelected = true;
                    }
                });
                facilityList.push(facilityListItem);
            });
            cfg.configuration.facilities = facilityList;

            var personList = [];
            _.each(cfg.configuration.personnel, function (person, key) {
                var personListItem = {
                    key: key,
                    count: person.count,
                    allSpecific: typeof person.allSpecific !== 'undefined' ? person.allSpecific : false,
                    hasSelected: person.count > 0 ? true : false,
                    type: person.type
                };
                if ('specific' in person) {
                    personListItem.specific = [];
                    _.each(person.specific, function (model, key2) {
                        personListItem.specific.push({
                            key: key2,
                            value: model
                        });

                        if (!personListItem.hasSelected && model) {
                            personListItem.hasSelected = true;
                        }
                    });
                }
                personList.push(personListItem);
            });
            cfg.configuration.personnel = personList;

            return cfg;
        };

        $scope.bounds = {
            start: moment().startOf('day').hours(8),
            end: moment().startOf('day').hours(18)
        };

        $scope.day = {
            start: moment().startOf('day').hours(8),
            end: moment().startOf('day').hours(18)
        };

        $scope.getPackageTimes = function (type) {
            var times = [];
            var time;
            if (type == "from") {
                for (time = moment().startOf('day').hours(6) ; !time.isSame($scope.bounds.end) ; time.add('minutes', 30)) {
                    if ($scope.day.end.diff(time, 'hours', true) >= $scope.getTotalHours())
                        times.push(moment(time));
                }
            } else if (type == "to") {
                for (time = moment($scope.bounds.start).add('minutes', 30) ; !time.isAfter(moment().startOf('day').hours(22)) ; time.add('minutes', 30)) {
                    if (time.diff($scope.day.start, 'hours', true) >= $scope.getTotalHours())
                        times.push(moment(time));
                }
            }
            return times;
        };

        $scope.getHours = function () {
            return $scope.day.end.diff($scope.day.start, 'hours', true);
        };

        $scope.getTimes = function () {
            var times = [];
            for (var hour = moment($scope.day.start) ; !hour.isAfter($scope.day.end) ; hour.add('hours', 1)) {
                times.push(hour.format('h:mm a'));
            }
            return times;
        };

        $scope.getRemainingHours = function (excludedSession) {
            return _.reduce($scope.sessions, function (sum, session) {
                if (session != excludedSession)
                    return sum - session.duration;
                else
                    return sum;
            }, $scope.getHours());
        };

        $scope.getTotalHours = function () {
            return _.reduce($scope.sessions, function (sum, session) {
                return sum + session.duration;
            }, 0);
        };

        $scope.getAllModels = function () {
            _.each($scope.currentSession.configuration.vehicles, function (vehicle, index) {
                vehicle.allModels = true;
                _.each(vehicle.models, function (model, index) {
                    if (model === false) {
                        vehicle.allModels = false;
                        return false;
                    }
                });
            });
        };

        $scope.getAllModelsPerCar = function (carKey, modelKey) {
            var vehicle = $scope.currentSession.configuration.vehicles[carKey];
            vehicle.allModels = true;
            _.each(vehicle.models, function (model, index) {
                if (index == modelKey) {
                    model = !model;
                }
                if (model === false) {
                    vehicle.allModels = false;
                    return false;
                }
            });
        };

        $scope.setAllModels = function (carKey) {
            var vehicle = $scope.currentSession.configuration.vehicles[carKey];
            _.each(vehicle.models, function (model, index) {
                vehicle.models[index] = !vehicle.allModels;
            });
        };

        $scope.setAllModelsIfNone = function (carKey) {
            var vehicle = $scope.currentSession.configuration.vehicles[carKey];
            if (_.all(vehicle.models, function (model, index) {
                return !model;
            })) {
                $scope.setAllModels(carKey);
                vehicle.allModels = true;
            }
        };

        $scope.getAllSpecific = function () {
            _.each($scope.currentSession.configuration.facilities, function (facility, index) {
                facility.allSpecific = true;
                _.each(facility.specific, function (specific, index) {
                    if (specific === false) {
                        facility.allSpecific = false;
                        return false;
                    }
                });
            });
        };

        $scope.getAllSpecificPerFacility = function (facilityKey, specificKey) {
            var facility = $scope.currentSession.configuration.facilities[facilityKey];
            facility.allSpecific = true;
            _.each(facility.specific, function (specific, index) {
                if (index == specificKey) {
                    specific = !specific;
                }
                if (specific === false) {
                    facility.allSpecific = false;
                    return false;
                }
            });
        };

        $scope.setAllSpecific = function (facilityKey) {
            var facility = $scope.currentSession.configuration.facilities[facilityKey];
            _.each(facility.specific, function (item, index) {
                facility.specific[index] = !facility.allSpecific;
            });
        };

        $scope.setAllSpecificIfNone = function (facilityKey) {
            var facility = $scope.currentSession.configuration.facilities[facilityKey];
            if (_.all(facility.specific, function (item) {
                return !item;
            })) {
                $scope.setAllSpecific(facilityKey);
                facility.allSpecific = true;
            }
        };

        $scope.getAllSpecificPerPerson = function (personKey, specificKey) {
            var person = $scope.currentSession.configuration.personnel[personKey];
            person.allSpecific = true;
            _.each(person.specific, function (specific, index) {
                if (index == specificKey) {
                    specific = !specific;
                }
                if (specific === false) {
                    person.allSpecific = false;
                    return false;
                }
            });
        };

        $scope.setAllSpecificPersonnel = function (personKey) {
            var person = $scope.currentSession.configuration.personnel[personKey];
            _.each(person.specific, function (item, index) {
                person.specific[index] = !person.allSpecific;
            });
        };

        $scope.setAllSpecificPersonnelIfNone = function (personKey) {
            var person = $scope.currentSession.configuration.personnel[personKey];
            if (_.all(person.specific, function (item) {
                return !item;
            })) {
                $scope.setAllSpecificPersonnel(personKey);
                person.allSpecific = true;
            }
        };

        $scope.selectSession = function (session) {
            $scope.page = 0;
            $scope.currentSession = session;
            $scope.getAllModels();
            $scope.step = 1;
        };

        $scope.newSession = function () {
            var session = {
                name: 'New Session ' + ($scope.sessions ? $scope.sessions.length + 1 : '1'),
                duration: 0.5,
                configuration: {
                    vehicles: {},
                    tracks: {},
                    facilities: {},
                    personnel: {}
                }
            };

            _.each($scope.stock.vehicles, function (vehicle) {
                session.configuration.vehicles[vehicle.key] = {
                    count: vehicle.count,
                    models: {}
                };
                _.each(vehicle.models, function (model) {
                    session.configuration.vehicles[vehicle.key].models[model.key] = false;
                });
            });

            _.each($scope.stock.tracks, function (track) {
                session.configuration.tracks[track.key] = false;
            });

            _.each($scope.stock.facilities, function (facility) {
                session.configuration.facilities[facility.key] = {
                    count: 0,
                    specific: {}
                };
                _.each(facility.specific, function (specificFacility) {
                    session.configuration.facilities[facility.key].specific[specificFacility.key] = false;
                });
            });

            _.each($scope.stock.personnel, function (person) {
                session.configuration.personnel[person.key] = {
                    count: 0,
                    specific: {},
                    type: person.type
                };
                if ('specific' in person) {
                    _.each(person.specific, function (specificPerson) {
                        session.configuration.personnel[person.key].specific[specificPerson.key] = false;
                    });
                }
            });
            //console.log(JSON.stringify(session));
            return session;
        };

        $scope.createSession = function () {
            var session = $scope.newSession();
            session.type = 'session';

            $scope.sessions.push(session);
            $scope.selectSession(session);
        };

        $scope.deleteCurrentSession = function () {
            _.remove($scope.sessions, $scope.currentSession);
            if ($scope.sessions.length > 0)
                $scope.selectSession($scope.sessions[$scope.sessions.length - 1]);
            else
                $scope.selectSession($scope.eventSession);
        };

        $scope.summaryStart = function () {
            try {
                //$scope._beforeSave();
                $scope.page = 1;
                var time = new Date($scope.day.start);
                _.each($scope.sessions, function (session) {
                    session.startTime = time;
                    time = new Date(session.startTime.getTime() + session.duration * 60000 * 60);
                    session.endTime = time;
                });
                $scope.eventSession.startTime = new Date($scope.day.start);
                $scope.eventSession.endTime = new Date($scope.day.end);
            }
            catch (error) {
                alert(error.message);
            }
        };

        $scope.summaryEnd = function () {
            $scope.page = 0;
        };
        $scope.saveOpenConfirm = function () {
            $scope.page = 2;
        };

        $scope.sessions = [];
        $scope.eventSession = {
            type: '',
            name: ''
        };
        $scope.currentSession = {};

        $scope.Init = function () {
            $scope.step = 1;
            $scope.page = 0;

            $scope.eventSession = $scope.newSession();
            $scope.eventSession.duration = $scope.day.end.diff($scope.day.start, 'hours', true);
            $scope.eventSession.type = 'event';
            $scope.eventSession.name = 'Event Resources';
            $scope.currentSession = $scope.eventSession;

            $scope.getAllModels();
            $scope.getAllSpecific();
        }


        $scope.getAllSessions = function () {
            var allSessions = $scope.sessions.slice(0);
            allSessions.unshift($scope.eventSession);
            return allSessions;
        };

        $scope.eventSessionDurationChanged = function(type)
        {
            if (type === 'from') {
                $scope.bounds.start = $scope.day.start;
            }
            else if (type === 'to') {
                $scope.bounds.end = $scope.day.end;
            }

            $scope.eventSession.duration = $scope.day.end.diff($scope.day.start, 'hours', true);
        }
    }
});