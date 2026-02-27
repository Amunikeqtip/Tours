import { Component } from '@angular/core';

interface DayOption {
  day: string;
  date: number;
  month: string;
  isoDate: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-booking-workflow-page',
  templateUrl: './booking-workflow-page.component.html',
  styleUrl: './booking-workflow-page.component.css',
  standalone: false
})
export class BookingWorkflowPageComponent {
  readonly steps = ['Selection', 'Details', 'Payment', 'Confirmation'];
  readonly times = ['07:30 AM', '09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
  readonly adultPrice = 95;
  readonly childPrice = 67;
  readonly monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  readonly yearOptions = this.buildYearOptions();

  days: DayOption[] = [];
  currentStep = 1;
  selectedDate!: DayOption;
  selectedTime = this.times[1];
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

  constructor() {
    this.refreshCalendar();
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
      return this.adults + this.children > 0 && !this.selectedDate.disabled;
    }
    if (this.currentStep === 2) {
      return this.fullName.trim().length > 1 && this.email.includes('@') && this.phone.trim().length > 5;
    }
    if (this.currentStep === 3) {
      return this.cardName.trim().length > 1 && this.cardNumber.trim().length >= 12 && this.expiry.trim().length >= 4 && this.cvv.trim().length >= 3;
    }
    return false;
  }

  selectDate(day: DayOption): void {
    if (day.disabled) {
      return;
    }
    this.selectedDate = day;
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  adjustAdults(delta: number): void {
    this.adults = Math.max(1, this.adults + delta);
  }

  adjustChildren(delta: number): void {
    this.children = Math.max(0, this.children + delta);
  }

  goToStep(step: number): void {
    if (step < 1 || step > 4) {
      return;
    }
    this.currentStep = step;
  }

  nextStep(): void {
    if (!this.canMoveNext || this.currentStep >= 4) {
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
      return;
    }
    const sameDate = this.days.find((d) => d.isoDate === this.selectedDate.isoDate);
    this.selectedDate = sameDate ?? firstAvailable ?? this.days[0];
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
}
