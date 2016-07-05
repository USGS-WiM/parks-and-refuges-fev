import {Component} from '@angular/core';
import {OnInit} from '@angular/core';
import {AfterViewInit} from '@angular/core';

import {MapService} from './map.service';

@Component({
    selector: 'fev-map',
    templateUrl: './app/map/map.component.html',
    providers: [MapService]
})
export class MapComponent implements OnInit, AfterViewInit {
     private mapService: MapService;

     constructor(mapService: MapService) {
        this.mapService = mapService;
    }

    ngOnInit () {
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
        L.control.scale().addTo(map);

        this.mapService.map = map;

        setTimeout(() => { (<any>(this.mapService.map)).invalidateSize(); }, 3000);


    }
    ngAfterViewInit() {
    }



}