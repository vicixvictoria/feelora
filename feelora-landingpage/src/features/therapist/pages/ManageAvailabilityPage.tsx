import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { addDays, addMinutes, format, getDay, parse, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { Ban, ChevronLeft, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { GET_OWN_THERAPIST_PROFILE_QUERY } from '../api/therapist-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MonthCalendar from '@/features/calendar/components/MonthCalendar';
import { mockCalendarService } from '@/features/calendar/api/mockCalendarService';
import { TimeSlot } from '@/features/calendar/types/appointment';
import { BlockedDate } from '@/features/calendar/types/blockedDate';

const DATE_FORMAT = 'yyyy-MM-dd';
const SESSION_LENGTH_OPTIONS = [15, 30, 45, 50, 60];
// Displayed Monday-first (matching the weekly calendar view) even though the
// underlying day numbers follow the schema's 0=Sunday..6=Saturday convention.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const SUNDAY_ANCHOR = startOfWeek(new Date(), { weekStartsOn: 0 });
const weekdayLabel = (day: number) => format(addDays(SUNDAY_ANCHOR, day), 'EEE', { locale: de });

const ManageAvailabilityPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: therapistData, loading: therapistLoading } = useQuery(
    GET_OWN_THERAPIST_PROFILE_QUERY,
  );
  const therapist = therapistData?.getOwnTherapistProfile;

  // Every weekday always has a working-hours entry — an empty array simply
  // means the therapist doesn't work that day, rather than the day being
  // absent from a separate list. The same template repeats every week (no
  // per-date exceptions yet). Working hours are only the outer
  // "HH:mm-HH:mm" timeframe a slot may fall within — the therapist places
  // each bookable slot (slotsByDay) individually, and gets a break simply
  // by leaving a gap before the next one.
  const [workingHoursByDay, setWorkingHoursByDay] = useState<Record<number, string[]>>({});
  const [slotsByDay, setSlotsByDay] = useState<Record<number, TimeSlot[]>>({});
  const [slotLengthMinutes, setSlotLengthMinutes] = useState(50);
  const [breakBetweenSessionsMinutes, setBreakBetweenSessionsMinutes] = useState(0);
  const [minimalNoticeHours, setMinimalNoticeHours] = useState(0);
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // One-off exceptions layered on top of the recurring template above —
  // not backed by a real endpoint yet (see mockCalendarService.ts), but
  // fully wired through the mock so the flow works end to end.
  const [blockDate, setBlockDate] = useState<Date>(() => addDays(new Date(), 1));
  const [blockedDateInfo, setBlockedDateInfo] = useState<BlockedDate>({
    date: '',
    fullDay: false,
    blockedStartTimes: [],
  });
  const [blockedDatesForCalendar, setBlockedDatesForCalendar] = useState<Date[]>([]);

  useEffect(() => {
    if (!therapist?.Id) return;
    setIsLoading(true);
    mockCalendarService
      .getTherapistSettings(therapist.Id)
      .then((settings) => {
        setWorkingHoursByDay(settings.workingHoursByDay);
        setSlotsByDay(settings.slotsByDay as Record<number, TimeSlot[]>);
        setSlotLengthMinutes(settings.slotLengthMinutes);
        setBreakBetweenSessionsMinutes(settings.breakBetweenSessionsMinutes);
        setMinimalNoticeHours(settings.minimalNoticeHours);
        setCancellationPolicy(settings.cancellationPolicy);
      })
      .finally(() => setIsLoading(false));
  }, [therapist?.Id]);

  const refreshBlockedDatesForCalendar = async (therapistId: string) => {
    const dates = await mockCalendarService.getAllBlockedDates(therapistId);
    setBlockedDatesForCalendar(dates.map((d) => parse(d, DATE_FORMAT, new Date())));
  };

  // Loads whichever date is currently selected in the small block-picker
  // calendar below, and (once, per therapist) the full list of blocked
  // dates so the calendar can show a dot on each of them.
  useEffect(() => {
    if (!therapist?.Id) return;
    const dateKey = format(blockDate, DATE_FORMAT);
    mockCalendarService.getBlockedDate(therapist.Id, dateKey).then(setBlockedDateInfo);
  }, [therapist?.Id, blockDate]);

  useEffect(() => {
    if (!therapist?.Id) return;
    refreshBlockedDatesForCalendar(therapist.Id);
  }, [therapist?.Id]);

  const handleToggleFullDayBlock = async () => {
    if (!therapist?.Id) return;
    const dateKey = format(blockDate, DATE_FORMAT);
    const nextValue = !blockedDateInfo.fullDay;
    await mockCalendarService.setFullDayBlocked(therapist.Id, dateKey, nextValue);
    setBlockedDateInfo((prev) => ({ ...prev, date: dateKey, fullDay: nextValue }));
    await refreshBlockedDatesForCalendar(therapist.Id);
    toast.success(
      nextValue
        ? t('app.therapist.calendar.manage.dayBlocked')
        : t('app.therapist.calendar.manage.dayUnblocked'),
    );
  };

  const handleToggleSlotBlock = async (startTime: string) => {
    if (!therapist?.Id) return;
    const dateKey = format(blockDate, DATE_FORMAT);
    const isCurrentlyBlocked = blockedDateInfo.blockedStartTimes.includes(startTime);
    await mockCalendarService.setSlotBlocked(therapist.Id, dateKey, startTime, !isCurrentlyBlocked);
    setBlockedDateInfo((prev) => ({
      ...prev,
      date: dateKey,
      blockedStartTimes: isCurrentlyBlocked
        ? prev.blockedStartTimes.filter((time) => time !== startTime)
        : [...prev.blockedStartTimes, startTime],
    }));
    await refreshBlockedDatesForCalendar(therapist.Id);
  };

  // A day counts as "worked" exactly when its hours array is non-empty —
  // there's no separate on/off list. Toggling on fills it with a default
  // range; toggling off clears it to [], keeping any slots around
  // (hidden, since the day is no longer shown) in case it's re-enabled.
  const isWorkingDay = (day: number) => (workingHoursByDay[day]?.length ?? 0) > 0;

  const toggleWorkingDay = (day: number) => {
    setWorkingHoursByDay((prev) => ({
      ...prev,
      [day]: prev[day]?.length ? [] : ['09:00-17:00'],
    }));
  };

  // Appends a new working-hours range starting right after the previous
  // one's end (or 09:00 if the day has none yet) — just a starting point,
  // both times are freely editable via the inputs below.
  const handleAddRange = (day: number) => {
    setWorkingHoursByDay((prev) => {
      const existing = prev[day] ?? [];
      const lastEnd = existing[existing.length - 1]?.split('-')[1] ?? '09:00';
      const end = format(addMinutes(parse(lastEnd, 'HH:mm', new Date()), slotLengthMinutes), 'HH:mm');
      return { ...prev, [day]: [...existing, `${lastEnd}-${end}`] };
    });
  };

  // Every working day must keep a non-empty working-hours boundary, so the
  // last remaining range for a day can't be removed.
  const handleRemoveRange = (day: number, index: number) => {
    setWorkingHoursByDay((prev) => {
      const existing = prev[day] ?? [];
      if (existing.length <= 1) return prev;
      return { ...prev, [day]: existing.filter((_, i) => i !== index) };
    });
  };

  // Working-hours ranges are stored as a single "HH:mm-HH:mm" string (to
  // match the backend's format), so editing either time input means
  // splitting it apart, replacing the edited half, and rejoining it.
  const handleRangeChange = (day: number, index: number, part: 'start' | 'end', value: string) => {
    setWorkingHoursByDay((prev) => {
      const existing = prev[day] ?? [];
      const [start, end] = existing[index].split('-');
      const updated = part === 'start' ? `${value}-${end}` : `${start}-${value}`;
      return { ...prev, [day]: existing.map((range, i) => (i === index ? updated : range)) };
    });
  };

  // Adds one bookable slot for the day, defaulting its start to
  // breakBetweenSessionsMinutes after the previous slot's end (or the
  // day's working-hours start if it's the first one) and its length to
  // slotLengthMinutes — both just defaults the therapist can edit freely.
  const handleAddSlot = (day: number) => {
    setSlotsByDay((prev) => {
      const existing = prev[day] ?? [];
      const lastEnd = existing[existing.length - 1]?.endTime;
      const dayStart = workingHoursByDay[day]?.[0]?.split('-')[0] ?? '09:00';
      const start = lastEnd
        ? format(addMinutes(parse(lastEnd, 'HH:mm', new Date()), breakBetweenSessionsMinutes), 'HH:mm')
        : dayStart;
      const end = format(addMinutes(parse(start, 'HH:mm', new Date()), slotLengthMinutes), 'HH:mm');
      return { ...prev, [day]: [...existing, { startTime: start, endTime: end }] };
    });
  };

  // Unlike working-hours ranges, a day is allowed to end up with zero
  // slots (e.g. mid-setup) — nothing forces at least one to remain.
  const handleRemoveSlot = (day: number, index: number) => {
    setSlotsByDay((prev) => ({ ...prev, [day]: (prev[day] ?? []).filter((_, i) => i !== index) }));
  };

  // Slots are stored as {startTime, endTime} objects rather than a joined
  // string, since they're the same TimeSlot shape used by the booking flow.
  const handleSlotChange = (day: number, index: number, field: 'startTime' | 'endTime', value: string) => {
    setSlotsByDay((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    }));
  };

  // Drives both the "select at least one working day" empty state below
  // and whether Save is allowed — a day only counts once its hours array
  // is non-empty (see isWorkingDay above).
  const hasAnyWorkingDay = Object.values(workingHoursByDay).some((hours) => hours.length > 0);

  const handleSave = async () => {
    if (!therapist?.Id || !hasAnyWorkingDay) return;
    setIsSaving(true);
    try {
      await mockCalendarService.saveTherapistSettings(therapist.Id, {
        workingHoursByDay,
        slotsByDay,
        slotLengthMinutes,
        breakBetweenSessionsMinutes,
        minimalNoticeHours,
        cancellationPolicy,
      });
      toast.success(t('app.therapist.calendar.manage.availabilitySaved'));
    } finally {
      setIsSaving(false);
    }
  };

  if (therapistLoading || !therapist) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate('/therapist/calendar')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('app.therapist.calendar.manage.backToCalendar')}
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('app.therapist.calendar.manage.title')}
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('app.therapist.calendar.manage.workingDays')}
            </label>
            <div className="flex flex-wrap gap-2">
              {DISPLAY_ORDER.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleWorkingDay(day)}
                  className={isWorkingDay(day) ? 'feelora-btn-primary text-sm' : 'feelora-btn-outline text-sm'}
                >
                  {weekdayLabel(day)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {t('app.therapist.calendar.manage.sessionLength')}
              </label>
              <Select value={String(slotLengthMinutes)} onValueChange={(v) => setSlotLengthMinutes(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_LENGTH_OPTIONS.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {t('app.therapist.calendar.manage.minutes', { count: minutes })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {t('app.therapist.calendar.manage.breakBetweenSessions')}
              </label>
              <Input
                type="number"
                min={0}
                step={5}
                value={breakBetweenSessionsMinutes}
                onChange={(e) => setBreakBetweenSessionsMinutes(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {t('app.therapist.calendar.manage.minimalNotice')}
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={minimalNoticeHours}
                onChange={(e) => setMinimalNoticeHours(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('app.therapist.calendar.manage.workingHours')}
            </label>
            {!hasAnyWorkingDay ? (
              <p className="text-sm text-muted-foreground">
                {t('app.therapist.calendar.manage.selectWorkingDay')}
              </p>
            ) : (
              <div className="space-y-4">
                {DISPLAY_ORDER.filter(isWorkingDay).map((day) => (
                  <div key={day} className="feelora-card">
                    <p className="font-semibold text-foreground mb-3">{weekdayLabel(day)}</p>

                    {/* Working hours: the outer timeframe slots may be scheduled within. */}
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {t('app.therapist.calendar.manage.workingHoursHint')}
                    </p>
                    <div className="space-y-2 mb-3">
                      {(workingHoursByDay[day] ?? []).map((range, index) => {
                        const [start, end] = range.split('-');
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 border border-border rounded-xl px-3 py-2"
                          >
                            <Input
                              type="time"
                              value={start}
                              onChange={(e) => handleRangeChange(day, index, 'start', e.target.value)}
                              className="border-0 p-0 h-auto focus-visible:ring-0"
                            />
                            <span className="text-muted-foreground">—</span>
                            <Input
                              type="time"
                              value={end}
                              onChange={(e) => handleRangeChange(day, index, 'end', e.target.value)}
                              className="border-0 p-0 h-auto focus-visible:ring-0"
                            />
                            <button
                              onClick={() => handleRemoveRange(day, index)}
                              disabled={(workingHoursByDay[day]?.length ?? 0) <= 1}
                              className="ml-auto text-destructive hover:bg-destructive/10 rounded-full p-1.5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handleAddRange(day)}
                      className="w-full border border-dashed border-primary/40 text-primary rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      {t('app.therapist.calendar.manage.addWorkingHoursRange')}
                    </button>

                    <div className="border-t border-border my-4" />

                    {/* Slots: the actual bookable blocks, placed one at a time. */}
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {t('app.therapist.calendar.manage.slotsHint')}
                    </p>
                    <div className="space-y-2 mb-3">
                      {(slotsByDay[day] ?? []).map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-xl px-3 py-2"
                        >
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleSlotChange(day, index, 'startTime', e.target.value)}
                            className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
                          />
                          <span className="text-muted-foreground">—</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleSlotChange(day, index, 'endTime', e.target.value)}
                            className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
                          />
                          <button
                            onClick={() => handleRemoveSlot(day, index)}
                            className="ml-auto text-destructive hover:bg-destructive/10 rounded-full p-1.5 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(slotsByDay[day] ?? []).length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          {t('app.therapist.calendar.manage.noSlotsYet')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddSlot(day)}
                      className="w-full feelora-btn-primary justify-center"
                    >
                      <Plus className="w-4 h-4" />
                      {t('app.therapist.calendar.manage.addTimeSlot')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('app.therapist.calendar.manage.blockTitle')}
            </label>
            <p className="text-sm text-muted-foreground mb-4">
              {t('app.therapist.calendar.manage.blockHint')}
            </p>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="md:flex-1 max-w-sm">
                <MonthCalendar
                  selected={blockDate}
                  onSelect={(date) => date && setBlockDate(date)}
                  blockedDates={blockedDatesForCalendar}
                  disablePastDates
                />
              </div>

              <div className="md:flex-1">
                <p className="font-medium text-foreground mb-3">
                  {format(blockDate, 'EEEE, d. MMMM', { locale: de })}
                </p>

                <button
                  onClick={handleToggleFullDayBlock}
                  className={
                    blockedDateInfo.fullDay
                      ? 'feelora-btn-primary w-full justify-center mb-4'
                      : 'w-full inline-flex items-center justify-center gap-2 rounded-full border border-destructive/40 text-destructive px-4 py-2 font-medium hover:bg-destructive/10 transition-colors mb-4'
                  }
                >
                  <Ban className="w-4 h-4" />
                  {blockedDateInfo.fullDay
                    ? t('app.therapist.calendar.manage.unblockDay')
                    : t('app.therapist.calendar.manage.blockDay')}
                </button>

                {blockedDateInfo.fullDay ? (
                  <p className="text-sm text-muted-foreground text-center">
                    {t('app.therapist.calendar.manage.dayFullyBlocked')}
                  </p>
                ) : (slotsByDay[getDay(blockDate)] ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('app.therapist.calendar.manage.noSlotsThisDay')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {[...(slotsByDay[getDay(blockDate)] ?? [])]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => {
                        const isBlocked = blockedDateInfo.blockedStartTimes.includes(slot.startTime);
                        return (
                          <div
                            key={slot.startTime}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                              isBlocked ? 'border-destructive/30 bg-destructive/5' : 'border-border'
                            }`}
                          >
                            <span
                              className={
                                isBlocked
                                  ? 'text-sm text-muted-foreground line-through'
                                  : 'text-sm text-foreground'
                              }
                            >
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <button
                              onClick={() => handleToggleSlotBlock(slot.startTime)}
                              className={
                                isBlocked
                                  ? 'text-xs font-medium text-primary hover:underline'
                                  : 'text-xs font-medium text-destructive hover:underline'
                              }
                            >
                              {isBlocked
                                ? t('app.therapist.calendar.manage.unblockSlot')
                                : t('app.therapist.calendar.manage.blockSlot')}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('app.therapist.calendar.manage.cancellationPolicy')}
            </label>
            <Textarea
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              placeholder={t('app.therapist.calendar.manage.cancellationPolicyPlaceholder')}
              rows={4}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasAnyWorkingDay}
            className="feelora-btn-primary w-full justify-center disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('app.therapist.calendar.manage.saveAvailability')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageAvailabilityPage;
