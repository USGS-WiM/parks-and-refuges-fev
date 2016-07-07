System.register(['@angular/core', '@angular/platform-browser', 'ng2-bs3-modal/ng2-bs3-modal'], function(exports_1, context_1) {
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
    var core_1, platform_browser_1, ng2_bs3_modal_1;
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
            }],
        execute: function() {
            NavbarComponent = (function () {
                function NavbarComponent(renderer, document) {
                    this.renderer = renderer;
                    this.document = document;
                    this.appTitle = "Flood Event Viewer";
                    this.appTitleMobile = "FEV";
                    this.isShown = false;
                    this.document = document;
                    this.renderer = renderer;
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
                NavbarComponent.prototype.modalOpen = function () {
                    this.modal.open();
                };
                NavbarComponent.prototype.modalClose = function () {
                    this.modal.close();
                };
                __decorate([
                    core_1.ViewChild('modal'), 
                    __metadata('design:type', ng2_bs3_modal_1.ModalComponent)
                ], NavbarComponent.prototype, "modal", void 0);
                NavbarComponent = __decorate([
                    core_1.Component({
                        selector: 'fev-navbar',
                        directives: [ng2_bs3_modal_1.MODAL_DIRECTIVES],
                        templateUrl: './app/navbar/navbar.component.html'
                    }),
                    __param(1, core_1.Inject(platform_browser_1.DOCUMENT)), 
                    __metadata('design:paramtypes', [core_1.Renderer, Object])
                ], NavbarComponent);
                return NavbarComponent;
            }());
            exports_1("NavbarComponent", NavbarComponent);
        }
    }
});

//# sourceMappingURL=navbar.component.js.map
