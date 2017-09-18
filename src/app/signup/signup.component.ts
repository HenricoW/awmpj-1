import { Component, OnInit, Attribute, OnChanges, SimpleChanges, Input, Directive, forwardRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { NG_VALIDATORS, FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

// third party imports
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { firebaseConfig } from '../../assets/fbConfig';
import * as $ from 'jquery';
// import { DatePickerOptions, DateModel } from 'ng2-datepicker';        // DID NOT WORK
// import { NKDatetime } from 'ng2-datetime/ng2-datetime';               // DID NOT WORK
import { IMyDpOptions, IMyInputFocusBlur } from 'mydatepicker';

// custom imports
import { User }    from '../../assets/User';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit {
  
  private model = new User('','','','',null,'','','','','');
  private userjs: any;
  private signupError: boolean;
  private authState: any = null;
  private signUpDateTime = Date.now();
  private userid: string = null;
  // afuser: Observable<firebase.User>;
  private fireDateRequired: boolean = false;
  private formValid: boolean = false;
  private passMinLen: number = 6;

  // datepicker configuration
  private mydate = { date: { year: 2007, month: 12, day: 31 } };
  private myDatePickerOptions: IMyDpOptions = {
    dateFormat: 'dd mm yyyy',
    maxYear: 2007,
    minYear: 1900,
    openSelectorTopOfInput: true,
    showSelectorArrow: false,
    showClearDateBtn: false,
    showTodayBtn: false,
  };

  constructor(private router: Router,
              private afAuth: AngularFireAuth,
              private db: AngularFireDatabase
              ){
    // this.date = new Date();
    this.afAuth.authState.subscribe((auth) => {
      if(auth) {
        // console.log(auth.uid);
        if(!this.userid){this.userid = auth.uid;} else {return;}

        // after account successfully created, upload user data + new uid to db
        if(true /*!this.signupError*/){
          // convert data to json
          this.userjs = this.userToObj(this.model);
          console.log(this.userjs);
          // publish to db
          this.db.database.ref('/users')
          .child(auth.uid)
          .set(this.userjs)
          // this.db.list('/users').push(this.userjs)
          .catch(e => {
            console.log(e.message);
          });
          this.db.database.ref('/bccRegQue')
          // .child(this.signUpDateTime.toString())
          .child(auth.uid)
          .set({
            "fname": this.model.fname,
            "lname": this.model.lname,
            "uname": this.model.uname,
            "email": this.model.email,
            "mobile": this.model.mobile,
            "dobD": this.mydate.date.day.toString(),
            "dobM": this.mydate.date.month.toString(),
            "dobY": this.mydate.date.year.toString(),
            "tempPassw": 'aPa55w0Rd'// TODO: generatePwdFcn()
          })
          .catch(e => {
            console.log(e.message);
          });
        }
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
    const promise = this.afAuth.auth.createUserWithEmailAndPassword(this.model.email, this.model.password);
    promise
    .then(() => {
      this.router.navigate(['about']);
    })
    .catch(e => {
      console.log(e.message);
    });
    // cannot push to db here, uid only available after server response, thus moved authState listener
  }

  // convert User class data to JSON obj in format to be used in /users db
  userToObj(theUser: User){
    return {
      "uname": theUser.uname,
      "udata": {
        "uname": theUser.uname,     // duplicated in prep for de-normalization
        "fname": theUser.fname,
        "lname": theUser.lname,
        "email": theUser.email,
        "mobile": theUser.mobile,
        "dobD": this.mydate.date.day.toString(),
        "dobM": this.mydate.date.month.toString(),
        "dobY": this.mydate.date.year.toString(),
        "tempPassw": 'aPa55w0Rd'// TODO: generatePwdFcn()
      },
      "umeta": {
        "signupTS": this.signUpDateTime,
        "bccActive": false,
        "bccPassChg": false,
        "bcc2FA": false,
        "bccCodeCard": false,
        "bankAcc": false,
        "bccAddressConfirmed": false,
      }
    };
  }

  // onDateFocusBlur(event: IMyInputFocusBlur): void {
  //   console.log('onInputFocusBlur(): Reason: ', event.reason, ' - Value: ', event.value);
  //   if(event.reason == 2) {
  //     if(this.mydate.date.day == 0 && this.mydate.date.month == 0 && this.mydate.date.year == 1975){
  //       this.fireDateRequired = true;
  //       this.formValid = false;
  //     } else {
  //       this.fireDateRequired = false;
  //       this.formValid = true;
  //     }
  //   } else {
  //     this.fireDateRequired = false;
  //   }
  // }

  onDateChange(event: IMyInputFocusBlur): void {
    this.formValid = true;
  }

  ngOnInit() {}

}
