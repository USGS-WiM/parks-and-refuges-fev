import {Component, Renderer, Inject, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
    selector: 'fev-navbar',
    directives: [MODAL_DIRECTIVES],
    templateUrl: './app/navbar/navbar.component.html'
})
export class NavbarComponent {
   appTitle: string = "Flood Event Viewer";
   appTitleMobile: string = "FEV";
   @ViewChild('modal')
   modal: ModalComponent;

   public isShown:boolean = false;

    public constructor( private renderer:Renderer, @Inject(DOCUMENT) private document:any) {
        this.document = document;
        this.renderer = renderer;
    }


    public toggle(isShown?:boolean):void {
        this.isShown = typeof isShown === 'undefined' ? !this.isShown : isShown;
        if (this.document && this.document.body) {
        this.renderer.setElementClass(this.document.body, 'isOpenMenu', this.isShown);
        if (this.isShown === false) {
            this.renderer.setElementProperty(this.document.body, 'scrollTop', 0);
        }
        }
    }

    modalOpen() {
        this.modal.open();
    }
    modalClose() {
        this.modal.close();
    }

}