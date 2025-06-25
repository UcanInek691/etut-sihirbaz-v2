
import { format, startOfWeek, endOfWeek } from 'date-fns';

export interface Session {
  id: string;
  teacherId: string;
  studentId: string;
  date: Date;
  timeSlot: string;
  subject: string;
  weekYear: string;
  status: 'scheduled' | 'completed' | 'absent';
  createdAt: Date;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  studentNumber: string;
  totalSessions: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  availableHours: { [key: string]: string[] };
  totalSessions: number;
}

/**
 * KRITIK FONKSIYON: Haftalık ders limiti kontrolü
 */
export const validateWeeklySubjectLimit = (
  studentId: string,
  subject: string,
  targetDate: Date,
  existingSessions: Session[],
  studentName: string
): { valid: boolean; message?: string } => {
  const weekYear = getWeekYear(targetDate);
  
  const existingSessionInWeek = existingSessions.find(session => 
    session.studentId === studentId && 
    session.subject === subject && 
    session.weekYear === weekYear
  );
  
  if (existingSessionInWeek) {
    return {
      valid: false,
      message: `❌ ${studentName} bu hafta ${subject} dersinden zaten etüt aldı/alacak! (${format(existingSessionInWeek.date, 'dd.MM.yyyy')} ${existingSessionInWeek.timeSlot})`
    };
  }
  
  return { valid: true };
};

export const getWeekYear = (date: Date): string => {
  const year = date.getFullYear();
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const onejan = new Date(year, 0, 1);
  const weekNumber = Math.ceil((((start.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

export const isTeacherAvailable = (
  teacherId: string,
  timeSlot: string,
  date: Date,
  existingSessions: Session[]
): boolean => {
  const conflictingSession = existingSessions.find(session =>
    session.teacherId === teacherId &&
    session.timeSlot === timeSlot &&
    format(session.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );
  
  return !conflictingSession;
};

export const isStudentAvailable = (
  studentId: string,
  timeSlot: string,
  date: Date,
  existingSessions: Session[]
): boolean => {
  const conflictingSession = existingSessions.find(session =>
    session.studentId === studentId &&
    session.timeSlot === timeSlot &&
    format(session.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );
  
  return !conflictingSession;
};

/**
 * Öğretmenin belirli gün için müsait olup olmadığını kontrol et
 */
export const isTeacherAvailableOnDay = (
  teacher: Teacher,
  dayName: string,
  timeSlot: string
): boolean => {
  const daySchedule = teacher.availableHours[dayName];
  return daySchedule ? daySchedule.includes(timeSlot) : false;
};

export const validateSessionAssignment = (
  teacherId: string,
  studentId: string,
  subject: string,
  timeSlot: string,
  date: Date,
  teachers: Teacher[],
  students: Student[],
  existingSessions: Session[]
): { valid: boolean; message?: string } => {
  const teacher = teachers.find(t => t.id === teacherId);
  const student = students.find(s => s.id === studentId);
  
  if (!teacher || !student) {
    return { valid: false, message: "Öğretmen veya öğrenci bulunamadı!" };
  }
  
  // 1. Haftalık ders limiti kontrolü
  const weeklyLimitCheck = validateWeeklySubjectLimit(studentId, subject, date, existingSessions, student.name);
  if (!weeklyLimitCheck.valid) {
    return weeklyLimitCheck;
  }
  
  // 2. Öğretmen o gün müsait mi?
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const dayName = dayNames[date.getDay()];
  
  if (!isTeacherAvailableOnDay(teacher, dayName, timeSlot)) {
    return { 
      valid: false, 
      message: `❌ ${teacher.name} ${dayName} günü ${timeSlot} saatinde müsait değil!` 
    };
  }
  
  // 3. Öğretmen çakışması
  if (!isTeacherAvailable(teacherId, timeSlot, date, existingSessions)) {
    return { 
      valid: false, 
      message: `❌ ${teacher.name} bu saatte başka etüt veriyor!` 
    };
  }
  
  // 4. Öğrenci çakışması
  if (!isStudentAvailable(studentId, timeSlot, date, existingSessions)) {
    return { 
      valid: false, 
      message: `❌ ${student.name} bu saatte başka etüt alıyor!` 
    };
  }
  
  return { valid: true };
};
