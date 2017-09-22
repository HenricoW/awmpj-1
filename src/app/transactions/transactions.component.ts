import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  private radio = 'txns';

  constructor() {}

  setDep(){ this.radio = 'dep'; }
  setWdraw(){ this.radio = 'wdraw'; }
  setTxns(){ this.radio = 'txns'; }

  ngOnInit() {}

}
