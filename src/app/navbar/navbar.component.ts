import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// third party imports
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { CommonPropertiesService } from '../common-properties.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})

export class NavbarComponent implements OnInit {
  private email: string;
  private pass: string;
  private error: boolean;
  private loggedin: boolean = false;
  private appName: string;
  private userName: string;
  
  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private afDB: AngularFireDatabase,
              public appProps: CommonPropertiesService
              ){ 
    this.appName = this.appProps.appName;
    this.afAuth.authState.subscribe(e => {
      if(e != null) {
        // console.log(e.uid);
        // console.log('user logged in');
        this.email = ''; this.pass = '';
        this.loggedin = true;
        this.getUserData(e);
      }
    });
  }

  login(){
    const promise = this.afAuth.auth.signInWithEmailAndPassword(this.email, this.pass);
    promise.catch(e => {
      console.log(e);
      // this.error = true;
      if(e){
        console.log('log in failed');
        alert("Hmmm... Seems you are not registered or you have entered the wrong email and/or password");
        this.email = ''; this.pass = '';
        this.loggedin = false;
      }
    });
    // if(!this.error) this.router.navigate(['dashboard']);
    // if(!this.error){}
  }

  logout(){
    const promise = this.afAuth.auth.signOut();
    promise.catch(e => {
      console.log(e.message);
      if(e) alert('There was a problem logging out. Please try again.');
    });

    this.loggedin = false; this.email = ''; this.pass = ''; this.userName = '';
    // console.log('user logged out');
  }

  // Posts data to CommonProps service
  storeSessData(data){
    this.appProps.setUserId(data);
  }

  getUserData(e){
    this.afDB.database.ref('/users/'+e.uid)
    .once('value')
    .then(snap => {
      this.userName = snap.val().uname;
      this.appProps.userid = e.uid;
      this.appProps.userDBentry = snap.val();
      // console.log(this.appProps.userDBentry);
      // this.getTempPass(e);
      // this.getBenifData(e);
      this.storeSessData(e.uid);
    })
    .catch(e => {
      console.log(e.message);
    });
  }

  getTempPass(e){
    this.afDB.database.ref('/bccRegQue/'+e.uid)
    .child('tempPassw')
    .once('value')
    .then(snap => {
      this.appProps.userTempPass = snap.val();
    })
    .catch(e => {
      console.log(e.message);
    });
  }

  getBenifData(e){
    this.afDB.database.ref('/beneficiaries/'+e.uid)
    .once('value')
    .then(snap => {
      this.appProps.userBeneficiary = snap.val();
    })
    .catch(e => {
      console.log(e.message);
    });
  }

  ngOnInit() {}

}
