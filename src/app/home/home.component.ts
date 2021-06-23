import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";

import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";
// import { ChartsModule } from 'ng2-charts';

import { CommonPropertiesService } from "../common-properties.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  @ViewChild("chartContainer") chartContainer: ElementRef;

  public appName: string;
  public loggedin: boolean;
  private ratesObj: object;
  private pulledDatesRates = { dates: [], rates: [] };
  private rateVals: number[] = [];
  private rateDates: string[] = [];
  public displayChart: boolean = false;
  private noChartDays: number = 31;
  public coinSupp: string;
  public coinPrice: string;
  public marketCap: string;
  private respJson: Promise<any>;

  // private url: string = "https://api.coinmarketcap.com/v1/ticker/bitcoin/";
  private url: string =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=0951b2aa-7143-4e4f-92cf-11c5b091b5eb&symbol=ETH";

  // bar chart properties
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
  };
  public barChartLabels: string[] = [];
  public barChartColors: Array<any> = [
    {
      backgroundColor: "rgba(255, 123, 61, 1)",
      // backgroundColor: 'rgba(148,159,177,1)',         // grey
    },
  ];
  public barChartType: string = "bar";
  public barChartLegend: boolean = true;
  public barChartData: any[] = [
    {
      data: this.randomArray(this.noChartDays, 20, 5),
      label: "Daily Returns (%)",
    },
  ];

  constructor(
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    public appProps: CommonPropertiesService
  ) {
    this.appName = this.appProps.appName;
    this.updateChart();
    this.afAuth.authState.subscribe((e) => {
      // for registration button
      this.loggedin = e != null ? true : false;
    });

    // fetch(this.url)
    // .then(resp => {
    //   this.respJson = resp.json();
    //   console.log(this.respJson);
    // })
    // .catch(e => {
    //   console.log(e);
    // })

    fetch(this.url)
      .then((resp) => resp.json())
      .then((data) => {
        // var cmcResp = data[0];
        // this.coinSupp = cmcResp.available_supply;
        // this.coinPrice = cmcResp.price_usd;
        // this.marketCap = cmcResp.market_cap_usd;
        console.log(data);
      })
      .catch((e) => {
        console.log(e);
      });

    // this.respJson.then(data => {
    //   console.log(data);
    // })
  }

  private pullRateData(ratesObj): void {
    var i = 0;
    for (var date in ratesObj) {
      this.rateDates.push(date);
      this.rateVals.push(ratesObj[date]);
      i++;
    }
    this.pulledDatesRates.dates = this.rateDates;
    this.pulledDatesRates.rates = this.rateVals;
  }

  private randomNo(min, max) {
    return Math.round((max - min) * Math.random() + min);
  }

  private randomArray(num_elements, min, max) {
    var nums = new Array();
    for (var i = 0; i < num_elements; i++) nums[i] = this.randomNo(min, max);
    return nums;
  }

  // charting library events
  private updateChart(): void {
    this.afDB.database
      .ref("dailyRate")
      .once("value")
      .then((snap) => {
        this.ratesObj = snap.val();
        this.pullRateData(this.ratesObj);
        // update labels
        this.barChartLabels = this.pulledDatesRates.dates.slice(
          this.pulledDatesRates.dates.length - this.noChartDays
        );
        // update values
        let clone = JSON.parse(JSON.stringify(this.barChartData));
        clone[0].data = this.pulledDatesRates.rates.slice(
          this.pulledDatesRates.rates.length - this.noChartDays
        );
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
