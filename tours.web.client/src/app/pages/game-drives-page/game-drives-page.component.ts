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
  activeFilter: 'All' | 'Family Friendly' | 'Adrenaline' | 'Nature' = 'All';

  readonly packages: DrivePackage[] = [
    {
      badge: 'Nature',
      badgeClass: 'nature',
      image: 'https://images.pexels.com/photos/31140979/pexels-photo-31140979.jpeg?auto=compress&cs=tinysrgb&w=1400',
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
      image: 'https://images.pexels.com/photos/16533214/pexels-photo-16533214.jpeg?auto=compress&cs=tinysrgb&w=1400',
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
      image: 'https://images.pexels.com/photos/2356059/pexels-photo-2356059.jpeg?auto=compress&cs=tinysrgb&w=1400',
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
      image: 'https://images.pexels.com/photos/18253372/pexels-photo-18253372.jpeg?auto=compress&cs=tinysrgb&w=1400',
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
      image: 'https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=1400',
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
      image: 'https://images.pexels.com/photos/4404518/pexels-photo-4404518.jpeg?auto=compress&cs=tinysrgb&w=1400',
      title: 'The Big Five Intensive',
      description: 'Extended route crafted for serious wildlife photographers and spotters.',
      meta: '10 Hours',
      mode: 'Photography Spec 4x4',
      features: ['Pro Photo Support', 'Remote Access', 'Lunch Included'],
      price: '180'
    }
  ];

  readonly animals: Animal[] = [
    { name: 'Lion', subtitle: 'King of Africa', image: 'https://images.pexels.com/photos/31140979/pexels-photo-31140979.jpeg?auto=compress&cs=tinysrgb&w=900' },
    { name: 'Elephant', subtitle: 'Gentle Giant', image: 'https://images.pexels.com/photos/3850526/pexels-photo-3850526.jpeg?auto=compress&cs=tinysrgb&w=900' },
    { name: 'Leopard', subtitle: 'Ghost of the Bush', image: 'https://images.pexels.com/photos/18253372/pexels-photo-18253372.jpeg?auto=compress&cs=tinysrgb&w=900' },
    { name: 'Buffalo', subtitle: 'Black Giant', image: 'https://images.pexels.com/photos/5127846/pexels-photo-5127846.jpeg?auto=compress&cs=tinysrgb&w=900' },
    { name: 'Rhino', subtitle: 'Armored Legend', image: 'https://images.pexels.com/photos/16533214/pexels-photo-16533214.jpeg?auto=compress&cs=tinysrgb&w=900' },
    { name: 'Giraffe', subtitle: 'Skyline Scout', image: 'https://images.pexels.com/photos/1319515/pexels-photo-1319515.jpeg?auto=compress&cs=tinysrgb&w=900' }
  ];

  get filteredPackages(): DrivePackage[] {
    if (this.activeFilter === 'All') {
      return this.packages;
    }
    return this.packages.filter((item) => item.badge === this.activeFilter);
  }

  setFilter(filter: 'All' | 'Family Friendly' | 'Adrenaline' | 'Nature'): void {
    this.activeFilter = filter;
  }
}
