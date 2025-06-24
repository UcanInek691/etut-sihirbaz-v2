
import React from 'react';
import { Download, Upload, Database, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LocalStorageManager } from '@/utils/localStorage';
import { TimeSlotManager } from '@/utils/timeSlotManager';

export const DataManager: React.FC = () => {
  const exportData = () => {
    try {
      const data = {
        sessions: LocalStorageManager.loadSessions(),
        teachers: LocalStorageManager.loadTeachers(),
        students: LocalStorageManager.loadStudents(),
        timeSlots: TimeSlotManager.getTimeSlots(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `etut_yedek_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Veriler Dışa Aktarıldı",
        description: "Tüm veriler başarıyla JSON dosyasına kaydedildi.",
      });
    } catch (error) {
      toast({
        title: "Dışa Aktarma Hatası",
        description: "Veriler dışa aktarılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Veri doğrulama
        if (!data.sessions || !data.teachers || !data.students) {
          throw new Error('Geçersiz dosya formatı');
        }

        // Verileri içe aktar
        LocalStorageManager.saveSessions(data.sessions);
        LocalStorageManager.saveTeachers(data.teachers);
        LocalStorageManager.saveStudents(data.students);
        
        if (data.timeSlots) {
          TimeSlotManager.saveTimeSlots(data.timeSlots);
        }

        toast({
          title: "Veriler İçe Aktarıldı",
          description: "Tüm veriler başarıyla yüklendi. Sayfa yenileniyor...",
        });

        // Sayfayı yenile
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        toast({
          title: "İçe Aktarma Hatası",
          description: "Dosya okunamadı veya geçersiz format.",
          variant: "destructive"
        });
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Input'u temizle
  };

  const clearAllData = () => {
    if (window.confirm('Tüm veriler silinecek! Bu işlem geri alınamaz. Emin misiniz?')) {
      localStorage.clear();
      toast({
        title: "Tüm Veriler Silindi",
        description: "Sayfa yenileniyor...",
        variant: "destructive"
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const getDataStats = () => {
    const sessions = LocalStorageManager.loadSessions();
    const teachers = LocalStorageManager.loadTeachers();
    const students = LocalStorageManager.loadStudents();
    
    return {
      sessions: sessions.length,
      teachers: teachers.length,
      students: students.length,
      timeSlots: TimeSlotManager.getActiveTimeSlots().length
    };
  };

  const stats = getDataStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Veri Yönetimi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.sessions}</div>
            <div className="text-sm text-blue-800">Etüt</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.teachers}</div>
            <div className="text-sm text-green-800">Öğretmen</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.students}</div>
            <div className="text-sm text-purple-800">Öğrenci</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.timeSlots}</div>
            <div className="text-sm text-orange-800">Saat Dilimi</div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportData} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Verileri Dışa Aktar
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <label>
                <Upload className="h-4 w-4 mr-2" />
                Verileri İçe Aktar
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
          
          <Button 
            variant="destructive" 
            onClick={clearAllData}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Tüm Verileri Sil
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Not:</strong> Dışa aktarılan dosya tüm etütler, öğretmenler, öğrenciler ve saat dilimlerini içerir. 
          Bu dosyayı güvenli bir yerde saklayın ve gerektiğinde sisteme geri yükleyebilirsiniz.
        </div>
      </CardContent>
    </Card>
  );
};
