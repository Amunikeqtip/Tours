import { Component } from '@angular/core';

interface GalleryStat {
  value: string;
  label: string;
}

interface GalleryFilter {
  label: string;
  active?: boolean;
}

interface GalleryImage {
  image: string;
  title: string;
  large?: boolean;
}

@Component({
  selector: 'app-gallery-page',
  templateUrl: './gallery-page.component.html',
  styleUrl: './gallery-page.component.css',
  standalone: false
})
export class GalleryPageComponent {
  readonly stats: GalleryStat[] = [
    { value: '2.5k+', label: 'High-Res Assets' },
    { value: '15+', label: 'Expert Guides' },
    { value: '4.9/5', label: 'Guest Rating' }
  ];

  readonly filters: GalleryFilter[] = [
    { label: 'All', active: true },
    { label: 'The Falls' },
    { label: 'Wildlife' },
    { label: 'Culture' },
    { label: 'Guests' }
  ];

  readonly images: GalleryImage[] = [
    { image: 'https://images.pexels.com/photos/690547/pexels-photo-690547.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Misty Highlands' },
    { image: 'https://images.pexels.com/photos/4152126/pexels-photo-4152126.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Cultural Dancers' },
    { image: 'https://images.pexels.com/photos/18253372/pexels-photo-18253372.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Leopard Rest', large: true },
    { image: 'https://images.pexels.com/photos/31140979/pexels-photo-31140979.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Savannah Moment' },
    { image: 'https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'River Adventure' },
    { image: 'https://images.pexels.com/photos/4152126/pexels-photo-4152126.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Craft Textures' }
  ];
}
