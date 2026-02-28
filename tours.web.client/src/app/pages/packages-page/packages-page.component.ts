import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface PackageItineraryItem {
  time: string;
  title: string;
  detail: string;
}

interface TravelPackage {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  location: string;
  duration: string;
  difficulty: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  summary: string;
  highlights: string[];
  includes: string[];
  itinerary: PackageItineraryItem[];
  cancellation: string;
}

@Component({
  selector: 'app-packages-page',
  templateUrl: './packages-page.component.html',
  styleUrl: './packages-page.component.css',
  standalone: false
})
export class PackagesPageComponent {
  readonly packages: TravelPackage[] = [
    {
      id: 'falls-heritage-walk',
      title: 'Guided Falls Heritage Walk',
      category: 'Falls Tours',
      subtitle: 'Iconic viewpoints and rainforest trails',
      location: 'Victoria Falls, Zimbabwe',
      duration: '2.5 Hours',
      difficulty: 'Easy',
      rating: 4.9,
      reviews: 1248,
      price: 30,
      image: 'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Explore classic viewpoints with a local expert while learning the geology, ecology, and history of the Falls.',
      highlights: ['16 key viewpoints', 'Rainforest boardwalks', 'Guide-led storytelling', 'Best photo angles'],
      includes: ['Licensed guide', 'Hotel pickup support', 'Ponchos in wet season', 'Bottled water'],
      itinerary: [
        { time: '08:30', title: 'Meet & briefing', detail: 'Quick orientation, safety notes, and route plan.' },
        { time: '09:00', title: 'Main viewpoints', detail: 'Guided walk through the highest-impact viewpoints.' },
        { time: '10:15', title: 'Photo and free time', detail: 'Capture photos and short stop for local crafts.' }
      ],
      cancellation: 'Free cancellation up to 24 hours before start.'
    },
    {
      id: 'zambezi-sunset-cruise',
      title: 'Zambezi Luxury Sunset Cruise',
      category: 'Cruises',
      subtitle: 'Golden-hour river safari experience',
      location: 'Zambezi River, Zimbabwe',
      duration: '3 Hours',
      difficulty: 'Easy',
      rating: 4.9,
      reviews: 892,
      price: 55,
      image: 'https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Premium catamaran cruise with sunset wildlife sightings, snacks, and onboard host support.',
      highlights: ['Hippo and crocodile zones', 'Sunset deck', 'Premium bar', 'Birding guide'],
      includes: ['Cruise ticket', 'Drinks and snacks', 'Safety briefing', 'Hotel transfer options'],
      itinerary: [
        { time: '16:00', title: 'Boarding', detail: 'Check-in and welcome drinks at the dock.' },
        { time: '16:30', title: 'River route', detail: 'Scenic route toward top wildlife sections.' },
        { time: '18:15', title: 'Sunset return', detail: 'Golden-hour viewing and return to marina.' }
      ],
      cancellation: 'Free cancellation up to 24 hours before departure.'
    },
    {
      id: 'lunar-rainbow-tour',
      title: 'Lunar Rainbow Tour',
      category: 'Falls Tours',
      subtitle: 'Night mist and moonbow experience',
      location: 'Victoria Falls Rainforest',
      duration: '2 Hours',
      difficulty: 'Moderate',
      rating: 4.8,
      reviews: 316,
      price: 45,
      image: 'https://images.pexels.com/photos/27878405/pexels-photo-27878405.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Rare after-dark tour timed for full-moon conditions and dramatic spray visibility.',
      highlights: ['Moonbow timing', 'Night viewpoints', 'Low crowd experience', 'Pro guide escort'],
      includes: ['Night entry coordination', 'Guide', 'Torch support', 'Transport assistance'],
      itinerary: [
        { time: '19:00', title: 'Night check-in', detail: 'Meet your guide and confirm moonbow route.' },
        { time: '19:30', title: 'Moonlit viewpoints', detail: 'Walk selected night-safe viewpoints.' },
        { time: '20:45', title: 'Return', detail: 'Wrap-up and return transfer support.' }
      ],
      cancellation: 'Free cancellation up to 48 hours before activity.'
    },
    {
      id: 'white-water-rafting',
      title: 'Zambezi White Water Rafting',
      category: 'Adventure Activities',
      subtitle: 'Class IV-V rapids through Batoka Gorge',
      location: 'Batoka Gorge',
      duration: 'Full Day',
      difficulty: 'High',
      rating: 4.9,
      reviews: 654,
      price: 120,
      image: 'https://images.pexels.com/photos/32768410/pexels-photo-32768410.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'A high-adrenaline full-day rafting route with professional safety crew and technical rapids.',
      highlights: ['Top-rated rapids', 'Safety kayakers', 'Gorge scenery', 'Adventure photography'],
      includes: ['Rafting gear', 'Safety briefing', 'Lead guide team', 'Lunch'],
      itinerary: [
        { time: '07:30', title: 'Pickup and prep', detail: 'Transfer, waiver check, and equipment fitting.' },
        { time: '09:00', title: 'Rapid sessions', detail: 'Guided raft runs through key rapid sections.' },
        { time: '14:30', title: 'Exit and lunch', detail: 'Gorge exit with cool-down meal and debrief.' }
      ],
      cancellation: 'Free cancellation up to 72 hours before activity.'
    },
    {
      id: 'bungee-jump',
      title: 'Victoria Falls Bungee Jump',
      category: 'Adventure Activities',
      subtitle: 'Historic bridge jump over the gorge',
      location: 'Victoria Falls Bridge',
      duration: '1 Hour',
      difficulty: 'High',
      rating: 4.9,
      reviews: 477,
      price: 160,
      image: 'https://images.pexels.com/photos/16040/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Iconic 111m jump with strict safety protocols and professional jumpmaster supervision.',
      highlights: ['111m jump height', 'Bridge views', 'High safety standards', 'Certificate included'],
      includes: ['Safety harness', 'Briefing and checks', 'Jumpmaster support', 'Certificate'],
      itinerary: [
        { time: '10:00', title: 'Check-in', detail: 'Identity check, medical declaration, and waiver.' },
        { time: '10:20', title: 'Safety prep', detail: 'Harness fitting and platform briefing.' },
        { time: '10:40', title: 'Jump window', detail: 'Final checks and jump execution.' }
      ],
      cancellation: 'Rescheduling allowed with 24h notice, subject to slot availability.'
    },
    {
      id: 'simunye-village-tour',
      title: 'Simunye Village Cultural Tour',
      category: 'Cultural Experiences',
      subtitle: 'Local food, crafts, and community storytelling',
      location: 'Simunye Village',
      duration: '3 Hours',
      difficulty: 'Easy',
      rating: 4.8,
      reviews: 238,
      price: 45,
      image: 'https://images.pexels.com/photos/4152126/pexels-photo-4152126.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Immersive local culture experience with hosts, traditional dishes, and artisan showcases.',
      highlights: ['Village hosts', 'Traditional cuisine', 'Local dance', 'Craft demonstration'],
      includes: ['Local host guide', 'Tasting platter', 'Village entry', 'Cultural program'],
      itinerary: [
        { time: '11:00', title: 'Village welcome', detail: 'Host greeting and community intro.' },
        { time: '11:40', title: 'Culture walkthrough', detail: 'Craft, dance, and storytelling segments.' },
        { time: '13:10', title: 'Cuisine session', detail: 'Traditional tasting and Q&A.' }
      ],
      cancellation: 'Free cancellation up to 24 hours before departure.'
    },
    {
      id: 'devils-pool',
      title: 'Livingstone Island & Devils Pool',
      category: 'Adventure Activities',
      subtitle: 'Edge-of-falls pool experience',
      location: 'Livingstone Island',
      duration: '2 Hours',
      difficulty: 'Moderate',
      rating: 4.9,
      reviews: 541,
      price: 110,
      image: 'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'World-famous adrenaline pool experience with strict seasonal operations and safety control.',
      highlights: ['Iconic edge pool', 'Boat transfer', 'Guide escort', 'Seasonal operation'],
      includes: ['Boat ride', 'Safety guide', 'Briefing', 'Light refreshments'],
      itinerary: [
        { time: '08:00', title: 'Dock transfer', detail: 'Boat transfer to island and safety prep.' },
        { time: '08:30', title: 'Island walk', detail: 'Short route to entry point and check sequence.' },
        { time: '09:00', title: 'Pool session', detail: 'Timed entry with guide supervision.' }
      ],
      cancellation: 'Free cancellation up to 48 hours before activity.'
    },
    {
      id: 'dawn-patrol-drive',
      title: 'Dawn Patrol: Sunrise Game Drive',
      category: 'Game Drives',
      subtitle: 'Early wildlife tracking in Zambezi National Park',
      location: 'Zambezi National Park',
      duration: '4 Hours',
      difficulty: 'Easy',
      rating: 4.9,
      reviews: 716,
      price: 85,
      image: 'https://images.pexels.com/photos/31140979/pexels-photo-31140979.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Sunrise drive focused on predator movement windows and high-value viewing zones.',
      highlights: ['Early predator activity', '4x4 safari vehicle', 'Tracker guide', 'Coffee stop'],
      includes: ['Licensed safari guide', '4x4 transport', 'Park logistics', 'Light refreshments'],
      itinerary: [
        { time: '05:45', title: 'Pickup', detail: 'Early pickup for first-light entry.' },
        { time: '06:20', title: 'Tracking route', detail: 'Priority zones for lion and elephant movement.' },
        { time: '09:15', title: 'Scenic stop', detail: 'Coffee break and photography stop.' }
      ],
      cancellation: 'Free cancellation up to 24 hours before departure.'
    },
    {
      id: 'walking-safari',
      title: 'Walking Safari: The Wild Unfiltered',
      category: 'Game Drives',
      subtitle: 'On-foot bush interpretation with armed ranger',
      location: 'Private concession route',
      duration: '3 Hours',
      difficulty: 'Moderate',
      rating: 4.8,
      reviews: 302,
      price: 120,
      image: 'https://images.pexels.com/photos/16533214/pexels-photo-16533214.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Ground-level safari focused on tracks, terrain reading, and close-range ecology interpretation.',
      highlights: ['On-foot safari', 'Armed ranger', 'Track reading', 'Small-group format'],
      includes: ['Ranger escort', 'Safety briefing', 'Bottled water', 'Transfer option'],
      itinerary: [
        { time: '07:00', title: 'Safety briefing', detail: 'Route profile and behavior protocol.' },
        { time: '07:30', title: 'Bush walk', detail: 'Guided tracking and ecological interpretation.' },
        { time: '09:30', title: 'Debrief', detail: 'Q&A and route wrap-up.' }
      ],
      cancellation: 'Free cancellation up to 24 hours before start.'
    },
    {
      id: 'family-explorer-drive',
      title: 'Family Explorer: Private Afternoon Drive',
      category: 'Game Drives',
      subtitle: 'Flexible private safari for families',
      location: 'Zambezi National Park',
      duration: 'Full Day',
      difficulty: 'Easy',
      rating: 4.7,
      reviews: 288,
      price: 350,
      image: 'https://images.pexels.com/photos/2356059/pexels-photo-2356059.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Private family-friendly safari with flexible route pacing and kid-conscious stops.',
      highlights: ['Private vehicle', 'Custom pace', 'Family-focused guide', 'Picnic option'],
      includes: ['Private 4x4', 'Guide', 'Refreshments', 'Picnic arrangement'],
      itinerary: [
        { time: '12:30', title: 'Family pickup', detail: 'Hotel pickup and route planning.' },
        { time: '13:30', title: 'Safari segment', detail: 'Wildlife route with flexible stop cadence.' },
        { time: '17:30', title: 'Golden-hour return', detail: 'Final sightings and drop-off.' }
      ],
      cancellation: 'Free cancellation up to 24 hours before departure.'
    },
    {
      id: 'boma-dinner-show',
      title: 'Traditional Boma Dinner & Drum Show',
      category: 'Cultural Experiences',
      subtitle: 'Night of food, drumming, and live performance',
      location: 'Victoria Falls cultural venue',
      duration: '4 Hours',
      difficulty: 'Easy',
      rating: 4.6,
      reviews: 631,
      price: 55,
      image: 'https://images.pexels.com/photos/1820987/pexels-photo-1820987.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary: 'Popular evening cultural show combining local cuisine, drumming, and dance performances.',
      highlights: ['Live drumming', 'Buffet dinner', 'Traditional dance', 'Family friendly'],
      includes: ['Dinner buffet', 'Show entry', 'Reserved seating', 'Host assistance'],
      itinerary: [
        { time: '18:30', title: 'Arrival', detail: 'Check-in and welcome drink.' },
        { time: '19:00', title: 'Dinner and show', detail: 'Buffet service with staged cultural performances.' },
        { time: '21:45', title: 'Close', detail: 'Final performance and departure support.' }
      ],
      cancellation: 'Free cancellation up to 24 hours before event start.'
    }
  ];

