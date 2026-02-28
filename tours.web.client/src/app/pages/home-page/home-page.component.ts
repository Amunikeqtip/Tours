import { Component } from '@angular/core';

interface AdventureCard {
  icon: string;
  image: string;
  title: string;
  subtitle: string;
}

interface PackageCard {
  badge: string;
  duration: string;
  rating: string;
  image: string;
  title: string;
  price: string;
}

interface ReviewCard {
  quote: string;
  author: string;
  location: string;
  image: string;
}

interface TrustBadge {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  standalone: false
})
export class HomePageComponent {
  readonly adventures: AdventureCard[] = [
    {
      icon: 'pi pi-car',
      image: 'https://images.pexels.com/photos/4404518/pexels-photo-4404518.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Game Drives',
      subtitle: 'Track the Big Five in raw bushland routes.'
    },
    {
      icon: 'pi pi-map',
      image: 'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Victoria Falls Tours',
      subtitle: 'Go beyond viewpoints with local expert stories.'
    },
    {
      icon: 'pi pi-bolt',
      image: 'https://images.pexels.com/photos/23232507/pexels-photo-23232507.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Adventure Activities',
      subtitle: 'Mix zipline, gorge swings, and scenic trail hikes.'
    }
  ];

  readonly deals: PackageCard[] = [
    {
      badge: 'Top Rated',
      duration: '2 Full Days',
      rating: '4.9 (214)',
      image: 'https://images.pexels.com/photos/4404518/pexels-photo-4404518.jpeg?auto=compress&cs=tinysrgb&w=900',
      title: 'Luxury Hwange Safari',
      price: '450'
    },
    {
      badge: 'Best Seller',
      duration: '2.5 Hours',
      rating: '4.8 (212)',
      image: 'https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=900',
      title: 'Zambezi Sunset Cruise',
      price: '85'
    },
    {
      badge: 'Adventure',
      duration: '2 Hours',
      rating: '5.0 (98)',
      image: 'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=900',
      title: 'Devils Pool Experience',
      price: '110'
    },
    {
      badge: 'Family',
      duration: '3 Half Days',
      rating: '4.7 (251)',
      image: 'https://images.pexels.com/photos/3850526/pexels-photo-3850526.jpeg?auto=compress&cs=tinysrgb&w=900',
      title: 'Elephant Interaction',
      price: '150'
    }
  ];

  readonly missionPoints: string[] = [
    '100% Local Guide Staffing',
    'Direct Community Support Programs',
    'Verified Eco-Friendly Transport',
    'Cultural Village Integration'
  ];

  readonly testimonials: ReviewCard[] = [
    {
      quote: 'The most authentic experience of my life. The falls are majestic, but our guides made it personal.',
      author: 'Sarah Jenkins',
      location: 'London, UK',
      image: 'https://images.pexels.com/photos/34031585/pexels-photo-34031585.jpeg?auto=compress&cs=tinysrgb&w=160'
    },
    {
      quote: 'Seamless booking and incredible attention to detail. The safari was exactly as described.',
      author: 'Marco Rossi',
      location: 'Milan, Italy',
      image: 'https://images.pexels.com/photos/12775213/pexels-photo-12775213.jpeg?auto=compress&cs=tinysrgb&w=160'
    }
  ];

  readonly trustBadges: TrustBadge[] = [
    { icon: 'pi pi-shield', title: 'Secure Booking', text: 'PCI-encrypted checkout' },
    { icon: 'pi pi-verified', title: 'Eco Commitment', text: 'Low-impact transport fleet' },
    { icon: 'pi pi-users', title: 'Local Experts', text: 'Zimbabwe-led experiences' },
    { icon: 'pi pi-language', title: 'Trip Support', text: 'English/French assistance' }
  ];
}
