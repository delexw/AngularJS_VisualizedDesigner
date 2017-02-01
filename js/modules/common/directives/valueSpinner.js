define(function(){
    'use strict';

    function myxValueSpinner() {
        return {
            restrict: 'A',
            template:
                '<input type="button" value="-" class="qty-form-minus btn btn-sm btn-default" ng-click="decrementFunction()" ng-disabled="value - step < min" />' +
                //'<input type="text" readonly="readonly" class="qty-form-text form-control input-sm" ng-model="value" />' +
                '<span class="spinner-value">{{ value }}</span>' +
                '<input type="button" value="+" class="qty-form-plus btn btn-sm btn-default" ng-click="incrementFunction()" ng-disabled="hasMax() && value + step > max" />',
            scope: {
                value: '=?',
                step: '=?',
                min: '=?',
                max: '=?',
                change: '&?',
                increment: '&?',
                decrement: '&?'
            },
            link: function($scope, element, attrs) {
                $scope.value = $scope.value || 0;
                $scope.step = $scope.step || 1;
                $scope.min = $scope.min || 0;
                $scope.hasMax = function() {
                    return typeof $scope.max !== 'undefined';
                };

                $scope.incrementFunction = function() {
                    $scope.value = $scope.value + $scope.step;
                    if($scope.increment) $scope.increment();
                    if($scope.change) $scope.change();
                };
                $scope.decrementFunction = function() {
                    $scope.value = $scope.value - $scope.step;
                    if($scope.decrement) $scope.decrement();
                    if($scope.change) $scope.change();
                };
            }
        };
    }

    return [myxValueSpinner];
});
