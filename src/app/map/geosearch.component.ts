import {Component, Output, EventEmitter} from '@angular/core';
import {GeocodingService} from './geocode.service';
import {MapService} from './map.service';
import {Location} from './location.class';
import {Map} from 'leaflet';

@Component({
    selector: 'geosearch',
    templateUrl: './app/map/geosearch.component.html',
    styleUrls: ['./app/map/geosearch.component.css']
    //styles: [ 'input { margin: 20px 0 0 20px; width: 300px; height: 35px; border: 2px solid rgba(77, 156, 237, 0.7) font-size: 16px;font: rgb(142, 142, 142);}', '#goto {margin: 20px 0 0 330px; width: 35px; height: 35px; text-align: center;}']
})
export class GeosearchComponent {
    address: string;

    private geocoder: GeocodingService;
    private map: Map;
    private mapService: MapService;
    @Output() locationFound = new EventEmitter();

    constructor(geocoder: GeocodingService, mapService: MapService) {
        this.address = '';
        this.geocoder = geocoder;
        this.mapService = mapService;
    }

    ngOnInit() {
        this.mapService.disableMouseEvent('goto');
        this.mapService.disableMouseEvent('place-input');
    }

    goto() {
        if (!this.address) { return; }

        this.geocoder.geocode(this.address)
        .subscribe(location => {
            this.address = location.address;
            var newBounds = location.viewBounds;
            this.mapService.changeBounds(newBounds);
        }, error => console.error(error));
    }
}