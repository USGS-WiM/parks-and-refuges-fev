import {Component, OnInit, AfterViewInit} from '@angular/core';

import {MapService} from './map.service';
import {GeocodingService} from './geocode.service';
import {GeosearchComponent} from './geosearch.component';
import {LatLngScaleComponent} from './latLngScale.component';

@Component({
    selector: 'fev-map',
    templateUrl: './app/map/map.component.html',
    styleUrls: ['./app/map/map.component.css'],
    directives: [GeosearchComponent, LatLngScaleComponent],
    providers: [MapService, GeocodingService]
})
export class MapComponent {
     private mapService: MapService;
     private geocoder: GeocodingService;
     public zoomLevel: number = 0;
     public mapScale: string = "";
     public cursorLat: number = 0;
     public cursorLng: number= 0;
     public touchScreen: Boolean = true;

     constructor(mapService: MapService,  geocoder: GeocodingService) {
        this.mapService = mapService;
        this.geocoder = geocoder;
        //var zoomLevel = mapService.map.getZoom;
    }

    ngOnInit() {
        var map = new L.Map('map', {
          zoomControl: false,
          center: new L.LatLng(40.731253, -73.996139),
          zoom: 12,
          minZoom: 4,
          maxZoom: 19,
          layers: [this.mapService.baseMaps.OpenStreetMap]
        });

        L.control.zoom({ position: 'topright' }).addTo(map);
        L.control.layers(this.mapService.baseMaps).addTo(map);

        this.mapService.map = map;

        //2 lines below sets the initial map scale string (and logs to console)
        this.mapScale = this.scaleLookup(this.mapService.zoomLevel);
        console.log('Initial Map scale registered as ' + this.mapScale, this.mapService.zoomLevel);

        //resets map scale on leaflet zoom end event
        map.on('zoomend', () => {
            this.mapScale = this.scaleLookup(this.mapService.zoomLevel);
            console.log('Map scale registered as ' + this.mapScale, this.mapService.zoomLevel);
        });

        //updates lat/lng as cursor moves
        map.on('mousemove', (cursorPosition) => {
            this.touchScreen = false;
            this.cursorLat = cursorPosition.latlng.lat.toFixed(3);
            this.cursorLng = cursorPosition.latlng.lng.toFixed(3);
        });
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


    ngAfterViewInit() {}
}