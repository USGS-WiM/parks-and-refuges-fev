System.register(['@angular/core', './map.service', './geocode.service', './geosearch.component', './latLngScale.component'], function(exports_1, context_1) {
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
    var core_1, map_service_1, geocode_service_1, geosearch_component_1, latLngScale_component_1;
    var MapComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (map_service_1_1) {
                map_service_1 = map_service_1_1;
            },
            function (geocode_service_1_1) {
                geocode_service_1 = geocode_service_1_1;
            },
            function (geosearch_component_1_1) {
                geosearch_component_1 = geosearch_component_1_1;
            },
            function (latLngScale_component_1_1) {
                latLngScale_component_1 = latLngScale_component_1_1;
            }],
        execute: function() {
            MapComponent = (function () {
                function MapComponent(mapService, geocoder) {
                    this.zoomLevel = 0;
                    this.mapScale = "";
                    this.cursorLat = 0;
                    this.cursorLng = 0;
                    this.touchScreen = true;
                    this.mapService = mapService;
                    this.geocoder = geocoder;
                    //var zoomLevel = mapService.map.getZoom;
                }
                MapComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    var map = new L.Map('map', {
                        zoomControl: false,
                        center: new L.LatLng(40.731253, -73.996139),
                        zoom: 12,
                        minZoom: 4,
                        maxZoom: 19,
                        layers: [this.mapService.baseMaps.OpenStreetMap]
                    });
                    L.control.zoom({ position: 'topright' }).addTo(map);
                    L.control.layers(this.mapService.baseMaps).addTo(map);
                    this.mapService.map = map;
                    //2 lines below sets the initial map scale string (and logs to console)
                    this.mapScale = this.scaleLookup(this.mapService.zoomLevel);
                    console.log('Initial Map scale registered as ' + this.mapScale, this.mapService.zoomLevel);
                    //resets map scale on leaflet zoom end event
                    map.on('zoomend', function () {
                        _this.mapScale = _this.scaleLookup(_this.mapService.zoomLevel);
                        console.log('Map scale registered as ' + _this.mapScale, _this.mapService.zoomLevel);
                    });
                    //updates lat/lng as cursor moves
                    map.on('mousemove', function (cursorPosition) {
                        _this.touchScreen = false;
                        _this.cursorLat = cursorPosition.latlng.lat.toFixed(3);
                        _this.cursorLng = cursorPosition.latlng.lng.toFixed(3);
                    });
                };
                MapComponent.prototype.scaleLookup = function (mapZoom) {
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
                MapComponent.prototype.ngAfterViewInit = function () { };
                MapComponent = __decorate([
                    core_1.Component({
                        selector: 'fev-map',
                        templateUrl: './app/map/map.component.html',
                        styleUrls: ['./app/map/map.component.css'],
                        directives: [geosearch_component_1.GeosearchComponent, latLngScale_component_1.LatLngScaleComponent],
                        providers: [map_service_1.MapService, geocode_service_1.GeocodingService]
                    }), 
                    __metadata('design:paramtypes', [map_service_1.MapService, geocode_service_1.GeocodingService])
                ], MapComponent);
                return MapComponent;
            }());
            exports_1("MapComponent", MapComponent);
        }
    }
});

//# sourceMappingURL=map.component.js.map
