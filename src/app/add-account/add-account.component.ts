import {
  Component,
  OnInit,
  Attribute,
  OnChanges,
  SimpleChanges,
  Input,
  Directive,
  forwardRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import {
  NG_VALIDATORS,
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
} from "@angular/forms";

// third party imports
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";
// import * as firebase from "firebase/app";
// import User from 'firebase/app' // it's not this; may need to create custom Struct
import { firebaseConfig } from "../../assets/fbConfig";
import * as $ from "jquery";

// custom imports
import { BankAcc } from "../../assets/BankAcc";

@Component({
  selector: "app-add-account",
  templateUrl: "./add-account.component.html",
  styleUrls: ["./add-account.component.css"],
})
export class AddAccountComponent implements OnInit {
  private accSetupDate = Date.now();
  public accDeets = new BankAcc("", "", "", "", "", null, null);
  private accObj: object;
  private user: any;
  private userDB: any;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {
    this.user = afAuth.currentUser;
    db.database
      .ref("users/" + this.user.uid + "/umeta")
      .child("bankAcc")
      .once("value")
      .then((snap) => {
        if (snap.val()) {
          router.navigate([
            "dashboard",
            { outlets: { dashoutlet: ["accounts"] } },
          ]);
        }
      })
      .catch((e) => {
        console.log(e.message);
      });

    this.userDB = JSON.parse(sessionStorage.getItem("userDBentry"));
  }

  ngOnInit() {}

  accToObj(account: BankAcc) {
    return {
      title: account.title,
      initials: account.initials,
      lname: account.lname,
      bank: account.bank,
      branchNo: account.branchNo,
      accType: account.accType,
      accNo: account.accNo,
      accSetupDate: this.accSetupDate,
    };
  }

  onSubmit(): void {
    this.accObj = this.accToObj(this.accDeets);

    const user_uid = sessionStorage.getItem("userid");
    // console.log(user_uid);

    this.db.database
      .ref("/beneficiaries")
      .child(user_uid)
      .set(this.accObj)
      .then(() => {
        console.log("submitted to db");
      })
      .catch((e) => {
        console.log(e.message);
      });

    this.db.database
      .ref("/users")
      .child(user_uid)
      .child("umeta/bankAcc")
      .set(true)
      .then(() => {
        console.log("updated user meta");

        // var benif = sessionStorage.getItem('userBeneficiary');
        // console.log('benificiary data before:');
        // console.log(benif);

        this.userDB.umeta.bankAcc = true;
        sessionStorage.setItem("userDBentry", JSON.stringify(this.userDB));
        sessionStorage.setItem("userBeneficiary", JSON.stringify(this.accObj));
        // console.log(this.userDB);

        // var benif = sessionStorage.getItem('userBeneficiary');
        // console.log('benificiary data after:');
        // console.log(benif);

        this.router.navigate([
          "dashboard",
          { outlets: { dashoutlet: ["accounts"] } },
        ]);
      })
      .catch((e) => {
        console.log(e.message);
      });
  }
}
