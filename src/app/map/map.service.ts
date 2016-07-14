import {Injectable} from '@angular/core';
import {Map, TileLayer} from 'leaflet';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class MapService {
    public map: Map;
    public baseMaps: any;

    // Observable string sources
    public mapLoadedSource = new BehaviorSubject<boolean>(false);
    public zoomLevelSource = new BehaviorSubject<number>(0);

    // Observable string streams
    mapLoaded$ = this.mapLoadedSource.asObservable();
    zoomLevel$ = this.zoomLevelSource.asObservable();

      // load a web map and return respons
    createMap(domId: any) {
        this.map = new L.Map(domId, {
          zoomControl: false,
          center: new L.LatLng(40.731253, -73.996139),
          zoom: 12,
          minZoom: 4,
          maxZoom: 19,
          layers: [new L.TileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            })]
        });

        this.mapLoadedSource.next(true);

        this.map.on('zoomend', () => {
            this.zoomLevelSource.next(this.map.getZoom());
        });
        // return this.map;
    };

    constructor() {}

    disableMouseEvent(tag: string) {
        var html = L.DomUtil.get(tag);

        L.DomEvent.disableClickPropagation(html);
        L.DomEvent.on(html, 'mousewheel', L.DomEvent.stopPropagation);
    };
}