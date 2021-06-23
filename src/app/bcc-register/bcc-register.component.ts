import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

// third party imports
import { AngularFireDatabase } from "@angular/fire/database";

@Component({
  selector: "app-bcc-register",
  templateUrl: "./bcc-register.component.html",
  styleUrls: ["./bcc-register.component.css"],
})
export class BccRegisterComponent implements OnInit {
  uid: string;
  private sub: any;
  dbsuccess: boolean = false;

  constructor(private route: ActivatedRoute, private db: AngularFireDatabase) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe((params) => {
      this.uid = params["id"];
    });
  }

  updateRegField() {
    this.db.database
      .ref("/users")
      .child(this.uid)
      .child("umeta")
      .child("bccRegistered")
      .set(true)
      .then(() => {
        this.dbsuccess = true;
      })
      .catch((e) => {
        console.log(e.message);
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
