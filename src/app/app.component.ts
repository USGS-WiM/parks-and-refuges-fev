import {Component, OnInit} from "@angular/core";

@Component({
    selector: "app",
    templateUrl: "./app/app.html",
    directives: []
})
export class AppComponent implements OnInit {
    ngOnInit() {
        console.log("Application component initialized ...");
    }
}