'use strict';
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');                // Firebase Admin SDK to access Database. 
const generator = require('generate-password');

admin.initializeApp(functions.config().firebase);
// CHANGE THIS: Configure the `gmail.email` and `gmail.password` Firebase Cloud environment variables.
const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);
const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);

// CHANGE THIS: Company name to include in the emails
const APP_NAME = 'Nuvest';
const  REG_URL = 'http://localhost:4200';
// const  REG_URL = 'http://localhost:4200/bccregister/4QbH5CzNedc76oHj4PsoNLzih8N2';

const destEmail = 'rico2chatter@gmail.com';
const [userdata, fname, lname, uname] = [null, null, null, null];
const [email, phone, userid, pass] = [null, null, null, null];


/**
 * Sends admin an email about a new deposit.
 */
exports.firstCronMail = functions.https
.onRequest((req, resp) => {
  const subject = req.body.q;                                     // bank mail subject in POST query
  // process text
  const amount = subject.slice(8, subject.indexOf('paid')-1);
  const refStart = subject.indexOf('Ref')+4;
  const snip = subject.slice(refStart);
  const depRef = snip.slice(0, snip.indexOf('.'));

  // do db entry
  admin.database().ref('/bankDeposits')
  .push({
    'amountRaw': amount,
    'amount': +amount.slice(1),
    'ref': depRef,
    'TS': Date.now()
  })
  .catch( e => console.log(e.message) );

  // notify admin of action
  const mssg = `New deposit has been received:\nAmount: \t${amount}\nRefernce: \t${depRef}`;
  const mailOptions = {
    from: `${APP_NAME} <noreply@nuvest.co.za>`,
    to: destEmail,
    subject: 'Deposit',
    text: mssg
  };

  mailTransport.sendMail(mailOptions)
  .then(() => {
    console.log('Deposit e-mail sent to admin:', destEmail);
    resp.send('Email sent');
    // return mssg = '';                          // send to next callback
  })
  // could send email by appending .then() here and using mailTransport.sendmail()
  // then use the mssg variable returned by the prev .then()
  .catch( e => console.log(e.message) );
});



/**
 * Sends admin an email about a new user.
 */
exports.sendNewUserEmail = functions.database
  .ref('/users/{pushId}')
  .onCreate(e => {
    console.log('User created'); console.log(e.data.val()); console.log(e.eventType);
    this.userid = e.params.pushId;
    this.userdata = e.data.val();
    this.fname = this.userdata.udata.fname;
    this.lname = this.userdata.udata.lname;
    this.uname = this.userdata.uname;
    this.email = this.userdata.udata.email;
    this.phone = this.userdata.udata.mobile;

    return sendNewUserEmail(this.fname, this.lname, this.uname, this.email, this.phone);
  });

  
