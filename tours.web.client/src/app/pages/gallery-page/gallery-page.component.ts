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
    { image: 'https://source.unsplash.com/900x700/?mountains,mist,valley', title: 'Misty Highlands' },
    { image: 'https://source.unsplash.com/900x700/?african,dancers,culture', title: 'Cultural Dancers' },
    { image: 'https://source.unsplash.com/700x900/?leopard,tree,africa', title: 'Leopard Rest', large: true },
    { image: 'https://source.unsplash.com/900x700/?lion,savannah,sunset', title: 'Savannah Moment' },
    { image: 'https://source.unsplash.com/900x700/?canoe,river,group', title: 'River Adventure' },
    { image: 'https://source.unsplash.com/900x700/?african,textile,pattern', title: 'Craft Textures' }
  ];
}
