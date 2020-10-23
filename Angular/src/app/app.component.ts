import { Component } from '@angular/core';
import { Service } from './app.service';
import GroupSelectionHelper from './GroupSelectionHelper'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [Service]
})
export class AppComponent {
  dataSource: object;
  helper: GroupSelectionHelper;
    myJsonObject: Array<any>;

  constructor(service: Service) {
    this.myJsonObject = service.getData();
    this.dataSource = {
      store: {
          type: 'array',
          key: "ProductID",
          data: this.myJsonObject
      }
    }

    this.onInitialized = this.onInitialized.bind(this)
  }

  onInitialized(e) {
    if (!this.helper) {
        this.helper = new GroupSelectionHelper(e.component, this.myJsonObject, "ProductID");
    }
  }
}
