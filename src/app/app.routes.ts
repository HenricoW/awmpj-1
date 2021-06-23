import { Routes, RouterModule } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";

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

const routes = [
  { path: "", component: HomeComponent },
  { path: "about", component: AboutComponent },
  { path: "signup", component: SignupComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    children: [
      { path: "profile", component: ProfileComponent, outlet: "dashoutlet" },
      {
        path: "transactions",
        component: TransactionsComponent,
        outlet: "dashoutlet",
      },
      { path: "acc_setup", component: AccSetupComponent, outlet: "dashoutlet" },
      { path: "accounts", component: AccountsComponent, outlet: "dashoutlet" },
      {
        path: "addaccount",
        component: AddAccountComponent,
        outlet: "dashoutlet",
      },
    ],
  },
  { path: "bccregister/:id", component: BccRegisterComponent },
  { path: "investing", component: InvestingComponent },
  { path: "admin", component: AdminComponent },
  { path: "**", component: HomeComponent },
];

export const routing: ModuleWithProviders<RouterModule> =
  RouterModule.forRoot(routes);
