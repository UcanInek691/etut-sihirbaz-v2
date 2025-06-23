
import { useState, useEffect } from 'react';
import { Calendar, Users, GraduationCap, FileSpreadsheet, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklySchedule } from '@/components/WeeklySchedule';
import { TeacherManagement } from '@/components/TeacherManagement';
import { StudentManagement } from '@/components/StudentManagement';
import { ReportsSection } from '@/components/ReportsSection';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalSessions, setTotalSessions] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Sample data initialization
  useEffect(() => {
    const sampleTeachers = [
      { id: '1', name: 'Ahmet Hoca', subject: 'Matematik', email: 'ahmet@okul.com', availableHours: [], totalSessions: 0 },
      { id: '2', name: 'Ayşe Öğretmen', subject: 'Fizik', email: 'ayse@okul.com', availableHours: [], totalSessions: 0 },
      { id: '3', name: 'Mehmet Bey', subject: 'Kimya', email: 'mehmet@okul.com', availableHours: [], totalSessions: 0 }
    ];

    const sampleStudents = [
      { id: '1', name: 'Ali Veli', class: '9-A', studentNumber: '001', isBanned: false, banEndDate: null, totalSessions: 0 },
      { id: '2', name: 'Fatma Yılmaz', class: '10-B', studentNumber: '002', isBanned: false, banEndDate: null, totalSessions: 0 },
      { id: '3', name: 'Can Demir', class: '11-C', studentNumber: '003', isBanned: false, banEndDate: null, totalSessions: 0 }
    ];

    setTeachers(sampleTeachers);
    setStudents(sampleStudents);
    
    // Show welcome message
    toast({
      title: "Etüt Yönetim Sistemi",
      description: "Hoş geldiniz! Haftalık program ve öğrenci atamaları için sol paneli kullanın.",
    });
  }, []);

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
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Etüt Yönetim Sistemi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Toplam Etüt: {totalSessions}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedDate.toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Program</span>
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
          </TabsList>

          <TabsContent value="dashboard">
            <WeeklySchedule 
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              teachers={teachers}
              students={students}
              sessions={sessions}
              setSessions={setSessions}
              setTotalSessions={setTotalSessions}
            />
          </TabsContent>

          <TabsContent value="teachers">
            <TeacherManagement 
              teachers={teachers}
              setTeachers={setTeachers}
            />
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement 
              students={students}
              setStudents={setStudents}
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
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
