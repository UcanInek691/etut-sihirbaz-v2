
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Teacher } from '@/utils/sessionValidation';

interface TeacherManagementProps {
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  setTeachers
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    availableHours: [] as string[]
  });

  const subjects = [
    'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 
    'Coğrafya', 'İngilizce', 'Almanca', 'Felsefe', 'Edebiyat'
  ];

  const timeSlots = [
    '08:00-08:40', '08:50-09:30', '09:40-10:20', '10:30-11:10',
    '11:20-12:00', '12:10-12:50', '13:00-13:40', '13:50-14:30',
    '14:40-15:20', '15:30-16:10', '16:20-17:00', '17:10-17:50'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      email: '',
      availableHours: []
    });
    setEditingTeacher(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.subject || !formData.email) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    if (editingTeacher) {
      // Güncelleme
      const updatedTeachers = teachers.map(teacher =>
        teacher.id === editingTeacher.id
          ? { ...teacher, ...formData }
          : teacher
      );
      setTeachers(updatedTeachers);
      toast({
        title: "Öğretmen Güncellendi",
        description: `${formData.name} bilgileri güncellendi.`
      });
    } else {
      // Yeni ekleme
      const newTeacher: Teacher = {
        id: Date.now().toString(),
        name: formData.name,
        subject: formData.subject,
        email: formData.email,
        availableHours: formData.availableHours,
        totalSessions: 0
      };
      setTeachers([...teachers, newTeacher]);
      toast({
        title: "Öğretmen Eklendi",
        description: `${formData.name} sisteme eklendi.`
      });
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (teacher: Teacher) => {
    setFormData({
      name: teacher.name,
      subject: teacher.subject,
      email: teacher.email,
      availableHours: teacher.availableHours
    });
    setEditingTeacher(teacher);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setTeachers(teachers.filter(t => t.id !== teacherId));
      toast({
        title: "Öğretmen Silindi",
        description: `${teacher.name} sistemden kaldırıldı.`,
        variant: "destructive"
      });
    }
  };

  const toggleAvailableHour = (timeSlot: string) => {
    setFormData(prev => ({
      ...prev,
      availableHours: prev.availableHours.includes(timeSlot)
        ? prev.availableHours.filter(slot => slot !== timeSlot)
        : [...prev.availableHours, timeSlot]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Öğretmen Yönetimi</span>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Yeni Öğretmen</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTeacher ? 'Öğretmen Düzenle' : 'Yeni Öğretmen Ekle'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Ad Soyad *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Öğretmen adı soyadı"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Ders *</Label>
                      <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ders seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">E-posta *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="ornek@okul.com"
                    />
                  </div>

                  <div>
                    <Label>Müsait Saatler</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
                      {timeSlots.map(timeSlot => (
                        <div
                          key={timeSlot}
                          className={`p-2 border rounded cursor-pointer text-center text-sm transition-colors ${
                            formData.availableHours.includes(timeSlot)
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => toggleAvailableHour(timeSlot)}
                        >
                          {timeSlot}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Tıklayarak müsait saatleri seçin ({formData.availableHours.length} saat seçildi)
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingTeacher ? 'Güncelle' : 'Kaydet'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Toplam Öğretmen</p>
                <p className="text-2xl font-bold">{teachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Toplam Etüt</p>
                <p className="text-2xl font-bold">
                  {teachers.reduce((sum, teacher) => sum + teacher.totalSessions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Aktif Ders</p>
                <p className="text-2xl font-bold">
                  {new Set(teachers.map(t => t.subject)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Öğretmen Listesi */}
      <div className="grid gap-4">
        {teachers.map(teacher => (
          <Card key={teacher.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{teacher.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Badge variant="secondary">{teacher.subject}</Badge>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{teacher.email}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{teacher.availableHours.length} müsait saat</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{teacher.totalSessions} etüt</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(teacher)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(teacher.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {teacher.availableHours.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Müsait Saatler:</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.availableHours.slice(0, 8).map(hour => (
                      <Badge key={hour} variant="outline" className="text-xs">
                        {hour}
                      </Badge>
                    ))}
                    {teacher.availableHours.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{teacher.availableHours.length - 8} daha
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {teachers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz öğretmen eklenmemiş</h3>
              <p className="text-gray-600 mb-4">İlk öğretmeninizi ekleyerek başlayın.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Öğretmen Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
