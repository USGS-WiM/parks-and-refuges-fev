System.register(['@angular/core', './map.service', './geocode.service', './geosearch.component'], function(exports_1, context_1) {
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
    var core_1, map_service_1, geocode_service_1, geosearch_component_1;
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
            }],
        execute: function() {
            MapComponent = (function () {
                function MapComponent(elRef, mapService, geocoder) {
                    this.elRef = elRef;
                    this.mapLoaded = new core_1.EventEmitter();
                    this.touchScreen = true;
                    this.mapService = mapService;
                    this.geocoder = geocoder;
                }
                MapComponent.prototype.ngOnInit = function () {
                    // create the map
                    this.map = this.mapService.createMap(this.elRef.nativeElement.firstChild);
                    this.mapLoaded.next(this.map);
                };
                MapComponent.prototype.fitBounds = function (bounds) {
                    this.map.fitBounds(bounds.value);
                    console.log("made it to navbar component with bounds: " + bounds.value);
                };
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', Object)
                ], MapComponent.prototype, "mapLoaded", void 0);
                MapComponent = __decorate([
                    core_1.Component({
                        selector: 'fev-map',
                        templateUrl: './app/map/map.component.html',
                        styleUrls: ['./app/map/map.component.css'],
                        directives: [geosearch_component_1.GeosearchComponent],
                        providers: [map_service_1.MapService, geocode_service_1.GeocodingService]
                    }), 
                    __metadata('design:paramtypes', [core_1.ElementRef, map_service_1.MapService, geocode_service_1.GeocodingService])
                ], MapComponent);
                return MapComponent;
            }());
            exports_1("MapComponent", MapComponent);
        }
    }
});

//# sourceMappingURL=map.component.js.map
