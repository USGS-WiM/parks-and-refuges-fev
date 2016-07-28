import {Component, ViewChild, OnInit} from "@angular/core";
import {NavbarComponent} from './navbar/navbar.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {MapComponent} from './map/map.component';
import {LatLngScaleComponent} from './map/latLngScale.component';
import { HTTP_PROVIDERS } from '@angular/http';

@Component({
    selector: "fev-app",
    templateUrl: "./app/app.component.html",
    directives: [NavbarComponent, SidebarComponent, MapComponent, LatLngScaleComponent],
    providers: [HTTP_PROVIDERS]
})
export class AppComponent implements OnInit {
    // references to child components
    @ViewChild(NavbarComponent) navbarComponent:NavbarComponent;
    @ViewChild(SidebarComponent) sidebarComponent:SidebarComponent;
    @ViewChild(MapComponent) mapComponent:MapComponent;
    @ViewChild(LatLngScaleComponent) latLngScaleComponent:LatLngScaleComponent;

    //once the map loads
    onMapLoad(response) {
        console.log('appcomponent : map has been loaded');
        //let const 'map' be our instance of the leaflet map
        const map = response;
        // Start up latlng component listeners the component can work with the map
        this.latLngScaleComponent.setListeners(map);
        this.navbarComponent.setListeners(map);

        //for later reference - this file based off this: 
        //https://github.com/tomwayson/angular2-esri-example/blob/master/app/app.component.ts
    }

    ngOnInit() {
        console.log("Application component initialized ...");
    }
}