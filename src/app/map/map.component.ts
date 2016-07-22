import {Component, ElementRef, OnInit, Output, EventEmitter} from '@angular/core';
import {MapService} from './map.service';
import {GeocodingService} from './geocode.service';
import {GeosearchComponent} from './geosearch.component';

@Component({
    selector: 'fev-map',
    templateUrl: './app/map/map.component.html',
    styleUrls: ['./app/map/map.component.css'],
    directives: [GeosearchComponent],
    providers: [MapService, GeocodingService]
})
export class MapComponent {
    @Output() mapLoaded = new EventEmitter();
    private mapService: MapService;
    private geocoder: GeocodingService;
    public touchScreen: Boolean = true;
    map: any;
    options: Object;

    constructor(private elRef:ElementRef, mapService: MapService,  geocoder: GeocodingService) {
        this.mapService = mapService;
        this.geocoder = geocoder;
    }

    ngOnInit() {
        // create the map
       this.map = this.mapService.createMap(this.elRef.nativeElement.firstChild);
       this.mapLoaded.next(this.map);
    }
    fitBounds(bounds) {
        this.map.fitBounds(bounds.value);
        console.log("made it to navbar component with bounds: " + bounds.value);
    }
}