
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Student, Session } from '@/utils/sessionValidation';
import { format } from 'date-fns';

interface StudentManagementProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  sessions: Session[];
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  setStudents,
  sessions
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    studentNumber: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      class: '',
      studentNumber: ''
    });
    setEditingStudent(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.class || !formData.studentNumber) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    // Öğrenci numarası kontrolü
    const existingStudent = students.find(s => 
      s.studentNumber === formData.studentNumber && 
      (!editingStudent || s.id !== editingStudent.id)
    );
    
    if (existingStudent) {
      toast({
        title: "Hata",
        description: "Bu öğrenci numarası zaten kullanılıyor.",
        variant: "destructive"
      });
      return;
    }

    if (editingStudent) {
      // Güncelleme
      const updatedStudents = students.map(student =>
        student.id === editingStudent.id
          ? { ...student, ...formData }
          : student
      );
      setStudents(updatedStudents);
      toast({
        title: "Öğrenci Güncellendi",
        description: `${formData.name} bilgileri güncellendi.`
      });
    } else {
      // Yeni ekleme
      const newStudent: Student = {
        id: Date.now().toString(),
        name: formData.name,
        class: formData.class,
        studentNumber: formData.studentNumber,
        totalSessions: 0
      };
      setStudents([...students, newStudent]);
      toast({
        title: "Öğrenci Eklendi",
        description: `${formData.name} sisteme eklendi.`
      });
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (student: Student) => {
    setFormData({
      name: student.name,
      class: student.class,
      studentNumber: student.studentNumber
    });
    setEditingStudent(student);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudents(students.filter(s => s.id !== studentId));
      toast({
        title: "Öğrenci Silindi",
        description: `${student.name} sistemden kaldırıldı.`,
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailDialogOpen(true);
  };

  // Arama filtreleme
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.includes(searchTerm)
  );

  // Öğrenci istatistikleri
  const getStudentSessions = (studentId: string) => {
    return sessions.filter(session => session.studentId === studentId);
  };

  const getStudentStats = (studentId: string) => {
    const studentSessions = getStudentSessions(studentId);
    return {
      total: studentSessions.length,
      completed: studentSessions.filter(s => s.status === 'completed').length,
      absent: studentSessions.filter(s => s.status === 'absent').length,
      scheduled: studentSessions.filter(s => s.status === 'scheduled').length
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Öğrenci Yönetimi</span>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Yeni Öğrenci</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ad Soyad *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Öğrenci adı soyadı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="class">Sınıf *</Label>
                    <Input
                      id="class"
                      value={formData.class}
                      onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                      placeholder="9-A, 10-B vb."
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentNumber">Öğrenci No *</Label>
                    <Input
                      id="studentNumber"
                      value={formData.studentNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentNumber: e.target.value }))}
                      placeholder="001, 1001 vb."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingStudent ? 'Güncelle' : 'Kaydet'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Arama */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Öğrenci adı, sınıf veya numara ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Toplam Öğrenci</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Toplam Etüt</p>
                <p className="text-2xl font-bold">
                  {students.reduce((sum, student) => sum + getStudentStats(student.id).total, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold">
                  {students.reduce((sum, student) => sum + getStudentStats(student.id).completed, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Devamsızlık</p>
                <p className="text-2xl font-bold">
                  {students.reduce((sum, student) => sum + getStudentStats(student.id).absent, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Öğrenci Listesi */}
      <div className="grid gap-4">
        {filteredStudents.map(student => {
          const stats = getStudentStats(student.id);
          
          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                      <span className="font-semibold text-lg text-blue-600">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Sınıf: {student.class}</span>
                        <span>No: {student.studentNumber}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Toplam: {stats.total}</span>
                        <span className="text-green-600">Tamamlanan: {stats.completed}</span>
                        <span className="text-red-600">Devamsızlık: {stats.absent}</span>
                        <span className="text-blue-600">Planlanmış: {stats.scheduled}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(student)}
                    >
                      Detay
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(student)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredStudents.length === 0 && students.length > 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Arama sonucu bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
            </CardContent>
          </Card>
        )}

        {students.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz öğrenci eklenmemiş</h3>
              <p className="text-gray-600 mb-4">İlk öğrencinizi ekleyerek başlayın.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Öğrenci Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Öğrenci Detay Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.name} - Etüt Geçmişi
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Öğrenci Bilgileri</h4>
                  <p className="text-sm">Sınıf: {selectedStudent.class}</p>
                  <p className="text-sm">No: {selectedStudent.studentNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium">İstatistikler</h4>
                  {(() => {
                    const stats = getStudentStats(selectedStudent.id);
                    return (
                      <div className="text-sm space-y-1">
                        <p>Toplam Etüt: {stats.total}</p>
                        <p className="text-green-600">Tamamlanan: {stats.completed}</p>
                        <p className="text-red-600">Devamsızlık: {stats.absent}</p>
                        <p className="text-blue-600">Planlanmış: {stats.scheduled}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Etüt Geçmişi</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {getStudentSessions(selectedStudent.id).map(session => (
                    <div key={session.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{session.subject}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {format(session.date, 'dd.MM.yyyy')} {session.timeSlot}
                        </span>
                      </div>
                      <Badge variant={
                        session.status === 'completed' ? 'default' :
                        session.status === 'absent' ? 'destructive' : 'secondary'
                      }>
                        {session.status === 'completed' ? 'Tamamlandı' :
                         session.status === 'absent' ? 'Gelmedi' : 'Planlandı'}
                      </Badge>
                    </div>
                  ))}
                  {getStudentSessions(selectedStudent.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Henüz etüt geçmişi yok</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
