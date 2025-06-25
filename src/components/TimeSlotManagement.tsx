
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { TimeSlotManager, TimeSlot } from '@/utils/timeSlotManager';

export const TimeSlotManagement: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  useEffect(() => {
    setTimeSlots(TimeSlotManager.getTimeSlots());
  }, []);

  const handleAddTimeSlot = () => {
    if (!newStartTime || !newEndTime) {
      toast({
        title: "Eksik Bilgi",
        description: "Başlangıç ve bitiş saatini girin.",
        variant: "destructive"
      });
      return;
    }

    if (newStartTime >= newEndTime) {
      toast({
        title: "Geçersiz Saat",
        description: "Başlangıç saati bitiş saatinden önce olmalı.",
        variant: "destructive"
      });
      return;
    }

    TimeSlotManager.addTimeSlot(newStartTime, newEndTime);
    TimeSlotManager.refreshTeacherAvailability(); // Öğretmen müsaitliklerini güncelle
    setTimeSlots(TimeSlotManager.getTimeSlots());
    setNewStartTime('');
    setNewEndTime('');
    setIsAddDialogOpen(false);

    toast({
      title: "Saat Dilimi Eklendi",
      description: `${newStartTime}-${newEndTime} saat dilimi eklendi ve öğretmen müsaitlikleri güncellendi.`,
    });
  };

  const handleToggleSlot = (id: string, isActive: boolean) => {
    TimeSlotManager.updateTimeSlot(id, { isActive });
    setTimeSlots(TimeSlotManager.getTimeSlots());

    toast({
      title: isActive ? "Saat Dilimi Aktifleştirildi" : "Saat Dilimi Devre Dışı",
      description: isActive ? "Saat dilimi kullanıma açıldı." : "Saat dilimi devre dışı bırakıldı.",
    });
  };

  const handleDeleteSlot = (id: string) => {
    TimeSlotManager.deleteTimeSlot(id);
    setTimeSlots(TimeSlotManager.getTimeSlots());

    toast({
      title: "Saat Dilimi Silindi",
      description: "Saat dilimi başarıyla silindi.",
      variant: "destructive"
    });
  };

  const handleUpdateSlot = (id: string, startTime: string, endTime: string) => {
    if (startTime >= endTime) {
      toast({
        title: "Geçersiz Saat",
        description: "Başlangıç saati bitiş saatinden önce olmalı.",
        variant: "destructive"
      });
      return;
    }

    TimeSlotManager.updateTimeSlot(id, { startTime, endTime });
    setTimeSlots(TimeSlotManager.getTimeSlots());
    setEditingSlot(null);

    toast({
      title: "Saat Dilimi Güncellendi",
      description: "Saat dilimi başarıyla güncellendi.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Saat Dilimi Yönetimi</span>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Saat Dilimi Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Saat Dilimi Ekle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Başlangıç Saati</label>
                  <Input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bitiş Saati</label>
                  <Input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddTimeSlot}>
                    Ekle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {timeSlots.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
              {editingSlot === slot.id ? (
                <EditTimeSlotForm
                  slot={slot}
                  onSave={(startTime, endTime) => handleUpdateSlot(slot.id, startTime, endTime)}
                  onCancel={() => setEditingSlot(null)}
                />
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={slot.isActive}
                      onCheckedChange={(checked) => handleToggleSlot(slot.id, checked)}
                    />
                    <span className={`font-medium ${slot.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSlot(slot.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface EditTimeSlotFormProps {
  slot: TimeSlot;
  onSave: (startTime: string, endTime: string) => void;
  onCancel: () => void;
}

const EditTimeSlotForm: React.FC<EditTimeSlotFormProps> = ({ slot, onSave, onCancel }) => {
  const [startTime, setStartTime] = useState(slot.startTime);
  const [endTime, setEndTime] = useState(slot.endTime);

  return (
    <div className="flex items-center space-x-2 flex-1">
      <Input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="w-24"
      />
      <span>-</span>
      <Input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="w-24"
      />
      <Button
        size="sm"
        onClick={() => onSave(startTime, endTime)}
      >
        <Check className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onCancel}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
