import { Component } from '@angular/core';

interface ActivityItem {
  duration: string;
  fitness: string;
  title: string;
  rating: string;
  description: string;
  features: string[];
  image: string;
  price: string;
}

interface SideFeature {
  title: string;
  subtitle: string;
}

interface ComboActivity {
  icon: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-activities-page',
  templateUrl: './activities-page.component.html',
  styleUrl: './activities-page.component.css',
  standalone: false
})
export class ActivitiesPageComponent {
  readonly activities: ActivityItem[] = [
    {
      duration: '2.5 Hours',
      fitness: 'Easy Fitness',
      title: 'Guided Falls Heritage Walk',
      rating: '4.9',
      description: 'The definitive Victoria Falls experience with expert geology, history, and flora insights.',
      features: ['16 viewpoints', 'Waterproof gear included', 'Rainforest walk', 'Hotel transfers'],
      image: 'https://source.unsplash.com/900x1200/?victoria-falls,rainbow',
      price: '30.00'
    },
    {
      duration: '3 Hours',
      fitness: 'Easy Fitness',
      title: 'Zambezi Luxury Sunset Cruise',
      rating: '4.9',
      description: 'Witness golden-hour wildlife sightings with premium drinks and curated river routes.',
      features: ['Premium open bar', 'Luxury catamaran', 'Hippos & Crocodiles', 'Bird watching'],
      image: 'https://source.unsplash.com/900x1200/?zambezi,boat,sunset',
      price: '55.00'
    },
    {
      duration: '2 Hours',
      fitness: 'Moderate Fitness',
      title: 'Lunar Rainbow Tour',
      rating: '4.9',
      description: 'A rare night-time falls tour timed for lunar spraybows and dramatic mist views.',
      features: ['Full moon exclusive', 'Guided stargazing', 'Night-time park entry', 'Magical atmosphere'],
      image: 'https://source.unsplash.com/900x1200/?waterfall,night,mist',
      price: '45.00'
    }
  ];

  readonly sideFeatures: SideFeature[] = [
    { title: 'Instant Confirmation', subtitle: 'Secure your spot immediately.' },
    { title: 'Free Cancellation', subtitle: 'Up to 24 hours before departure.' }
  ];

  readonly combos: ComboActivity[] = [
    { icon: 'pi pi-sliders-h', title: 'The Boma Dinner', subtitle: 'A legendary cultural drum show and feast.' },
    { icon: 'pi pi-send', title: 'Chobe Day Trip', subtitle: 'Explore the wildlife of Botswana.' },
    { icon: 'pi pi-compass', title: 'Flight of Angels', subtitle: 'Helicopter trip over the falls.' }
  ];
}
