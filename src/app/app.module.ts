import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { routing } from './app.routes';

// third party imports
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { DatePickerModule } from 'ng2-datepicker';
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { DatepickerModule } from 'ng2-bootstrap';
import { MyDatePickerModule } from 'mydatepicker';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AboutComponent } from './about/about.component';
import { PasswordMatchDirective } from './password-match.directive';

import { firebaseConfig } from '../assets/fbConfig';
import { ProfileComponent } from './profile/profile.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { BccRegisterComponent } from './bcc-register/bcc-register.component';
import { AccSetupComponent } from './acc-setup/acc-setup.component';
import { AccountsComponent } from './accounts/accounts.component';
import { AddAccountComponent } from './add-account/add-account.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    SignupComponent,
    LoginComponent,
    DashboardComponent,
    AboutComponent,
    PasswordMatchDirective,
    ProfileComponent,
    TransactionsComponent,
    BccRegisterComponent,
    AccSetupComponent,
    AccountsComponent,
    AddAccountComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    routing,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    DatePickerModule,
    NKDatetimeModule,
    DatepickerModule,
    MyDatePickerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
