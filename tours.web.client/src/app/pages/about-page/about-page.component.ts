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
    { image: 'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'The Falls at Dawn' },
    { image: 'https://images.pexels.com/photos/16241908/pexels-photo-16241908.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Guides in the Field' },
    { image: 'https://images.pexels.com/photos/31140979/pexels-photo-31140979.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Wildlife Encounters', large: true },
    { image: 'https://images.pexels.com/photos/1430675/pexels-photo-1430675.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'River Routes' },
    { image: 'https://images.pexels.com/photos/4152126/pexels-photo-4152126.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Living Culture' },
    { image: 'https://images.pexels.com/photos/102129/pexels-photo-102129.jpeg?auto=compress&cs=tinysrgb&w=1400', title: 'Evening Storytelling' }
  ];
}