// Sends admin an email about user signup.
function sendNewUserEmail(fname, lname, uname, email, phone) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@nuvest.co.za>`,
    to: destEmail
  };
  mailOptions.subject = `New user on ${APP_NAME}!`;
  mailOptions.html = 
    `<h3 style="text-align: center;">New user signed up 
    and has been qued on the bcc register dataabase</h3>
    <table><tr><td>Name:</td><td>${fname}</td></tr>
    <tr><td>Surname:</td><td>${lname}</td></tr>
    <tr><td>User name:</td><td>${uname}</td></tr>
    <tr><td>e-mail:</td><td>${email}</td></tr>
    <tr><td>phone:</td><td>${phone}</td></tr></table>`
  
  return mailTransport.sendMail(mailOptions).then(() => {
    console.log('Email sent to admin:', destEmail);
  });
}



/**
 * Generate unique user temporary password
 */
exports.createTempPassw = functions.database
  .ref('/users/{pushId}')
  .onCreate(e => {
    console.log('Generating password'); console.log(e.eventType);
    this.userid = e.params.pushId;
    this.pass = generator.generate({length: 15, numbers: true});
    console.log(this.pass);

    // call function to update bccRegQue pass entry
    copyTempPass(this.pass, this.userid);

    // update db with password
    return e.data.ref.child('udata').child('tempPassw').set(this.pass);
  });

// copy password to bccRegQue db
function copyTempPass(pass, pushId){
  admin.database().ref('bccRegQue/'+pushId+'/tempPassw')
  .set(pass)
  .then( e => console.log('temp passw has been copied') )
  .catch( e => console.log(e.message) );  
}



/**
 * Generate unique deposit reference for new user
 */
exports.createDepRef = functions.database
  .ref('/users/{pushId}')
  .onCreate(e => {
    console.log('Generating deposit reference');
    console.log(e.eventType);
    var depRef = generator.generate({length: 7, numbers: true, upperCase: true});
    console.log(depRef);

    return e.data.ref.child('udata').child('depRef').set(depRef);
  });



/**
 * Sends a welcome email to new user.
 */
// exports.sendUserActivationMail = functions.database
// .ref('/users/{pushId}')
// .onCreate(e => {
//     console.log('User created');
//     console.log(e.data.val());
//     console.log(e.eventType);
//     this.userdata = e.data.val();
//     this.uname = this.userdata.uname;
//     this.email = this.userdata.udata.email;

//     return sendUserActivationMail(this.uname, this.email);
// });

// Sends a welcome email to the given user.
function sendUserActivationMail(uname, email){
  const mailOptions = {
    from: `${APP_NAME} <noreply@nuvest.co.za>`,
    to: email
  };
  const password = "ja9rqirajDAFASjfa0uf0";                 // TODO: eliminate. Handled on site
  mailOptions.subject = `Welcome to ${APP_NAME}!`;
  mailOptions.html = processHtml(uname, password);          // TODO: take out password

  return mailTransport.sendMail(mailOptions).then(() => {
      console.log('New welcome email sent to:', email);
  });
}

// html of email to be sent. Keep this at the end of the file, because it's huge
function processHtml(uname, password){
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><!--[if IE]><html xmlns="http://www.w3.org/1999/xhtml" class="ie"><![endif]--><!--[if !IE]><!--><html style="margin: 0;padding: 0;" xmlns="http://www.w3.org/1999/xhtml"><!--<![endif]--><head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title></title>
  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
  <meta name="viewport" content="width=device-width"><style type="text/css">
  @media only screen and (min-width: 620px){.wrapper{min-width:600px !important}.wrapper h1{}.wrapper h1{font-size:64px !important;line-height:63px !important}.wrapper h2{}.wrapper h2{font-size:30px !important;line-height:38px !important}.wrapper h3{}.wrapper h3{font-size:22px !important;line-height:31px !important}.column{}.wrapper .size-8{font-size:8px !important;line-height:14px !important}.wrapper .size-9{font-size:9px !important;line-height:16px !important}.wrapper .size-10{font-size:10px !important;line-height:18px !important}.wrapper .size-11{font-size:11px !important;line-height:19px !important}.wrapper .size-12{font-size:12px !important;line-height:19px !important}.wrapper .size-13{font-size:13px !important;line-height:21px !important}.wrapper .size-14{font-size:14px !important;line-height:21px !important}.wrapper .size-15{font-size:15px !important;line-height:23px 
  !important}.wrapper .size-16{font-size:16px !important;line-height:24px !important}.wrapper .size-17{font-size:17px !important;line-height:26px !important}.wrapper .size-18{font-size:18px !important;line-height:26px !important}.wrapper .size-20{font-size:20px !important;line-height:28px !important}.wrapper .size-22{font-size:22px !important;line-height:31px !important}.wrapper .size-24{font-size:24px !important;line-height:32px !important}.wrapper .size-26{font-size:26px !important;line-height:34px !important}.wrapper .size-28{font-size:28px !important;line-height:36px !important}.wrapper .size-30{font-size:30px !important;line-height:38px !important}.wrapper .size-32{font-size:32px !important;line-height:40px !important}.wrapper .size-34{font-size:34px !important;line-height:43px !important}.wrapper .size-36{font-size:36px !important;line-height:43px !important}.wrapper 
  .size-40{font-size:40px !important;line-height:47px !important}.wrapper .size-44{font-size:44px !important;line-height:50px !important}.wrapper .size-48{font-size:48px !important;line-height:54px !important}.wrapper .size-56{font-size:56px !important;line-height:60px !important}.wrapper .size-64{font-size:64px !important;line-height:63px !important}}
  </style>
  <style type="text/css">
  body {
  margin: 0;
  padding: 0;
  }
  table {
  border-collapse: collapse;
  table-layout: fixed;
  }
  * {
  line-height: inherit;
  }
  [x-apple-data-detectors],
  [href^="tel"],
  [href^="sms"] {
  color: inherit !important;
  text-decoration: none !important;
  }
  .wrapper .footer__share-button a:hover,
  .wrapper .footer__share-button a:focus {
  color: #ffffff !important;
  }
  .btn a:hover,
  .btn a:focus,
  .footer__share-button a:hover,
  .footer__share-button a:focus,
  .email-footer__links a:hover,
  .email-footer__links a:focus {
  opacity: 0.8;
  }
  .preheader,
  .header,
  .layout,
  .column {
  transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out;
  }
  .layout,
  div.header {
  max-width: 400px !important;
  -fallback-width: 95% !important;
  width: calc(100% - 20px) !important;
  }
  div.preheader {
  max-width: 360px !important;
  -fallback-width: 90% !important;
  width: calc(100% - 60px) !important;
  }
  .snippet,
  .webversion {
  Float: none !important;
  }
  .column {
  max-width: 400px !important;
  width: 100% !important;
  }
  .fixed-width.has-border {
  max-width: 402px !important;
  }
  .fixed-width.has-border .layout__inner {
  box-sizing: border-box;
  }
  .snippet,
  .webversion {
  width: 50% !important;
  }
  .ie .btn {
  width: 100%;
  }
  [owa] .column div,
  [owa] .column button {
  display: block !important;
  }
  .ie .column,
  [owa] .column,
  .ie .gutter,
  [owa] .gutter {
  display: table-cell;
  float: none !important;
  vertical-align: top;
  }
  .ie div.preheader,
  [owa] div.preheader,
  .ie .email-footer,
  [owa] .email-footer {
  max-width: 560px !important;
  width: 560px !important;
  }
  .ie .snippet,
  [owa] .snippet,
  .ie .webversion,
  [owa] .webversion {
  width: 280px !important;
  }
  .ie div.header,
  [owa] div.header,
  .ie .layout,
  [owa] .layout,
  .ie .one-col .column,
  [owa] .one-col .column {
  max-width: 600px !important;
  width: 600px !important;
  }
  .ie .fixed-width.has-border,
  [owa] .fixed-width.has-border,
  .ie .has-gutter.has-border,
  [owa] .has-gutter.has-border {
  max-width: 602px !important;
  width: 602px !important;
  }
  .ie .two-col .column,
  [owa] .two-col .column {
  max-width: 300px !important;
  width: 300px !important;
  }
  .ie .three-col .column,
  [owa] .three-col .column,
  .ie .narrow,
  [owa] .narrow {
  max-width: 200px !important;
  width: 200px !important;
  }
  .ie .wide,
  [owa] .wide {
  width: 400px !important;
  }
  .ie .two-col.has-gutter .column,
  [owa] .two-col.x_has-gutter .column {
  max-width: 290px !important;
  width: 290px !important;
  }
  .ie .three-col.has-gutter .column,
  [owa] .three-col.x_has-gutter .column,
  .ie .has-gutter .narrow,
  [owa] .has-gutter .narrow {
  max-width: 188px !important;
  width: 188px !important;
  }
  .ie .has-gutter .wide,
  [owa] .has-gutter .wide {
  max-width: 394px !important;
  width: 394px !important;
  }
  .ie .two-col.has-gutter.has-border .column,
  [owa] .two-col.x_has-gutter.x_has-border .column {
  max-width: 292px !important;
  width: 292px !important;
  }
  .ie .three-col.has-gutter.has-border .column,
  [owa] .three-col.x_has-gutter.x_has-border .column,
  .ie .has-gutter.has-border .narrow,
  [owa] .has-gutter.x_has-border .narrow {
  max-width: 190px !important;
  width: 190px !important;
  }
  .ie .has-gutter.has-border .wide,
  [owa] .has-gutter.x_has-border .wide {
  max-width: 396px !important;
  width: 396px !important;
  }
  .ie .fixed-width .layout__inner {
  border-left: 0 none white !important;
  border-right: 0 none white !important;
  }
  .ie .layout__edges {
  display: none;
  }
  .mso .layout__edges {
  font-size: 0;
  }
  .layout-fixed-width,
  .mso .layout-full-width {
  background-color: #ffffff;
  }
  @media only screen and (min-width: 620px) {
  .column,
  .gutter {
  display: table-cell;
  Float: none !important;
  vertical-align: top;
  }
  div.preheader,
  .email-footer {
  max-width: 560px !important;
  width: 560px !important;
  }
  .snippet,
  .webversion {
  width: 280px !important;
  }
  div.header,
  .layout,
  .one-col .column {
  max-width: 600px !important;
  width: 600px !important;
  }
  .fixed-width.has-border,
  .fixed-width.ecxhas-border,
  .has-gutter.has-border,
  .has-gutter.ecxhas-border {
  max-width: 602px !important;
  width: 602px !important;
  }
  .two-col .column {
  max-width: 300px !important;
  width: 300px !important;
  }
  .three-col .column,
  .column.narrow {
  max-width: 200px !important;
  width: 200px !important;
  }
  .column.wide {
  width: 400px !important;
  }
  .two-col.has-gutter .column,
  .two-col.ecxhas-gutter .column {
  max-width: 290px !important;
  width: 290px !important;
  }
  .three-col.has-gutter .column,
  .three-col.ecxhas-gutter .column,
  .has-gutter .narrow {
  max-width: 188px !important;
  width: 188px !important;
  }
  .has-gutter .wide {
  max-width: 394px !important;
  width: 394px !important;
  }
  .two-col.has-gutter.has-border .column,
  .two-col.ecxhas-gutter.ecxhas-border .column {
  max-width: 292px !important;
  width: 292px !important;
  }
  .three-col.has-gutter.has-border .column,
  .three-col.ecxhas-gutter.ecxhas-border .column,
  .has-gutter.has-border .narrow,
  .has-gutter.ecxhas-border .narrow {
  max-width: 190px !important;
  width: 190px !important;
  }
  .has-gutter.has-border .wide,
  .has-gutter.ecxhas-border .wide {
  max-width: 396px !important;
  width: 396px !important;
  }
  }
  @media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx) {
  .fblike {
  background-image: url(http://i7.createsend1.com/static/eb/master/13-the-blueprint-3/images/fblike@2x.png) !important;
  }
  .tweet {
  background-image: url(http://i10.createsend1.com/static/eb/master/13-the-blueprint-3/images/tweet@2x.png) !important;
  }
  .linkedinshare {
  background-image: url(http://i8.createsend1.com/static/eb/master/13-the-blueprint-3/images/lishare@2x.png) !important;
  }
  .forwardtoafriend {
  background-image: url(http://i9.createsend1.com/static/eb/master/13-the-blueprint-3/images/forward@2x.png) !important;
  }
  }
  @media (max-width: 321px) {
  .fixed-width.has-border .layout__inner {
  border-width: 1px 0 !important;
  }
  .layout,
  .column {
  min-width: 320px !important;
  width: 320px !important;
  }
  .border {
  display: none;
  }
  }
  .mso div {
  border: 0 none white !important;
  }
  .mso .w560 .divider {
  Margin-left: 260px !important;
  Margin-right: 260px !important;
  }
  .mso .w360 .divider {
  Margin-left: 160px !important;
  Margin-right: 160px !important;
  }
  .mso .w260 .divider {
  Margin-left: 110px !important;
  Margin-right: 110px !important;
  }
  .mso .w160 .divider {
  Margin-left: 60px !important;
  Margin-right: 60px !important;
  }
  .mso .w354 .divider {
  Margin-left: 157px !important;
  Margin-right: 157px !important;
  }
  .mso .w250 .divider {
  Margin-left: 105px !important;
  Margin-right: 105px !important;
  }
  .mso .w148 .divider {
  Margin-left: 54px !important;
  Margin-right: 54px !important;
  }
  .mso .size-8,
  .ie .size-8 {
  font-size: 8px !important;
  line-height: 14px !important;
  }
  .mso .size-9,
  .ie .size-9 {
  font-size: 9px !important;
  line-height: 16px !important;
  }
  .mso .size-10,
  .ie .size-10 {
  font-size: 10px !important;
  line-height: 18px !important;
  }
  .mso .size-11,
  .ie .size-11 {
  font-size: 11px !important;
  line-height: 19px !important;
  }
  .mso .size-12,
  .ie .size-12 {
  font-size: 12px !important;
  line-height: 19px !important;
  }
  .mso .size-13,
  .ie .size-13 {
  font-size: 13px !important;
  line-height: 21px !important;
  }
  .mso .size-14,
  .ie .size-14 {
  font-size: 14px !important;
  line-height: 21px !important;
  }
  .mso .size-15,
  .ie .size-15 {
  font-size: 15px !important;
  line-height: 23px !important;
  }
  .mso .size-16,
  .ie .size-16 {
  font-size: 16px !important;
  line-height: 24px !important;
  }
  .mso .size-17,
  .ie .size-17 {
  font-size: 17px !important;
  line-height: 26px !important;
  }
  .mso .size-18,
  .ie .size-18 {
  font-size: 18px !important;
  line-height: 26px !important;
  }
  .mso .size-20,
  .ie .size-20 {
  font-size: 20px !important;
  line-height: 28px !important;
  }
  .mso .size-22,
  .ie .size-22 {
  font-size: 22px !important;
  line-height: 31px !important;
  }
  .mso .size-24,
  .ie .size-24 {
  font-size: 24px !important;
  line-height: 32px !important;
  }
  .mso .size-26,
  .ie .size-26 {
  font-size: 26px !important;
  line-height: 34px !important;
  }
  .mso .size-28,
  .ie .size-28 {
  font-size: 28px !important;
  line-height: 36px !important;
  }
  .mso .size-30,
  .ie .size-30 {
  font-size: 30px !important;
  line-height: 38px !important;
  }
  .mso .size-32,
  .ie .size-32 {
  font-size: 32px !important;
  line-height: 40px !important;
  }
  .mso .size-34,
  .ie .size-34 {
  font-size: 34px !important;
  line-height: 43px !important;
  }
  .mso .size-36,
  .ie .size-36 {
  font-size: 36px !important;
  line-height: 43px !important;
  }
  .mso .size-40,
  .ie .size-40 {
  font-size: 40px !important;
  line-height: 47px !important;
  }
  .mso .size-44,
  .ie .size-44 {
  font-size: 44px !important;
  line-height: 50px !important;
  }
  .mso .size-48,
  .ie .size-48 {
  font-size: 48px !important;
  line-height: 54px !important;
  }
  .mso .size-56,
  .ie .size-56 {
  font-size: 56px !important;
  line-height: 60px !important;
  }
  .mso .size-64,
  .ie .size-64 {
  font-size: 64px !important;
  line-height: 63px !important;
  }
  </style>

  <style type="text/css">
  body{background-color:#fff}.logo a:hover,.logo a:focus{color:#859bb1 !important}.mso .layout-has-border{border-top:1px solid #ccc;border-bottom:1px solid #ccc}.mso .layout-has-bottom-border{border-bottom:1px solid #ccc}.mso .border,.ie .border{background-color:#ccc}.mso h1,.ie h1{}.mso h1,.ie h1{font-size:64px !important;line-height:63px !important}.mso h2,.ie h2{}.mso h2,.ie h2{font-size:30px !important;line-height:38px !important}.mso h3,.ie h3{}.mso h3,.ie h3{font-size:22px !important;line-height:31px !important}.mso .layout__inner,.ie .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:sans-serif}
  </style><meta name="robots" content="noindex,nofollow"></meta>
  <meta property="og:title" content="My First Campaign"></meta>
  </head>
  <!--[if mso]>
  <body class="mso">
  <![endif]-->
  <!--[if !mso]><!-->
  <body class="no-padding" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;">
  <!--<![endif]-->
  <table class="wrapper" style="border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: #fff;" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr><td>
    <div role="banner">
      <div class="preheader" style="Margin: 0 auto;max-width: 560px;min-width: 280px; width: 280px;width: calc(28000% - 167440px);">
        <div style="border-collapse: collapse;display: table;width: 100%;">
        <!--[if (mso)|(IE)]><table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 280px" valign="top"><![endif]-->
          <div class="snippet" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 140px; width: 140px;width: calc(14000% - 78120px);padding: 10px 0 5px 0;color: #adb3b9;font-family: sans-serif;">
            
          </div>
        <!--[if (mso)|(IE)]></td><td style="width: 280px" valign="top"><![endif]-->
          <div class="webversion" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 139px; width: 139px;width: calc(14100% - 78680px);padding: 10px 0 5px 0;text-align: right;color: #adb3b9;font-family: sans-serif;">
            
          </div>
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </div>
      </div>
      
    </div>
    <div role="section">
    <div style="background-color: #18527c;">
      <div class="layout one-col" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
        <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-full-width" style="background-color: #18527c;"><td class="layout__edges">&nbsp;</td><td style="width: 600px" class="w560"><![endif]-->
          <div class="column" style="max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);text-align: left;color: #8e959c;font-size: 14px;line-height: 21px;font-family: sans-serif;">
          
            <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:60px;font-size:1px">&nbsp;</div>
  </div>
          
            <div style="Margin-left: 20px;Margin-right: 20px;">
    <h1 class="size-64" style="Margin-top: 0;Margin-bottom: 20px;font-style: normal;font-weight: normal;color: #000;font-size: 44px;line-height: 50px;font-family: avenir,sans-serif;text-align: center;" lang="x-size-64">
        <span class="font-avenir">
            <span style="color:#ffffff">Welcome to the team!</span></span></h1>
  </div>
          
            <div style="Margin-left: 20px;Margin-right: 20px;">
    <p style="Margin-top: 0;Margin-bottom: 0;text-align: center;">
        <span style="color:#fff">Congratulations, you have start your journey with ${APP_NAME}. We will now guide you in the process that so many people have been using to make extra income daily.</span></p><p style="Margin-top: 20px;Margin-bottom: 20px;text-align: center;"><span style="color:#fff">We hope that this will be fruitful relationship going forward.</span></p>
  </div>
          
  <!-- <div style="Margin-left: 20px;Margin-right: 20px;">
    <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
      <!-- [if !mso]>
          <a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #18527c !important;background-color: #ffffff;font-family: Avenir, sans-serif;" href="http://test.com">
            Go to my profile</a>
      <![endif] -->
      <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="http://test.com" style="width:159px" arcsize="9%" fillcolor="#FFFFFF" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,11px,0px,11px"><center style="font-size:14px;line-height:24px;color:#18527C;font-family:Avenir,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">
        Go to my profile</center></v:textbox></v:roundrect><![endif]-->
    <!-- </div>
  </div> -->
          
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:5px;font-size:1px">&nbsp;</div>
  </div>
          
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:20px;font-size:1px">&nbsp;</div>
  </div>
          
          </div>
        <!--[if (mso)|(IE)]></td><td class="layout__edges">&nbsp;</td></tr></table><![endif]-->
        </div>
      </div>
    </div>

    <div style="line-height:15px;font-size:15px;">&nbsp;</div>

    <div class="layout one-col fixed-width" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
      <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: #ffffff;">
      <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #ffffff;"><td style="width: 600px" class="w560"><![endif]-->
        <div class="column" style="text-align: left;color: #8e959c;font-size: 14px;line-height: 21px;font-family: sans-serif;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);">
      
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:50px;font-size:1px">&nbsp;</div>
  </div>
      
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <p class="size-40" style="Margin-top: 0;Margin-bottom: 20px;font-size: 32px;line-height: 40px;text-align: center;" lang="x-size-40"><span style="color:#000000">
      OK, what's next?</span></p>
  </div>
      
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <p style="Margin-top: 0;Margin-bottom: 0;text-align: center;"><span style="color:#000000">
      We've created an account for you with BCC. Shortly, you should receive an e-mail from BCC asking you to activate the account.</span></p>
    <!-- <p style="Margin-top: 20px;Margin-bottom: 0;text-align: center;"><span style="color:#000000">
      Your BCC login information is:</span></p>
    <p style="Margin-top: 20px;Margin-bottom: 0;text-align: center;"><span style="color:#000000"><strong>
      User name:</strong> ${uname}</span></p>
    <p style="Margin-top: 20px;Margin-bottom: 0;text-align: center;"><span style="color:#000000"><strong>
      Temporary password:</strong> ${password}</span></p> -->
    <p style="Margin-top: 20px;Margin-bottom: 20px;text-align: center;"><span style="color:#000000">
      After that, Log in to your ${APP_NAME} profile and go to DASHBOARD &gt; SET UP. 
      This will show you the important steps to properly secure your BCC profile.</span></p>
  </div>
      
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:20px;font-size:1px">&nbsp;</div>
  </div>
      
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <div class="btn btn--flat btn--large" style="Margin-bottom: 20px;text-align: center;">
      <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 14px;font-weight: bold;line-height: 24px;padding: 12px 24px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;background-color: #06ba2d;font-family: Avenir, sans-serif;" href="${REG_URL}">
      Go to my ${APP_NAME} profile
      </a><![endif]>
    <!--[if mso]><p style="lsine-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${REG_URL}" style="width:277px" arcsize="9%" fillcolor="#06BA2D" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,11px,0px,11px"><center style="font-size:14px;line-height:24px;color:#FFFFFF;font-family:Avenir,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">
    Go to my ${APP_NAME} profile
    </center></v:textbox></v:roundrect><![endif]--></div>
  </div>
      
          <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:50px;font-size:1px">&nbsp;</div>
  </div>
      
        </div>
      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
      </div>
    </div>

    <div style="line-height:20px;font-size:20px;">&nbsp;</div>

    <div style="background-color: #18527c;">
      <div class="layout one-col" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
        <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-full-width" style="background-color: #18527c;"><td class="layout__edges">&nbsp;</td><td style="width: 600px" class="w560"><![endif]-->
          <div class="column" style="max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);text-align: left;color: #8e959c;font-size: 14px;line-height: 21px;font-family: sans-serif;">
          
            <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:50px;font-size:1px">&nbsp;</div>
  </div>
          
            <div style="Margin-left: 20px;Margin-right: 20px;">
    <h1 class="size-30" style="Margin-top: 0;Margin-bottom: 0;font-style: normal;font-weight: normal;color: #000;font-size: 26px;line-height: 34px;font-family: avenir,sans-serif;text-align: center;" lang="x-size-30"><span class="font-avenir">
        <strong><span style="color:#ffffff">BCC daily rates for the past 5 days</span></strong></span></h1>
        <h2 class="size-28" style="Margin-top: 20px;Margin-bottom: 16px;font-style: normal;font-weight: normal;color: #e31212;font-size: 24px;line-height: 32px;font-family: Avenir,sans-serif;text-align: center;" lang="x-size-28">
            <strong><span style="color:#fff">&lt;&lt;table of dates n rates&gt;&gt;</span></strong></h2>
  </div>
          
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:15px;font-size:1px">&nbsp;</div>
  </div>
          
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <div class="btn btn--flat btn--medium" style="Margin-bottom: 20px;text-align: center;">
      <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 12px;font-weight: bold;line-height: 22px;padding: 10px 20px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #18527c !important;background-color: #ffffff;font-family: sans-serif;" href="http://test.com">Get me started</a><![endif]>
    <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="http://test.com" style="width:124px" arcsize="10%" fillcolor="#FFFFFF" stroke="f"><v:textbox style="mso-fit-shape-to-text:t" inset="0px,9px,0px,9px"><center style="font-size:12px;line-height:22px;color:#18527C;font-family:sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">Get me started</center></v:textbox></v:roundrect><![endif]--></div>
  </div>
          
  <div style="Margin-left: 20px;Margin-right: 20px;">
    <div style="line-height:35px;font-size:1px">&nbsp;</div>
  </div>
          
          </div>
        <!--[if (mso)|(IE)]></td><td class="layout__edges">&nbsp;</td></tr></table><![endif]-->
        </div>
      </div>
    </div>

    <div style="line-height:20px;font-size:20px;">&nbsp;</div>

    
    <div role="contentinfo">
      <div class="layout email-footer" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
        <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
        <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 400px;" valign="top" class="w360"><![endif]-->
          <div class="column wide" style="text-align: left;font-size: 12px;line-height: 19px;color: #adb3b9;font-family: sans-serif;Float: left;max-width: 400px;min-width: 320px; width: 320px;width: calc(8000% - 47600px);">
            <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">
              
              <div style="font-size: 12px;line-height: 19px;">
                <div>{Nuvest}<br>
  nuvest.co.za</div>
              </div>
              <div style="font-size: 12px;line-height: 19px;Margin-top: 18px;">
                <div>You are receiving this mail because you signed up on nuvest.co.za</div>
              </div>
              <!--[if mso]>&nbsp;<![endif]-->
            </div>
          </div>
        <!--[if (mso)|(IE)]></td><td style="width: 200px;" valign="top" class="w160"><![endif]-->
          <div class="column narrow" style="text-align: left;font-size: 12px;line-height: 19px;color: #adb3b9;font-family: sans-serif;Float: left;max-width: 320px;min-width: 200px; width: 320px;width: calc(72200px - 12000%);">
            <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">
              
            </div>
          </div>
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </div>
      </div>
      <div class="layout one-col email-footer" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
        <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
        <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 600px;" class="w560"><![endif]-->
          <div class="column" style="text-align: left;font-size: 12px;line-height: 19px;color: #adb3b9;font-family: sans-serif;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);">
            <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">
              <div style="font-size: 12px;line-height: 19px;">
                <span><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #adb3b9;" href="http://client.updatemyprofile.com/j-l-2AD73FFF-l-r" lang="en">Preferences</a>&nbsp;&nbsp;|&nbsp;&nbsp;</span><a style="text-decoration: underline;transition: opacity 0.1s ease-in;color: #adb3b9;" href="http://preview17090610.createsend1.com/t/j-u-oldltuk-l-y/">Unsubscribe</a>
              </div>
            </div>
          </div>
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </div>
      </div>
    </div>
    <div style="line-height:40px;font-size:40px;">&nbsp;</div>
  </div></td></tr></tbody></table>
  <img style="overflow: hidden;position: fixed;visibility: hidden !important;display: block !important;height: 1px !important;width: 1px !important;border: 0 !important;margin: 0 !important;padding: 0 !important;" src="http://o.createsend1.com/t/j-o-oldltuk-l/o.gif" width="1" height="1" border="0" alt="">
  </body>
  </html>`
}