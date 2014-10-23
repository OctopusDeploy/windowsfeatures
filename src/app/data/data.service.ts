/// <reference path="../../types/types.ts"/>

module windowsfeatures.services.data {
    "use strict";

    export class DataService implements core.IDataService {
        OperatingSystems() {
            return [
                {name: "Win2008", displayName: "Windows Server 2008 R2"},
                {name: "Win2012", displayName: "Windows Server 2012/2012R2"},
            ];
        }

        RolesAndFeatures(osId: string) {
            var resource = this.$resource(":osId.json", {}, {
                query: {method: "GET", params: {osId: "data"}, isArray: true}
            });

            return resource.query({osId: osId}).$promise;
        }

        /* @ngInject */
        constructor(
            private $resource: ng.resource.IResourceService
            ) {

        }
    }

    angular
        .module("windowsfeatures.services.data", ["ngResource"])
        .service("DataService", DataService);

}
