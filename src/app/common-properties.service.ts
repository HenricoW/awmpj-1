import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject'

@Injectable()
export class CommonPropertiesService {
  public appName = 'Derivation Analytics';
  public userid: string = 'initVal';
  public userDBentry: any;
  public userTempPass: string;
  public userBeneficiary: any;
  public bccDailyRates: any;

  // Observable string source
  private useridSource = new Subject<string>();

  // Observable string stream
  useridString$ = this.useridSource.asObservable();

  // Service command
  setUserId(data: string){ 
    this.useridSource.next(data);
    console.log('setting userid in service');
  }
  
}
