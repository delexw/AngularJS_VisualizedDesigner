define([
    'angular'
],function(
    angular
){
    'use strict';

    // @name myxFallbackSrc
    //
    // @description
    // Set fallback image to be displayed when target image cannot be loaded.
    //
    // @example
    // <img ng-src="{{image}}" myx-fallback-src="./default-image.jpg" />

    function myxFallbackSrc() {
        return {
            link: function postLink(scope, element, attrs) {
                element.bind('error', function() {
                    angular.element(this).attr("src", attrs.myxFallbackSrc);
                });
            }
        };
    }

    return [myxFallbackSrc];
});