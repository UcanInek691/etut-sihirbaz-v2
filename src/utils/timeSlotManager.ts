
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: '1', startTime: '09:30', endTime: '10:10', isActive: true },
  { id: '2', startTime: '10:20', endTime: '11:00', isActive: true },
  { id: '3', startTime: '11:10', endTime: '11:50', isActive: true },
  { id: '4', startTime: '12:00', endTime: '12:40', isActive: true },
  { id: '5', startTime: '12:50', endTime: '13:30', isActive: true },
  { id: '6', startTime: '13:40', endTime: '14:20', isActive: true },
  { id: '7', startTime: '14:30', endTime: '15:10', isActive: true },
  { id: '8', startTime: '15:20', endTime: '16:00', isActive: true },
  { id: '9', startTime: '16:10', endTime: '16:50', isActive: true },
  { id: '10', startTime: '17:00', endTime: '17:40', isActive: true },
  { id: '11', startTime: '17:50', endTime: '18:30', isActive: true },
  { id: '12', startTime: '18:40', endTime: '19:20', isActive: true },
  { id: '13', startTime: '19:30', endTime: '20:00', isActive: true }
];

const STORAGE_KEY = 'etut_time_slots';

export class TimeSlotManager {
  static getTimeSlots(): TimeSlot[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    this.saveTimeSlots(DEFAULT_TIME_SLOTS);
    return DEFAULT_TIME_SLOTS;
  }

  static saveTimeSlots(timeSlots: TimeSlot[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timeSlots));
  }

  static getActiveTimeSlots(): TimeSlot[] {
    return this.getTimeSlots().filter(slot => slot.isActive);
  }

  static getTimeSlotStrings(): string[] {
    return this.getActiveTimeSlots().map(slot => `${slot.startTime}-${slot.endTime}`);
  }

  static addTimeSlot(startTime: string, endTime: string): void {
    const timeSlots = this.getTimeSlots();
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime,
      endTime,
      isActive: true
    };
    timeSlots.push(newSlot);
    this.saveTimeSlots(timeSlots);
  }

  static updateTimeSlot(id: string, updates: Partial<TimeSlot>): void {
    const timeSlots = this.getTimeSlots();
    const index = timeSlots.findIndex(slot => slot.id === id);
    if (index !== -1) {
      timeSlots[index] = { ...timeSlots[index], ...updates };
      this.saveTimeSlots(timeSlots);
    }
  }

  static deleteTimeSlot(id: string): void {
    const timeSlots = this.getTimeSlots().filter(slot => slot.id !== id);
    this.saveTimeSlots(timeSlots);
  }

  // Mevcut öğretmenlerin müsaitlik listesini yeni saat dilimleriyle güncelle
  static refreshTeacherAvailability(): void {
    const currentTimeSlots = this.getTimeSlotStrings();
    const teachers = JSON.parse(localStorage.getItem('etut_teachers') || '[]');
    
    const updatedTeachers = teachers.map((teacher: any) => {
      const currentAvailableHours = teacher.availableHours || {};
      
      // Her gün için mevcut saat dilimlerini kontrol et ve eksik olanları ekle
      const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      
      weekDays.forEach(day => {
        if (!currentAvailableHours[day]) {
          currentAvailableHours[day] = [];
        }
      });

      return {
        ...teacher,
        availableHours: currentAvailableHours
      };
    });
    
    localStorage.setItem('etut_teachers', JSON.stringify(updatedTeachers));
  }
}
