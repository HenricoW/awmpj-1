import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonPropertiesService } from '../common-properties.service';

// third party imports
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { firebaseConfig } from '../../assets/fbConfig';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [CommonPropertiesService]
})

export class DashboardComponent implements OnInit {

  private displayMenu: boolean = false;
  
  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private appProps: CommonPropertiesService,
            ){
    // check if user logged in
    this.afAuth.authState.subscribe(e => {
      if(e == null) {
        console.log('unathorized access');
        this.router.navigate(['/']);
      }
    });
  }

  toggleSideMenu(){
    this.displayMenu = !this.displayMenu;
  }

  ngOnInit() {}

}
