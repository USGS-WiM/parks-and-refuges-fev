"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var geocode_service_1 = require('./geocode.service');
var map_service_1 = require('./map.service');
var GeosearchComponent = (function () {
    function GeosearchComponent(geocoder, mapService) {
        this.address = '';
        this.geocoder = geocoder;
        this.mapService = mapService;
    }
    GeosearchComponent.prototype.ngOnInit = function () {
        // this.mapService.disableMouseEvent('goto');
        // this.mapService.disableMouseEvent('place-input');
        this.map = this.mapService.map;
    };
    GeosearchComponent.prototype.goto = function () {
        var _this = this;
        if (!this.address) {
            return;
        }
        this.geocoder.geocode(this.address)
            .subscribe(function (location) {
            _this.map.fitBounds(location.viewBounds);
            _this.address = location.address;
        }, function (error) { return console.error(error); });
    };
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
exports.GeosearchComponent = GeosearchComponent;
//# sourceMappingURL=geosearch.component.js.map