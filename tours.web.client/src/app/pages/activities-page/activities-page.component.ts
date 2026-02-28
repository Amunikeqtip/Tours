import { Component } from '@angular/core';

interface ActivityItem {
  category: string;
  badge: string;
  title: string;
  subtitle: string;
  rating: string;
  duration: string;
  age: string;
  warning: string;
  image: string;
  price: string;
}

interface TrustItem {
  icon: string;
  title: string;
}

interface PrepItem {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-activities-page',
  templateUrl: './activities-page.component.html',
  styleUrl: './activities-page.component.css',
  standalone: false
})
export class ActivitiesPageComponent {
  activeFilter: 'All' | 'Adrenaline' | 'Cultural' | 'Nature' = 'All';

  readonly trustItems: TrustItem[] = [
    { icon: 'pi pi-shield', title: 'Global Safety Standards' },
    { icon: 'pi pi-map', title: 'Licensed Local Operators' },
    { icon: 'pi pi-bolt', title: 'Instant Confirmation' },
    { icon: 'pi pi-leaf', title: 'Sustainable Tourism' }
  ];

  readonly activities: ActivityItem[] = [
    {
      category: 'Adrenaline',
      badge: 'Instant',
      title: 'Zambezi White Water Rafting',
      subtitle: 'Conquer the world-famous Batoka Gorge with Class IV-V rapids.',
      rating: '4.9',
      duration: 'Full Day',
      age: '12+',
      warning: 'Not suitable for guests with limited mobility or serious heart conditions.',
      image: 'https://images.pexels.com/photos/32768410/pexels-photo-32768410.jpeg?auto=compress&cs=tinysrgb&w=1400',
      price: '120'
    },
    {
      category: 'Adrenaline',
      badge: 'Instant',
      title: 'Victoria Falls Bungee Jump',
      subtitle: 'Leap from the historic Victoria Falls Bridge for a pure rush.',
      rating: '4.9',
      duration: '1 Hour',
      age: '14+',
      warning: 'Weight limits apply. Closed shoes required for all participants.',
      image: 'https://images.pexels.com/photos/16040/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1400',
      price: '160'
    },
    {
      category: 'Cultural',
      badge: 'Local',
      title: 'Simunye Village Cultural Tour',
      subtitle: 'Immerse yourself in authentic Zimbabwean culture and food.',
      rating: '4.8',
      duration: '3 Hours',
      age: 'All Ages',
      warning: 'Respect local customs and carry light clothing for warm weather.',
      image: 'https://images.pexels.com/photos/4152126/pexels-photo-4152126.jpeg?auto=compress&cs=tinysrgb&w=1400',
      price: '45'
    },
    {
      category: 'Nature',
      badge: 'Instant',
      title: 'Livingstone Island & Devils Pool',
      subtitle: 'Swim at the edge of the falls in one of the world’s iconic pools.',
      rating: '4.9',
      duration: '2 Hours',
      age: '12+',
      warning: 'Seasonal water levels apply. Expert swimmers only for pool access.',
      image: 'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400',
      price: '110'
    },
    {
      category: 'Adrenaline',
      badge: 'Instant',
      title: 'Gorge Swing & Zip Line',
      subtitle: 'Soar above Batoka Gorge on two of Victoria Falls’ top thrill rides.',
      rating: '4.7',
      duration: '2 Hours',
      age: '16+',
      warning: 'Children under 16 are not allowed. Secure harness checks mandatory.',
      image: 'https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=1400',
      price: '95'
    },
    {
      category: 'Cultural',
      badge: 'Evening',
      title: 'Traditional Boma Dinner & Drum Show',
      subtitle: 'An unforgettable evening of feast, dance, and live drumming.',
      rating: '4.6',
      duration: '4 Hours',
      age: 'All Ages',
      warning: 'Advance reservation required. Dietary requests must be pre-booked.',
      image: 'https://images.pexels.com/photos/1820987/pexels-photo-1820987.jpeg?auto=compress&cs=tinysrgb&w=1400',
      price: '55'
    }
  ];

  readonly prepItems: PrepItem[] = [
    {
      icon: 'pi pi-shield',
      title: 'Insurance & Liability',
      text: 'Basic medical evacuation cover is included. Comprehensive personal travel insurance is recommended.'
    },
    {
      icon: 'pi pi-map-marker',
      title: 'Pick-up & Logistics',
      text: 'Complimentary transfers operate from central Victoria Falls hotels. Be ready 15 minutes before pickup.'
    },
    {
      icon: 'pi pi-users',
      title: 'Age & Health Requirements',
      text: 'Some activities have age and fitness rules. Contact us for guidance before booking high-adrenaline tours.'
    }
  ];

  get filteredActivities(): ActivityItem[] {
    if (this.activeFilter === 'All') {
      return this.activities;
    }
    return this.activities.filter((item) => item.category === this.activeFilter);
  }

  setFilter(filter: 'All' | 'Adrenaline' | 'Cultural' | 'Nature'): void {
    this.activeFilter = filter;
  }
}
