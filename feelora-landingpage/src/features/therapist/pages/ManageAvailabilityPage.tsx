import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// import { useQuery } from '@apollo/client';
import { useMockQuery } from '@/mocks/use-mock-query'; // PORTFOLIO DEMO MODE: backend is offline
import { addDays, addMinutes, format, getDay, parse, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertTriangle, Ban, ChevronDown, ChevronLeft, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { GET_OWN_THERAPIST_PROFILE_QUERY } from '../api/therapist-service';
import { scheduleService } from '../api/schedule-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MonthCalendar from '@/features/calendar/components/MonthCalendar';
import { TimeSlot } from '@/features/calendar/types/session';
import { DateOverride } from '@/features/calendar/types/schedule';

const DATE_FORMAT = 'yyyy-MM-dd';
const SESSION_LENGTH_OPTIONS = [15, 30, 45, 50, 60];
const BREAK_OPTIONS = [0, 5, 10, 15, 20, 30];
const DEFAULT_BREAK_MINUTES = 10;
// Displayed Monday-first (matching the weekly calendar view) even though the
// underlying day numbers follow the schema's 0=Sunday..6=Saturday convention.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const SUNDAY_ANCHOR = startOfWeek(new Date(), { weekStartsOn: 0 });
const weekdayLabel = (day: number) => format(addDays(SUNDAY_ANCHOR, day), 'EEE', { locale: de });
const EMPTY_SCHEDULE: Record<number, TimeSlot[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
const DEFAULT_BREAK_BY_DAY: Record<number, number> = {
  0: DEFAULT_BREAK_MINUTES,
  1: DEFAULT_BREAK_MINUTES,
  2: DEFAULT_BREAK_MINUTES,
  3: DEFAULT_BREAK_MINUTES,
  4: DEFAULT_BREAK_MINUTES,
  5: DEFAULT_BREAK_MINUTES,
  6: DEFAULT_BREAK_MINUTES,
};

// Slots can start whenever the therapist wants (no forced break) — the
// only hard rule is that two slots on the same day can't overlap. "HH:mm"
// strings compare correctly with plain string operators, so no parsing is
// needed here. Back-to-back slots (one ending exactly when the next
// starts) are NOT considered overlapping.
const doSlotsOverlap = (a: TimeSlot, b: TimeSlot): boolean =>
  a.startTime < b.endTime && b.startTime < a.endTime;

const getOverlappingIndices = (slots: TimeSlot[]): Set<number> => {
  const overlapping = new Set<number>();
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (doSlotsOverlap(slots[i], slots[j])) {
        overlapping.add(i);
        overlapping.add(j);
      }
    }
  }
  return overlapping;
};

const ManageAvailabilityPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // PORTFOLIO DEMO MODE: original API call kept for reference
  // const { data: therapistData, loading: therapistLoading } = useQuery(
  //   GET_OWN_THERAPIST_PROFILE_QUERY,
  // );
  const { data: therapistData, loading: therapistLoading } = useMockQuery(
    GET_OWN_THERAPIST_PROFILE_QUERY,
  );
  const therapist = therapistData?.getOwnTherapistProfile;

  // The recurring schedule, wired to the real backend (Settings type,
  // schema.graphql) — every weekday is simply the list of bookable slots
  // the therapist has placed. There's no separate working-hours boundary
  // anymore: a slot's Start/End IS the schedule.
  const [slotsByDay, setSlotsByDay] = useState<Record<number, TimeSlot[]>>(EMPTY_SCHEDULE);
  // The backend has no SlotRange field — this is purely a local UI default
  // for the "Add Slot" button's duration below, never saved. There's no
  // break constraint on the backend either: slots can start whenever the
  // therapist wants, the only hard rule is not overlapping another slot
  // (see getOverlappingIndices).
  const [slotLengthMinutes, setSlotLengthMinutes] = useState(50);
  // Purely a local scheduling convenience, per weekday — it only changes
  // where "Add Time Slot" places the START of the NEXT slot (latest end +
  // this gap, instead of right at the latest end). It's never sent to the
  // backend: a slot's Start/End on the schema IS the schedule, there's no
  // BreakBetweenSessions field to save it into, and it has no effect on
  // slots that already exist (editing existing times is still free-form).
  const [breakMinutesByDay, setBreakMinutesByDay] = useState<Record<number, number>>(DEFAULT_BREAK_BY_DAY);
  // Two distinct notice periods on the backend: bookingNoticeHours (how soon
  // before its start a slot may still be booked) and cancellationNoticeHours
  // (the notice period the cancellation policy text itself refers to).
  const [bookingNoticeHours, setBookingNoticeHours] = useState(0);
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState(0);
  const [cancellationPolicyText, setCancellationPolicyText] = useState('');
  // The backend has separate createSettings/updateSettings mutations (no
  // upsert) — this tracks which one Save should call.
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Purely a local UI toggle for the "how to use this page" explainer below.
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // One-off exceptions layered on top of the recurring schedule above, via
  // the backend's OverrideSettings (see schedule-service.ts). There's no
  // query to list every overridden date, only a single-date lookup, so the
  // small calendar below can't show a dot for "which dates are blocked"
  // the way the appointment calendars do.
  const [blockDate, setBlockDate] = useState<Date>(() => addDays(new Date(), 1));
  const [dateOverride, setDateOverride] = useState<DateOverride | null>(null);
  const [isLoadingOverride, setIsLoadingOverride] = useState(false);
  // Guards against double-clicking a block button while its real network
  // call is still in flight (the mock never needed this — it never failed
  // or took long enough to double-submit).
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  useEffect(() => {
    if (!therapist?.Id) return;
    setIsLoading(true);
    scheduleService
      .getSchedule()
      .then((schedule) => {
        if (!schedule) {
          setHasExistingSchedule(false);
          return;
        }
        setHasExistingSchedule(true);
        setSlotsByDay(schedule.slotsByDay);
        setBookingNoticeHours(schedule.bookingNoticeHours);
        setCancellationNoticeHours(schedule.cancellationPolicy.minimalNoticeHours);
        setCancellationPolicyText(schedule.cancellationPolicy.cancellationPolicy);
      })
      .catch((error) => {
        console.error('Failed to load schedule:', error);
        toast.error(t('app.therapist.calendar.manage.loadError'));
      })
      .finally(() => setIsLoading(false));
  }, [therapist?.Id, t]);

  useEffect(() => {
    if (!therapist?.Id) return;
    setIsLoadingOverride(true);
    scheduleService
      .getOverride(format(blockDate, DATE_FORMAT))
      .then(setDateOverride)
      .catch((error) => {
        console.error('Failed to load override:', error);
        toast.error(t('app.therapist.calendar.manage.loadError'));
        // A failed fetch must never leave the PREVIOUS date's override
        // sitting in state — without this, navigating from a date that had
        // an override to one that errors out (e.g. the backend's
        // getOverrideSettings crash on a "no override yet" date, see the
        // filed bug) makes every slot on the new date look blocked, because
        // it gets diffed against the old date's leftover override times
        // instead of falling back to that date's own recurring slots.
        setDateOverride(null);
      })
      .finally(() => setIsLoadingOverride(false));
  }, [therapist?.Id, blockDate, t]);

  const blockDateWeekday = getDay(blockDate);
  const recurringSlotsForBlockDate = slotsByDay[blockDateWeekday] ?? [];
  // Once an override exists for this date it fully replaces the recurring
  // day's slots — [] means every slot on this date is blocked.
  const isFullyBlocked = dateOverride !== null && dateOverride.availabilities.length === 0;

  const handleToggleFullDayBlock = async () => {
    if (!therapist?.Id || isSavingOverride) return;
    const dateKey = format(blockDate, DATE_FORMAT);
    // There's no "delete override" mutation, so unblocking means saving an
    // override that matches the recurring schedule again.
    const nextAvailabilities = isFullyBlocked ? recurringSlotsForBlockDate : [];
    setIsSavingOverride(true);
    try {
      const saved = await scheduleService.saveOverride(dateKey, nextAvailabilities);
      setDateOverride(saved);
      toast.success(
        isFullyBlocked
          ? t('app.therapist.calendar.manage.dayUnblocked')
          : t('app.therapist.calendar.manage.dayBlocked'),
      );
    } catch (error) {
      console.error('Failed to save override:', error);
      toast.error(t('app.therapist.calendar.manage.actionError'));
    } finally {
      setIsSavingOverride(false);
    }
  };

  const handleToggleSlotBlock = async (slot: TimeSlot) => {
    if (!therapist?.Id || isSavingOverride) return;
    const dateKey = format(blockDate, DATE_FORMAT);
    const effectiveSlots = dateOverride?.availabilities ?? recurringSlotsForBlockDate;
    const isCurrentlyBlocked = !effectiveSlots.some((s) => s.startTime === slot.startTime);
    const nextAvailabilities = isCurrentlyBlocked
      ? [...effectiveSlots, slot].sort((a, b) => a.startTime.localeCompare(b.startTime))
      : effectiveSlots.filter((s) => s.startTime !== slot.startTime);
    setIsSavingOverride(true);
    try {
      const saved = await scheduleService.saveOverride(dateKey, nextAvailabilities);
      setDateOverride(saved);
    } catch (error) {
      console.error('Failed to save override:', error);
      toast.error(t('app.therapist.calendar.manage.actionError'));
    } finally {
      setIsSavingOverride(false);
    }
  };

  // A day counts as "worked" exactly when it has at least one slot.
  const isWorkingDay = (day: number) => (slotsByDay[day]?.length ?? 0) > 0;

  // Toggling on adds one starting slot (so the day isn't left ambiguous);
  // toggling off clears every slot for that day.
  const toggleWorkingDay = (day: number) => {
    setSlotsByDay((prev) => {
      if (prev[day]?.length) return { ...prev, [day]: [] };
      const start = '09:00';
      const end = format(addMinutes(parse(start, 'HH:mm', new Date()), slotLengthMinutes), 'HH:mm');
      return { ...prev, [day]: [{ startTime: start, endTime: end }] };
    });
  };

  // Adds one bookable slot for the day, defaulting its start to the latest
  // existing slot's end plus that day's break (or 09:00 if it's the first
  // one) and its length to slotLengthMinutes — this default can never
  // overlap an existing slot; the therapist is free to drag it later (or
  // anywhere else) from there. The break is purely where this default gets
  // placed — it isn't a gap enforced afterwards.
  const handleAddSlot = (day: number) => {
    setSlotsByDay((prev) => {
      const existing = prev[day] ?? [];
      const latestEnd = existing.reduce((latest, s) => (s.endTime > latest ? s.endTime : latest), '00:00');
      const breakMinutes = breakMinutesByDay[day] ?? 0;
      const start =
        existing.length > 0
          ? format(addMinutes(parse(latestEnd, 'HH:mm', new Date()), breakMinutes), 'HH:mm')
          : '09:00';
      const end = format(addMinutes(parse(start, 'HH:mm', new Date()), slotLengthMinutes), 'HH:mm');
      return { ...prev, [day]: [...existing, { startTime: start, endTime: end }] };
    });
  };

  const handleRemoveSlot = (day: number, index: number) => {
    setSlotsByDay((prev) => ({ ...prev, [day]: (prev[day] ?? []).filter((_, i) => i !== index) }));
  };

  // Changing the start time keeps the slot's duration fixed at the current
  // session length, so the end time jumps with it automatically instead of
  // the therapist having to recompute it by hand. Changing the end time
  // directly is left as a free-form override (e.g. for a one-off longer
  // session) and doesn't pull the start time along with it.
  const handleSlotChange = (day: number, index: number, field: 'startTime' | 'endTime', value: string) => {
    setSlotsByDay((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).map((slot, i) => {
        if (i !== index) return slot;
        if (field === 'startTime') {
          const endTime = format(addMinutes(parse(value, 'HH:mm', new Date()), slotLengthMinutes), 'HH:mm');
          return { startTime: value, endTime };
        }
        return { ...slot, endTime: value };
      }),
    }));
  };

  const hasAnyWorkingDay = Object.values(slotsByDay).some((slots) => slots.length > 0);
  // True if ANY day across the whole week has an overlap — drives both the
  // warning message and disabling Save below, not just the per-day borders.
  const hasAnyOverlap = Object.values(slotsByDay).some((slots) => getOverlappingIndices(slots).size > 0);

  const handleSave = async () => {
    if (!therapist?.Id || !hasAnyWorkingDay || hasAnyOverlap) return;
    setIsSaving(true);
    try {
      await scheduleService.saveSchedule(
        {
          slotsByDay,
          bookingNoticeHours,
          cancellationPolicy: {
            minimalNoticeHours: cancellationNoticeHours,
            cancellationPolicy: cancellationPolicyText,
          },
        },
        !hasExistingSchedule,
      );
      setHasExistingSchedule(true);
      toast.success(t('app.therapist.calendar.manage.availabilitySaved'));
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error(t('app.therapist.calendar.manage.actionError'));
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

      <Collapsible
        open={isHelpOpen}
        onOpenChange={setIsHelpOpen}
        className={`feelora-card mb-6 bg-primary/5 border-primary/30 transition-[padding] ${
          isHelpOpen ? 'p-4' : 'py-2.5 px-4'
        }`}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-foreground">
          {t('app.therapist.calendar.manage.help.title')}
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${isHelpOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4 text-sm text-muted-foreground">
          <p>{t('app.therapist.calendar.manage.help.intro2')}</p>

          <div>
            <p className="font-bold text-foreground mb-1">
              {t('app.therapist.calendar.manage.help.scheduleHeading')}
            </p>
            <p>{t('app.therapist.calendar.manage.help.scheduleBody')}</p>
          </div>

          <div>
            <p className="font-bold text-foreground mb-1">
              {t('app.therapist.calendar.manage.help.step1Heading')}
            </p>
            <p>{t('app.therapist.calendar.manage.help.step1Body')}</p>
          </div>

          <div>
            <p className="font-bold text-foreground mb-1">
              {t('app.therapist.calendar.manage.help.step2Heading')}
            </p>
            <p>{t('app.therapist.calendar.manage.help.step2Body')}</p>
          </div>

          <div>
            <p className="font-bold text-foreground mb-1">
              {t('app.therapist.calendar.manage.help.step3Heading')}
            </p>
            <p>{t('app.therapist.calendar.manage.help.step3Body1')}</p>
            <p className="mt-2">
              {t('app.therapist.calendar.manage.help.step3Body2')}{' '}
              <strong className="text-foreground">{t('app.therapist.calendar.manage.help.step3Emphasis')}</strong>
            </p>
          </div>

          <div>
            <p className="font-bold text-foreground mb-1">
              {t('app.therapist.calendar.manage.help.step4Heading')}
            </p>
            <p>{t('app.therapist.calendar.manage.help.step4Body')}</p>
          </div>

          <div>
            <p className="font-bold text-foreground mb-1">
              {t('app.therapist.calendar.manage.help.step5Heading')}
            </p>
            <p>{t('app.therapist.calendar.manage.help.step5Body')}</p>
            <p className="italic">{t('app.therapist.calendar.manage.help.step5Note')}</p>
          </div>

           <div>
            <p className="font-bold text-foreground mb-1">
              {t('app.therapist.calendar.manage.help.step6Heading')}
            </p>
            <p>{t('app.therapist.calendar.manage.help.step6Body')}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>

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

          <div className="grid sm:grid-cols-2 gap-4">
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
                {t('app.therapist.calendar.manage.minimalNotice')}
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={bookingNoticeHours}
                onChange={(e) => setBookingNoticeHours(Number(e.target.value))}
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
                {DISPLAY_ORDER.filter(isWorkingDay).map((day) => {
                  const daySlots = slotsByDay[day] ?? [];
                  // Recomputed per render so a live edit (e.g. dragging a
                  // start time into another slot) is flagged immediately.
                  const overlappingIndices = getOverlappingIndices(daySlots);
                  return (
                  <div key={day} className="feelora-card">
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <p className="font-semibold text-foreground">{weekdayLabel(day)}</p>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t('app.therapist.calendar.manage.breakBetweenSessions')}
                        </label>
                        <Select
                          value={String(breakMinutesByDay[day] ?? DEFAULT_BREAK_MINUTES)}
                          onValueChange={(v) =>
                            setBreakMinutesByDay((prev) => ({ ...prev, [day]: Number(v) }))
                          }
                        >
                          <SelectTrigger className="h-8 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BREAK_OPTIONS.map((minutes) => (
                              <SelectItem key={minutes} value={String(minutes)}>
                                {t('app.therapist.calendar.manage.minutes', { count: minutes })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {t('app.therapist.calendar.manage.slotsHint')}
                    </p>
                    <div className="space-y-2 mb-3">
                      {daySlots.map((slot, index) => {
                        const isOverlapping = overlappingIndices.has(index);
                        return (
                        <div key={index}>
                          <div
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${
                              isOverlapping
                                ? 'border-destructive/50 bg-destructive/5'
                                : 'border-primary/30 bg-primary/5'
                            }`}
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
                          {/* Per-slot warning — one shows on each side of an overlapping pair. */}
                          {isOverlapping && (
                            <p className="flex items-center gap-1 text-xs text-destructive mt-1 ml-1">
                              <AlertTriangle className="w-3 h-3" />
                              {t('app.therapist.calendar.manage.slotOverlaps')}
                            </p>
                          )}
                        </div>
                        );
                      })}
                      {daySlots.length === 0 && (
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
                  );
                })}
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
                  disablePastDates
                />
              </div>

              <div className="md:flex-1">
                <p className="font-medium text-foreground mb-3">
                  {format(blockDate, 'EEEE, d. MMMM', { locale: de })}
                </p>

                {isLoadingOverride ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleToggleFullDayBlock}
                      disabled={isSavingOverride}
                      className={
                        isFullyBlocked
                          ? 'feelora-btn-primary w-full justify-center mb-4 disabled:opacity-50'
                          : 'w-full inline-flex items-center justify-center gap-2 rounded-full border border-destructive/40 text-destructive px-4 py-2 font-medium hover:bg-destructive/10 transition-colors mb-4 disabled:opacity-50'
                      }
                    >
                      {isSavingOverride ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                      {isFullyBlocked
                        ? t('app.therapist.calendar.manage.unblockDay')
                        : t('app.therapist.calendar.manage.blockDay')}
                    </button>

                    {isFullyBlocked ? (
                      <p className="text-sm text-muted-foreground text-center">
                        {t('app.therapist.calendar.manage.dayFullyBlocked')}
                      </p>
                    ) : recurringSlotsForBlockDate.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('app.therapist.calendar.manage.noSlotsThisDay')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {recurringSlotsForBlockDate.map((slot) => {
                          const effectiveSlots = dateOverride?.availabilities ?? recurringSlotsForBlockDate;
                          const isBlocked = !effectiveSlots.some((s) => s.startTime === slot.startTime);
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
                                onClick={() => handleToggleSlotBlock(slot)}
                                disabled={isSavingOverride}
                                className={
                                  isBlocked
                                    ? 'text-xs font-medium text-primary hover:underline disabled:opacity-50'
                                    : 'text-xs font-medium text-destructive hover:underline disabled:opacity-50'
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
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('app.therapist.calendar.manage.cancellationPolicy')}
            </label>
            <Textarea
              value={cancellationPolicyText}
              onChange={(e) => setCancellationPolicyText(e.target.value)}
              placeholder={t('app.therapist.calendar.manage.cancellationPolicyPlaceholder')}
              rows={4}
              className="mb-3"
            />
            {/* This is a second, separate notice-period number from the
                "minimum booking notice" one above — the backend's Policy
                type nests its own MinimalNotice inside CancellationPolicy,
                distinct from Settings.MinimalNotice. It's the number the
                policy text itself is referring to (e.g. "cancel 24h
                ahead"), shown to patients but never enforced by us. */}
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('app.therapist.calendar.manage.cancellationNotice')}
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={cancellationNoticeHours}
              onChange={(e) => setCancellationNoticeHours(Number(e.target.value))}
              className="max-w-[160px]"
            />
          </div>

          {/* Summary warning — the per-slot ones above show which slots, this
              is what actually explains why Save is greyed out. */}
          {hasAnyOverlap && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {t('app.therapist.calendar.manage.fixOverlapsBeforeSaving')}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || !hasAnyWorkingDay || hasAnyOverlap}
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
