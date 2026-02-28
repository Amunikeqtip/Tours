import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameDrivesPageComponent } from './pages/game-drives-page/game-drives-page.component';
import { FallsToursPageComponent } from './pages/falls-tours-page/falls-tours-page.component';
import { ActivitiesPageComponent } from './pages/activities-page/activities-page.component';
import { GalleryPageComponent } from './pages/gallery-page/gallery-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { ContactSupportPageComponent } from './pages/contact-support-page/contact-support-page.component';
import { BookingWorkflowPageComponent } from './pages/booking-workflow-page/booking-workflow-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { PackagesPageComponent } from './pages/packages-page/packages-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'game-drives', component: GameDrivesPageComponent },
  { path: 'falls-tours', component: FallsToursPageComponent },
  { path: 'activities', component: ActivitiesPageComponent },
  { path: 'gallery', component: GalleryPageComponent },
  { path: 'about', component: AboutPageComponent },
  { path: 'contact-support', component: ContactSupportPageComponent },
  { path: 'packages', component: PackagesPageComponent },
  { path: 'booking', component: BookingWorkflowPageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
