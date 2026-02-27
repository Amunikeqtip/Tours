import { Component } from '@angular/core';

interface DrivePackage {
  badge: string;
  badgeClass: string;
  image: string;
  title: string;
  description: string;
  meta: string;
  mode: string;
  features: string[];
  price: string;
}

interface Animal {
  name: string;
  subtitle: string;
  image: string;
}

@Component({
  selector: 'app-game-drives-page',
  templateUrl: './game-drives-page.component.html',
  styleUrl: './game-drives-page.component.css',
  standalone: false
})
export class GameDrivesPageComponent {
  readonly packages: DrivePackage[] = [
    {
      badge: 'Nature',
      badgeClass: 'nature',
      image: 'https://source.unsplash.com/900x650/?lion,savannah',
      title: 'Dawn Patrol: Sunrise Game Drive',
      description: 'Witness the savannah wake up with elite trackers and open-sky viewpoints.',
      meta: '4 Hours',
      mode: 'Open 4x4 Cruiser',
      features: ['Lion Sighting', 'Coffee & Snacks', 'Expert Tracker'],
      price: '85'
    },
    {
      badge: 'Adrenaline',
      badgeClass: 'adrenaline',
      image: 'https://source.unsplash.com/900x650/?safari,group,walking',
      title: 'Walking Safari: The Wild Unfiltered',
      description: 'Step deeper into rhino territory with armed guides and raw trail routes.',
      meta: '3 Hours',
      mode: 'On Foot',
      features: ['Rhino Tracking', 'Botanical Education', 'Terrain Reading'],
      price: '120'
    },
    {
      badge: 'Family Friendly',
      badgeClass: 'family',
      image: 'https://source.unsplash.com/900x650/?family,safari,jeep',
      title: 'Family Explorer: Private Afternoon Drive',
      description: 'Comfort-first safari for families with flexible stops and kid-friendly moments.',
      meta: 'Full Day',
      mode: 'Private Safari Van',
      features: ['Kid-Friendly Guide', 'Picnic Lunch', 'Flexible Schedule'],
      price: '350'
    },
    {
      badge: 'Nature',
      badgeClass: 'nature',
      image: 'https://source.unsplash.com/900x650/?leopard,wild,tree',
      title: 'Night Owl: Nocturnal Adventure',
      description: 'Infrared spotlights reveal predators and hidden species after sunset.',
      meta: '3 Hours',
      mode: 'Equipped 4x4',
      features: ['Infrared Spotting', 'Nocturnal Predators', 'Stargazing'],
      price: '95'
    },
    {
      badge: 'Nature',
      badgeClass: 'nature',
      image: 'https://source.unsplash.com/900x650/?elephants,river,africa',
      title: 'Zambezi River Basin Safari',
      description: 'Cruise edge-water channels where elephant herds gather in golden light.',
      meta: '6 Hours',
      mode: 'Open 4x4 + Boat',
      features: ['Elephant Crossings', 'Riverbank Birds', 'Photography Stops'],
      price: '150'
    },
    {
      badge: 'Adrenaline',
      badgeClass: 'adrenaline',
      image: 'https://source.unsplash.com/900x650/?rhino,safari,sunset',
      title: 'The Big Five Intensive',
      description: 'Extended route crafted for serious wildlife photographers and spotters.',
      meta: '10 Hours',
      mode: 'Photography Spec 4x4',
      features: ['Pro Photo Support', 'Remote Access', 'Lunch Included'],
      price: '180'
    }
  ];

  readonly animals: Animal[] = [
    { name: 'Lion', subtitle: 'King of Africa', image: 'https://source.unsplash.com/320x320/?lion,portrait' },
    { name: 'Elephant', subtitle: 'Gentle Giant', image: 'https://source.unsplash.com/320x320/?elephant,portrait' },
    { name: 'Leopard', subtitle: 'Ghost of the Bush', image: 'https://source.unsplash.com/320x320/?leopard,portrait' },
    { name: 'Buffalo', subtitle: 'Black Giant', image: 'https://source.unsplash.com/320x320/?buffalo,africa' },
    { name: 'Rhino', subtitle: 'Armored Legend', image: 'https://source.unsplash.com/320x320/?rhinoceros,portrait' },
    { name: 'Giraffe', subtitle: 'Skyline Scout', image: 'https://source.unsplash.com/320x320/?giraffe,portrait' }
  ];
}
