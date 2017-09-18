const firebase = require('firebase');
const fs = require('fs');
var EmailTemplate = require('email-templates').EmailTemplate;

// ##### Awesome Profile #####
const firebaseConfig = {
  apiKey: "AIzaSyBbwvVwreAXcSVl1B3OWKWQ2-Cn_WIGLCE",
  authDomain: "awesome-app-2617f.firebaseapp.com",
  databaseURL: "https://awesome-app-2617f.firebaseio.com",
  projectId: "awesome-app-2617f",
  storageBucket: "awesome-app-2617f.appspot.com",
  messagingSenderId: "334528911038"
};

firebase.initializeApp(firebaseConfig);

// var storageRef = functions.
var storageRef = firebase.storage().ref();
var mailResources = storageRef.child('resources/mail');
var htmlFile = fs.open('../email_resources/mailTemplate.html');
var metadata = {contenType: 'text/html'};
mailResources.put(htmlFile).then(() => {
  console.log('html file uploaded');
})
mailResources.child('mailTemplate.html').getDownloadURL()
.then((url) => {
  var xhr = XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = (event) => {
    var blob = xhr.response;
  };
  xhr.open('GET', url);
  xhr.send();
})
.catch((error) => {
  console.log(error.message);
})