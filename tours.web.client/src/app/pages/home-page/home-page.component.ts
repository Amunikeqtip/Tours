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
      image: 'https://source.unsplash.com/900x650/?safari,jeep,wildlife',
      title: 'Game Drives',
      subtitle: 'Track the Big Five in raw bushland routes.'
    },
    {
      icon: 'pi pi-map',
      image: 'https://source.unsplash.com/900x650/?victoria,falls,waterfall',
      title: 'Victoria Falls Tours',
      subtitle: 'Go beyond viewpoints with local expert stories.'
    },
    {
      icon: 'pi pi-bolt',
      image: 'https://source.unsplash.com/900x650/?mountain,hike,adventure',
      title: 'Adventure Activities',
      subtitle: 'Mix zipline, gorge swings, and scenic trail hikes.'
    }
  ];

  readonly deals: PackageCard[] = [
    {
      badge: 'Top Rated',
      duration: '2 Full Days',
      rating: '4.9 (214)',
      image: 'https://source.unsplash.com/700x500/?luxury,tent,safari',
      title: 'Luxury Hwange Safari',
      price: '450'
    },
    {
      badge: 'Best Seller',
      duration: '2.5 Hours',
      rating: '4.8 (212)',
      image: 'https://source.unsplash.com/700x500/?zambezi,river,boat,sunset',
      title: 'Zambezi Sunset Cruise',
      price: '85'
    },
    {
      badge: 'Adventure',
      duration: '2 Hours',
      rating: '5.0 (98)',
      image: 'https://source.unsplash.com/700x500/?cultural,dance,africa',
      title: 'Devils Pool Experience',
      price: '110'
    },
    {
      badge: 'Family',
      duration: '3 Half Days',
      rating: '4.7 (251)',
      image: 'https://source.unsplash.com/700x500/?elephant,river,africa',
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
      image: 'https://source.unsplash.com/80x80/?woman,portrait,smile'
    },
    {
      quote: 'Seamless booking and incredible attention to detail. The safari was exactly as described.',
      author: 'Marco Rossi',
      location: 'Milan, Italy',
      image: 'https://source.unsplash.com/80x80/?man,portrait,smile'
    }
  ];

  readonly trustBadges: TrustBadge[] = [
    { icon: 'pi pi-shield', title: 'Secure Booking', text: 'PCI-encrypted checkout' },
    { icon: 'pi pi-verified', title: 'Eco Commitment', text: 'Low-impact transport fleet' },
    { icon: 'pi pi-users', title: 'Local Experts', text: 'Zimbabwe-led experiences' },
    { icon: 'pi pi-language', title: 'Trip Support', text: 'English/French assistance' }
  ];
}
