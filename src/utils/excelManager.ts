
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Session, Teacher, Student } from './sessionValidation';

export interface TeacherSessionRecord {
  Tarih: string;
  Saat: string;
  'Öğretmen Adı': string;
  'Öğrenci Adı': string;
  Ders: string;
  Durum: string;
  Hafta: string;
  Notlar: string;
}

export interface StudentSessionRecord {
  Tarih: string;
  Saat: string;
  'Öğrenci Adı': string;
  Sınıf: string;
  Öğretmen: string;
  Ders: string;
  Durum: string;
  Hafta: string;
  Notlar: string;
}

export class ExcelManager {
  private static instance: ExcelManager;
  
  static getInstance(): ExcelManager {
    if (!ExcelManager.instance) {
      ExcelManager.instance = new ExcelManager();
    }
    return ExcelManager.instance;
  }

  /**
   * Öğretmen etütleri Excel dosyası oluştur ve indir
   */
  exportTeacherSessions(sessions: Session[], teachers: Teacher[], students: Student[]): void {
    const teacherRecords: TeacherSessionRecord[] = sessions.map(session => {
      const teacher = teachers.find(t => t.id === session.teacherId);
      const student = students.find(s => s.id === session.studentId);
      
      return {
        'Tarih': format(session.date, 'dd.MM.yyyy'),
        'Saat': session.timeSlot,
        'Öğretmen Adı': teacher?.name || 'Bilinmeyen',
        'Öğrenci Adı': student?.name || 'Bilinmeyen',
        'Ders': session.subject,
        'Durum': this.getStatusText(session.status),
        'Hafta': session.weekYear,
        'Notlar': session.notes || ''
      };
    });

    this.downloadExcelFile(teacherRecords, 'ogretmen_etutleri.xlsx');
  }

  /**
   * Öğrenci etütleri Excel dosyası oluştur ve indir
   */
  exportStudentSessions(sessions: Session[], teachers: Teacher[], students: Student[]): void {
    const studentRecords: StudentSessionRecord[] = sessions.map(session => {
      const teacher = teachers.find(t => t.id === session.teacherId);
      const student = students.find(s => s.id === session.studentId);
      
      return {
        'Tarih': format(session.date, 'dd.MM.yyyy'),
        'Saat': session.timeSlot,
        'Öğrenci Adı': student?.name || 'Bilinmeyen',
        'Sınıf': student?.class || 'Bilinmeyen',
        'Öğretmen': teacher?.name || 'Bilinmeyen',
        'Ders': session.subject,
        'Durum': this.getStatusText(session.status),
        'Hafta': session.weekYear,
        'Notlar': session.notes || ''
      };
    });

    this.downloadExcelFile(studentRecords, 'ogrenci_etutleri.xlsx');
  }

  /**
   * Belirli bir öğretmenin etüt geçmişini Excel olarak indir
   */
  exportTeacherHistory(teacherName: string, sessions: Session[], teachers: Teacher[], students: Student[]): void {
    const teacher = teachers.find(t => t.name.toLowerCase().includes(teacherName.toLowerCase()));
    if (!teacher) return;

    const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);
    const records: TeacherSessionRecord[] = teacherSessions.map(session => {
      const student = students.find(s => s.id === session.studentId);
      
      return {
        'Tarih': format(session.date, 'dd.MM.yyyy'),
        'Saat': session.timeSlot,
        'Öğretmen Adı': teacher.name,
        'Öğrenci Adı': student?.name || 'Bilinmeyen',
        'Ders': session.subject,
        'Durum': this.getStatusText(session.status),
        'Hafta': session.weekYear,
        'Notlar': session.notes || ''
      };
    });

