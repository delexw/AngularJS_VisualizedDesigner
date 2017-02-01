define([
    'angular',
    './controllers/WizardCtrl',
    '../common/factories/crmsdk',
    '../common/factories/crmsdk_metadata',
    '../common/factories/xml2json',
    './services/resourceService'
], function (
    angular,
    WizardCtrl,
    crmSDK,
    crmSDKMetaData,
    xml2json,
    resourceService
) {
    var module = angular.module('porscheEC.wizard', []);

    module.controller({
        WizardCtrl: WizardCtrl
    });

    //register crm sdk
    //added by Adam
    module.factory('crmSDK', function () {
        return crmSDK;
    })

    //register crm sdk
    //added by Adam
    module.factory('crmSDKMetaData', function () {
        return crmSDKMetaData;
    })

    //register xml2json
    module.factory('xml2json', function () {
        return new xml2json();
    });

    //register resource service
    module.service({
        resourceService: resourceService
    })
});