import { Component, OnInit } from "@angular/core";

import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";

import { CommonPropertiesService } from "../common-properties.service";

@Component({
  selector: "app-acc-setup",
  templateUrl: "./acc-setup.component.html",
  styleUrls: ["./acc-setup.component.css"],
})
export class AccSetupComponent implements OnInit {
  private uid: string;
  private userDB: any;
  public activated: boolean;
  public passChgd: boolean;
  public goog2fa: boolean;
  public codeCard: boolean;
  public bccAddrAdded: boolean = false;
  public allDone: boolean = false;
  private userObj: any;
  private pass: string;
  private model: any = { bccAddress: "" };
  private formValid: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    private appProps: CommonPropertiesService
  ) {
    this.userDB = JSON.parse(sessionStorage.getItem("userDBentry"));
    this.activated = this.userDB.umeta.bccActive;
    this.passChgd = this.userDB.umeta.bccPassChg;
    this.goog2fa = this.userDB.umeta.bcc2FA;
    this.codeCard = this.userDB.umeta.bccCodeCard;
    this.bccAddrAdded = this.userDB.umeta.bccAddressConfirmed;

    // this.pass = sessionStorage.getItem('userTempPass');
    this.uid = sessionStorage.getItem("userid");
    this.userObj = JSON.parse(sessionStorage.getItem("userDBentry"));
    this.updateUserMeta(this.uid);

    // get updated temp password
    this.afDB.database
      .ref("/users/" + this.uid + "/udata/tempPassw")
      .once("value", (e) => {
        this.pass = e.val();
        sessionStorage.setItem("userPw", this.pass);
      });

    // this.afAuth.authState.subscribe(e => {
    //   if(e != null) {
    //     this.uid = e.uid;
    //     this.afDB.database.ref('/users/'+e.uid)
    //     .child('umeta')
    //     // .once('value')
    //     .on('value', snap => {
    //       this.activated = snap.val().bccActive;
    //       this.passChgd = snap.val().bccPassChg;
    //       this.goog2fa = snap.val().bcc2FA;
    //       this.codeCard = snap.val().bccCodeCard;
    //     })

    //     // this.afDB.database.ref('/users/'+this.uid)
    //     //   .child('udata')
    //     //   .child('tempPassw')
    //     //   .once('value')
    //     //   .then((snap) => {
    //     //     // console.log(snap.val())
    //     //     this.pass = snap.val();
    //     // });
    //   } else {
    //     this.pass = '';
    //   }
    // });
    this.checkDone();

    // console.log(this.userDB.umeta);
  }

  checkAddr() {
    this.formValid = this.model.bccAddress == "" ? false : true;
  }

  updateUserMeta(uid) {
    this.afDB.database
      .ref("/users/" + uid + "/umeta")
      .once("value")
      .then((snap) => {
        var newUmeta: any = snap.val();
        this.userObj.umeta = newUmeta;
        sessionStorage.setItem("userDBentry", JSON.stringify(this.userObj));
        // this.storeSessData(e.uid);
      })
      .catch((e) => {
        console.log(e.message);
      });
  }

  ngOnInit() {}

  checkDone() {
    if (
      this.activated &&
      this.passChgd &&
      this.goog2fa &&
      this.codeCard &&
      this.bccAddrAdded
    ) {
      this.allDone = true;
    } else {
      this.allDone = false;
    }
  }

  bccActivated() {
    this.activated = true;
    console.log("bccActivated fired");
    this.afDB.database
      .ref("/users/" + this.uid)
      .child("umeta")
      .child("bccActive")
      .set(true)
      .then((e) => {
        this.updateUserMeta(this.uid);
        this.checkDone();
      })
      .catch((e) => {
        console.log(e.message);
      });
  }

  bccPassChgd() {
    this.passChgd = true;
    console.log("bccPassChgd fired");
    this.afDB.database
      .ref("/users/" + this.uid)
      .child("umeta")
      .child("bccPassChg")
      .set(true)
      .then((e) => {
        this.updateUserMeta(this.uid);
        this.checkDone();
      })
      .catch((e) => {
        console.log(e.message);
      });
  }

  bcc2FAed() {
    this.goog2fa = true;
    console.log("bcc2FAed fired");
    this.afDB.database
      .ref("/users/" + this.uid)
      .child("umeta")
      .child("bcc2FA")
      .set(true)
      .then((e) => {
        this.updateUserMeta(this.uid);
        this.checkDone();
      })
      .catch((e) => {
        console.log(e.message);
      });
  }

  bccCodeCardMade() {
    this.codeCard = true;
    console.log("setBccAddr fired");
    this.afDB.database
      .ref("/users/" + this.uid)
      .child("umeta")
      .child("bccCodeCard")
      .set(true)
      .then((e) => {
        this.updateUserMeta(this.uid);
        this.checkDone();
      })
      .catch((e) => {
        console.log(e.message);
      });
  }

  setBccAddr() {
    this.bccAddrAdded = true;
    console.log("setBccAddr fired");

    this.afDB.database
      .ref("/users/" + this.uid)
      .child("umeta")
      .child("bccAddressConfirmed")
      .set(true)
      .catch((e) => {
        console.log(e.message);
      });

    this.afDB.database
      .ref("/users/" + this.uid)
      .child("udata")
      .child("bccAddress")
      .set(this.model.bccAddress)
      .then((e) => {
        this.updateUserMeta(this.uid);
        this.checkDone();
      })
      .catch((e) => {
        console.log(e.message);
      });
  }
}
