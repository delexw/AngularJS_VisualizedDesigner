angular.module('pecTemplate', ['../js/modules/wizard/templates/tip.html', '../js/modules/wizard/templates/wizard.html', '../js/modules/common/templates/legend.html']);

angular.module("../js/modules/wizard/templates/tip.html", []).run(["$templateCache", function ($templateCache) {
  "use strict";
  $templateCache.put("../js/modules/wizard/templates/tip.html",
    "<div ng-hide=\"{{ !tip.info.enable }}\">{{ tip.info.message }}</div>\n" +
    "\n" +
    "<div ng-hide=\"{{ !tip.loading.enable }}\">{{ tip.loading.message }}</div>");
}]);

angular.module("../js/modules/wizard/templates/wizard.html", []).run(["$templateCache", function ($templateCache) {
  "use strict";
  $templateCache.put("../js/modules/wizard/templates/wizard.html",
    "<div ng-init=\"Init()\">\n" +
    "    <button class=\"btn btn-primary btn-main pull-right\" ng-show=\"page == 0\" ng-click=\"summaryStart()\">Finish</button>\n" +
    "    <button class=\"btn btn-primary btn-main pull-right\" ng-show=\"page == 1\" ng-click=\"saveOpenConfirm()\">Save</button>\n" +
    "\n" +
    "    <section class=\"time-line\" ng-show=\"page == 0 || page == 1\">\n" +
    "        <div class=\"times\" style=\"margin-left: -2px;\">\n" +
    "            <div class=\"time-label\" ng-style=\"{ left: (10+90/getHours()*$index)+'%' }\" ng-repeat=\"time in times = getTimes()\" ng-show=\"times.length < 15 || $index % 2 == 0\">{{ time }}</div>\n" +
    "        </div>\n" +
    "        <div class=\"progress\">\n" +
    "            <div class=\"progress-bar\" ng-style=\"{ width: '8%' }\" ng-click=\"selectSession(eventSession)\" style=\"background: #c91602;\">\n" +
    "                Event\n" +
    "            </div>\n" +
    "            <div class=\"progress-bar\" ng-click=\"selectSession(eventSession)\" style=\"background: #f6f8fa; width: 2%; color: black;\">\n" +
    "                &ndash;\n" +
    "            </div>\n" +
    "            <div class=\"progress-bar\" ng-style=\"{ width: (90/getHours()*session.duration)+'%' }\"\n" +
    "                 ng-click=\"selectSession(session)\"\n" +
    "                 ng-repeat=\"session in sessions\" ng-class=\"{even: $even,odd: $odd}\">\n" +
    "                {{ session.name }}\n" +
    "            </div>\n" +
    "            <div class=\"progress-bar timeline-add btn-add\" ng-style=\"{ width: (90/getHours()*0.5)+'%' }\"\n" +
    "                 ng-show=\"getRemainingHours(currentSession) >= 0.5 && page == 0\" ng-click=\"createSession()\">\n" +
    "                +\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </section>\n" +
    "\n" +
    "    <section class=\"content\" ng-show=\"page == 0\">\n" +
    "        <div class=\"content-left\">\n" +
    "            <div class=\"content-header\">\n" +
    "                <form class=\"form-horizontal\" role=\"form\" ng-show=\"currentSession.type == 'event'\">\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label class=\"col-sm-1 control-label\">From: </label>\n" +
    "                        <div class=\"col-sm-2\">\n" +
    "                            <select class=\"form-control input-sm\" ng-model=\"day.start\"\n" +
    "                                    ng-options=\"time.format('h:mm a') for time in getPackageTimes('from') track by time.valueOf()\"\n" +
    "                                    ng-change=\"eventSessionDurationChanged('from')\"></select>\n" +
    "                        </div>\n" +
    "\n" +
    "                        <label class=\"col-sm-1 control-label\">To: </label>\n" +
    "                        <div class=\"col-sm-2\">\n" +
    "                            <select class=\"form-control input-sm\" ng-model=\"day.end\"\n" +
    "                                    ng-options=\"time.format('h:mm a') for time in getPackageTimes('to') track by time.valueOf()\"\n" +
    "                                    ng-change=\"eventSessionDurationChanged('to')\"></select>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "\n" +
    "                <div class=\"col-1\" ng-show=\"currentSession.type == 'session'\">\n" +
    "                    <form class=\"form-horizontal\" role=\"form\">\n" +
    "                        <div class=\"form-group\">\n" +
    "                            <label for=\"inputEmail3\" class=\"col-sm-2 control-label\">Name</label>\n" +
    "\n" +
    "                            <div class=\"col-sm-10\">\n" +
    "                                <input type=\"text\" class=\"form-control input-sm\" placeholder=\"Name your session\"\n" +
    "                                       ng-model=\"currentSession.name\">\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </form>\n" +
    "                </div>\n" +
    "                <div class=\"col-2 qty\" ng-show=\"currentSession.type == 'session'\">\n" +
    "                    <span class=\"qty-text-left\">Duration</span>\n" +
    "\n" +
    "                    <form class='qty-form' method='POST' action='#'>\n" +
    "                        <div myx-value-spinner value=\"currentSession.duration\" step=\"0.5\" min=\"0.5\"\n" +
    "                             max=\"getRemainingHours(currentSession)\"></div>\n" +
    "                    </form>\n" +
    "                    <span class=\"qty-text-right\">Hours</span>\n" +
    "                </div>\n" +
    "                <div class=\"col-3\" ng-show=\"currentSession.type == 'session'\">\n" +
    "                    <button class=\"btn btn-sm btn-danger\" ng-click=\"deleteCurrentSession()\">Delete Session</button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"content-body\">\n" +
    "                <div class=\"steps\">\n" +
    "                    <ul class=\"steps-init\">\n" +
    "\n" +
    "                        <li class=\"steps-list\" ng-click=\"step = 1\" ng-class=\"{'active': step == 1 }\">\n" +
    "                            <div class=\"step-title\">1</div>\n" +
    "                            <div class=\"step-text\">Vehicles</div>\n" +
    "                        </li>\n" +
    "\n" +
    "                        <li class=\"steps-list\" ng-click=\"step = 2\" ng-class=\"{'active': step == 2 }\">\n" +
    "                            <div class=\"step-title\">2</div>\n" +
    "                            <div class=\"step-text\">Tracks</div>\n" +
    "                        </li>\n" +
    "\n" +
    "                        <li class=\"steps-list\" ng-click=\"step = 3\" ng-class=\"{'active': step == 3 }\">\n" +
    "                            <div class=\"step-title\">3</div>\n" +
    "                            <div class=\"step-text\">Facilities</div>\n" +
    "                        </li>\n" +
    "\n" +
    "                        <li class=\"steps-list\" ng-click=\"step = 4\" ng-class=\"{'active': step == 4 }\">\n" +
    "                            <div class=\"step-title\">4</div>\n" +
    "                            <div class=\"step-text\">Personnel</div>\n" +
    "                        </li>\n" +
    "\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"step-title\">\n" +
    "                    Step {{ step }}.\n" +
    "                    <strong ng-show=\"step == 1\">Select Vehicles</strong>\n" +
    "                    <strong ng-show=\"step == 2\">Select Tracks</strong>\n" +
    "                    <strong ng-show=\"step == 3\">Select Facilities</strong>\n" +
    "                    <strong ng-show=\"step == 4\">Select Personnel</strong>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- Start - Step 1. -->\n" +
    "                <div class=\"step-content\" ng-show=\"step == 1\">\n" +
    "                    <div class=\"step-box car\" ng-class=\"{ 'pull-left': $even,'pull-right': $odd }\"\n" +
    "                         ng-repeat=\"car in stock.vehicles\">\n" +
    "                        <div class=\"pull-left\">\n" +
    "                            <img ng-src=\"{{ car.icon }}\" alt=\"\">\n" +
    "                        </div>\n" +
    "                        <div class=\"qty pull-right\">\n" +
    "                            <form class=\"qty-form ng-pristine ng-valid\" method=\"POST\" action=\"#\">\n" +
    "                                <div myx-value-spinner value=\"currentSession.configuration.vehicles[car.key].count\"\n" +
    "                                     increment=\"setAllModelsIfNone(car.key)\"\n" +
    "                                     max=\"car.models.length\"\n" +
    "                                     step=\"1\"></div>\n" +
    "                            </form>\n" +
    "                        </div>\n" +
    "                        <div class=\"step-box-list clearfix\">\n" +
    "                            <div class=\"checkbox label-checkbox\">\n" +
    "                                <h2 class=\"step-box-list-title\">\n" +
    "                                    <input type=\"checkbox\"\n" +
    "                                           ng-model=\"currentSession.configuration.vehicles[car.key].allModels\"\n" +
    "                                           ng-click=\"setAllModels(car.key)\">\n" +
    "                                    {{ car.name }}\n" +
    "                                </h2>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <ul class=\"step-box-offer car\">\n" +
    "                                <li class=\"step-box-offer-list\" ng-repeat=\"model in car.models\">\n" +
    "                                    <div class=\"checkbox label-checkbox\">\n" +
    "                                        <label>\n" +
    "                                            <input type=\"checkbox\"\n" +
    "                                                   ng-model=\"currentSession.configuration.vehicles[car.key].models[model.key]\"\n" +
    "                                                   ng-click=\"getAllModelsPerCar(car.key, model.key)\">\n" +
    "                                            {{ model.name }}\n" +
    "                                        </label>\n" +
    "                                    </div>\n" +
    "                                </li>\n" +
    "                            </ul>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <!-- End - Step 1. -->\n" +
    "\n" +
    "                <!-- Start - Step 2. -->\n" +
    "                <div class=\"step-content\" ng-show=\"step == 2\">\n" +
    "                    <div class=\"step-box text-center\" ng-class=\"{ 'pull-left': $even,'pull-right': $odd }\"\n" +
    "                         ng-repeat=\"track in stock.tracks\">\n" +
    "                        <img ng-src=\"{{ track.image }}\" alt=\"\">\n" +
    "\n" +
    "                        <div class=\"step-box-air checkbox label-checkbox\">\n" +
    "                            <label>\n" +
    "                                <input type=\"checkbox\"\n" +
    "                                       ng-model=\"currentSession.configuration.tracks[track.key]\">\n" +
    "                                {{ track.name }}\n" +
    "                            </label>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <!-- End - Step 2. -->\n" +
    "\n" +
    "                <!-- Start - Step 3. -->\n" +
    "                <div class=\"step-content\" ng-show=\"step == 3\">\n" +
    "                    <div class=\"step-box\" ng-class=\"{ 'pull-left': $even,'pull-right': $odd }\"\n" +
    "                         ng-repeat=\"facility in stock.facilities\">\n" +
    "                        <div class=\"qty pull-right\">\n" +
    "                            <form class=\"qty-form ng-pristine ng-valid\" method=\"POST\" action=\"#\">\n" +
    "                                <div myx-value-spinner value=\"currentSession.configuration.facilities[facility.key].count\"\n" +
    "                                     step=\"1\"\n" +
    "                                     max=\"facility.specific.length\"\n" +
    "                                     increment=\"setAllSpecificIfNone(facility.key)\"></div>\n" +
    "                            </form>\n" +
    "                        </div>\n" +
    "                        <div class=\"step-box-list clearfix\">\n" +
    "                            <ul class=\"step-box-select\">\n" +
    "                                <li class=\"step-box-select-list\">\n" +
    "                                    <div class=\"step-box-select-list-title checkbox label-checkbox\">\n" +
    "                                        <label>\n" +
    "                                            <input type=\"checkbox\"\n" +
    "                                                   ng-model=\"currentSession.configuration.facilities[facility.key].allSpecific\"\n" +
    "                                                   ng-click=\"setAllSpecific(facility.key)\">\n" +
    "                                            {{ facility.name }}\n" +
    "                                        </label>\n" +
    "                                    </div>\n" +
    "                                </li>\n" +
    "                                <li class=\"step-box-select-list\" ng-repeat=\"specificFacility in facility.specific\">\n" +
    "                                    <div class=\"checkbox label-checkbox\">\n" +
    "                                        <label>\n" +
    "                                            <input type=\"checkbox\"\n" +
    "                                                   ng-model=\"currentSession.configuration.facilities[facility.key].specific[specificFacility.key]\"\n" +
    "                                                   ng-click=\"getAllSpecificPerFacility(facility.key, specificFacility.key)\">\n" +
    "                                            {{ specificFacility.name }}\n" +
    "                                        </label>\n" +
    "                                    </div>\n" +
    "                                </li>\n" +
    "                            </ul>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <!-- End - Step 3. -->\n" +
    "\n" +
    "                <!-- Start - Step 4. -->\n" +
    "                <div class=\"step-content personnel clearfix\" ng-show=\"step == 4\">\n" +
    "                    <div class=\"pull-left specific\">\n" +
    "                        <div class=\"step-box step-box-sm\"\n" +
    "                             ng-repeat=\"person in stock.personnel | filter:{type:'specific'}\">\n" +
    "                            <div class=\"qty pull-right\">\n" +
    "                                <form class=\"qty-form ng-pristine ng-valid\" method=\"POST\" action=\"#\">\n" +
    "                                    <div myx-value-spinner value=\"currentSession.configuration.personnel[person.key].count\"\n" +
    "                                         step=\"1\"\n" +
    "                                         max=\"person.specific.length\"\n" +
    "                                         increment=\"setAllSpecificPersonnelIfNone(person.key)\"></div>\n" +
    "                                </form>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"step-box-list clearfix\">\n" +
    "                                <div class=\"checkbox label-checkbox\">\n" +
    "                                    <h2 class=\"step-box-list-title\">\n" +
    "                                        <input type=\"checkbox\"\n" +
    "                                               ng-model=\"currentSession.configuration.personnel[person.key].allSpecific\"\n" +
    "                                               ng-click=\"setAllSpecificPersonnel(person.key)\">\n" +
    "                                        {{ person.name }}\n" +
    "                                    </h2>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <ul class=\"step-box-select\">\n" +
    "                                    <li class=\"step-box-select-list\" ng-repeat=\"specificPerson in person.specific\">\n" +
    "                                        <div class=\"checkbox label-checkbox\">\n" +
    "                                            <label>\n" +
    "                                                <input type=\"checkbox\"\n" +
    "                                                       ng-model=\"currentSession.configuration.personnel[person.key].specific[specificPerson.key]\"\n" +
    "                                                       ng-click=\"getAllSpecificPerPerson(person.key, specificPerson.key)\">\n" +
    "                                                {{ specificPerson.name }}\n" +
    "                                            </label>\n" +
    "                                        </div>\n" +
    "                                    </li>\n" +
    "                                </ul>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"pull-right generic\">\n" +
    "                        <div class=\"step-box step-box-sm\">\n" +
    "                            <div ng-repeat=\"person in stock.personnel | filter:{type:'generic'}\">\n" +
    "                                <div class=\"qty pull-right\">\n" +
    "                                    <form class=\"qty-form ng-pristine ng-valid\" method=\"POST\" action=\"#\">\n" +
    "                                        <div myx-value-spinner value=\"currentSession.configuration.personnel[person.key].count\"\n" +
    "                                             step=\"1\"\n" +
    "                                             max=\"person.count\"></div>\n" +
    "                                    </form>\n" +
    "                                </div>\n" +
    "                                <div class=\"step-box-list clearfix\">\n" +
    "                                    <ul class=\"step-box-select\">\n" +
    "                                        <li class=\"step-box-select-list\">\n" +
    "                                            <div class=\"checkbox label-checkbox\">\n" +
    "                                                <label>\n" +
    "                                                    {{ person.name }}\n" +
    "                                                </label>\n" +
    "                                            </div>\n" +
    "                                        </li>\n" +
    "                                    </ul>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <!-- End - Step 4. -->\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"content-right\">\n" +
    "            <h3 class=\"content-title\">Summary <br>{{ currentSession.name }} </h3>\n" +
    "\n" +
    "            <div class=\"item\">\n" +
    "                <h4 class=\"item-title\">Vehicles Selected</h4>\n" +
    "                <ul class=\"item-content\">\n" +
    "                    <li class=\"item-content-list\" ng-repeat=\"(key,vehicle) in currentSession.configuration.vehicles\"\n" +
    "                        ng-show=\"vehicle.count != 0\">\n" +
    "                        {{ (stock.vehicles | filter:{key:key})[0].name }}\n" +
    "                        <span class=\"pull-right\">{{ vehicle.count }}</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"item\">\n" +
    "                <h4 class=\"item-title\">Tracks selected</h4>\n" +
    "                <ul class=\"item-content\">\n" +
    "                    <li class=\"item-content-list\" ng-repeat=\"(key,track) in currentSession.configuration.tracks\"\n" +
    "                        ng-show=\"track\">\n" +
    "                        {{ (stock.tracks | filter:{key: key})[0].name }}\n" +
    "                        <span class=\"pull-right\">1</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"item\">\n" +
    "                <h4 class=\"item-title\">Facilities selected</h4>\n" +
    "                <ul class=\"item-content\">\n" +
    "                    <li class=\"item-content-list\" ng-repeat=\"(key,facility) in currentSession.configuration.facilities\"\n" +
    "                        ng-show=\"facility.count != 0\">\n" +
    "                        {{ (stock.facilities | filter:{key:key})[0].name }}\n" +
    "                        <span class=\"pull-right\">{{ facility.count }}</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"item\">\n" +
    "                <h4 class=\"item-title\">Personnel</h4>\n" +
    "                <ul class=\"item-content\">\n" +
    "                    <li class=\"item-content-list\" ng-repeat=\"(key,person) in currentSession.configuration.personnel\"\n" +
    "                        ng-show=\"person.count != 0\">\n" +
    "                        {{ (stock.personnel | filter:{key:key})[0].name }}\n" +
    "                        <span class=\"pull-right\">{{ person.count }}</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </section>\n" +
    "\n" +
    "    <div class=\"summary\" ng-show=\"page == 1\">\n" +
    "        <div class=\"summary-list col-xs-3\" ng-repeat=\"session in getAllSessions()\" ng-class=\"'type-'+session.type\">\n" +
    "            <h3 class=\"summary-title\">{{ session.name }}</h3>\n" +
    "\n" +
    "            <div class=\"item-time\">\n" +
    "                <div class=\"item-list\">{{ session.startTime | date:'shortTime' }} -\n" +
    "                    {{ session.endTime | date:'shortTime' }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"item\">\n" +
    "                <h4 class=\"item-title\">Vehicles</h4>\n" +
    "                <ul class=\"item-content\">\n" +
    "                    <li class=\"item-content-list\" ng-repeat=\"(key,vehicle) in session.configuration.vehicles\"\n" +
    "                        ng-if=\"vehicle.count > 0\">\n" +
    "                        {{ (stock.vehicles | filter:{key:key})[0].name }}\n" +
    "                        <span class=\"pull-right\">{{ vehicle.count }}</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"item\">\n" +
    "                <h4 class=\"item-title\">Tracks</h4>\n" +
    "                <ul class=\"item-content\">\n" +
    "                    <li class=\"item-content-list\" ng-repeat=\"(key,track) in session.configuration.tracks\"\n" +
    "                        ng-if=\"track\">\n" +
    "                        {{ (stock.tracks | filter:{key: key})[0].name }}\n" +
    "                        <span class=\"pull-right\">1</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"item\">\n" +
    "                <h4 class=\"item-title\">Facilities</h4>\n" +
    "                <ul class=\"item-content\">\n" +
    "                    <li class=\"item-content-list\" ng-repeat=\"(key,facility) in session.configuration.facilities\"\n" +
    "                        ng-if=\"facility.count > 0\">\n" +
    "                        {{ (stock.facilities | filter:{key:key})[0].name }}\n" +
    "                        <span class=\"pull-right\">{{ facility.count }}</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"item\">\n" +
    "                <h4 class=\"item-title\">Personnel</h4>\n" +
    "                <ul class=\"item-content\">\n" +
    "                    <li class=\"item-content-list\" ng-repeat=\"(key,person) in session.configuration.personnel\"\n" +
    "                        ng-if=\"person.count > 0\">\n" +
    "                        {{ (stock.personnel | filter:{key:key})[0].name }}\n" +
    "                        <span class=\"pull-right\">{{ person.count }}</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"save-confirmation\" ng-show=\"page == 2\">\n" +
    "        <h2>Confirm Save</h2>\n" +
    "        <div>Are you sure you want to save the current event setup and resource selection?</div>\n" +
    "        <br/>\n" +
    "        <button type=\"button\" class=\"btn btn-primary\" ng-click=\"save()\" ng-disabled=\"controls.saveBtn.isDisabled\">Save</button>\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"page = 1\">Back to Review</button>\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"page = 0\">Back to Configuration</button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../js/modules/common/templates/legend.html", []).run(["$templateCache", function ($templateCache) {
  "use strict";
  $templateCache.put("../js/modules/common/templates/legend.html",
    "<div class=\"legend\">\n" +
    "	<span class=\"filter sort\" ng-class=\"legend.active === item.label ? 'active': ''\" ng-repeat=\"item in legend.data\" ng-click=\"legend.active = item.label\">\n" +
    "		<span class=\"count\">\n" +
    "			{{item.value}}\n" +
    "		</span>\n" +
    "		<span class=\"filter-title\">\n" +
    "			{{item.label}}\n" +
    "		</span>\n" +
    "	</span>\n" +
    "</div>");
}]);
