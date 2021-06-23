import { Component } from "@angular/core";

import { CommonPropertiesService } from "./common-properties.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  providers: [CommonPropertiesService],
})
export class AppComponent {
  constructor(public appProps: CommonPropertiesService) {}
}
