System.register(['@angular/core', 'rxjs/BehaviorSubject'], function(exports_1, context_1) {
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
    var core_1, BehaviorSubject_1;
    var MapService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (BehaviorSubject_1_1) {
                BehaviorSubject_1 = BehaviorSubject_1_1;
            }],
        execute: function() {
            MapService = (function () {
                function MapService() {
                    // Observable string sources
                    this.mapLoadedSource = new BehaviorSubject_1.BehaviorSubject(false);
                    this.zoomLevelSource = new BehaviorSubject_1.BehaviorSubject(0);
                    // Observable string streams
                    this.mapLoaded$ = this.mapLoadedSource.asObservable();
                    this.zoomLevel$ = this.zoomLevelSource.asObservable();
                }
                // load a web map and return respons
                MapService.prototype.createMap = function (domId) {
                    var _this = this;
                    this.map = new L.Map(domId, {
                        zoomControl: false,
                        center: new L.LatLng(40.731253, -73.996139),
                        zoom: 12,
                        minZoom: 4,
                        maxZoom: 19,
                        layers: [new L.TileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
                            })]
                    });
                    this.mapLoadedSource.next(true);
                    this.map.on('zoomend', function () {
                        _this.zoomLevelSource.next(_this.map.getZoom());
                    });
                    // return this.map;
                };
                ;
                MapService.prototype.disableMouseEvent = function (tag) {
                    var html = L.DomUtil.get(tag);
                    L.DomEvent.disableClickPropagation(html);
                    L.DomEvent.on(html, 'mousewheel', L.DomEvent.stopPropagation);
                };
                ;
                MapService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], MapService);
                return MapService;
            }());
            exports_1("MapService", MapService);
        }
    }
});

//# sourceMappingURL=map.service.js.map
