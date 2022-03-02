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
import { Observable } from "rxjs";
import { Router } from "@angular/router";
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
// import * as firebase from 'firebase/app';
// import { firebaseConfig } from '../../assets/fbConfig';
// import * as $ from 'jquery';
// import { IMyDpOptions, IMyInputFocusBlur } from "mydatepicker";
import {
  IAngularMyDpOptions,
  IMyInputFieldChanged,
} from "angular-mydatepicker";
// import { DatePickerOptions, DateModel } from 'ng2-datepicker';        // DID NOT WORK
// import { NKDatetime } from 'ng2-datetime/ng2-datetime';               // DID NOT WORK

// custom imports
import { User } from "../../assets/User";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  public model = new User("", "", "", "", null, "", "", "", "", "");
  private userjs: any;
  private authState: any = null;
  private signUpDateTime = Date.now();
  private userid: string = null;
  // afuser: Observable<firebase.User>;
  public fireDateRequired: boolean = false;
  public formValid: boolean = true; //  nb nb nb nb: CHANGE THIS BAAACKKKK!!!
  public passMinLen: number = 6;
  private latestYear: number = 2002;

  // datepicker configuration
  public mydate = { date: { year: this.latestYear, month: 12, day: 31 } }; // default date and latest valid date
  public myDatePickerOptions: IAngularMyDpOptions = {
    dateFormat: "dd mm yyyy",
    maxYear: this.latestYear,
    minYear: 1900,
    openSelectorTopOfInput: true,
    showSelectorArrow: false,
    // showClearDateBtn: false,
    // showTodayBtn: false,
  };

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {
    this.afAuth.authState.subscribe((auth) => {
      if (auth) {
        // if(!this.userid){this.userid = auth.uid;} else {return;}
        if (auth.uid) {
          this.router.navigate(["about"]);
        }

        // after account successfully created, upload user data + new uid to db
        // convert data to required json tree
        this.userjs = this.userToObj(this.model);
        // publish to user json to db
        this.db.database
          .ref("/users")
          .child(auth.uid)
          .set(this.userjs)
          .catch((e) => {
            console.log(e.message);
          });

        // publish to registration que db
        this.db.database
          .ref("/bccRegQue")
          .child(auth.uid)
          .set({
            fname: this.model.fname,
            lname: this.model.lname,
            uname: this.model.uname,
            email: this.model.email,
            mobile: this.model.mobile,
            // dobD: this.mydate.date.day.toString(),
            // dobM: this.mydate.date.month.toString(),
            // dobY: this.mydate.date.year.toString(),
            dobD: "12",
            dobM: "12",
            dobY: "2002",
            signupTS: this.signUpDateTime,
            tempPassw: "aPa55w0Rd", // DONE - IN CLOUD FUNCTION: generatePwdFcn()
          })
          .catch((e) => {
            console.log(e.message);
          });
      }
    });

    // const messaging = firebase.messaging();
    // messaging.requestPermission()
    // // .then(() => {
    // //   console.log('Have permission');
    // // })
    // .then((token) => {
    //   console.log(token);
    // })
    // .catch((err) => {
    //   console.log(err.message);
    // })
  }

  onSubmit() {
    const promise = this.afAuth.createUserWithEmailAndPassword(
      this.model.email,
      this.model.password
    );
    promise
      .then(() => {
        this.router.navigate(["about"]);
      })
      .catch((e) => {
        console.log(e.message);
      });
    // cannot push to db here, uid only available after server response, thus moved authState listener
  }

  // convert User class data to JSON obj in format to be used in /users db
  userToObj(theUser: User) {
    return {
      uname: theUser.uname,
      udata: {
        uname: theUser.uname, // duplicated in prep for de-normalization
        fname: theUser.fname,
        lname: theUser.lname,
        email: theUser.email,
        mobile: theUser.mobile,
        dobD: this.mydate.date.day.toString(),
        dobM: this.mydate.date.month.toString(),
        dobY: this.mydate.date.year.toString(),
        tempPassw: "aPa55w0Rd", // DONE - IN CLOUD FUNCTION:: generatePwdFcn()
      },
      umeta: {
        signupTS: this.signUpDateTime,
        bccActive: false,
        bccPassChg: false,
        bcc2FA: false,
        bccCodeCard: false,
        bankAcc: false,
        bccAddressConfirmed: false,
      },
    };
  }

  onDateChange(event: IMyInputFieldChanged): void {
    this.formValid = true;
  }

  ngOnInit() {}
}
