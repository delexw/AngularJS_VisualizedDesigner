define([
    'angular',
    'config',
    'modules/common/common_module',
    'modules/wizard/wizard_module'
], function (angular) {
    // Declare app level module which depends on filters, and services
    angular.module('porscheEC', [
        'ngRoute',
        'ngMessages',
        'restangular',
        'porscheEC.config',
        'porscheEC.common',
        'porscheEC.wizard',
        'ngDialog'
        //'pecTemplate'
    ])
    .config(['$routeProvider',  'RestangularProvider', '$compileProvider', function($routeProvider, RestangularProvider, $compileProvider) {
        $routeProvider
            .when('/wizard', {
                templateUrl: 'js/modules/wizard/templates/wizard.html',
                controller: 'WizardCtrl'
            })
            .otherwise({
                redirectTo: '/wizard'
            });
        // please refer to the angular source code about $$SanitizeUriProvider part.
        // we have to rewrite these two white list regex, because the ms-appx is used by Microsoft.
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|ms-appx):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|ms-appx):|data:image\//);
    }]);
});
