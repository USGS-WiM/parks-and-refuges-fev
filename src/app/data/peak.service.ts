import {Http, Headers, Response} from '@angular/http';
import {Injectable} from '@angular/core';

@Injectable()
export class PeakService {
    private http: Http;

    constructor(http: Http) {
        this.http = http;
    }
}