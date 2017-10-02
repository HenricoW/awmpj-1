import { Component, OnInit } from '@angular/core';
import { NG_VALIDATORS, FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';

import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

// custom imports
import { Transaction } from '../../assets/Transaction';
import { CommonPropertiesService } from '../common-properties.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  private radio: string = 'txns';
  private bankVal: string = '';
  private amountVal: number = null;
  private userid: string;
  private initTime = Date.now();
  private depObj = new Transaction(0,0,0,0,null,0,false,null,0,0,0,false,null,0,null);
  private txList: any[] = [];
  private userObj: any;
  private userDepRef: string;
  private anyTxns: boolean = false;
  private bccSecure: boolean = false;
  private bccSecureCC: boolean = false;
  private bccAddrAdded: boolean = false;
  private withdrawAcc: boolean = false;
  private canWithdraw: boolean = false;
  private canDeposit: boolean = false;

  constructor(private db: AngularFireDatabase,
              private router: Router,
              public appProps: CommonPropertiesService
              ) {
    this.userid = sessionStorage.getItem('userid');
    this.userObj = JSON.parse(sessionStorage.getItem('userDBentry'));
    this.userDepRef = this.userObj.udata.depRef;
    
    // secure for deposits
    this.bccSecure = this.userObj.umeta.bccActive && this.userObj.umeta.bcc2FA && this.userObj.umeta.bccPassChg;
    // secure for withdrawals
    this.bccSecureCC = this.userObj.umeta.bccActive && this.userObj.umeta.bcc2FA && this.userObj.umeta.bccCodeCard && this.userObj.umeta.bccPassChg;
    this.bccAddrAdded = this.userObj.umeta.bccAddressConfirmed;
    this.withdrawAcc = this.userObj.umeta.bankAcc;

    this.canDeposit = this.bccSecure && this.bccAddrAdded
    this.canWithdraw = this.bccSecureCC && this.bccAddrAdded && this.withdrawAcc

    this.getTxns();
  }

  setDep():void { this.radio = 'dep'; }
  setWdraw():void { this.radio = 'wdraw'; }
  setTxns():void { this.radio = 'txns'; }

  submitDeposit():void {
    this.depObj.dep(this.bankVal, this.amountVal, this.userDepRef, this.userid);
    // push txObj to db (use push to generate sequential ids)
    this.db.database.ref('/transactions')
    .push(this.depObj)
    .then(() => {
      // console.log('submitted to db');
      this.bankVal = '';
      this.amountVal = null;
      this.radio = 'txns';        // redirect to transactions page
      this.txList = [];
      this.getTxns();
    })
    .catch(e => {
      console.log(e.message);
    });
  }

  // get txns from db
  getTxns():void {
    this.db.database.ref('/transactions')
    .orderByChild('uid')
    .equalTo(this.userid)
    .once('value')
    .then((snap) => {
      if(snap.val()){
        this.anyTxns = true;
        // console.log(snap.val());
        // console.log('anyTxns: '+this.anyTxns);
        snap.forEach(childSnap => {
          // create temporary object
          let dbTxObj;
          // parse db data
          let date: string = this.appProps.convertToDate(childSnap.val().initTime);
          let txType: string = (childSnap.val().isDeposit == true) ? 'Deposit' : 'Withdrawal';
          let txStatus: string = (childSnap.val().depConfirmed == true) ? 'Confirmed' : 'Pending';

          dbTxObj = {
            initTime: date,
            amountZAR: childSnap.val().amountZAR,
            isDeposit: txType,
            localBank: childSnap.val().localBank,
            depConfirmed: txStatus
          };
          this.txList.push(dbTxObj);
        });
      }
    })
    .catch(e => {
      console.log(e.message);
    });;
  }

  ngOnInit() {}

}
