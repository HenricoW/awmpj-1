import { Component, OnInit } from '@angular/core';
import { CommonPropertiesService } from '../common-properties.service';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [CommonPropertiesService]
})
export class HomeComponent implements OnInit {
  private appName: string;
  private loggedin: boolean;
  private ratesObj;
  public rateVals:number[] = [];
  private rateDates:string[] = [];;

  // bar chart properties
  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels:string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,1)',
      borderColor: 'rgba(148,159,177,1)',
    }
  ];
  public barChartType:string = 'bar';
  public barChartLegend:boolean = false;
 
  public barChartData:any[] = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Daily Returns'},
  ];
  
  constructor(private afAuth: AngularFireAuth,
              private afDB: AngularFireDatabase,
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

  // charting library events
  public chartClicked(e:any):void {
    console.log(e);
  }
  public chartHovered(e:any):void {
    console.log(e);
  }
  public updateChart():void {

    this.afDB.database.ref('dailyRate')
    .once('value')
    .then((snap) => {
      this.ratesObj = snap.val();
      var i = 0;
      for(var date in this.ratesObj){
        // [DONE] GET THIS TO WORK!!
        this.rateDates.push(date);
        this.rateVals.push(this.ratesObj[date]);
        console.log(this.rateDates[i]+"::"+this.rateVals[i]);
        i++;
      }
    })
    .catch((e) => {
      console.log(e.message);
    });
    
    // Only Change 3 values
    let data = [Math.round(Math.random() * 100), 59, 80,
      (Math.random() * 100), 56,
      (Math.random() * 100), 40];
    let clone = JSON.parse(JSON.stringify(this.barChartData));
    clone[0].data = data;
    this.barChartData = clone;
    /**
     * (My guess), for Angular to recognize the change in the dataset
     * it has to change the dataset variable directly,
     * so one way around it, is to clone the data, change it and then
     * assign it;
     */
  }

  ngOnInit() {
  }

}
