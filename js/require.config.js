var console = console || { "log": function () { } }; //IE8 fix

// Defines the configuration for **require.js**, this lists all the project's
// external dependencies as well as where to find the dependency file in a
// development environment
require.config({
    // List of all the dependencies
    paths: {
        text: '../bower_components/requirejs-text/text',
        lodash: '../bower_components/lodash/dist/lodash',
        moment: '../bower_components/moment/moment',
        angular: '../bower_components/angular/angular',
        angularRoute: '../bower_components/angular-route/angular-route.min',
        angularMessage: '../bower_components/angular-messages/angular-messages',
        restangular: '../bower_components/restangular/src/restangular',
        html5shiv: '../bower_components/html5shiv/dist/html5shiv',
        json2: '../bower_components/json2/json2',
        xml2json: '../bower_components/xml2json',
        ngDialog: '../bower_components/ng-dialog/js/ngDialog'
        //templates: '../tmp/template'
    },
    // Ensure that the dependencies are loaded in the right order
    shim: {
        lodash: {
            exports: '_'
        },
        angular: {
            exports: 'angular'
        },
        angularRoute: { deps: ['angular'] },
        angularMessage: { deps: ['angular'] },
        restangular: {
            deps: ['angular', 'lodash']
        },
        ngDialog: { deps: ['angular'] }
    }
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";
// using require() here, so that the related js files will be included in genereated js file build/myservice.build.js by requireJS. require.config.deps won't work withe requireJS build.
require(["bootstrap"]);