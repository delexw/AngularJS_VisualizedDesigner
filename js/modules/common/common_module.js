define([
    'angular',
    './directives/fallbackSrc',
    './directives/valueSpinner'
], function (
    angular,
    fallbackSrc,
    valueSpinner
) {
    var module = angular.module('porscheEC.common', []);

    module.directive({
        myxFallbackSrc: fallbackSrc,
        myxValueSpinner: valueSpinner
    });
});