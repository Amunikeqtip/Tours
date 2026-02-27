import { Component } from '@angular/core';

interface AboutStat {
  value: string;
  label: string;
}

interface AboutPillar {
  title: string;
  description: string;
}

interface AboutMoment {
  image: string;
  title: string;
  large?: boolean;
}

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.css',
  standalone: false
})
export class AboutPageComponent {
  readonly stats: AboutStat[] = [
    { value: '15+', label: 'Years of Guiding' },
    { value: '4.9/5', label: 'Guest Satisfaction' },
    { value: '12k+', label: 'Travelers Hosted' }
  ];

  readonly pillars: AboutPillar[] = [
    { title: 'Local Expertise', description: 'Zimbabwe-led teams with deep regional knowledge.' },
    { title: 'Responsible Travel', description: 'Community-first partnerships and eco-aware operations.' },
    { title: 'Seamless Planning', description: 'Clear itineraries, support, and dependable logistics.' }
  ];

  readonly moments: AboutMoment[] = [
    { image: 'https://source.unsplash.com/900x700/?victoria-falls,mist', title: 'The Falls at Dawn' },
    { image: 'https://source.unsplash.com/900x700/?safari,guide,group', title: 'Guides in the Field' },
    { image: 'https://source.unsplash.com/700x900/?african,wildlife,leopard', title: 'Wildlife Encounters', large: true },
    { image: 'https://source.unsplash.com/900x700/?zambezi,boat,cruise', title: 'River Routes' },
    { image: 'https://source.unsplash.com/900x700/?african,culture,dance', title: 'Living Culture' },
    { image: 'https://source.unsplash.com/900x700/?african,campfire,safari', title: 'Evening Storytelling' }
  ];
}
