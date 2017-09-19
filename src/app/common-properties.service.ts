import { Injectable } from '@angular/core';

@Injectable()
export class CommonPropertiesService {
  appName = 'Derivation Analytics';
  userid: string;
  userDBentry: object;
  userTempPass: string;
  userBeneficiary: object;
  bccDailyRates: object;
  
  constructor() {}

}
