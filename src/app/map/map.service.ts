import {Injectable} from '@angular/core';
import {Map, TileLayer} from 'leaflet';

import {ReplaySubject} from 'rxjs/ReplaySubject';

@Injectable()
export class MapService {
    public map: Map;
    public baseMaps: any;

    //Observable bounds source
    private _geosearchBoundsSource = new ReplaySubject<any>();
    geosearchBounds$ = this._geosearchBoundsSource.asObservable();

    constructor() {
        this.baseMaps = {
            OpenStreetMap: new L.TileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            }),
            Esri: new L.TileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            })
        };
    }

    // load a web map and return response
    createMap(domId: any) {
        console.log('in map service createMap function');
        this.map = new L.Map(domId, {
          zoomControl: false,
          center: new L.LatLng(40.731253, -73.996139),
          zoom: this.getURLParameter('zoomLevel') || 12,
          minZoom: 4,
          maxZoom: 19,
          layers: [this.baseMaps.OpenStreetMap]
        });
        L.control.zoom({ position: 'topright' }).addTo(this.map);
        L.control.layers(this.baseMaps).addTo(this.map);
        return this.map;
    };

    getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    // service command
    changeBounds(newBounds: any) {
        this._geosearchBoundsSource.next(newBounds);
    }

    disableMouseEvent(tag: string) {
        var html = L.DomUtil.get(tag);

        L.DomEvent.disableClickPropagation(html);
        L.DomEvent.on(html, 'mousewheel', L.DomEvent.stopPropagation);
    };
}