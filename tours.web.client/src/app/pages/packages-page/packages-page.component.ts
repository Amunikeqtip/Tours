import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

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

interface BokunPackageApi {
  id: string;
  title: string;
  category: string;
  duration: string;
  priceFrom: number;
  rating: number;
  imageUrl: string;
  summary: string;
}

@Component({
  selector: 'app-packages-page',
  templateUrl: './packages-page.component.html',
  styleUrl: './packages-page.component.css',
  standalone: false
})
export class PackagesPageComponent implements OnInit {
  packages: TravelPackage[] = [];

  searchTerm = '';
  selectedCategory = 'All';
  sortBy: 'featured' | 'priceAsc' | 'priceDesc' | 'rating' = 'featured';
  selectedPackage: TravelPackage | null = null;
  isLoading = false;
  errorMessage = '';
  private requestedPackageId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category')?.trim();
      const pkg = params.get('pkg')?.trim();
      const q = params.get('q')?.trim();

      if (q) {
        this.searchTerm = q;
      }

      if (category) {
        this.selectedCategory = category;
      }

      if (pkg) {
        this.requestedPackageId = pkg;
        this.tryOpenRequestedPackage();
      }
    });

    this.loadPackages();
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

  private loadPackages(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<BokunPackageApi[]>(`${environment.apiBaseUrl}/bokun/packages`).subscribe({
      next: (items) => {
        this.packages = (items ?? []).map((item, index) => this.mapApiPackage(item, index));
        if (!this.categories.includes(this.selectedCategory)) {
          this.selectedCategory = 'All';
        }
        this.tryOpenRequestedPackage();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load packages from Bokun right now. Please try again.';
        this.packages = [];
        this.isLoading = false;
      }
    });
  }

  private tryOpenRequestedPackage(): void {
    if (!this.requestedPackageId) {
      return;
    }
    const found = this.packages.find((item) => item.id === this.requestedPackageId);
    this.selectedPackage = found ?? null;
  }

  private mapApiPackage(item: BokunPackageApi, index: number): TravelPackage {
    const title = item.title?.trim() || 'Untitled Package';
    const category = item.category?.trim() || 'General';
    const duration = item.duration?.trim() || 'Flexible';
    const summary = item.summary?.trim() || 'Explore this curated experience with trusted local operators.';
    const difficulty = duration.toLowerCase().includes('full') || duration.toLowerCase().includes('day') ? 'Moderate' : 'Easy';
    const price = item.priceFrom && item.priceFrom > 0 ? item.priceFrom : 0;
    const rating = item.rating && item.rating > 0 ? item.rating : 4.6;

    return {
      id: item.id?.toString() || `pkg-${index + 1}`,
      title,
      category,
      subtitle: summary.length > 85 ? `${summary.slice(0, 82)}...` : summary,
      location: 'Victoria Falls, Zimbabwe',
      duration,
      difficulty,
      rating,
      reviews: Math.max(24, Math.round(rating * 140) + index * 5),
      price,
      image: item.imageUrl?.trim() || 'https://images.pexels.com/photos/27878405/pexels-photo-27878405.jpeg?auto=compress&cs=tinysrgb&w=1400',
      summary,
      highlights: ['Local expert support', 'Curated logistics', 'Flexible departure slots', 'Trusted operators'],
      includes: ['Booking coordination', 'Activity confirmation', 'Support team access', 'Digital voucher'],
      itinerary: [
        { time: '08:30', title: 'Check-in and briefing', detail: 'Meet your guide and review activity flow and safety notes.' },
        { time: '09:15', title: 'Main experience', detail: 'Enjoy the core highlights of this package with guided assistance.' },
        { time: '11:30', title: 'Wrap-up', detail: 'Final photo moments, summary, and onward support.' }
      ],
      cancellation: 'Cancellation policy depends on the operator and schedule. Final terms are shown at booking confirmation.'
    };
  }
}
