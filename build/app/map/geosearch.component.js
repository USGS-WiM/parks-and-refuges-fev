System.register(['@angular/core', './geocode.service', './map.service'], function(exports_1, context_1) {
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
    var core_1, geocode_service_1, map_service_1;
    var GeosearchComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (geocode_service_1_1) {
                geocode_service_1 = geocode_service_1_1;
            },
            function (map_service_1_1) {
                map_service_1 = map_service_1_1;
            }],
        execute: function() {
            GeosearchComponent = (function () {
                function GeosearchComponent(geocoder, mapService) {
                    this.locationFound = new core_1.EventEmitter();
                    this.address = '';
                    this.geocoder = geocoder;
                    this.mapService = mapService;
                }
                GeosearchComponent.prototype.ngOnInit = function () {
                    this.mapService.disableMouseEvent('goto');
                    this.mapService.disableMouseEvent('place-input');
                };
                GeosearchComponent.prototype.goto = function () {
                    var _this = this;
                    if (!this.address) {
                        return;
                    }
                    this.geocoder.geocode(this.address)
                        .subscribe(function (location) {
                        _this.address = location.address;
                        var newBounds = location.viewBounds;
                        _this.mapService.changeBounds(newBounds);
                    }, function (error) { return console.error(error); });
                };
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', Object)
                ], GeosearchComponent.prototype, "locationFound", void 0);
                GeosearchComponent = __decorate([
                    core_1.Component({
                        selector: 'geosearch',
                        templateUrl: './app/map/geosearch.component.html',
                        styleUrls: ['./app/map/geosearch.component.css']
                    }), 
                    __metadata('design:paramtypes', [geocode_service_1.GeocodingService, map_service_1.MapService])
                ], GeosearchComponent);
                return GeosearchComponent;
            }());
            exports_1("GeosearchComponent", GeosearchComponent);
        }
    }
});

//# sourceMappingURL=geosearch.component.js.map
