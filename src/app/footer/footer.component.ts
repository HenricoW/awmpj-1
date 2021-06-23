import { Component, OnInit } from "@angular/core";
import { CommonPropertiesService } from "../common-properties.service";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
  providers: [CommonPropertiesService],
})
export class FooterComponent implements OnInit {
  public appName: string = "";

  constructor(private appProps: CommonPropertiesService) {
    this.appName = this.appProps.appName;
  }

  ngOnInit() {}
}
