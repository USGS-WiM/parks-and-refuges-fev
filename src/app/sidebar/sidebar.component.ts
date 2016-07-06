import {Component} from '@angular/core';
import {BUTTON_DIRECTIVES} from 'ng2-bootstrap/components/buttons';

@Component({
    selector: 'fev-sidebar',
    templateUrl: './app/sidebar/sidebar.component.html',
    directives: [BUTTON_DIRECTIVES]
})
export class SidebarComponent {
  public title: string = "Sidebar";
  public singleModel:string = '1';
}