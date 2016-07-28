System.register(['@angular/core', '@angular/platform-browser', 'ng2-bs3-modal/ng2-bs3-modal', './../map/geocode.service', './../map/map.service', './../map/geosearch.component'], function(exports_1, context_1) {
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
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var core_1, platform_browser_1, ng2_bs3_modal_1, geocode_service_1, map_service_1, geosearch_component_1;
    var NavbarComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (ng2_bs3_modal_1_1) {
                ng2_bs3_modal_1 = ng2_bs3_modal_1_1;
            },
            function (geocode_service_1_1) {
                geocode_service_1 = geocode_service_1_1;
            },
            function (map_service_1_1) {
                map_service_1 = map_service_1_1;
            },
            function (geosearch_component_1_1) {
                geosearch_component_1 = geosearch_component_1_1;
            }],
        execute: function() {
            NavbarComponent = (function () {
                function NavbarComponent(renderer, mapService, document) {
                    this.renderer = renderer;
                    this.document = document;
                    this.appTitle = "Flood Event Viewer";
                    this.appTitleMobile = "FEV";
                    this.isShown = false;
                    this.document = document;
                    this.renderer = renderer;
                    this.mapService = mapService;
                }
                NavbarComponent.prototype.toggle = function (isShown) {
                    this.isShown = typeof isShown === 'undefined' ? !this.isShown : isShown;
                    if (this.document && this.document.body) {
                        this.renderer.setElementClass(this.document.body, 'isOpenMenu', this.isShown);
                        if (this.isShown === false) {
                            this.renderer.setElementProperty(this.document.body, 'scrollTop', 0);
                        }
                    }
                };
                NavbarComponent.prototype.setListeners = function (map) {
                    console.log('in navbar component setlisteners');
                    this.subscription = this.mapService.geosearchBounds$.subscribe(
                    ///theoretically, do the fitbounds operation here 
                    function (newBounds) { return map.fitBounds(newBounds); });
                };
                NavbarComponent.prototype.aboutModalOpen = function () {
                    this.aboutModal.open();
                };
                NavbarComponent.prototype.aboutModalClose = function () {
                    this.aboutModal.close();
                };
                NavbarComponent.prototype.geosearchModalOpen = function () {
                    this.geosearchModal.open();
                };
                NavbarComponent.prototype.geosearchModalClose = function () {
                    this.geosearchModal.close();
                };
                __decorate([
                    core_1.ViewChild('aboutModal'), 
                    __metadata('design:type', ng2_bs3_modal_1.ModalComponent)
                ], NavbarComponent.prototype, "aboutModal", void 0);
                __decorate([
                    core_1.ViewChild('geosearchModal'), 
                    __metadata('design:type', ng2_bs3_modal_1.ModalComponent)
                ], NavbarComponent.prototype, "geosearchModal", void 0);
                NavbarComponent = __decorate([
                    core_1.Component({
                        selector: 'fev-navbar',
                        directives: [ng2_bs3_modal_1.MODAL_DIRECTIVES, geosearch_component_1.GeosearchComponent],
                        providers: [geocode_service_1.GeocodingService, map_service_1.MapService],
                        templateUrl: './app/navbar/navbar.component.html'
                    }),
                    __param(2, core_1.Inject(platform_browser_1.DOCUMENT)), 
                    __metadata('design:paramtypes', [core_1.Renderer, map_service_1.MapService, Object])
                ], NavbarComponent);
                return NavbarComponent;
            }());
            exports_1("NavbarComponent", NavbarComponent);
        }
    }
});

//# sourceMappingURL=navbar.component.js.map
