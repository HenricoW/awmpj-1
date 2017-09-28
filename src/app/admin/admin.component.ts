import { Component, OnInit } from '@angular/core';

import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private message: string;
  private entries: FirebaseListObservable<any[]>;
  private regQue: any;
  private currentKey: string;
  private TS: number;
  private keyList: string[] = [];
  private TSlist: any[] = [];

  constructor(private afDB: AngularFireDatabase) {
    // place admin task here:

    // References to relevant 'tables'
    var regRef = afDB.database.ref('/bccRegQue');
    var usersRef = afDB.database.ref('/users');

    regRef.once('value')
    .then(snap => {
      // Store a local copy of the smaller db and properly format the json
      // << had to do it this way (store local copy of smaller 'table') because of asyncronous hell! >>
      this.regQue = JSON.parse(JSON.stringify(snap.val()));

      // create an array of the user ids (keyList)
      // << only the relevant ones: /bccRegQue to be updated from /users, i.e. not all uids needed >>
      for(var key in this.regQue){
        this.keyList.push(key);
      }

      // Loop through uids, update local copy of entry, push local copy to db
      this.keyList.forEach(key => {
        usersRef.child(key).child('umeta/signupTS')
        .once('value')
        .then(TSsnap => {
          var data = this.regQue[key];                // local entry
          data.signupTS = TSsnap.val();

          regRef.child(key).set(data)                 // Had to push entire entry. Was not allowed to set with new child name!?!
          .catch(e => console.log(e.message) ); 
        })
        .catch(e => console.log(e.message) );
      });
    })
    .catch(e => console.log(e.message) );
  }

  ngOnInit() {
  }

}
