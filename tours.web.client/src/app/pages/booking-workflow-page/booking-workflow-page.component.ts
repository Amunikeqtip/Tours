import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

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

interface BokunPackageDetailApi {
  id: string;
  title: string;
  category: string;
  duration: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  location: string;
  summary: string;
  description: string;
  highlights: string[];
  includes: string[];
  requirements: string;
  attention: string;
  cancellationPolicy: string;
  itinerary: { time: string; title: string; detail: string }[];
  gallery: string[];
}

interface BokunPricingCategoryApi {
  id: number;
  title: string;
  categoryType: string;
  isDefault: boolean;
}

interface BokunCategoryPriceApi {
  pricingCategoryId: number;
  amount: number;
}

interface BokunAvailabilitySlotApi {
  date: string;
  startTime: string;
  startTimeId: number;
  rateId: number;
  availabilityCount: number;
  soldOut: boolean;
  pricesByCategory: BokunCategoryPriceApi[];
}

interface BokunAvailabilityResponseApi {
  packageId: string;
  currency: string;
  defaultRateId: number;
  pricingCategories: BokunPricingCategoryApi[];
  slots: BokunAvailabilitySlotApi[];
}

interface BokunQuestionOptionApi {
  value: string;
  label: string;
}

interface BokunQuestionApi {
  questionId: string;
  label: string;
  required: boolean;
  dataType: string;
  dataFormat: string;
  selectFromOptions: boolean;
  selectMultiple: boolean;
  answerOptions: BokunQuestionOptionApi[];
}

interface BokunCheckoutOptionApi {
  type: string;
  label: string;
  amount: number;
  currency: string;
  partialPayment: boolean;
  paymentMethods: string[];
  questions: BokunQuestionApi[];
}

interface BokunCheckoutOptionsResponseApi {
  options: BokunCheckoutOptionApi[];
  mainContactQuestions: BokunQuestionApi[];
}

