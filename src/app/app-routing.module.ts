import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {StartupComponent} from './startup/startup.component';
import {ChatComponent} from './chat/chat.component';
import {AuthComponent} from "./auth/auth.component";

const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: StartupComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'auth/callback', component: AuthComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
