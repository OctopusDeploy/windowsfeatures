/// <reference path="../../types/types.ts"/>

module windowsfeatures.services.home {
    "use strict";

    export class HomeService implements core.IHomeService {
        getOperatingSystems() {
            return [
                {name: "Win2008", displayName: "Windows Server 2008 R2"},
                {name: "Win2012", displayName: "Windows Server 2012/2012R2"},
            ];
        }
    }

    angular
        .module("windowsfeatures.services.home", [])
        .service("HomeService", HomeService);

}