interface BokunCheckoutSubmitResponseApi {
  status: string;
  confirmationCode: string;
  bookingId: string;
  redirectUrl: string;
  message: string;
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
    highlights: ['Guided experience', 'Photo opportunities', 'Local support'],
    includes: ['Licensed local guide', 'Hotel pickup and drop-off', 'Entry coordination support', 'Lunch included'],
    requirements: '',
    attention: '',
    cancellation: 'Cancellation policy depends on selected operator terms.',
    gallery: [
      'https://images.pexels.com/photos/27878405/pexels-photo-27878405.jpeg?auto=compress&cs=tinysrgb&w=1400',
      'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400',
      'https://images.pexels.com/photos/30172599/pexels-photo-30172599.jpeg?auto=compress&cs=tinysrgb&w=1400'
    ]
  };
  itinerary: ItineraryItem[] = [
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
  readonly fallbackGallery = [
    'https://images.pexels.com/photos/27878405/pexels-photo-27878405.jpeg?auto=compress&cs=tinysrgb&w=1400',
    'https://images.pexels.com/photos/16241868/pexels-photo-16241868.jpeg?auto=compress&cs=tinysrgb&w=1400',
    'https://images.pexels.com/photos/30172599/pexels-photo-30172599.jpeg?auto=compress&cs=tinysrgb&w=1400'
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
  personalIdNumber = '';
  nationality = '';
  isActivityLoading = false;
  isAvailabilityLoading = false;
  isCheckoutLoading = false;
  bookingError = '';
  checkoutMessage = '';
  bookingConfirmationCode = '';
  bookingReference = '';

  cardName = '';
  cardNumber = '';
  expiry = '';
  cvv = '';

  private _bokunPackageId = '';
  private availability: BokunAvailabilityResponseApi | null = null;
  selectedAvailabilitySlot: BokunAvailabilitySlotApi | null = null;
  checkoutOptions: BokunCheckoutOptionApi[] = [];
  mainContactQuestions: BokunQuestionApi[] = [];
  selectedCheckoutOption = '';
  selectedPaymentMethod = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient
  ) {
    this.refreshCalendar();
    this.route.queryParamMap.subscribe((params) => {
      const pkgId = params.get('pkgId')?.trim();
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
        gallery: image ? this.ensureGallerySize([image, ...this.activity.gallery]) : this.ensureGallerySize(this.activity.gallery)
      };

      const parsed = Number(priceRaw);
      if (!Number.isNaN(parsed) && parsed > 0) {
        this.adultPrice = parsed;
        this.childPrice = Math.max(1, Math.round(parsed * 0.7));
      }

      this._bokunPackageId = pkgId || '';
      if (this._bokunPackageId) {
        this.loadPackageDetails(this._bokunPackageId);
      } else {
        this.availability = null;
        this.refreshCalendar();
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
      if (this.bokunPackageId) {
        return this.adults + this.children > 0 && !this.selectedDate.disabled && this.selectedAvailabilitySlot !== null;
      }
      return this.adults + this.children > 0 && !this.selectedDate.disabled && this.selectedTime.trim().length > 0;
    }
    if (this.currentStep === 3) {
      if (this.requiresPersonalId && this.personalIdNumber.trim().length < 2) {
        return false;
      }
      return this.fullName.trim().length > 1 && this.email.includes('@');
    }
    if (this.currentStep === 4) {
      if (this.bokunPackageId) {
        return this.selectedCheckoutOption.length > 0 && this.selectedPaymentMethod.length > 0 && !this.isCheckoutLoading;
      }
      return this.cardName.trim().length > 1 && this.cardNumber.trim().length >= 12 && this.expiry.trim().length >= 4 && this.cvv.trim().length >= 3;
    }
    return false;
  }

  get requiresPersonalId(): boolean {
    const q = this.mainContactQuestions.find((item) => item.questionId === 'personalIdNumber');
    return !!q?.required;
  }

  get bokunPackageId(): string {
    return this._bokunPackageId;
  }

  get selectedOptionPaymentMethods(): string[] {
    const option = this.checkoutOptions.find((item) => item.type === this.selectedCheckoutOption) ?? this.checkoutOptions[0];
    return option?.paymentMethods ?? [];
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
    if (!this.bokunPackageId) {
      return;
    }

    const slot = this.getSlotsForDate(this.selectedDate.isoDate).find((item) => this.formatTimeLabel(item.startTime) === time);
    this.selectedAvailabilitySlot = slot ?? null;
    this.applySlotPricing();
  }

  onTimeInputChange(value: string): void {
    if (!value || this.bokunPackageId) {
      return;
    }
    this.selectedTimeInput = value;
    this.selectedTime = this.formatTimeLabel(value);
  }

  adjustAdults(delta: number): void {
    this.adults = Math.max(1, this.adults + delta);
    this.applySlotPricing();
  }

  adjustChildren(delta: number): void {
    this.children = Math.max(0, this.children + delta);
    this.applySlotPricing();
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

    if (this.currentStep === 2 && this.bokunPackageId) {
      this.loadCheckoutOptions(() => {
        this.currentStep = 3;
      });
      return;
    }

    if (this.currentStep === 4 && this.bokunPackageId) {
      this.submitCheckout();
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
    if (this.bokunPackageId) {
      this.loadAvailabilityForCurrentMonth();
      return;
    }
    this.refreshCalendar();
  }

  private refreshCalendar(enabledDates?: Set<string>): void {
    this.days = this.buildDaysForMonth(this.selectedYear, this.selectedMonth, enabledDates);
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

  private buildDaysForMonth(year: number, month: number, enabledDates?: Set<string>): DayOption[] {
    const result: DayOption[] = [];
    const today = new Date();
    const current = new Date(year, month, 1);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i += 1) {
      const d = new Date(year, month, i);
      const basePast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isoDate = d.toISOString().slice(0, 10);
      const hasAvailability = !enabledDates || enabledDates.has(isoDate);
      result.push({
        day: dayNames[d.getDay()],
        date: i,
        month: this.monthNames[current.getMonth()],
        isoDate,
        disabled: basePast || !hasAvailability
      });
    }
    return result;
  }

  private buildYearOptions(): number[] {
    const now = new Date().getFullYear();
    return [now, now + 1, now + 2, now + 3];
  }

  private refreshTimeOptions(): void {
    if (this.bokunPackageId) {
      const slots = this.getSlotsForDate(this.selectedDate.isoDate).filter((item) => !item.soldOut);
      this.timeOptions = slots.map((item) => this.formatTimeLabel(item.startTime));
      if (this.timeOptions.length === 0) {
        this.selectedTime = '';
        this.selectedTimeInput = '';
        this.selectedAvailabilitySlot = null;
        return;
      }
      if (!this.selectedTime || !this.timeOptions.includes(this.selectedTime)) {
        this.selectedTime = this.timeOptions[0];
      }
      this.selectedTimeInput = this.formatToInputTime(this.selectedTime);
      this.selectedAvailabilitySlot = slots.find((item) => this.formatTimeLabel(item.startTime) === this.selectedTime) ?? null;
      this.applySlotPricing();
      return;
    }

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

  private loadPackageDetails(pkgId: string): void {
    this.isActivityLoading = true;
    this.http.get<BokunPackageDetailApi>(`${environment.apiBaseUrl}/bokun/packages/${encodeURIComponent(pkgId)}`).subscribe({
      next: (detail) => {
        const summary = detail.summary?.trim() || detail.description?.trim() || this.activity.overview;
        const highlights = detail.highlights?.length ? detail.highlights : this.activity.highlights;
        const includes = detail.includes?.length ? detail.includes : this.activity.includes;
        const gallery = detail.gallery?.length ? detail.gallery : this.activity.gallery;

        this.activity = {
          ...this.activity,
          title: detail.title?.trim() || this.activity.title,
          subtitle: detail.category?.trim() ? `${detail.category.trim()} Package` : this.activity.subtitle,
          location: detail.location?.trim() || this.activity.location,
          duration: detail.duration?.trim() || this.activity.duration,
          rating: detail.rating > 0 ? detail.rating.toFixed(1) : this.activity.rating,
          reviews: detail.reviewCount > 0 ? `${detail.reviewCount} reviews` : this.activity.reviews,
          overview: summary,
          highlights,
          includes,
          requirements: detail.requirements?.trim() || this.activity.requirements,
          attention: detail.attention?.trim() || this.activity.attention,
          cancellation: detail.cancellationPolicy?.trim() || this.activity.cancellation,
          gallery: this.ensureGallerySize(gallery)
        };

        if (detail.itinerary?.length) {
          this.itinerary.splice(
            0,
            this.itinerary.length,
            ...detail.itinerary.map((item) => ({
              time: item.time || '09:00',
              title: item.title || 'Experience Step',
              description: item.detail || 'Details are provided by the operator at confirmation.'
            }))
          );
        }

        if (detail.priceFrom > 0) {
          this.adultPrice = detail.priceFrom;
          this.childPrice = Math.max(1, Math.round(detail.priceFrom * 0.7));
        }

        this.isActivityLoading = false;
        this.loadAvailabilityForCurrentMonth();
      },
      error: () => {
        this.isActivityLoading = false;
      }
    });
  }

  private loadAvailabilityForCurrentMonth(): void {
    if (!this.bokunPackageId) {
      return;
    }

    const start = new Date(this.selectedYear, this.selectedMonth, 1);
    const end = new Date(this.selectedYear, this.selectedMonth + 1, 0);
    const startIso = start.toISOString().slice(0, 10);
    const endIso = end.toISOString().slice(0, 10);

    this.isAvailabilityLoading = true;
    this.bookingError = '';

    this.http.get<BokunAvailabilityResponseApi>(
      `${environment.apiBaseUrl}/bokun/packages/${encodeURIComponent(this.bokunPackageId)}/availability?start=${startIso}&end=${endIso}&currency=USD`
    ).subscribe({
      next: (data) => {
        this.availability = data;
        const dates = new Set((data.slots ?? []).filter((item) => !item.soldOut).map((item) => item.date));
        this.refreshCalendar(dates);
        this.applySlotPricing();
        this.isAvailabilityLoading = false;
      },
      error: (err) => {
        this.availability = null;
        this.refreshCalendar();
        this.isAvailabilityLoading = false;
        this.bookingError = err?.error?.detail || 'Unable to load live availability for this package.';
      }
    });
  }

  private getSlotsForDate(isoDate: string): BokunAvailabilitySlotApi[] {
    const slots = this.availability?.slots ?? [];
    return slots
      .filter((item) => item.date === isoDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  private applySlotPricing(): void {
    if (!this.bokunPackageId || !this.selectedAvailabilitySlot) {
      return;
    }

    const adultCategory = this.resolveCategoryByType('ADULT');
    const childCategory = this.resolveCategoryByType('CHILD');

    const adultPrice = this.findPriceForCategory(this.selectedAvailabilitySlot, adultCategory?.id ?? null);
    const childPrice = this.findPriceForCategory(this.selectedAvailabilitySlot, childCategory?.id ?? null);

    if (adultPrice > 0) {
      this.adultPrice = adultPrice;
    }
    if (childPrice > 0) {
      this.childPrice = childPrice;
    } else if (adultPrice > 0) {
      this.childPrice = Math.max(1, Math.round(adultPrice * 0.7));
    }
  }

  private resolveCategoryByType(type: string): BokunPricingCategoryApi | null {
    const categories = this.availability?.pricingCategories ?? [];
    const byType = categories.find((item) => item.categoryType?.toUpperCase() === type.toUpperCase());
    if (byType) {
      return byType;
    }
    const fallback = categories.find((item) => item.isDefault);
    return fallback ?? categories[0] ?? null;
  }

  private findPriceForCategory(slot: BokunAvailabilitySlotApi, categoryId: number | null): number {
    if (!categoryId) {
      return 0;
    }
    return slot.pricesByCategory.find((item) => item.pricingCategoryId === categoryId)?.amount ?? 0;
  }

  private loadCheckoutOptions(onSuccess: () => void): void {
    const selection = this.buildSelectionPayload();
    if (!selection) {
      this.bookingError = 'Please select a valid date, time, and guest setup before proceeding.';
      return;
    }

    this.isCheckoutLoading = true;
    this.bookingError = '';
    this.checkoutMessage = '';

    this.http.post<BokunCheckoutOptionsResponseApi>(`${environment.apiBaseUrl}/bokun/checkout/options`, selection).subscribe({
      next: (response) => {
        this.checkoutOptions = response.options ?? [];
        this.mainContactQuestions = response.mainContactQuestions ?? [];
        const preferredOption = this.checkoutOptions[0];
        this.selectedCheckoutOption = preferredOption?.type ?? '';
        this.selectedPaymentMethod = this.selectPreferredPaymentMethod(preferredOption?.paymentMethods ?? []);
        this.checkoutMessage = this.checkoutOptions.length
          ? `Checkout loaded: ${this.checkoutOptions[0].label} (${this.checkoutOptions[0].currency} ${this.checkoutOptions[0].amount}).`
          : 'Checkout options loaded.';
        this.isCheckoutLoading = false;
        onSuccess();
      },
      error: (err) => {
        this.isCheckoutLoading = false;
        this.bookingError = err?.error?.detail || 'Unable to load checkout options from Bokun.';
      }
    });
  }

  private submitCheckout(): void {
    const selection = this.buildSelectionPayload();
    if (!selection) {
      this.bookingError = 'Please select a valid slot before submitting booking.';
      return;
    }

    const [firstName, ...rest] = this.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    const payload = {
      selection,
      mainContact: {
        firstName: firstName || this.fullName.trim(),
        lastName: lastName || this.fullName.trim(),
        email: this.email.trim(),
        personalIdNumber: this.personalIdNumber.trim() || null,
        phoneNumber: this.phone.trim() || null,
        nationality: this.nationality.trim() || null,
        title: null,
        gender: null
      },
      checkoutOption: this.selectedCheckoutOption || null,
      paymentMethod: this.selectedPaymentMethod || null,
      sendNotificationToMainContact: true,
      showPricesInNotification: true
    };

    this.isCheckoutLoading = true;
    this.bookingError = '';

    this.http.post<BokunCheckoutSubmitResponseApi>(`${environment.apiBaseUrl}/bokun/checkout/submit`, payload).subscribe({
      next: (result) => {
        this.bookingConfirmationCode = result.confirmationCode || '';
        this.bookingReference = result.bookingId || '';
        this.checkoutMessage = result.message || 'Booking submitted successfully.';
        this.isCheckoutLoading = false;
        this.currentStep = 5;
      },
      error: (err) => {
        this.isCheckoutLoading = false;
        this.bookingError = err?.error?.detail || 'Bokun rejected booking submission.';
      }
    });
  }

  private buildSelectionPayload(): {
    packageId: string;
    date: string;
    startTimeId: number;
    rateId: number;
    currency: string;
    passengers: { pricingCategoryId: number; quantity: number }[];
  } | null {
    if (!this.bokunPackageId || !this.selectedAvailabilitySlot || !this.selectedDate?.isoDate) {
      return null;
    }

    const passengers: { pricingCategoryId: number; quantity: number }[] = [];
    const adultCategory = this.resolveCategoryByType('ADULT');
    const childCategory = this.resolveCategoryByType('CHILD');

    if (this.adults > 0 && adultCategory) {
      passengers.push({ pricingCategoryId: adultCategory.id, quantity: this.adults });
    }
    if (this.children > 0 && childCategory) {
      passengers.push({ pricingCategoryId: childCategory.id, quantity: this.children });
    }
    if (passengers.length === 0) {
      return null;
    }

    return {
      packageId: this.bokunPackageId,
      date: this.selectedDate.isoDate,
      startTimeId: this.selectedAvailabilitySlot.startTimeId,
      rateId: this.selectedAvailabilitySlot.rateId || this.availability?.defaultRateId || 0,
      currency: this.availability?.currency || 'USD',
      passengers
    };
  }

  private selectPreferredPaymentMethod(methods: string[]): string {
    const normalized = methods ?? [];
    if (normalized.includes('RESERVE_FOR_EXTERNAL_PAYMENT')) return 'RESERVE_FOR_EXTERNAL_PAYMENT';
    if (normalized.includes('CASH')) return 'CASH';
    if (normalized.includes('CARD')) return 'CARD';
    return normalized[0] || '';
  }

  private ensureGallerySize(gallery: string[]): string[] {
    const cleaned = gallery.filter((item) => item && item.trim().length > 0);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 3);
    }

    const result = [...cleaned];
    let idx = 0;
    while (result.length < 3) {
      result.push(this.fallbackGallery[idx]);
      idx += 1;
    }
    return result;
  }
}
