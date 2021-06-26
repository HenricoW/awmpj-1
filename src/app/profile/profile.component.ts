import { Component, OnInit } from "@angular/core";

import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";

import { CommonPropertiesService } from "../common-properties.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  public userName: string;
  public lastName: string;
  public firstName: string;
  public eMail: string;
  public phoneN: string;
  private userdata: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    public appProps: CommonPropertiesService
  ) {
    this.userdata = JSON.parse(sessionStorage.getItem("userDBentry"));
    this.userName = this.userdata.udata.uname;
    this.firstName = this.userdata.udata.fname;
    this.lastName = this.userdata.udata.lname;
    this.eMail = this.userdata.udata.email;
    this.phoneN = this.userdata.udata.mobile;
  }

  ngOnInit() {}
}
