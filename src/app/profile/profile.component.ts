import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { CommonPropertiesService } from '../common-properties.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: []
})
export class ProfileComponent implements OnInit {
  userName: string;
  lastName: string;
  firstName: string;
  eMail: string;
  phoneN: string;

  constructor(private afAuth: AngularFireAuth,
              private afDB: AngularFireDatabase,
              private appProps: CommonPropertiesService) {
    // this.userName = this.appProps.userDBentry.udata.uname;
    // console.log(appProps.userid);
    //   this.firstName = this.appProps.userDBentry.udata.fname;
    //   this.lastName = this.appProps.userDBentry.udata.lname;
    //   this.eMail = this.appProps.userDBentry.udata.email;
    //   this.phoneN = this.appProps.userDBentry.udata.mobile;
    
    this.afAuth.authState.subscribe(e => {
      if(e != null) {
        this.afDB.database.ref('/users/'+e.uid)
        .child('udata')
        .once('value')
        .then(snap => {
          this.userName = snap.val().uname;
          this.firstName = snap.val().fname;
          this.lastName = snap.val().lname;
          this.eMail = snap.val().email;
          this.phoneN = snap.val().mobile;
        })
        .catch(e => {
          console.log(e.message);
        });
      }
    });
  }

  ngOnInit() {
  }

}
