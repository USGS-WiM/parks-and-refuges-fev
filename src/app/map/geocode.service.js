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
var http_1 = require('@angular/http');
var location_class_1 = require('./location.class');
var core_1 = require('@angular/core');
var leaflet_1 = require('leaflet');
require('rxjs/add/operator/map');
require('rxjs/add/operator/mergeMap');
var GeocodingService = (function () {
    function GeocodingService(http) {
        this.http = http;
    }
    GeocodingService.prototype.geocode = function (address) {
        return this.http
            .get('http://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address))
            .map(function (res) { return res.json(); })
            .map(function (result) {
            if (result.status !== 'OK') {
                throw new Error('unable to geocode address');
            }
            var location = new location_class_1.Location();
            location.address = result.results[0].formatted_address;
            location.latitude = result.results[0].geometry.location.lat;
            location.longitude = result.results[0].geometry.location.lng;
            var viewPort = result.results[0].geometry.viewport;
            location.viewBounds = new leaflet_1.LatLngBounds({ lat: viewPort.southwest.lat, lng: viewPort.southwest.lng }, { lat: viewPort.northeast.lat, lng: viewPort.northeast.lng });
            return location;
        });
    };
    GeocodingService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], GeocodingService);
    return GeocodingService;
}());
exports.GeocodingService = GeocodingService;
//# sourceMappingURL=geocode.service.js.map