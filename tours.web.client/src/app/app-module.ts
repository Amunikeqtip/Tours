import { HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { SiteHeaderComponent } from './components/site-header/site-header.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { GameDrivesPageComponent } from './pages/game-drives-page/game-drives-page.component';
import { FallsToursPageComponent } from './pages/falls-tours-page/falls-tours-page.component';
import { ActivitiesPageComponent } from './pages/activities-page/activities-page.component';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { ContactSupportPageComponent } from './pages/contact-support-page/contact-support-page.component';
import { BookingWorkflowPageComponent } from './pages/booking-workflow-page/booking-workflow-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { PackagesPageComponent } from './pages/packages-page/packages-page.component';

@NgModule({
  declarations: [
    App,
    SiteHeaderComponent,
    SiteFooterComponent,
    GameDrivesPageComponent,
    FallsToursPageComponent,
    ActivitiesPageComponent,
    GalleryPageComponent,
    AboutPageComponent,
    ContactSupportPageComponent,
    BookingWorkflowPageComponent,
    HomePageComponent,
    PackagesPageComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, FormsModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
