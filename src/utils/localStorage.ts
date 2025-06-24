
import { Session, Teacher, Student } from './sessionValidation';
import { TimeSlot } from './timeSlotManager';

const STORAGE_KEYS = {
  SESSIONS: 'etut_sessions',
  TEACHERS: 'etut_teachers', 
  STUDENTS: 'etut_students',
  TIME_SLOTS: 'etut_time_slots'
};

export class LocalStorageManager {
  // Sessions
  static saveSessions(sessions: Session[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  static loadSessions(): Session[] {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    
    return JSON.parse(data).map((session: any) => ({
      ...session,
      date: new Date(session.date),
      createdAt: new Date(session.createdAt)
    }));
  }

  // Teachers
  static saveTeachers(teachers: Teacher[]): void {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }

  static loadTeachers(): Teacher[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!data) return [];
    return JSON.parse(data);
  }

  // Students
  static saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  static loadStudents(): Student[] {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!data) return [];
    
    return JSON.parse(data).map((student: any) => ({
      ...student,
      banEndDate: student.banEndDate ? new Date(student.banEndDate) : null
    }));
  }

  // Auto-save all data
  static autoSaveAll(sessions: Session[], teachers: Teacher[], students: Student[]): void {
    this.saveSessions(sessions);
    this.saveTeachers(teachers);
    this.saveStudents(students);
  }

  // Clear all data
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
