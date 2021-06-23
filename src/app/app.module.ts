import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

// third party imports
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from "@angular/fire/database";
// import { NKDatetimeModule } from "ng2-datetime/ng2-datetime";
// import { DatepickerModule } from "ngx-bootstrap/datepicker"; // may have to change to BsDatepickerModule
import { AngularMyDatePickerModule } from "angular-mydatepicker";

import { routing } from "./app.routes";
import { PasswordMatchDirective } from "./password-match.directive";
import { firebaseConfig } from "../assets/fbConfig";
import { CommonPropertiesService } from "./common-properties.service";

import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { HomeComponent } from "./home/home.component";
import { SignupComponent } from "./signup/signup.component";
import { LoginComponent } from "./login/login.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AboutComponent } from "./about/about.component";
import { ProfileComponent } from "./profile/profile.component";
import { TransactionsComponent } from "./transactions/transactions.component";
import { BccRegisterComponent } from "./bcc-register/bcc-register.component";
import { AccSetupComponent } from "./acc-setup/acc-setup.component";
import { AccountsComponent } from "./accounts/accounts.component";
import { AddAccountComponent } from "./add-account/add-account.component";
import { InvestingComponent } from "./investing/investing.component";
import { AdminComponent } from "./admin/admin.component";

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
    AddAccountComponent,
    InvestingComponent,
    AdminComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    routing,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularMyDatePickerModule,
    // NKDatetimeModule,
    // DatepickerModule,
  ],
  providers: [CommonPropertiesService],
  bootstrap: [AppComponent],
})
export class AppModule {}
