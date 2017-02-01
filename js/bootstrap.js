// Include libraries that should be included at "all times" and are dependencies
// to some other behaviors.
//
// Add some functionalities to specific parts of existing libraries
define([
    'lodash',
    'moment',
    'angular',
    'angularRoute',
    'angularMessage',
    'restangular',
    'ngDialog',
    //'templates',
    // modules
    'main'
], function (
    _
) {
    angular.element().ready(function() {       
        angular.bootstrap(document, ['porscheEC']);
    });
});