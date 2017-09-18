import { Component, OnInit, Attribute, OnChanges, SimpleChanges, Input, Directive, forwardRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { NG_VALIDATORS, FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

// third party imports
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { firebaseConfig } from '../../assets/fbConfig';
import * as $ from 'jquery';

// custom imports
import { BankAcc } from '../../assets/BankAcc';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.css']
})
export class AddAccountComponent implements OnInit {
  private accSetupDate = Date.now();
  private accDeets = new BankAcc('','','','','',null,null);
  private accObj: object;
  private user: firebase.User;

  constructor(private router: Router,
              private afAuth: AngularFireAuth,
              private db: AngularFireDatabase){
    this.user = afAuth.auth.currentUser;
    db.database.ref('users/'+this.user.uid+'/umeta')
    .child('bankAcc')
    .once('value')
    .then((snap) => {
      if(snap.val()){
        router.navigate(['dashboard', {outlets: {'dashoutlet': ['accounts']}}])
      }
    })
    .catch(e => {
      console.log(e.message);
    });
  }

  ngOnInit() {}

  accToObj(account: BankAcc){
    return {
      "title": account.title,
      "initials": account.initials,
      "lname": account.lname,
      "bank": account.bank,
      "branchNo": account.branchNo,
      "accType": account.accType,
      "accNo": account.accNo,
      "accSetupDate": this.accSetupDate,
    };
  }

  onSubmit(){
    this.accObj = this.accToObj(this.accDeets);

    this.db.database.ref('/beneficiaries')
    .child(this.user.uid)
    .set(this.accObj)
    .then(() => {
      console.log('submitted to db');
    })
    .catch(e => {
      console.log(e.message);
    });

    this.db.database.ref('/users')
    .child(this.user.uid)
    .child('umeta/bankAcc')
    .set(true)
    .then(() => {
      console.log('updated user meta');
      this.router.navigate(['dashboard', {outlets: {'dashoutlet': ['accounts']}}])
    })
    .catch(e => {
      console.log(e.message);
    });
  }

}
 