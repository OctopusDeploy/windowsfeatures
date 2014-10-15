/// <reference path="../types/types.ts"/>

module windowsfeatures {
    "use strict";

    /* @ngInject */
    function appConfig($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) {
        $locationProvider.html5Mode(false);
        $routeProvider
            .otherwise({
                redirectTo: "/home"
            });
    }

    var windowsfeatures = angular
        .module("windowsfeatures", [
            "ngRoute",
            "templates",
            "windowsfeatures.home",
            "windowsfeatures.controllers"
        ])
        .config(appConfig);
}

