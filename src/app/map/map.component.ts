import {Component, OnInit, AfterViewInit} from '@angular/core';

import {MapService} from './map.service';
import {GeocodingService} from './geocode.service';
import {GeosearchComponent} from './geosearch.component';

@Component({
    selector: 'fev-map',
    templateUrl: './app/map/map.component.html',
    directives: [GeosearchComponent],
    providers: [MapService, GeocodingService]
})
export class MapComponent {
     private mapService: MapService;
     private geocoder: GeocodingService;

     constructor(mapService: MapService,  geocoder: GeocodingService) {
        this.mapService = mapService;
        this.geocoder = geocoder;
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
        L.control.scale().addTo(map);

        this.mapService.map = map;
    }
    ngAfterViewInit() {}
}