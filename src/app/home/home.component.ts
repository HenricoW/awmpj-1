import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('chartContainer') chartContainer: ElementRef;

  private appName: string;
  private loggedin: boolean;
  private ratesObj: object;
  private pulledDatesRates = {'dates':[], 'rates':[]};
  private rateVals: number[] = [];
  private rateDates: string[] = [];
  private displayChart: boolean = false;
  private noChartDays: number = 21;

  // bar chart properties
  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels:string[] = [];
  public barChartColors:Array<any> = [
    { 
      backgroundColor: 'rgba(255, 123, 61, 1)',
      // backgroundColor: 'rgba(148,159,177,1)',         // grey
    }
  ];
  public barChartType:string = 'bar';
  public barChartLegend:boolean = true;
 
  public barChartData:any[] = [
    {data: this.randomArray(this.noChartDays, 20, 5) , label: 'Daily Returns (%)'},
  ];
  
  constructor(private afAuth: AngularFireAuth,
              private afDB: AngularFireDatabase,
              private appProps: CommonPropertiesService) {
    this.appName = this.appProps.appName;
    this.updateChart();
    this.afAuth.authState.subscribe(e => {
      // for registration button
      this.loggedin = (e != null) ? true : false;
    });
  }

  private pullRateData(ratesObj):void {
    var i = 0;
    for(var date in ratesObj){
      this.rateDates.push(date);
      this.rateVals.push(ratesObj[date]);
      i++;
    }
    this.pulledDatesRates.dates = this.rateDates;
    this.pulledDatesRates.rates = this.rateVals;
  }

  private randomNo(min,max) {
    return (Math.round((max-min) * Math.random() + min));
  }

  private randomArray(num_elements,min,max) {
    var nums = new Array;
    for (var i=0; i<num_elements; i++) nums[i] = this.randomNo(min,max);
    return (nums);
  }

  // charting library events
  private updateChart():void {
    this.afDB.database.ref('dailyRate')
    .once('value')
    .then((snap) => {
      this.ratesObj = snap.val();
      this.pullRateData(this.ratesObj);
      // update labels
      this.barChartLabels = 
        this.pulledDatesRates.dates.slice(this.pulledDatesRates.dates.length-this.noChartDays);
      // update values
      let clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data = 
        this.pulledDatesRates.rates.slice(this.pulledDatesRates.rates.length-this.noChartDays);
      this.barChartData = clone;
      /* (My guess), for Angular to recognize the change in the dataset it has to change the dataset variable directly,
       * so one way around it, is to clone the data, change it and then assign it;
       */
      this.displayChart = true;
    })
    .catch((e) => {
      console.log(e.message);
    });
  }

  ngOnInit() {}

}
