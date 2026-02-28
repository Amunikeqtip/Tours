import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface DayOption {
  day: string;
  date: number;
  month: string;
  isoDate: string;
  disabled?: boolean;
}

interface ItineraryItem {
  time: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-booking-workflow-page',
  templateUrl: './booking-workflow-page.component.html',
  styleUrl: './booking-workflow-page.component.css',
  standalone: false
})
export class BookingWorkflowPageComponent {
  readonly steps = ['Activity', 'Selection', 'Details', 'Payment', 'Confirmation'];
  adultPrice = 95;
  childPrice = 67;
  activity = {
    title: 'Victoria Falls Guided Tour & Lunch',
    subtitle: 'Top Rated Activity',
    location: 'Victoria Falls, Zim',
    duration: '5 Hours',
    rating: '4.9',
    reviews: '1,248 reviews',
    overview:
      'Explore rainforest viewpoints with expert local guides, then enjoy a curated lunch overlooking the gorge. This experience is designed for first-time and returning travelers who want a complete Falls introduction.',
    includes: ['Licensed local guide', 'Hotel pickup and drop-off', 'Entry coordination support', 'Lunch included'],
    gallery: [
      'https://images.pexels.com/photos/27878405/pexels-photo-27878405.jpeg?auto=compress&cs=tinysrgb&w=1400',
      'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400',
      'https://images.pexels.com/photos/30172599/pexels-photo-30172599.jpeg?auto=compress&cs=tinysrgb&w=1400'
    ]
  };
  readonly itinerary: ItineraryItem[] = [
    {
      time: '08:30',
      title: 'Pickup and Welcome Briefing',
      description: 'Meet your guide and review the route, weather conditions, and best photo stops.'
    },
    {
      time: '09:15',
      title: 'Rainforest and Main Viewpoints',
      description: 'Walk key viewpoints with guided interpretation of geology, wildlife, and local history.'
    },
    {
      time: '11:30',
      title: 'Leisure and Photo Session',
      description: 'Free time for photography, short breaks, and optional souvenir browsing.'
    },
    {
      time: '12:30',
      title: 'Scenic Lunch',
      description: 'Finish with a relaxed lunch stop and trip support for your next activity.'
    }
  ];
  readonly monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  readonly yearOptions = this.buildYearOptions();

  days: DayOption[] = [];
  timeOptions: string[] = [];
  currentStep = 1;
  selectedDate!: DayOption;
  selectedTime = '';
  selectedTimeInput = '';
  selectedMonth = new Date().getMonth();
  selectedYear = new Date().getFullYear();

  adults = 2;
  children = 0;

  fullName = '';
  email = '';
  phone = '';
  notes = '';

  cardName = '';
  cardNumber = '';
  expiry = '';
  cvv = '';

  constructor(private readonly route: ActivatedRoute) {
    this.refreshCalendar();
    this.route.queryParamMap.subscribe((params) => {
      const title = params.get('title')?.trim();
      const subtitle = params.get('subtitle')?.trim();
      const duration = params.get('duration')?.trim();
      const image = params.get('image')?.trim();
      const priceRaw = params.get('price')?.trim();

      this.activity = {
        ...this.activity,
        title: title || this.activity.title,
        subtitle: subtitle || this.activity.subtitle,
        duration: duration || this.activity.duration,
        gallery: image
          ? [image, this.activity.gallery[1], this.activity.gallery[2]]
          : this.activity.gallery
      };

      const parsed = Number(priceRaw);
      if (!Number.isNaN(parsed) && parsed > 0) {
        this.adultPrice = parsed;
        this.childPrice = Math.max(1, Math.round(parsed * 0.7));
      }
    });
  }

