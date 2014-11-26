/// <reference path="../../types/types.ts"/>

module windowsfeatures.controllers {
    "use strict";

    export class HomeController {
        operatingSystems: any[];
        selectedOs: any;
        rolesAndFeatures: any[];
        selectedRolesAndFeatures: any[];
        jsTreeConfig: any = {
            "core": {
                "themes": {
                    "name": "default",
                    "icons": true,
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
            private DataService: core.IDataService
        ) {
            this.$rootScope.siteTitle = "windowsfeatures";
            this.$rootScope.pageTitle = "Home";
            this.$rootScope.pageDescription = "a simple guide to windows roles and features including dependencies";

            this.operatingSystems = this.DataService.OperatingSystems();
            this.selectedRolesAndFeatures = [];
            this.rolesAndFeatures = [];
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

        private addRoleOrFeature = (roleOrFeature) => {
            if (this.selectedRolesAndFeatures.indexOf(roleOrFeature, 0) === -1) {
                this.selectedRolesAndFeatures.push(roleOrFeature);
            }
        };

        public osSelected = () => {
            return this.selectedOs;
        };

        public selectedOsChanged = () => {
            this.selectedRolesAndFeatures = [];
            this.scriptCreated = false;

            if (this.osSelected()) {
                this.DataService.RolesAndFeatures(this.selectedOs.name).then((result) => {
                    this.rolesAndFeatures = result;
                });
                $(".tree-container").show();
            } else {
                $("#rolesAndFeatures").empty();
                this.rolesAndFeatures = [];
                $(".tree-container").hide();
            }
        };

        private selectDependencies = (node, instance) => {
            node.original.dependsOn.forEach( dep => {
                instance.check_node(dep);
            });
        };

        public nodeSelected = (e, data) => {
            if (data.node.parent !== "#") {
                this.addRoleOrFeature(data.instance.get_node(data.node.parent));
            }

            this.addRoleOrFeature(data.node);

            data.node.children.forEach( item => {
                var child = data.instance.get_node(item);
                this.addRoleOrFeature(child);

                this.selectDependencies(child, data.instance);
            });

            this.selectDependencies(data.node, data.instance);
        };

        public nodeDeselected = (e, data) => {
            var index = this.selectedRolesAndFeatures.indexOf(data, 0);
            if (index !== -1) {
                this.selectedRolesAndFeatures.splice(index, 1);
            }
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

