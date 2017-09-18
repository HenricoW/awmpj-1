export class User{
    constructor(
        public fname: string,
        public lname: string,
        public uname: string,
        public email: string,
        public mobile: number,
        public password: any,
        public confirmPassword: any,
        public day: string,
        public month: string,
        public year: string,
    ){}
}