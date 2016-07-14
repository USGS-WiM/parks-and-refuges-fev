System.register(['@angular/core', './map.service'], function(exports_1, context_1) {
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
    var core_1, map_service_1;
    var LatLngScaleComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (map_service_1_1) {
                map_service_1 = map_service_1_1;
            }],
        execute: function() {
            LatLngScaleComponent = (function () {
                function LatLngScaleComponent(mapService) {
                    console.log('in latlngscale component constructor');
                    this.mapScale = '5';
                    this.mapService = mapService;
                }
                LatLngScaleComponent.prototype.scaleLookup = function (mapZoom) {
                    switch (mapZoom) {
                        case 19: return '1,128';
                        case 18: return '2,256';
                        case 17: return '4,513';
                        case 16: return '9,027';
                        case 15: return '18,055';
                        case 14: return '36,111';
                        case 13: return '72,223';
                        case 12: return '144,447';
                        case 11: return '288,895';
                        case 10: return '577,790';
                        case 9: return '1,155,581';
                        case 8: return '2,311,162';
                        case 7: return '4,622,324';
                        case 6: return '9,244,649';
                        case 5: return '18,489,298';
                        case 4: return '36,978,596';
                        case 3: return '73,957,193';
                        case 2: return '147,914,387';
                        case 1: return '295,828,775';
                        case 0: return '591,657,550';
                    }
                };
                LatLngScaleComponent.prototype.ngOnInit = function () {
                    // this.mapService.mapLoaded$.subscribe((state) => {
                    //     console.log('map has been loaded: ', state);
                    // });
                    // this.mapService.zoomLevel$.subscribe((level) => {
                    //     console.log('heard from map service zoom level subscription: ', level);
                    // });
                };
                LatLngScaleComponent.prototype.ngAfterViewInit = function () {
                    //console.log('is the map loaded: ', this.mapLoaded);
                };
                LatLngScaleComponent = __decorate([
                    core_1.Component({
                        selector: "lat-lng-scale",
                        templateUrl: "./app/map/latLngScale.component.html",
                        styleUrls: ['./app/map/latLngScale.component.css'],
                        providers: [map_service_1.MapService]
                    }), 
                    __metadata('design:paramtypes', [map_service_1.MapService])
                ], LatLngScaleComponent);
                return LatLngScaleComponent;
            }());
            exports_1("LatLngScaleComponent", LatLngScaleComponent);
        }
    }
});

//# sourceMappingURL=latLngScale.component.js.map
