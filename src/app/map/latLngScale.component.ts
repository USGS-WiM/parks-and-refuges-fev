import {Component, OnInit, AfterViewInit} from '@angular/core';
import {MapService} from './map.service';

@Component({
    selector: "lat-lng-scale",
    templateUrl: "./app/map/latLngScale.component.html",
    styleUrls: ['./app/map/latLngScale.component.css'],
    providers: [MapService]
})
export class LatLngScaleComponent implements OnInit {
    public mapService: MapService;
    public mapZoom: number;
    public mapScale: string;

    constructor(mapService: MapService) {
        console.log('in latlngscale component constructor');
        this.mapScale = '5';
        this.mapService = mapService;
    }

    scaleLookup(mapZoom: number) {
        switch (mapZoom) {
            case 19: return '1,128';
            case 18: return '2,256';
            case 17: return '4,513';
            case 16: return '9,027';
            case 15: return '18,055';
            case 14: return '36,111';
            case 13: return '72,223';
            case 12: return '144,447';
            case 11: return '288,895';
            case 10: return '577,790';
            case 9: return '1,155,581';
            case 8: return '2,311,162';
            case 7: return '4,622,324';
            case 6: return '9,244,649';
            case 5: return '18,489,298';
            case 4: return '36,978,596';
            case 3: return '73,957,193';
            case 2: return '147,914,387';
            case 1: return '295,828,775';
            case 0: return '591,657,550';
        }
    }

    ngOnInit() {
        // this.mapService.mapLoaded$.subscribe((state) => {
        //     console.log('map has been loaded: ', state);
        // });

        // this.mapService.zoomLevel$.subscribe((level) => {
        //     console.log('heard from map service zoom level subscription: ', level);
        // });
    }

    ngAfterViewInit() {
        //console.log('is the map loaded: ', this.mapLoaded);
    }
}