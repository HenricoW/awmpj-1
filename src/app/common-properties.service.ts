import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class CommonPropertiesService {
  public appName = "Nuvest Analytics";
  public userid: string = "initVal";
  public userDBentry: any;
  public userTempPass: string;
  public userBeneficiary: any;
  public bccDailyRates: any;

  // Observable string source
  private useridSource = new Subject<string>();

  // Observable string stream
  useridString$ = this.useridSource.asObservable();

  // Service command
  setUserId(data: string): void {
    this.useridSource.next(data);
    console.log("setting userid in service");
  }

  // utility function(s)
  convertToDate(msEpoch: number): string {
    var d = new Date(0);
    d.setUTCMilliseconds(msEpoch);
    return d.toLocaleString();
  }
}