  get guestLabel(): string {
    const parts: string[] = [];
    if (this.adults > 0) {
      parts.push(`${this.adults} Adult${this.adults > 1 ? 's' : ''}`);
    }
    if (this.children > 0) {
      parts.push(`${this.children} Child${this.children > 1 ? 'ren' : ''}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'No guests selected';
  }

  get subtotal(): number {
    return (this.adults * this.adultPrice) + (this.children * this.childPrice);
  }

  get bookingFee(): number {
    return Math.round(this.subtotal * 0.05);
  }

  get total(): number {
    return this.subtotal + this.bookingFee;
  }

  get canMoveNext(): boolean {
    if (this.currentStep === 1) {
      return true;
    }
    if (this.currentStep === 2) {
      return this.adults + this.children > 0 && !this.selectedDate.disabled && this.selectedTime.trim().length > 0;
    }
    if (this.currentStep === 3) {
      return this.fullName.trim().length > 1 && this.email.includes('@') && this.phone.trim().length > 5;
    }
    if (this.currentStep === 4) {
      return this.cardName.trim().length > 1 && this.cardNumber.trim().length >= 12 && this.expiry.trim().length >= 4 && this.cvv.trim().length >= 3;
    }
    return false;
  }

  selectDate(day: DayOption): void {
    if (day.disabled) {
      return;
    }
    this.selectedDate = day;
    this.refreshTimeOptions();
  }

  selectTime(time: string): void {
    this.selectedTime = time;
    this.selectedTimeInput = this.formatToInputTime(time);
  }

  onTimeInputChange(value: string): void {
    if (!value) {
      return;
    }
    this.selectedTimeInput = value;
    this.selectedTime = this.formatTimeLabel(value);
  }

  adjustAdults(delta: number): void {
    this.adults = Math.max(1, this.adults + delta);
  }

  adjustChildren(delta: number): void {
    this.children = Math.max(0, this.children + delta);
  }

  goToStep(step: number): void {
    if (step < 1 || step > this.steps.length) {
      return;
    }
    this.currentStep = step;
  }

  nextStep(): void {
    if (!this.canMoveNext || this.currentStep >= this.steps.length) {
      return;
    }
    this.currentStep += 1;
  }

  previousStep(): void {
    if (this.currentStep <= 1) {
      return;
    }
    this.currentStep -= 1;
  }

  onMonthYearChange(): void {
    this.refreshCalendar();
  }

  private refreshCalendar(): void {
    this.days = this.buildDaysForMonth(this.selectedYear, this.selectedMonth);
    const firstAvailable = this.days.find((d) => !d.disabled);
    if (!this.selectedDate || this.selectedDate.month !== this.monthNames[this.selectedMonth] || this.selectedDate.date > this.days.length) {
      this.selectedDate = firstAvailable ?? this.days[0];
      this.refreshTimeOptions();
      return;
    }
    const sameDate = this.days.find((d) => d.isoDate === this.selectedDate.isoDate);
    this.selectedDate = sameDate ?? firstAvailable ?? this.days[0];
    this.refreshTimeOptions();
  }

  private buildDaysForMonth(year: number, month: number): DayOption[] {
    const result: DayOption[] = [];
    const today = new Date();
    const current = new Date(year, month, 1);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i += 1) {
      const d = new Date(year, month, i);
      const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      result.push({
        day: dayNames[d.getDay()],
        date: i,
        month: this.monthNames[current.getMonth()],
        isoDate: d.toISOString().slice(0, 10),
        disabled: isPast
      });
    }
    return result;
  }

  private buildYearOptions(): number[] {
    const now = new Date().getFullYear();
    return [now, now + 1, now + 2, now + 3];
  }

  private refreshTimeOptions(): void {
    this.timeOptions = this.buildTimeOptions(this.selectedDate.isoDate);
    if (this.timeOptions.length === 0) {
      this.selectedTime = '';
      this.selectedTimeInput = '';
      return;
    }

    if (!this.selectedTime || !this.timeOptions.includes(this.selectedTime)) {
      this.selectedTime = this.timeOptions[0];
    }
    this.selectedTimeInput = this.formatToInputTime(this.selectedTime);
  }

  private buildTimeOptions(isoDate: string): string[] {
    const slots: string[] = [];
    const startMinutes = 6 * 60;
    const endMinutes = 18 * 60;
    const selected = new Date(`${isoDate}T00:00:00`);
    const now = new Date();

    let minAllowed = startMinutes;
    if (
      selected.getFullYear() === now.getFullYear() &&
      selected.getMonth() === now.getMonth() &&
      selected.getDate() === now.getDate()
    ) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      minAllowed = Math.max(startMinutes, Math.ceil(currentMinutes / 30) * 30);
    }

    for (let minutes = minAllowed; minutes <= endMinutes; minutes += 30) {
      const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
      const mm = String(minutes % 60).padStart(2, '0');
      slots.push(this.formatTimeLabel(`${hh}:${mm}`));
    }

    return slots;
  }

  private formatTimeLabel(value24h: string): string {
    const [hRaw, mRaw] = value24h.split(':');
    const h = Number(hRaw);
    const m = Number(mRaw);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  }

  private formatToInputTime(label: string): string {
    const [time, period] = label.split(' ');
    const [hRaw, mRaw] = time.split(':');
    let h = Number(hRaw);
    if (period === 'PM' && h !== 12) {
      h += 12;
    }
    if (period === 'AM' && h === 12) {
      h = 0;
    }
    return `${String(h).padStart(2, '0')}:${mRaw}`;
  }
}
