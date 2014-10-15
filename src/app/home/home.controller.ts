/// <reference path="../../types/types.ts"/>

module windowsfeatures.controllers {
    "use strict";

    export class HomeController {
        operatingSystems: any[];
        selectedOs: any;
        rolesAndFeatures: any[] = [];
        selectedRolesAndFeatures: any[];
        jsTreeConfig: any = {
            "core": {
                "themes": {
                    "theme": "default",
                    "icons": false,
                    "dots": false
                }
            },
            "data": {
            },
            "checkbox": {
                "tie_selection": false
            }
        };
        data: core.IDataService;
        scriptCreated: boolean;
        dismScriptTemplate: string = "dism /online /enable-feature {features}";
        dismFeatureTemplate: string = "/featurename:{featurename}";

        cmdletScriptTemplate: string = "Install-WindowsFeature -Name @({features})";
        dscScriptTemplate: string =
            "Configuration WindowsFeatures\n" +
            "{\n" +
            "   param ($MachineName)\n" +
            "\n" +
            "   Node $MachineName\n" +
            "   {\n" +
            "{features}" +
            "   }\n" +
            "}\n";
        dscFeatureTemplate: string =
            "      WindowsFeature {feature}\n" +
            "      {\n" +
            "          Ensure = \"Present\"\n" +
            "          Name = \"{featurename}\"\n" +
            "      }\n" +
            "\n";

        dismScript: string;
        cmdletScript: string;
        dscScript: string;

        /* @ngInject */
        constructor(
            private $rootScope: core.IRootScope,
            DataService: core.IDataService
        ) {
            this.data = DataService;

            this.$rootScope.siteTitle = "windowsfeatures";
            this.$rootScope.pageTitle = "Home";
            this.$rootScope.pageDescription = "a simple guide to windows roles and features including dependencies";

            this.operatingSystems = DataService.OperatingSystems();
            this.selectedRolesAndFeatures = [];
            this.$rootScope.$watch(() => this.dismScript, () => {});
        }

        generateDscScript = () => {
            var script: string = "";
            var template: string = this.dscFeatureTemplate;
            this.selectedRolesAndFeatures.forEach((item, index) => {
                script += template.replace(RegExp("\\{feature\\}", "g"), item.id).replace(RegExp("\\{featurename\\}", "g"), item.id);
            });
            return this.dscScriptTemplate.replace(RegExp("\\{features\\}", "g"), script);
        };

        generateScript = () => {
            var script: string = "";
            var template: string = "";
            switch (this.selectedOs.name) {
                case "Win2008":
                    template = this.dismFeatureTemplate;
                    this.selectedRolesAndFeatures.forEach((item, index) => {
                        console.log(item);
                        script += template.replace(RegExp("\\{featurename\\}", "g"), item.id);
                        script += " ";
                    });
                    this.dismScript = this.dismScriptTemplate.replace(RegExp("\\{features\\}", "g"), script);
                    this.scriptCreated = true;
                    break;
                case "Win2012":
                    this.cmdletScript = this.cmdletScriptTemplate.replace(RegExp("\\{features\\}", "g"),
                    this.selectedRolesAndFeatures.map(r => r.id).join(", "));
                    this.scriptCreated = true;
                    break;
            }
            this.dscScript = this.generateDscScript();
        };

        public selectedOsChanged = () => {
            console.log(this.selectedOs);
            this.selectedRolesAndFeatures = [];
            this.data.RolesAndFeatures(this.selectedOs.name).then( (result) => {
                this.rolesAndFeatures = result;
            });
        };

        public nodeSelected = (e, data) => {
            this.selectedRolesAndFeatures.push(data.node);
            if (data.node.original.dependsOn && data.node.original.dependsOn.length > 0) {
                data.instance.check_node(data.node.original.dependsOn[0]);
            }
            console.log(this.selectedRolesAndFeatures);
        };

        public nodeDeselected = (e, data) => {
            var index = this.selectedRolesAndFeatures.indexOf(data, 0);
            if (index !== undefined) {
                this.selectedRolesAndFeatures.splice(index, 1);
            }
        };

        public osSelected = () => {
            return this.selectedOs;
        };

        public scriptGenerated = () => {
            return this.osSelected() ? this.selectedOs.name : "";
        };
    }

    var vm = angular
        .module("windowsfeatures.controllers", [
            "windowsfeatures.services.data",
            "jsTree.directive"
        ])
        .controller("HomeController", HomeController);
}

