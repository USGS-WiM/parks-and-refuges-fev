import { Component, ElementRef, Output, EventEmitter, OnChanges } from '@angular/core';
import {MapService} from './map.service';

import {GeocodingService} from './geocode.service';
import {GeosearchComponent} from './geosearch.component';
import {LatLngScaleComponent} from './latLngScale.component';

@Component({
    selector: 'fev-map',
    templateUrl: './app/map/map.component.html',
    styleUrls: ['./app/map/map.component.css'],
    directives: [GeosearchComponent, LatLngScaleComponent],
    providers: [MapService, GeocodingService],
    inputs: ['options']
})
export class MapComponent {
    @Output() mapLoaded = new EventEmitter();

    map: any;
    public latLngScaleComponent: LatLngScaleComponent;

    constructor(private elRef:ElementRef, private _mapService:MapService) {}

    ngOnInit() {
        // create the map
        this.map = this._mapService.createMap(this.elRef.nativeElement.firstChild);

        this._mapService.mapLoaded$.subscribe((state) => {
            console.log('map has been loaded: ', state);
        });

        this._mapService.zoomLevel$.subscribe((level) => {
            console.log('heard from map service zoom level subscription: ', level);
        });
    }

    ngOnChanges(changes) {
      console.log(changes);
  }
}