define(function () {
    return ['$q', '$http', 'crmSDK', 'crmSDKMetaData', 'xml2json', resourceService];
    function resourceService($q, $http, crmSDK, crmSDKMetaData, xml2json) {
        /*format AssociatedResourceId to array*/
        _getAssociatedResourceIds = function (resource) {
            if (!resource) {
                alert('resource is null in _getAssociatedResourceId');
                return null;
            }
            //Constraints contain resources which one resource group is associated with
            var j = xml2json.xml_str2json(resource.constraintbasedgroup_resource_groups.Constraints);
            //Get body from constraint
            var body = j.Constraints.Constraint.Expression.Body;
            var items = body.split('||');
            var values = _.map(items, function (i) {
                var value = i.split('==')[1];
                return value.substring(value.indexOf('{') + 1, value.indexOf('}'));
            });

            return values;
        }

        _defferedWrapper = function (delegation) {
            //defer object
            var deferred = $q.defer();

            if (typeof delegation != 'function') {
                throw new Exception('delegation must be a method');
            }
            delegation.call(this, deferred);

            return deferred.promise;
        }

        _noSpaceString = function (string) {
            var match = /\W+/gi;
            return string.replace(match, '').toLowerCase();  
        }

        /*for public using*/
        this.defferedInvoker = function (delegation) {
            return _defferedWrapper.call(this, delegation);
        }

        /*fixed resource group names*/
        /*Change their values if the corresponding value in CRM Resource Group are changed*/
        /*these group names are as the root of resource hierarchy*/
        var resourceType = {
            vehicle: 'Vehicle',
            track: 'Circuit Group',
            facility: 'Facility',
            personnelGeneric: 'Personnel Generic',
            personnelSpecific: 'Personnel Specific'
        };

        /*instance of resource service*/
        this.instance = {
            retrieveEntity: function (oDataUri) {
                return $http.get(oDataUri);
            },
            retrieveAll: function () {
                /*run all operations to retrieve all data and return deffered*/
                var promise = this.loadAllResouceGroup();
                return $q.all([
                    this.retrieveVehicles(promise).then(function (vs) {
                        return { vehicles: vs };
                    }),
                    this.retrieveTracks(promise).then(function (ts) {
                        return { tracks: ts };
                    }),
                    this.retrieveFacility(promise).then(function (fs) {
                        return { facilities: fs };
                    }),
                    this.retrievePersonnel(promise).then(function (ps) {
                        return { personnel: ps };
                    })
                ]);
            },
            loadAllResouceGroup: function () {
                //defer object
                var deferred = $q.defer();

                this._loadAllResouceGroupAsync(deferred);

                return deferred.promise;
            },
            _loadAllResouceGroupAsync: function (deferred) {
                var resourceGroups = [];
                var queryString = '&$filter=(GroupTypeCode/Value eq 0) and (Name eq \'' +
                    resourceType.vehicle + '\' or Name eq \'' +
                    resourceType.track + '\' or Name eq \'' +
                    resourceType.facility + '\' or Name eq \'' +
                    resourceType.personnelGeneric + '\'or Name eq \'' +
                    resourceType.personnelSpecific + '\')';

                var selectString = '$select=Name,ResourceGroupId,constraintbasedgroup_resource_groups';
                crmSDK.REST.retrieveMultipleRecords('ResourceGroup', selectString + queryString + '&$expand=constraintbasedgroup_resource_groups', function (data) {
                    _.each(data, function (d) {
                        resourceGroups.push(d);
                    });
                }, function (error) {
                    alert(error.message);
                }, function () {
                    //all have been loaded and construct new entity hierarchy for angularJs
                    if (deferred) {
                        deferred.resolve(resourceGroups);
                    }
                });
            },
            _retrieveResouceGroup: function (promise, type) {
                return promise.then(function (result) {
                    //Shoud be only one group
                    var v = _.find(result, { Name: type });
                    return v;
                }, function (error) {
                    alert(error);
                });
            },
            _retrieveSubResouceGroup: function (promise) {
                var mainContext = this;
                return promise.then(function (results) {
                    var _subResouceGroup = [];
                    var queryStrings = queryBuilder.resourceGroupQueryStringBuilder.queryStrings(results);
                    var subResouceGroupPromises = [];
                    //queryStrings.length might be great than 1, combine all of objects
                    var sendQueryRequestFunc = function (queryString, deffered, subResouceGroup) {
                        crmSDK.REST.retrieveMultipleRecords('ResourceGroup', queryString, function (data) {
                            _.each(data, function (d) {
                                subResouceGroup.push(d);
                            });
                        }, function (error) {
                            alert(error.message);
                        }, function () {
                            deffered.resolve(subResouceGroup);
                        });
                    };

                    _.each(queryStrings, function (queryString) {

                        subResouceGroupPromises.push(_defferedWrapper(function (deffered) {
                            sendQueryRequestFunc(queryString, deffered, _subResouceGroup);
                        }));

                    })
                    /*get all merged data*/
                    return $q.all(subResouceGroupPromises).then(function (groups) {
                        //one or more same objects will be passed into here, any one is ok
                        return groups[0];
                    }, function (error) {
                        alert(error);
                    });

                }, function (error) {
                    alert(error);
                });
            },
            _retrieveResources: function (resourceGroup) {
                var mainContext = this;
                var _resources = [];
                var queryStrings = queryBuilder.resourceQueryStringBuilder.queryStrings(resourceGroup);
                var resourcesPromises = [];
                var sendQueryRequestFunc = function (queryString, deffered, resources) {
                    crmSDK.REST.retrieveMultipleRecords('Resource', queryString, function (data) {
                        _.each(data, function (d) {
                            resources.push({
                                key: d.ResourceId,
                                name: d.Name
                            })
                        });
                    }, function (error) {
                        alert(error.message);
                    }, function () {
                        deffered.resolve(resources);
                    });
                };

                _.each(queryStrings, function (queryString) {
                    resourcesPromises.push(_defferedWrapper(function (deffered) {
                        sendQueryRequestFunc(queryString, deffered, _resources);
                    }));
                });

                return resourcesPromises;
            },
            _retrieveVehicle: function (promise) {
                return this._retrieveSubResouceGroup(promise);
            },
            _retrieveModel: function (promise) {
                var mainContext = this;
                return promise.then(function (results) {
                    var _vehicles = [];
                    var promises = [];
                    _.each(results, function (v) {
                        //prepare vehicle entity
                        var vehicle = {
                            key: v.ResourceGroupId,
                            name: v.Name,
                            count: 0,
                            icon: 'img/vehicles/' + _noSpaceString(v.Name) + '.png',
                            models: []
                        };
                        var modelPromises = mainContext._retrieveResources(v);

                        /*get all merged data*/
                        promises.push($q.all(modelPromises).then(function (models) {
                            //one or more same objects will be passed into here, any one is ok
                            vehicle.models = models[0];
                            return vehicle;
                        }, function (error) {
                            alert(error);
                        }));

                        //_vehicles.push(vehicle);
                    })
                    return $q.all(promises);
                }, function (error) {
                    alert(error);
                })
            },
            retrieveVehicles: function (promise) {
                /* Retrieve vehicles from Dynamics CRM and return the deffered object*/
                var promiseV = this._retrieveResouceGroup(promise, resourceType.vehicle);
                promiseV = this._retrieveVehicle(promiseV);
                promiseV = this._retrieveModel(promiseV);
                return promiseV;
            },
            _retrieveTrack: function (promise) {
                var mainContext = this;
                return promise.then(function (results) {

                    var trackPromises = mainContext._retrieveResources(results);

                    /*get all merged data*/
                    return $q.all(trackPromises).then(function (ts) {
                        return _.map(ts[0], function (o) {
                            o.image = 'img/tracks/' + _noSpaceString(o.name) + '.png';
                            return o;
                        });
                    }, function (error) {
                        alert(error);
                    });

                    //return _tracks;
                }, function (error) {
                    alert(error);
                })
            },
            retrieveTracks: function (promise) {
                /* Retrieve tracks from Dynamics CRM */
                promiseT = this._retrieveResouceGroup(promise, resourceType.track);
                promiseT = this._retrieveTrack(promiseT);
                return promiseT;
            },
            _retrieveFacility: function (promise) {
                return this._retrieveSubResouceGroup(promise);
            },
            _retrieveFacilityItem: function (promise) {
                var mainContext = this;
                return promise.then(function (facilities) {
                    var promises = [];
                    _.each(facilities, function (v) {
                        //prepare vehicle entity
                        var facility = {
                            key: v.ResourceGroupId,
                            name: v.Name,
                            specific: []
                        };
                        var facilityItemPromises = mainContext._retrieveResources(v);

                        //assign to facility.specific
                        promises.push($q.all(facilityItemPromises).then(function (specs) {
                            facility.specific = specs[0];
                            return facility;
                        }, function (error) {
                            alert(error);
                        }));

                    })
                    return $q.all(promises);
                }, function (error) {
                    alert(error);
                })
            },
            retrieveFacility: function (promise, callback) {
                /* Retrieve facilities from Dynamics CRM */
                promiseF = this._retrieveResouceGroup(promise, resourceType.facility);
                promiseF = this._retrieveFacility(promiseF);
                promiseF = this._retrieveFacilityItem(promiseF);
                return promiseF;
            },
            _retrievePersonnelGeneric: function (promise) {
                return this._retrieveSubResouceGroup(promise).then(function (generics) {
                    var personnel = [];
                    _.each(generics, function (pg) {
                        personnel.push({
                            key: pg.ResourceGroupId,
                            name: pg.Name,
                            count: _getAssociatedResourceIds(pg).length,
                            type: 'generic',
                        })
                    });
                    return personnel;
                }, function (error) {
                    alert(error);
                });
            },
            _retrievePersonnelSpecific: function (promise, personnel) {
                var mainContext = this;
                return promise.then(function (results) {
                    var _users = [];
                    var specific = {
                        type: 'specific',
                        key: results.ResourceGroupId,
                        name: results.Name,
                        count: 0,
                        specific: []
                    };

                    var personnelPromises = mainContext._retrieveResources(results);

                    return $q.all(personnelPromises).then(function (us) {
                        specific.specific = us[0];
                        personnel.push(specific);
                        return personnel;
                    }, function (error) {
                        alert(error);
                    })

                });
            },
            retrievePersonnel: function (promise) {
                /*Retrieve personnel specific and generic from Dynamics CRM*/
                var mainContext = this;
                var promiseG = this._retrieveResouceGroup(promise, resourceType.personnelGeneric);
                promiseG = this._retrievePersonnelGeneric(promiseG);
                return promiseG.then(function (generics) {
                    var promiseS = mainContext._retrieveResouceGroup(promise, resourceType.personnelSpecific);
                    promiseS = mainContext._retrievePersonnelSpecific(promiseS, generics);
                    return promiseS;
                })
            },
            retrieveBusinessUnitFromCurrentUser: function (id) {
                /*return businessUnitId from current user*/
                var queryStrings = '$select=business_unit_system_users&$filter=SystemUserId eq guid(\'' + id + '\')&$expand=business_unit_system_users';
                var _bu;
                var sendQueryRequestFunc = function (deffered) {
                    /*id, type, select, expand,*/
                    crmSDK.REST.retrieveRecord(id, 'SystemUser', 'business_unit_system_users', 'business_unit_system_users', function (data) {
                        _bu = data.business_unit_system_users.BusinessUnitId;
                        deffered.resolve(_bu);
                    }, function (error) {
                        alert(error.message);
                    });
                };

                return _defferedWrapper(function (deffered) {
                    sendQueryRequestFunc(deffered)
                })
            },
            creator: function (entitySchemaName) {
                this.properties = {
                    entityName: entitySchemaName
                };
                var _createEntity = function (entities) {
                    var creator = this;
                    var creationPromises = [];
                    //var _returnData = [];
                    /*create one record*/
                    var sendCreateRequestFunc = function (entity, deffered) {
                        crmSDK.REST.createRecord(entity, this.properties.entityName, function (ret) {
                            //_returnData.push(ret);
                            deffered.resolve(ret);
                        }, function (error) {
                            alert(error.message);
                        });
                    }

                    _.each(entities, function (entity, index) {
                        creationPromises.push($q.all([index, _defferedWrapper.call(creator, function (deffered) {
                            sendCreateRequestFunc.call(this, entity, deffered);
                        })]));
                    });

                    return $q.all(creationPromises);
                }
                this.create = function (entities) {
                    return _createEntity.call(this, entities);
                }
            },
            updator: function (entitySchemaName) {
                this.properties = {
                    entityName: entitySchemaName
                };

                var _updateEntity = function (id, entity) {
                    var updator = this;
                    /*update one record*/
                    var sendUpdateRequestFunc = function (id, entity, deffered) {
                        crmSDK.REST.updateRecord(id, entity, this.properties.entityName, function (ret) {
                            deffered.resolve(ret);
                        }, function (error) {
                            alert(error.message);
                        });
                    }

                    return _defferedWrapper.call(updator, function (deffered) {
                        sendUpdateRequestFunc.call(this, id, entity, deffered);
                    });
                }

                this.update = function (id, entity) {
                    return _updateEntity.call(this, id, entity);
                }
            },
            crmContext: function () {
                return crmSDK.REST._context();
            },
            retrieveEntityMetaData: function (entityLogicalName) {
                /*return entity meta data and return promise*/
                return _defferedWrapper(function (deffered) {
                    crmSDKMetaData.Metadata.RetrieveEntity(crmSDKMetaData.Metadata.EntityFilters.Entity,
                     entityLogicalName,
                     null,
                     false,
                     function (data) {
                         deffered.resolve(data);
                     },
                     function (error) {
                         alert(error.message);
                     })
                })
            },
            retrieveOneWithAllColumns: function (id, entitySchemaName) {
                return _defferedWrapper(function (defered) {
                    crmSDK.REST.retrieveRecord(id, entitySchemaName, null, null, function (data) {
                        defered.resolve(data);
                    }, function (error) {
                        alert(error.message);
                    });
                })
            }
        }

        //build query string
        var queryBuilder = {
            equipmentQueryStringBuilder: {
                queryStrings: function (resourceGroup) {
                    var ids = _getAssociatedResourceIds(resourceGroup);
                    var queryStrings = [];
                    var subQueryString = '';
                    var tail = ' or ';
                    var recursiveCount = 0;
                    _.each(ids, function (r) {
                        subQueryString = subQueryString + 'EquipmentId eq (guid\'' + r.toUpperCase() + '\')' + tail;
                        recursiveCount++;
                        //4 Ids per group
                        if (recursiveCount % 4 === 0 ||
                            (recursiveCount % 4 > 0 && ids.length === recursiveCount)) {
                            queryStrings.push('$select=Name,EquipmentId&$orderby=CreatedOn desc&$filter=(cf_Status eq true) and (' + subQueryString.substring(0, subQueryString.lastIndexOf(tail)) + ')');
                            subQueryString = '';
                        }
                    });
                    return queryStrings;
                }
            },
            resourceGroupQueryStringBuilder: {
                queryStrings: function (parentResourceGroup) {
                    var ids = _getAssociatedResourceIds(parentResourceGroup);
                    var queryStrings = [];
                    var selectString = '$select=Name,ResourceGroupId,constraintbasedgroup_resource_groups&$expand=constraintbasedgroup_resource_groups';
                    var subQueryString = '';
                    var tail = ' or ';
                    var recursiveCount = 0;
                    _.each(ids, function (r) {
                        subQueryString = subQueryString + 'ResourceGroupId eq (guid\'' + r.toUpperCase() + '\')' + tail;
                        recursiveCount++;
                        //4 Ids per group
                        if (recursiveCount % 4 === 0 ||
                            (recursiveCount % 4 > 0 && ids.length === recursiveCount)) {
                            queryStrings.push(selectString + '&$orderby=Name&$filter=(GroupTypeCode/Value eq 0) and (' + subQueryString.substring(0, subQueryString.lastIndexOf(tail)) + ')');
                            subQueryString = '';
                        }
                    });
                    //var queryString = '$select=Name,ResourceGroupId,constraintbasedgroup_resource_groups&$expand=constraintbasedgroup_resource_groups&$filter=(GroupTypeCode/Value eq 0) and (' + subQueryString.substring(0, subQueryString.lastIndexOf(tail)) + ')';
                    return queryStrings;

                }
            },
            userQueryStringBuilder: {
                queryStrings: function (parentResourceGroup) {
                    var ids = _getAssociatedResourceIds(parentResourceGroup);
                    var queryStrings = [];
                    var selectString = '$select=FullName,SystemUserId';
                    var subQueryString = '';
                    var tail = ' or ';
                    var recursiveCount = 0;
                    _.each(ids, function (r) {
                        subQueryString = subQueryString + 'SystemUserId eq (guid\'' + r.toUpperCase() + '\')' + tail;
                        recursiveCount++;
                        //4 Ids per group
                        if (recursiveCount % 4 === 0 ||
                            (recursiveCount % 4 > 0 && ids.length === recursiveCount)) {
                            queryStrings.push(selectString + '&$orderby=CreatedOn desc&$filter=(IsDisabled eq false) and (' + subQueryString.substring(0, subQueryString.lastIndexOf(tail)) + ')');
                            subQueryString = '';
                        }
                    });
                    //var queryString = '$select=Name,ResourceGroupId,constraintbasedgroup_resource_groups&$expand=constraintbasedgroup_resource_groups&$filter=(GroupTypeCode/Value eq 0) and (' + subQueryString.substring(0, subQueryString.lastIndexOf(tail)) + ')';
                    return queryStrings;
                }
            },
            resourceQueryStringBuilder: {
                queryStrings: function (parentResourceGroup) {
                    var ids = _getAssociatedResourceIds(parentResourceGroup);
                    var queryStrings = [];
                    var selectString = '$select=Name,ResourceId';
                    var subQueryString = '';
                    var tail = ' or ';
                    var recursiveCount = 0;
                    _.each(ids, function (r) {
                        subQueryString = subQueryString + 'ResourceId eq (guid\'' + r.toUpperCase() + '\')' + tail;
                        recursiveCount++;
                        //4 Ids per group
                        if (recursiveCount % 4 === 0 ||
                            (recursiveCount % 4 > 0 && ids.length === recursiveCount)) {
                            queryStrings.push(selectString + '&$orderby=Name&$filter=(IsDisabled eq false) and (' + subQueryString.substring(0, subQueryString.lastIndexOf(tail)) + ')');
                            subQueryString = '';
                        }
                    });
                    return queryStrings;
                }
            }
        }
    }
})