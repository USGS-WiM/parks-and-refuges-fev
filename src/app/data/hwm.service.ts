import {Http, Headers, Response} from '@angular/http';
import {Injectable} from '@angular/core';

@Injectable()
export class HWMService {
    private http: Http;

    constructor(http: Http) {
        this.http = http;
    }
}