// Small pill showing whether an appointment is online/in-person/phone,
// reused on the patient calendar, therapist calendar, and booking flow.
import { MapPin, Phone, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppointmentType } from '../types/appointment';

const iconByType: Record<AppointmentType, typeof Video> = {
  online: Video,
  in_person: MapPin,
  phone: Phone,
};

const labelKeyByType: Record<AppointmentType, string> = {
  online: 'calendar.type.online',
  in_person: 'calendar.type.inPerson',
  phone: 'calendar.type.phone',
};

const AppointmentTypeBadge = ({ type }: { type: AppointmentType }) => {
  const { t } = useTranslation();
  const Icon = iconByType[type];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
      <Icon className="w-3.5 h-3.5" />
      {t(labelKeyByType[type])}
    </span>
  );
};

export default AppointmentTypeBadge;