    this.downloadExcelFile(records, `${teacher.name.replace(' ', '_')}_etut_gecmisi.xlsx`);
  }

  /**
   * Belirli bir öğrencinin etüt geçmişini Excel olarak indir
   */
  exportStudentHistory(studentName: string, sessions: Session[], teachers: Teacher[], students: Student[]): void {
    const student = students.find(s => s.name.toLowerCase().includes(studentName.toLowerCase()));
    if (!student) return;

    const studentSessions = sessions.filter(s => s.studentId === student.id);
    const records: StudentSessionRecord[] = studentSessions.map(session => {
      const teacher = teachers.find(t => t.id === session.teacherId);
      
      return {
        'Tarih': format(session.date, 'dd.MM.yyyy'),
        'Saat': session.timeSlot,
        'Öğrenci Adı': student.name,
        'Sınıf': student.class,
        'Öğretmen': teacher?.name || 'Bilinmeyen',
        'Ders': session.subject,
        'Durum': this.getStatusText(session.status),
        'Hafta': session.weekYear,
        'Notlar': session.notes || ''
      };
    });

    this.downloadExcelFile(records, `${student.name.replace(' ', '_')}_etut_gecmisi.xlsx`);
  }

  /**
   * Belirli bir ayın etüt verilerini Excel olarak indir
   */
  exportMonthlyData(year: number, month: number, sessions: Session[], teachers: Teacher[], students: Student[]): void {
    const monthlySessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getFullYear() === year && sessionDate.getMonth() === month - 1;
    });

    const records: StudentSessionRecord[] = monthlySessions.map(session => {
      const teacher = teachers.find(t => t.id === session.teacherId);
      const student = students.find(s => s.id === session.studentId);
      
      return {
        'Tarih': format(session.date, 'dd.MM.yyyy'),
        'Saat': session.timeSlot,
        'Öğrenci Adı': student?.name || 'Bilinmeyen',
        'Sınıf': student?.class || 'Bilinmeyen',
        'Öğretmen': teacher?.name || 'Bilinmeyen',
        'Ders': session.subject,
        'Durum': this.getStatusText(session.status),
        'Hafta': session.weekYear,
        'Notlar': session.notes || ''
      };
    });

    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    this.downloadExcelFile(records, `${year}_${monthNames[month-1]}_etutleri.xlsx`);
  }

  /**
   * Belirli sınıfların etüt geçmişini Excel olarak indir
   */
  exportClassHistory(className: string, sessions: Session[], teachers: Teacher[], students: Student[]): void {
    const classStudents = students.filter(s => s.class.toLowerCase().includes(className.toLowerCase()));
    const studentIds = classStudents.map(s => s.id);
    
    const classSessions = sessions.filter(s => studentIds.includes(s.studentId));
    const records: StudentSessionRecord[] = classSessions.map(session => {
      const teacher = teachers.find(t => t.id === session.teacherId);
      const student = students.find(s => s.id === session.studentId);
      
      return {
        'Tarih': format(session.date, 'dd.MM.yyyy'),
        'Saat': session.timeSlot,
        'Öğrenci Adı': student?.name || 'Bilinmeyen',
        'Sınıf': student?.class || 'Bilinmeyen',
        'Öğretmen': teacher?.name || 'Bilinmeyen',
        'Ders': session.subject,
        'Durum': this.getStatusText(session.status),
        'Hafta': session.weekYear,
        'Notlar': session.notes || ''
      };
    });

    this.downloadExcelFile(records, `${className.replace('-', '_')}_sinifi_etut_gecmisi.xlsx`);
  }

  /**
   * Her etüt işlemi sonrası iki Excel dosyasını da otomatik güncelle
   */
  autoSaveAllExcelFiles(sessions: Session[], teachers: Teacher[], students: Student[]): void {
    console.log('🔄 Otomatik Excel kaydetme başlatılıyor...');
    
    this.exportTeacherSessions(sessions, teachers, students);
    
    setTimeout(() => {
      this.exportStudentSessions(sessions, teachers, students);
      console.log('✅ Excel dosyaları başarıyla güncellendi ve indirildi!');
    }, 1000);
  }

  /**
   * Excel dosyasını oluştur ve otomatik indir
   */
  private downloadExcelFile(data: any[], filename: string): void {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      
      const columnWidths = [
        { wpx: 100 }, // Tarih
        { wpx: 120 }, // Saat
        { wpx: 150 }, // İsim
        { wpx: 100 }, // Sınıf/Ders
        { wpx: 150 }, // Öğretmen/Öğrenci
        { wpx: 120 }, // Ders/Durum
        { wpx: 100 }, // Durum/Hafta
        { wpx: 100 }, // Hafta
        { wpx: 200 }  // Notlar
      ];
      worksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Etütler');
      XLSX.writeFile(workbook, filename);
      
    } catch (error) {
      console.error('Excel dosyası oluşturulurken hata:', error);
    }
  }

  /**
   * Durum metni çevirisi
   */
  private getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Planlandı';
      case 'completed': return 'Tamamlandı';
      case 'absent': return 'Gelmedi';
      default: return 'Bilinmeyen';
    }
  }

  /**
   * Excel dosyasından veri içe aktar
   */
  importFromExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsBinaryString(file);
    });
  }
}

export const excelManager = ExcelManager.getInstance();
