import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { CommonPropertiesService } from '../common-properties.service';

@Component({
  selector: 'app-acc-setup',
  templateUrl: './acc-setup.component.html',
  styleUrls: ['./acc-setup.component.css']
})
export class AccSetupComponent implements OnInit {
  uid: string;
  activated: boolean;
  passChgd: boolean;
  goog2fa: boolean;
  codeCard: boolean;
  allDone: boolean = true;
  pass: string;

  constructor(private afAuth: AngularFireAuth,
              private afDB: AngularFireDatabase,
              private appProps: CommonPropertiesService) {
    this.afAuth.authState.subscribe(e => {
      if(e != null) {
        this.uid = e.uid;
        this.afDB.database.ref('/users/'+e.uid)
        .child('umeta')
        // .once('value')
        .on('value', snap => {
          this.activated = snap.val().bccActive;
          this.passChgd = snap.val().bccPassChg;
          this.goog2fa = snap.val().bcc2FA;
          this.codeCard = snap.val().bccCodeCard;
          if(this.activated && this.passChgd && this.goog2fa && this.codeCard){
            this.allDone = true;
          } else {
            this.allDone = false;
          }
        })

        this.afDB.database.ref('/users/'+this.uid)
          .child('udata')
          .child('tempPassw')
          .once('value')
          .then((snap) => {
            // console.log(snap.val())
            this.pass = snap.val();
        });
      } else {
        this.pass = '';
      }
    });

    console.log(appProps.userid);
  }

  ngOnInit() {}

  bccActivated(){
    this.afDB.database.ref('/users/'+this.uid)
    .child('umeta')
    .child('bccActive')
    .set(true)
    .catch(e => {
      console.log(e.message);
    });
  }

  bccPassChgd(){
    this.afDB.database.ref('/users/'+this.uid)
    .child('umeta')
    .child('bccPassChg')
    .set(true)
    .catch(e => {
      console.log(e.message);
    });
  }

  bcc2FAed(){
    this.afDB.database.ref('/users/'+this.uid)
    .child('umeta')
    .child('bcc2FA')
    .set(true)
    .catch(e => {
      console.log(e.message);
    });
  }

  bccCodeCardMade(){
    this.afDB.database.ref('/users/'+this.uid)
    .child('umeta')
    .child('bccCodeCard')
    .set(true)
    .catch(e => {
      console.log(e.message);
    });
  }

}
