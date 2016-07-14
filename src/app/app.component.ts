import {Component, OnInit} from "@angular/core";

import {NavbarComponent} from './navbar/navbar.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {MapComponent} from './map/map.component';
import { HTTP_PROVIDERS } from '@angular/http';


@Component({
    selector: "fev-app",
    templateUrl: "./app/app.component.html",
    directives: [NavbarComponent, SidebarComponent, MapComponent],
    providers: [HTTP_PROVIDERS]
})
export class AppComponent implements OnInit {
    appTitle: string = "Flood Event Viewer";
    ngOnInit() {
        console.log("Application component initialized ...");
    }
}