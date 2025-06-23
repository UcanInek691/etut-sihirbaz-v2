
import React, { useState } from 'react';
import { FileSpreadsheet, Download, BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line } from 'recharts';
import { Teacher, Student, Session } from '@/utils/sessionValidation';
import { excelManager } from '@/utils/excelManager';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface ReportsSectionProps {
  teachers: Teacher[];
  students: Student[];
  sessions: Session[];
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  teachers,
  students,
  sessions
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Excel Export
  const handleExportTeachers = async () => {
    setIsExporting(true);
    try {
      excelManager.exportTeacherSessions(sessions, teachers, students);
      toast({
        title: "Excel Dışa Aktarıldı",
        description: "Öğretmen etütleri Excel dosyası indirildi."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Excel dosyası oluşturulurken hata oluştu.",
        variant: "destructive"
      });
    }
    setIsExporting(false);
  };

  const handleExportStudents = async () => {
    setIsExporting(true);
    try {
      excelManager.exportStudentSessions(sessions, teachers, students);
      toast({
        title: "Excel Dışa Aktarıldı",
        description: "Öğrenci etütleri Excel dosyası indirildi."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Excel dosyası oluşturulurken hata oluştu.",
        variant: "destructive"
      });
    }
    setIsExporting(false);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      excelManager.autoSaveAllExcelFiles(sessions, teachers, students);
      toast({
        title: "Tüm Excel Dosyaları Dışa Aktarıldı",
        description: "Hem öğretmen hem öğrenci etütleri indirildi."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Excel dosyaları oluşturulurken hata oluştu.",
        variant: "destructive"
      });
    }
    setIsExporting(false);
  };

  // İstatistikler
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const absentSessions = sessions.filter(s => s.status === 'absent').length;
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;

  // Öğretmen bazında etüt dağılımı
  const teacherData = teachers.map(teacher => {
    const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);
    return {
      name: teacher.name.split(' ')[0], // Sadece isim
      etutSayisi: teacherSessions.length,
      subject: teacher.subject
    };
  }).sort((a, b) => b.etutSayisi - a.etutSayisi);

  // Ders bazında dağılım
  const subjectData = teachers.reduce((acc, teacher) => {
    const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);
    const existing = acc.find(item => item.subject === teacher.subject);
    if (existing) {
      existing.value += teacherSessions.length;
    } else {
      acc.push({
        subject: teacher.subject,
        value: teacherSessions.length
      });
    }
    return acc;
  }, [] as { subject: string; value: number }[]);

  // Aylık trend verisi
  const monthlyData = (() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return months.map(month => {
      const monthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startOfMonth(month) && sessionDate <= endOfMonth(month);
      });

      return {
        month: format(month, 'MMM'),
        etutSayisi: monthSessions.length
      };
    });
  })();

  // Renkler
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Raporlar ve İstatistikler</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleExportTeachers}
                disabled={isExporting}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Öğretmen Excel</span>
              </Button>
              <Button 
                onClick={handleExportStudents}
                disabled={isExporting}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Öğrenci Excel</span>
              </Button>
              <Button 
                onClick={handleExportAll}
                disabled={isExporting}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Tümünü İndir</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Toplam Etüt</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold text-green-600">{completedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Devamsızlık</p>
                <p className="text-2xl font-bold text-red-600">{absentSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Planlanmış</p>
                <p className="text-2xl font-bold text-blue-600">{scheduledSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Öğretmen Etüt Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Öğretmen Etüt Dağılımı</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teacherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    value, 
                    `Etüt Sayısı (${props.payload.subject})`
                  ]}
                />
                <Bar dataKey="etutSayisi" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ders Bazında Dağılım */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Ders Bazında Dağılım</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPieChart
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPieChart>
                <Tooltip formatter={(value) => [value, 'Etüt Sayısı']} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {subjectData.map((subject, index) => (
                <div key={subject.subject} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm">{subject.subject}: {subject.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aylık Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Aylık Etüt Trendi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="etutSayisi" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detaylı İstatistikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Aktif Öğretmenler */}
        <Card>
          <CardHeader>
            <CardTitle>En Aktif Öğretmenler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherData.slice(0, 5).map((teacher, index) => (
                <div key={teacher.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-gray-600">{teacher.subject}</p>
                    </div>
                  </div>
                  <Badge>{teacher.etutSayisi} etüt</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sistem Özeti */}
        <Card>
          <CardHeader>
            <CardTitle>Sistem Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Toplam Öğretmen:</span>
                <Badge variant="outline">{teachers.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Toplam Öğrenci:</span>
                <Badge variant="outline">{students.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Aktif Dersler:</span>
                <Badge variant="outline">{new Set(teachers.map(t => t.subject)).size}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Yasaklı Öğrenci:</span>
                <Badge variant="destructive">
                  {students.filter(s => s.isBanned).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Başarı Oranı:</span>
                <Badge variant="default">
                  {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
