
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
}

export interface Student {
  id: string;
  name: string;
  class: string;
  studentNumber: string;
  isBanned: boolean;
  banEndDate: Date | null;
  totalSessions: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  availableHours: string[];
  totalSessions: number;
}

/**
 * KRITIK FONKSIYON: Haftalık ders limiti kontrolü
 * Bir öğrenci aynı dersten haftada sadece 1 etüt alabilir
 */
export const validateWeeklySubjectLimit = (
  studentId: string,
  subject: string,
  targetDate: Date,
  existingSessions: Session[],
  studentName: string
): { valid: boolean; message?: string } => {
  // ISO hafta formatı oluştur (YYYY-WW)
  const weekYear = getWeekYear(targetDate);
  
  // Bu hafta bu öğrencinin bu dersten etütü var mı kontrol et
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

/**
 * ISO hafta formatı oluşturur (YYYY-WW)
 */
export const getWeekYear = (date: Date): string => {
  const year = date.getFullYear();
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Pazartesi başlangıç
  const onejan = new Date(year, 0, 1);
  const weekNumber = Math.ceil((((start.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

/**
 * Öğrenci yasaklı mı kontrol et
 */
export const isStudentBanned = (student: Student): boolean => {
  if (!student.isBanned || !student.banEndDate) return false;
  return new Date() < student.banEndDate;
};

/**
 * Öğretmen müsait mi kontrol et
 */
export const isTeacherAvailable = (
  teacherId: string,
  timeSlot: string,
  date: Date,
  existingSessions: Session[]
): boolean => {
  // Aynı zaman diliminde öğretmenin başka etütü var mı?
  const conflictingSession = existingSessions.find(session =>
    session.teacherId === teacherId &&
    session.timeSlot === timeSlot &&
    format(session.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );
  
  return !conflictingSession;
};

/**
 * Zaman slotu dolu mu kontrol et
 */
export const isTimeSlotFull = (
  timeSlot: string,
  date: Date,
  existingSessions: Session[],
  maxStudentsPerSlot: number = 30
): boolean => {
  const sessionsInSlot = existingSessions.filter(session =>
    session.timeSlot === timeSlot &&
    format(session.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );
  
  return sessionsInSlot.length >= maxStudentsPerSlot;
};

/**
 * Kapsamlı etüt validasyonu
 */
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
  
  // 1. Öğrenci yasaklı mı?
  if (isStudentBanned(student)) {
    return { 
      valid: false, 
      message: `❌ ${student.name} yasaklı! Yasak bitiş tarihi: ${student.banEndDate?.toLocaleDateString('tr-TR')}` 
    };
  }
  
  // 2. KRITIK: Haftalık ders limiti kontrolü
  const weeklyLimitCheck = validateWeeklySubjectLimit(studentId, subject, date, existingSessions, student.name);
  if (!weeklyLimitCheck.valid) {
    return weeklyLimitCheck;
  }
  
  // 3. Öğretmen müsait mi?
  if (!isTeacherAvailable(teacherId, timeSlot, date, existingSessions)) {
    return { 
      valid: false, 
      message: `❌ ${teacher.name} bu saatte başka etüt veriyor!` 
    };
  }
  
  // 4. Zaman slotu dolu mu?
  if (isTimeSlotFull(timeSlot, date, existingSessions)) {
    return { 
      valid: false, 
      message: `❌ Bu zaman dilimi dolu! (Max 30 öğrenci)` 
    };
  }
  
  return { valid: true };
};

/**
 * Öğrenci ban işlemi (2 hafta)
 */
export const banStudent = (student: Student): Student => {
  const banEndDate = new Date();
  banEndDate.setDate(banEndDate.getDate() + 14); // 2 hafta
  
  return {
    ...student,
    isBanned: true,
    banEndDate
  };
};
