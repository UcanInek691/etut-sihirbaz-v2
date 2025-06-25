import { useState, useEffect } from 'react';
import { Calendar, Users, GraduationCap, FileSpreadsheet, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { TeacherManagement } from '@/components/TeacherManagement';
import { StudentManagement } from '@/components/StudentManagement';
import { ReportsSection } from '@/components/ReportsSection';
import { TeacherScheduleView } from '@/components/TeacherScheduleView';
import { toast } from '@/hooks/use-toast';
import { LocalStorageManager } from '@/utils/localStorage';
import { Teacher, Student, Session } from '@/utils/sessionValidation';
import { TimeSlotManagement } from '@/components/TimeSlotManagement';
import { DataManager } from '@/components/DataManager';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalSessions, setTotalSessions] = useState(0);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  // Uygulama başlangıcında verileri yükle
  useEffect(() => {
    console.log('🔄 Veriler yükleniyor...');
    
    const savedTeachers = LocalStorageManager.loadTeachers();
    const savedStudents = LocalStorageManager.loadStudents();
    const savedSessions = LocalStorageManager.loadSessions();

    if (savedTeachers.length > 0) {
      setTeachers(savedTeachers);
      console.log(`✅ ${savedTeachers.length} öğretmen yüklendi`);
    } else {
      const sampleTeachers: Teacher[] = [
        { 
          id: '1', 
          name: 'Ahmet Hoca', 
          subject: 'Matematik', 
          email: 'ahmet@okul.com', 
          availableHours: {
            'Pazartesi': ['09:30-10:10', '11:10-11:50'],
            'Salı': ['10:20-11:00', '14:30-15:10'],
            'Çarşamba': ['09:30-10:10', '13:40-14:20']
          }, 
          totalSessions: 0 
        },
        { 
          id: '2', 
          name: 'Ayşe Öğretmen', 
          subject: 'Fizik', 
          email: 'ayse@okul.com', 
          availableHours: {
            'Pazartesi': ['12:00-12:40', '15:20-16:00'],
            'Perşembe': ['10:20-11:00', '16:10-16:50']
          }, 
          totalSessions: 0 
        },
        { 
          id: '3', 
          name: 'Mehmet Öğretmen', 
          subject: 'Geometri', 
          email: 'mehmet@okul.com', 
          availableHours: {
            'Salı': ['09:30-10:10', '12:50-13:30'],
            'Cuma': ['11:10-11:50', '14:30-15:10']
          }, 
          totalSessions: 0 
        },
        { 
          id: '4', 
          name: 'Zeynep Öğretmen', 
          subject: 'Fen Bilgisi', 
          email: 'zeynep@okul.com', 
          availableHours: {
            'Çarşamba': ['10:20-11:00', '15:20-16:00'],
            'Cumartesi': ['09:30-10:10', '11:10-11:50']
          }, 
          totalSessions: 0 
        },
        { 
          id: '5', 
          name: 'Emre Öğretmen', 
          subject: 'Sosyal Bilgiler', 
          email: 'emre@okul.com', 
          availableHours: {
            'Perşembe': ['12:00-12:40', '17:00-17:40'],
            'Pazar': ['13:40-14:20', '16:10-16:50']
          }, 
          totalSessions: 0 
        }
      ];
      setTeachers(sampleTeachers);
      LocalStorageManager.saveTeachers(sampleTeachers);
    }

    if (savedStudents.length > 0) {
      setStudents(savedStudents);
      console.log(`✅ ${savedStudents.length} öğrenci yüklendi`);
    } else {
      const sampleStudents: Student[] = [
        { id: '1', name: 'Ali Veli', class: '9-A', studentNumber: '001', totalSessions: 0 },
        { id: '2', name: 'Fatma Yılmaz', class: '10-B', studentNumber: '002', totalSessions: 0 }
      ];
      setStudents(sampleStudents);
      LocalStorageManager.saveStudents(sampleStudents);
    }

    if (savedSessions.length > 0) {
      setSessions(savedSessions);
      console.log(`✅ ${savedSessions.length} etüt yüklendi`);
    }

    toast({
      title: "Sistem Hazır",
      description: "Veriler başarıyla yüklendi. Otomatik kayıt aktif.",
    });
  }, []);

  // Otomatik kayıt fonksiyonları
  const updateSessions = (newSessions: Session[]) => {
    setSessions(newSessions);
    LocalStorageManager.autoSaveAll(newSessions, teachers, students);
  };

  const updateTeachers = (newTeachers: Teacher[]) => {
    setTeachers(newTeachers);
    LocalStorageManager.autoSaveAll(sessions, newTeachers, students);
  };

  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    LocalStorageManager.autoSaveAll(sessions, teachers, newStudents);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/6c221dbb-ab39-4895-904a-60e2842c99ef.png" 
                alt="Uğur Ocak Logo" 
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold text-gray-900">Uğur Ocak Etüt Yönetim Sistemi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Otomatik Kayıt Aktif</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Toplam Etüt: {sessions.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="teacher-schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
            <TabsTrigger value="teacher-schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Öğretmen Programı</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Genel Program</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Öğretmenler</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Öğrenciler</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Raporlar</span>
            </TabsTrigger>
            <TabsTrigger value="time-slots" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Saat Dilimleri</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Veri Yönetimi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teacher-schedule">
            <TeacherScheduleView 
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              teachers={teachers}
              students={students}
              sessions={sessions}
              setSessions={updateSessions}
              selectedTeacherId={selectedTeacherId}
              setSelectedTeacherId={setSelectedTeacherId}
              setStudents={updateStudents}
            />
          </TabsContent>

          <TabsContent value="dashboard">
            <WeeklySchedule 
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              teachers={teachers}
              students={students}
              sessions={sessions}
              setSessions={updateSessions}
              setTotalSessions={setTotalSessions}
              setStudents={updateStudents}
            />
          </TabsContent>

          <TabsContent value="teachers">
            <TeacherManagement 
              teachers={teachers}
              setTeachers={updateTeachers}
            />
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement 
              students={students}
              setStudents={updateStudents}
              sessions={sessions}
            />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsSection 
              teachers={teachers}
              students={students}
              sessions={sessions}
            />
          </TabsContent>

          <TabsContent value="time-slots">
            <TimeSlotManagement />
          </TabsContent>

          <TabsContent value="data">
            <DataManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
