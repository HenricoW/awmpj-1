import { Component, OnInit } from "@angular/core";

// 3rd party imports
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";
import * as firebase from "firebase/app";

// custom imports
import { BankAcc } from "../../assets/BankAcc";

@Component({
  selector: "app-accounts",
  templateUrl: "./accounts.component.html",
  styleUrls: ["./accounts.component.css"],
})
export class AccountsComponent implements OnInit {
  private accDeets = new BankAcc("", "", "", "", "", null, null);
  // private user: firebase.User;
  private dbObj: any;
  public bankAdded: boolean;
  private userdata: any;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {
    var rawObj = sessionStorage.getItem("userDBentry");
    // console.log(rawObj);
    this.userdata = JSON.parse(rawObj);
    this.bankAdded = this.userdata.umeta.bankAcc;
    // db.database.ref('users/'+this.user.uid+'/umeta')
    // .child('bankAcc')
    // .once('value')
    // .then((snap) => {
    //   if(snap.val()){
    //     this.bankAdded = snap.val();
    //   }
    // })
    // .catch(e => {
    //   console.log(e.message);
    // });

    if (this.bankAdded) {
      this.dbObj = JSON.parse(sessionStorage.getItem("userBeneficiary"));
      this.accDeets.title = this.dbObj.title;
      this.accDeets.initials = this.dbObj.initials;
      this.accDeets.lname = this.dbObj.lname;
      this.accDeets.bank = this.dbObj.bank;
      this.accDeets.branchNo = this.dbObj.branchNo;
      this.accDeets.accType = this.dbObj.accType;
      this.accDeets.accNo = this.dbObj.accNo;
    }
    // db.database.ref('beneficiaries/'+this.user.uid)
    // .once('value')
    // .then((snap) => {
    //   this.dbObj = snap.val();
    //   this.accDeets.title = this.dbObj.title;
    //   this.accDeets.initials = this.dbObj.initials;
    //   this.accDeets.lname = this.dbObj.lname;
    //   this.accDeets.bank = this.dbObj.bank;
    //   this.accDeets.branchNo = this.dbObj.branchNo;
    //   this.accDeets.accType = this.dbObj.accType;
    //   this.accDeets.accNo = this.dbObj.accNo;
    // })
    // .catch(e => {
    //   console.log(e.message);
    // });
  }

  ngOnInit() {}
}
