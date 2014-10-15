/// <reference path="../libs/angular.d.ts"/>

declare module core {

    interface IRootScope extends ng.IScope {
        siteTitle: string;
        pageTitle: string;
        pageDescription: string;
        operatingSystems: any[];
        selectedOs: any;
        rolesAndFeatures: any[];
        dismScript: string;
        cmdletScript: string;
        dscScript: string;
    }

    interface IHomeService {
        getOperatingSystems(): any[];
    }

    interface IDataService {
        RolesAndFeatures(osId: string): any;
        OperatingSystems(): any[];

    }
}
