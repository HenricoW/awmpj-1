export class Transaction{
    constructor(
        public amountBCC: number,
        public amountUSD: number,
        public amountZAR: number,
        public bankTransfTime: number,  // deposit: reflect time, withdraw: time of eft send
        public bccAddress: string,  
        public bccTransfTime: number,   // deposit: reflect time, withdraw: time of eft send
        public depConfirmed: boolean,
        public depRef: string,
        public exchRateBCCUSD: number,
        public exchRateUSDZAR: number,
        public initTime: number,
        public isDeposit: boolean,
        public localBank: string,
        public txId: number,
        public uid: string,
    ){}

    public dep(bank: string, zarAmount: number, depRef: string, userid: string){
        // default values
        this.isDeposit = true;
        this.depConfirmed = false;
        this.bankTransfTime = 0;
        this.bccTransfTime = 0;
        
        this.localBank = bank;
        this.amountZAR = zarAmount;
        this.depRef = depRef;
        // TODO: get exchange rate values
        this.exchRateBCCUSD = 118.00;
        this.exchRateUSDZAR = 13.00;
        this.amountUSD = (zarAmount / this.exchRateUSDZAR);
        this.amountBCC = (this.amountUSD / this.exchRateBCCUSD);
        this.initTime = Date.now();
        // TODO: get session data
        this.uid = userid;
        this.bccAddress = 'a045oNcOA8y502x';
        // TODO: create sequential numbering system
        this.txId = 100002;
    }
}