  searchTerm = '';
  selectedCategory = 'All';
  sortBy: 'featured' | 'priceAsc' | 'priceDesc' | 'rating' = 'featured';
  selectedPackage: TravelPackage | null = null;

  constructor(private readonly route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category')?.trim();
      const pkg = params.get('pkg')?.trim();
      const q = params.get('q')?.trim();

      if (q) {
        this.searchTerm = q;
      }

      if (category && this.categories.includes(category)) {
        this.selectedCategory = category;
      }

      if (pkg) {
        const found = this.packages.find((item) => item.id === pkg);
        this.selectedPackage = found ?? null;
      }
    });
  }

  get categories(): string[] {
    const all = this.packages.map((item) => item.category);
    return ['All', ...Array.from(new Set(all))];
  }

  get filteredPackages(): TravelPackage[] {
    const query = this.searchTerm.trim().toLowerCase();
    let items = this.packages.filter((item) => {
      const categoryOk = this.selectedCategory === 'All' || item.category === this.selectedCategory;
      const text = `${item.title} ${item.subtitle} ${item.location} ${item.summary}`.toLowerCase();
      const searchOk = !query || text.includes(query);
      return categoryOk && searchOk;
    });

    if (this.sortBy === 'priceAsc') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'priceDesc') {
      items = [...items].sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'rating') {
      items = [...items].sort((a, b) => b.rating - a.rating);
    }

    return items;
  }

  openPackage(item: TravelPackage): void {
    this.selectedPackage = item;
  }

  closePackage(): void {
    this.selectedPackage = null;
  }
}
