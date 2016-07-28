import {Component, Renderer, Inject, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {GeocodingService} from './../map/geocode.service';
import {MapService} from './../map/map.service';
import {GeosearchComponent} from './../map/geosearch.component';
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'fev-navbar',
    directives: [MODAL_DIRECTIVES, GeosearchComponent],
    providers: [GeocodingService, MapService],
    templateUrl: './app/navbar/navbar.component.html'
})
export class NavbarComponent {
   appTitle: string = "Flood Event Viewer";
   appTitleMobile: string = "FEV";
   @ViewChild('aboutModal') aboutModal:ModalComponent;
   @ViewChild('geosearchModal') geosearchModal:ModalComponent;
   private mapService: MapService;
   subscription: Subscription;

   public isShown:boolean = false;

    public constructor( private renderer:Renderer, mapService: MapService, @Inject(DOCUMENT) private document:any) {
        this.document = document;
        this.renderer = renderer;
        this.mapService = mapService;
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

    setListeners(map:any) {
        console.log('in navbar component setlisteners');
       this.subscription = this.mapService.geosearchBounds$.subscribe(
          ///theoretically, do the fitbounds operation here 
         newBounds => map.fitBounds(newBounds)
        );
    }

    aboutModalOpen() {
        this.aboutModal.open();
    }
    aboutModalClose() {
        this.aboutModal.close();
    }
    geosearchModalOpen() {
        this.geosearchModal.open();
    }
    geosearchModalClose() {
        this.geosearchModal.close();
    }

}