import { Component } from '@angular/core';

interface SupportStat {
  value: string;
  label: string;
}

interface ContactChannel {
  icon: string;
  title: string;
  detail: string;
  subtext: string;
}

interface SupportTopic {
  title: string;
  description: string;
}

@Component({
  selector: 'app-contact-support-page',
  templateUrl: './contact-support-page.component.html',
  styleUrl: './contact-support-page.component.css',
  standalone: false
})
export class ContactSupportPageComponent {
  readonly stats: SupportStat[] = [
    { value: '<15 min', label: 'Average Response' },
    { value: '24/7', label: 'Support Coverage' },
    { value: '4.9/5', label: 'Helpdesk Rating' }
  ];

  readonly channels: ContactChannel[] = [
    {
      icon: 'pi pi-phone',
      title: 'Phone Support',
      detail: '+263 77 123 4567',
      subtext: 'Best for urgent changes and same-day travel support.'
    },
    {
      icon: 'pi pi-envelope',
      title: 'Email Support',
      detail: 'info@vicfallsadventures.com',
      subtext: 'Ideal for itinerary planning and custom package requests.'
    },
    {
      icon: 'pi pi-map-marker',
      title: 'Office Location',
      detail: 'Victoria Falls, Zimbabwe',
      subtext: 'Walk-ins welcome for pre-booked consultation slots.'
    }
  ];

  readonly topics: SupportTopic[] = [
    { title: 'Booking Changes', description: 'Reschedule dates, swap activities, and update guest details quickly.' },
    { title: 'Payments & Invoices', description: 'Card payments, bank transfer confirmations, and receipt support.' },
    { title: 'Travel Logistics', description: 'Airport pickup, border guidance, and packing recommendations.' }
  ];
}
