import { Component } from '@angular/core';

interface FallsTour {
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

interface ExtraAdventure {
  icon: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-falls-tours-page',
  templateUrl: './falls-tours-page.component.html',
  styleUrl: './falls-tours-page.component.css',
  standalone: false
})
export class FallsToursPageComponent {
  readonly tours: FallsTour[] = [
    {
      duration: '2.5 Hours',
      fitness: 'Easy Fitness',
      title: 'Guided Falls Heritage Walk',
      rating: '4.9',
      description: 'The definitive Victoria Falls experience with expert geology, history, and flora insights.',
      features: ['16 viewpoints', 'Waterproof gear included', 'Rainforest walk', 'Hotel transfers'],
      image: 'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400',
      price: '30.00'
    },
    {
      duration: '3 Hours',
      fitness: 'Easy Fitness',
      title: 'Zambezi Luxury Sunset Cruise',
      rating: '4.9',
      description: 'Witness golden-hour wildlife sightings with premium drinks and curated river routes.',
      features: ['Premium open bar', 'Luxury catamaran', 'Hippos & Crocodiles', 'Bird watching'],
      image: 'https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=1400',
      price: '55.00'
    },
    {
      duration: '2 Hours',
      fitness: 'Moderate Fitness',
      title: 'Lunar Rainbow Tour',
      rating: '4.9',
      description: 'A rare night-time falls tour timed for lunar spraybows and dramatic mist views.',
      features: ['Full moon exclusive', 'Guided stargazing', 'Night-time park entry', 'Magical atmosphere'],
      image: 'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400',
      price: '45.00'
    }
  ];

  readonly sideFeatures: SideFeature[] = [
    { title: 'Instant Confirmation', subtitle: 'Secure your spot immediately.' },
    { title: 'Free Cancellation', subtitle: 'Up to 24 hours before departure.' }
  ];

  readonly extras: ExtraAdventure[] = [
    { icon: 'pi pi-sliders-h', title: 'The Boma Dinner', subtitle: 'A legendary cultural drum show and feast.' },
    { icon: 'pi pi-send', title: 'Chobe Day Trip', subtitle: 'Explore the wildlife of Botswana.' },
    { icon: 'pi pi-compass', title: 'Flight of Angels', subtitle: 'Helicopter flip over the falls.' }
  ];
}
