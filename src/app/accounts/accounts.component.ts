import { Component, OnInit } from '@angular/core';

// 3rd party imports
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';

// custom imports
import { BankAcc } from '../../assets/BankAcc';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  private accDeets = new BankAcc('','','','','',null,null);
  private user: firebase.User;
  private dbObj: any;
  private bankAdded: boolean;
  
  constructor(private afAuth: AngularFireAuth,
              private db: AngularFireDatabase){
    this.user = afAuth.auth.currentUser;

    db.database.ref('users/'+this.user.uid+'/umeta')
    .child('bankAcc')
    .once('value')
    .then((snap) => {
      if(snap.val()){
        this.bankAdded = snap.val();
      }
    })
    .catch(e => {
      console.log(e.message);
    });

    db.database.ref('beneficiaries/'+this.user.uid)
    .once('value')
    .then((snap) => {
      this.dbObj = snap.val();
      this.accDeets.title = this.dbObj.title;
      this.accDeets.initials = this.dbObj.initials;
      this.accDeets.lname = this.dbObj.lname;
      this.accDeets.bank = this.dbObj.bank;
      this.accDeets.branchNo = this.dbObj.branchNo;
      this.accDeets.accType = this.dbObj.accType;
      this.accDeets.accNo = this.dbObj.accNo;
    })
    .catch(e => {
      console.log(e.message);
    });
  }

  ngOnInit() {
  }

}
