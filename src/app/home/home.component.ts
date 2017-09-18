import { Component, OnInit } from '@angular/core';
import { CommonPropertiesService } from '../common-properties.service';

import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [CommonPropertiesService]
})
export class HomeComponent implements OnInit {
  private appName: string = '';
  private loggedin: boolean;
  
  constructor(private afAuth: AngularFireAuth, 
              private appProps: CommonPropertiesService) {
    this.appName = this.appProps.appName;
    this.afAuth.authState.subscribe(e => {
      if(e != null) {
        // console.log('user logged in');
        this.loggedin = true;
      } else {
        this.loggedin = false;
      }
    });
  }

  ngOnInit() {
  }

}
