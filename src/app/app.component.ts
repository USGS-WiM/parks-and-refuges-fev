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
    appTitle: string = "Flood Event Viewer";
    // references to child components
    @ViewChild(NavbarComponent) navbarComponent:NavbarComponent;
    @ViewChild(SidebarComponent) sidebarComponent:SidebarComponent;
    @ViewChild(MapComponent) mapComponent:MapComponent;
    @ViewChild(LatLngScaleComponent) latLngScaleComponent:LatLngScaleComponent;

    // once the map loads
    onMapLoad(response) {
        console.log('appcomponent : map has been loaded');
        const map = response;

        // Start up lnglng component listeners
        this.latLngScaleComponent.setListeners(map);

        // // initialize the leged dijit with map and layer infos
        // this.legendComponent.init(map, response.layerInfos);
        // // set the selected basemap
        // this.basemapSelect.selectedBasemap = response.basemapName;
        // // bind the map title
        // this.title = response.itemInfo.item.title;
        // //bind the legendlayer
        // this.LayerComponent.init(response);
    }
    ngOnInit() {
        console.log("Application component initialized ...");
    }
}