import { Injectable } from '@angular/core';

@Injectable()
export class CommonPropertiesService {
  public appName = 'Derivation Analytics';
  public userid: string;
  public userDBentry: any;
  public userTempPass: string;
  public userBeneficiary: any;
  public bccDailyRates: any;
  
  constructor() {}

}
