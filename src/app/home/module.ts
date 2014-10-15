/// <reference path="../../types/types.ts"/>

module windowsfeatures.home {
    "use strict";

    /* @ngInject */
    function homeConfig($routeProvider: ng.route.IRouteProvider) {
        $routeProvider
            .when("/home", {
                controller: "HomeController",
                templateUrl: "home/index.html"
            });
    }

    angular
        .module("windowsfeatures.home", [
            "ngRoute",
            "windowsfeatures.controllers"
        ])
        .config(homeConfig);

}
