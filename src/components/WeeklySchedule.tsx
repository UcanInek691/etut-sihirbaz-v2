import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, X, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { validateSessionAssignment, getWeekYear, isStudentBanned, banStudentFromAllSubjects, Session, Teacher, Student } from '@/utils/sessionValidation';
import { LocalStorageManager } from '@/utils/localStorage';
import { TimeSlotManager } from '@/utils/timeSlotManager';

interface WeeklyScheduleProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  teachers: Teacher[];
  students: Student[];
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  setTotalSessions: (count: number) => void;
  setStudents: (students: Student[]) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  selectedDate,
  onDateChange,
  teachers,
  students,
  sessions,
  setSessions,
  setTotalSessions,
  setStudents
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDate_, setSelectedDate_] = useState<Date>(new Date());
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [editingSessionId, setEditingSessionId] = useState<string>('');
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  // Hafta günleri
  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  
  // Hafta başlangıcı hesapla
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

  useEffect(() => {
    setTotalSessions(sessions.length);
    setTimeSlots(TimeSlotManager.getTimeSlotStrings());
  }, [sessions, setTotalSessions]);

  // Etüt atama - not desteği ile
  const handleAssignSession = async () => {
    if (!selectedTeacher || !selectedStudent || !selectedTimeSlot) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen öğretmen, öğrenci ve zaman dilimi seçin.",
        variant: "destructive"
      });
      return;
    }

    const teacher = teachers.find(t => t.id === selectedTeacher);
    if (!teacher) return;

    const validation = validateSessionAssignment(
      selectedTeacher,
      selectedStudent,
      teacher.subject,
      selectedTimeSlot,
      selectedDate_,
      teachers,
      students,
      sessions
    );

    if (!validation.valid) {
      toast({
        title: "Atama Başarısız",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }

    const newSession: Session = {
      id: Date.now().toString(),
      teacherId: selectedTeacher,
      studentId: selectedStudent,
      date: selectedDate_,
      timeSlot: selectedTimeSlot,
      subject: teacher.subject,
      weekYear: getWeekYear(selectedDate_),
      status: 'scheduled',
      createdAt: new Date(),
      notes: sessionNotes || ''
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    LocalStorageManager.autoSaveAll(updatedSessions, teachers, students);

    toast({
      title: "Etüt Planlandı",
      description: `${students.find(s => s.id === selectedStudent)?.name} - ${teacher.name} (${teacher.subject})`,
      variant: "default"
    });

    setIsAssignDialogOpen(false);
    setSelectedTeacher('');
    setSelectedStudent('');
    setSelectedTimeSlot('');
    setSessionNotes('');
  };

  // Not düzenleme
  const handleNotesEdit = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setEditingSessionId(sessionId);
      setSessionNotes(session.notes || '');
      setIsNotesDialogOpen(true);
    }
  };

  const saveNotes = () => {
    const updatedSessions = sessions.map(session => {
      if (session.id === editingSessionId) {
        return { ...session, notes: sessionNotes };
      }
      return session;
    });

    setSessions(updatedSessions);
    LocalStorageManager.autoSaveAll(updatedSessions, teachers, students);

    toast({
      title: "Not Kaydedildi",
      description: "Etüt notu başarıyla güncellendi.",
      variant: "default"
    });

    setIsNotesDialogOpen(false);
    setEditingSessionId('');
    setSessionNotes('');
  };

  // Öğrenci gelmedi işaretleme - BU KISIM DÜZELTİLDİ
  const markStudentAbsent = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const student = students.find(s => s.id === session.studentId);
    if (!student) return;

    // 1. Session'ı absent olarak işaretle
    const updatedSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'absent' as const };
      }
      return s;
    });

    // 2. Öğrenciyi ban'le
    const bannedStudent = banStudentFromAllSubjects(student);
    const updatedStudents = students.map(s => 
      s.id === student.id ? bannedStudent : s
    );

    // 3. State'leri güncelle
    setSessions(updatedSessions);
    setStudents(updatedStudents);

    // 4. OTOMATIK KAYDETME
    LocalStorageManager.autoSaveAll(updatedSessions, teachers, updatedStudents);

    toast({
      title: "Devamsızlık İşaretlendi",
      description: `${student.name} 2 hafta TÜM DERSLERDEN yasaklandı!`,
      variant: "destructive"
    });
  };

  // Etüt tamamlama
  const markSessionCompleted = (sessionId: string) => {
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        return { ...session, status: 'completed' as const };
      }
      return session;
    });

    setSessions(updatedSessions);
    LocalStorageManager.autoSaveAll(updatedSessions, teachers, students);

    toast({
      title: "Etüt Tamamlandı",
      description: "Etüt başarıyla tamamlandı olarak işaretlendi.",
      variant: "default"
    });
  };

  // Etüt silme
  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    LocalStorageManager.autoSaveAll(updatedSessions, teachers, students);

    toast({
      title: "Etüt Silindi",
      description: "Etüt başarıyla silindi.",
      variant: "destructive"
    });
  };

  // Belirli gün ve saat için sessionları getir (birden fazla olabilir)
  const getSessionsForSlot = (day: number, timeSlot: string): Session[] => {
    const targetDate = addDays(weekStart, day);
    return sessions.filter(session => 
      format(session.date, 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd') &&
      session.timeSlot === timeSlot
    );
  };

  // Session kartları render et - not düzenleme butonu ile
  const renderSessionCards = (slotSessions: Session[], day: number, timeSlot: string) => {
    if (slotSessions.length === 0) {
      return (
        <div 
          className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
          onClick={() => {
            setSelectedTimeSlot(timeSlot);
            setSelectedDate_(addDays(weekStart, day));
            setIsAssignDialogOpen(true);
          }}
        >
          <span className="text-gray-400 text-sm">+ Etüt Ekle</span>
        </div>
      );
    }

    const statusColors = {
      scheduled: 'bg-blue-100 border-blue-300 text-blue-800',
      completed: 'bg-green-100 border-green-300 text-green-800',
      absent: 'bg-red-100 border-red-300 text-red-800'
    };

    return (
      <div className="space-y-1 min-h-20">
        {slotSessions.map(session => {
          const teacher = teachers.find(t => t.id === session.teacherId);
          const student = students.find(s => s.id === session.studentId);
          
          return (
            <Card key={session.id} className={`${statusColors[session.status]} border relative group hover:shadow-md transition-shadow`}>
              <CardContent className="p-2">
                <div className="text-xs font-medium truncate">{teacher?.name}</div>
                <div className="text-xs truncate">{student?.name}</div>
                <div className="text-xs text-gray-600 truncate">{session.subject}</div>
                {session.notes && (
                  <div className="text-xs text-gray-500 truncate mt-1" title={session.notes}>
                    📝 {session.notes}
                  </div>
                )}
                
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-5 w-5 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotesEdit(session.id);
                    }}
                    title="Not Ekle/Düzenle"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  {session.status === 'scheduled' && (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        title="Etütü Sil"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markStudentAbsent(session.id);
                        }}
                        title="Etüte Gelmedi"
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-5 w-5 p-0 bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          markSessionCompleted(session.id);
                        }}
                        title="Etüt Tamamlandı"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        <div 
          className="h-8 border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onClick={() => {
            setSelectedTimeSlot(timeSlot);
            setSelectedDate_(addDays(weekStart, day));
            setIsAssignDialogOpen(true);
          }}
        >
          <span className="text-gray-500 text-xs">+ Ekle</span>
        </div>
      </div>
    );
  };

  // Yasaklı öğrencileri filtrele
  const availableStudents = students.filter(student => !isStudentBanned(student));
  const bannedStudents = students.filter(student => isStudentBanned(student));

  return (
    <div className="space-y-6">
      {/* Hafta Navigasyonu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Haftalık Program</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => onDateChange(addDays(selectedDate, -7))}
              >
                ← Önceki Hafta
              </Button>
              <span className="font-medium">
                {format(weekStart, 'dd MMM')} - {format(addDays(weekStart, 6), 'dd MMM yyyy')}
              </span>
              <Button
                variant="outline"
                onClick={() => onDateChange(addDays(selectedDate, 7))}
              >
                Sonraki Hafta →
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Yasaklı Öğrenciler Uyarısı */}
      {bannedStudents.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Yasaklı Öğrenciler ({bannedStudents.length})</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {bannedStudents.map(student => (
                <Badge key={student.id} variant="destructive">
                  {student.name} (Bitiş: {student.banEndDate?.toLocaleDateString('tr-TR')})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Program Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-8 gap-2">
            {/* Header */}
            <div className="font-medium text-center p-2">Saat</div>
            {weekDays.map((day, index) => (
              <div key={day} className="font-medium text-center p-2 bg-gray-50 rounded">
                <div>{day}</div>
                <div className="text-xs text-gray-600">
                  {format(addDays(weekStart, index), 'dd/MM')}
                </div>
              </div>
            ))}

            {/* Time Slots */}
            {timeSlots.map((timeSlot) => (
              <React.Fragment key={timeSlot}>
                <div className="font-medium text-center p-2 bg-gray-50 rounded text-sm">
                  {timeSlot}
                </div>
                {weekDays.map((_, dayIndex) => (
                  <div key={`${timeSlot}-${dayIndex}`} className="p-1">
                    {renderSessionCards(getSessionsForSlot(dayIndex, timeSlot), dayIndex, timeSlot)}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Etüt Atama Dialog - not ekleme ile */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Etüt Planla</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tarih & Saat</label>
              <p className="text-sm text-gray-600">
                {format(selectedDate_, 'dd MMMM yyyy')} - {selectedTimeSlot}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Öğretmen Seçin</label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Öğretmen seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Öğrenci Seçin</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Öğrenci seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Not (İsteğe Bağlı)</label>
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Bu etütle ilgili bir not ekleyebilirsiniz..."
                rows={3}
              />
            </div>

            {selectedTeacher && selectedStudent && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Atama Önizleme</span>
                </div>
                <p className="text-sm mt-1">
                  {students.find(s => s.id === selectedStudent)?.name} → {teachers.find(t => t.id === selectedTeacher)?.name} 
                  ({teachers.find(t => t.id === selectedTeacher)?.subject})
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAssignSession}>
                Etüt Planla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Not Düzenleme Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Etüt Notu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Not</label>
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Bu etütle ilgili notunuzu yazın..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={saveNotes}>
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
