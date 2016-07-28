System.register(["@angular/core"], function(exports_1, context_1) {
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
    var core_1;
    var LatLngScaleComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            LatLngScaleComponent = (function () {
                //public mapScale: string = this.mapComponent.mapScale;
                //TODO: get the touchsreen ng if thing going again for the 'center' label
                function LatLngScaleComponent() {
                    this.cursorLat = 0;
                    this.cursorLng = 0;
                    this.touchScreen = true;
                }
                LatLngScaleComponent.prototype.setListeners = function (map) {
                    var _this = this;
                    console.log('in latlngscalecompoenent set listeners');
                    //initialize map scales
                    this.mapScale = this.scaleLookup(map.getZoom());
                    console.log('Initial Map scale registered as ' + this.mapScale, map.getZoom());
                    map.on('zoomend', function () {
                        _this.mapZoom = map.getZoom();
                        _this.mapScale = _this.scaleLookup(_this.mapZoom);
                    });
                    map.on('mousemove', function (cursorPosition) {
                        _this.touchScreen = false;
                        _this.cursorLat = cursorPosition.latlng.lat.toFixed(3);
                        _this.cursorLng = cursorPosition.latlng.lng.toFixed(3);
                    });
                };
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
                };
                LatLngScaleComponent = __decorate([
                    core_1.Component({
                        selector: "lat-lng-scale",
                        templateUrl: "./app/map/latLngScale.component.html",
                        styleUrls: ['./app/map/latLngScale.component.css']
                    }), 
                    __metadata('design:paramtypes', [])
                ], LatLngScaleComponent);
                return LatLngScaleComponent;
            }());
            exports_1("LatLngScaleComponent", LatLngScaleComponent);
        }
    }
});

//# sourceMappingURL=latLngScale.component.js.map
