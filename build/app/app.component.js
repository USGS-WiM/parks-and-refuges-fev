System.register(["@angular/core", './navbar/navbar.component', './sidebar/sidebar.component', './map/map.component', './map/latLngScale.component', '@angular/http'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, navbar_component_1, sidebar_component_1, map_component_1, latLngScale_component_1, http_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (navbar_component_1_1) {
                navbar_component_1 = navbar_component_1_1;
            },
            function (sidebar_component_1_1) {
                sidebar_component_1 = sidebar_component_1_1;
            },
            function (map_component_1_1) {
                map_component_1 = map_component_1_1;
            },
            function (latLngScale_component_1_1) {
                latLngScale_component_1 = latLngScale_component_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent() {
                }
                //once the map loads
                AppComponent.prototype.onMapLoad = function (response) {
                    console.log('appcomponent : map has been loaded');
                    //let const 'map' be our instance of the leaflet map
                    var map = response;
                    // Start up latlng component listeners the component can work with the map
                    this.latLngScaleComponent.setListeners(map);
                    this.navbarComponent.setListeners(map);
                    //for later reference - this file based off this: 
                    //https://github.com/tomwayson/angular2-esri-example/blob/master/app/app.component.ts
                };
                AppComponent.prototype.ngOnInit = function () {
                    console.log("Application component initialized ...");
                };
                __decorate([
                    core_1.ViewChild(navbar_component_1.NavbarComponent), 
                    __metadata('design:type', navbar_component_1.NavbarComponent)
                ], AppComponent.prototype, "navbarComponent", void 0);
                __decorate([
                    core_1.ViewChild(sidebar_component_1.SidebarComponent), 
                    __metadata('design:type', sidebar_component_1.SidebarComponent)
                ], AppComponent.prototype, "sidebarComponent", void 0);
                __decorate([
                    core_1.ViewChild(map_component_1.MapComponent), 
                    __metadata('design:type', map_component_1.MapComponent)
                ], AppComponent.prototype, "mapComponent", void 0);
                __decorate([
                    core_1.ViewChild(latLngScale_component_1.LatLngScaleComponent), 
                    __metadata('design:type', latLngScale_component_1.LatLngScaleComponent)
                ], AppComponent.prototype, "latLngScaleComponent", void 0);
                AppComponent = __decorate([
                    core_1.Component({
                        selector: "fev-app",
                        templateUrl: "./app/app.component.html",
                        directives: [navbar_component_1.NavbarComponent, sidebar_component_1.SidebarComponent, map_component_1.MapComponent, latLngScale_component_1.LatLngScaleComponent],
                        providers: [http_1.HTTP_PROVIDERS]
                    }), 
                    __metadata('design:paramtypes', [])
                ], AppComponent);
                return AppComponent;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});

//# sourceMappingURL=app.component.js.map
