import {Http, Headers, Response} from '@angular/http';
import {Location} from './location.class';
import {Injectable} from '@angular/core';
import {LatLngBounds} from 'leaflet';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class GeocodingService {
    private http: Http;

    constructor(http: Http) {
        this.http = http;
    }

    geocode(address: string) {
        return this.http
            .get('http://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address))
            .map(res => res.json())
            .map(result => {
                if (result.status !== 'OK') { throw new Error('unable to geocode address'); }
                var location = new Location();
                location.address = result.results[0].formatted_address;
                location.latitude = result.results[0].geometry.location.lat;
                location.longitude = result.results[0].geometry.location.lng;

                var viewPort = result.results[0].geometry.viewport;
                location.viewBounds = new LatLngBounds(
                  {lat: viewPort.southwest.lat, lng: viewPort.southwest.lng},
                  {lat: viewPort.northeast.lat, lng: viewPort.northeast.lng});
                return location;
            });
    }
}