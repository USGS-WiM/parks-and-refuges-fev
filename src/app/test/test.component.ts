import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'geosearch',
    templateUrl: './app/test/test.component.html',
    styleUrls: ['./app/test/test.component.css'],
})
export class TestComponent {
    public address: string;
    public testVar: string = "Hello";
    constructor() {}
}