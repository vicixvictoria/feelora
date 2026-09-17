import { motion, useReducedMotion } from 'framer-motion';
import { BellIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * The white "push notification" card that slides onto a device screen on a loop.
 * Shared by the phone and laptop decorations.
 */
function NotificationCard({ reduceMotion }: { reduceMotion: boolean | null }) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="absolute inset-x-1 top-1.5 rounded-lg bg-white/95 p-1.5 shadow-md backdrop-blur-sm"
      initial={reduceMotion ? undefined : { y: -44, opacity: 0 }}
      animate={
        reduceMotion
          ? { y: 0, opacity: 1 }
          : { y: [-44, 0, 0, 0, -44], opacity: [0, 1, 1, 1, 0] }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 4,
              times: [0, 0.12, 0.5, 0.88, 1],
              repeat: Infinity,
              repeatDelay: 1.4,
              ease: 'easeInOut',
            }
      }
    >
      <div className="flex items-center gap-1">
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] bg-primary">
          <BellIcon className="h-2 w-2 text-white" strokeWidth={2.5} />
        </span>
        <span className="text-[6px] font-semibold leading-none text-[#2f3e46]">Feelora</span>
      </div>
      <p className="mt-1 text-[5.5px] leading-tight text-[#2f3e46]/80">
        {t('patients.notification', 'Time for your check-in')}
      </p>
    </motion.div>
  );
}

interface DeviceNotificationProps {
  /** Positioning / sizing classes for the wrapper (absolute within a relative parent). */
  className?: string;
}

/**
 * A small decorative phone that lies next to an illustration and "blinks" with a
 * Feelora push notification on a loop. Purely visual — hidden from assistive tech
 * and calmed down when the user prefers reduced motion.
 */
export function FeeloraPhoneNotification({ className = '' }: DeviceNotificationProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute w-[92px] rotate-[14deg] ${className}`}
    >
      {!reduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-[26px] bg-primary/40 blur-xl"
          animate={{ opacity: [0, 0.7, 0], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative rounded-[22px] border border-white/30 bg-[#2f3e46] p-[6px] shadow-xl">
        <div className="relative aspect-[9/17] overflow-hidden rounded-[16px] bg-gradient-to-b from-[#e9f6f3] to-[#d9ccf0]">
          <div className="absolute left-1/2 top-1 h-[3px] w-8 -translate-x-1/2 rounded-full bg-[#2f3e46]/40" />

          <NotificationCard reduceMotion={reduceMotion} />

          {!reduceMotion && (
            <motion.div
              className="absolute bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * An open laptop that sits next to an illustration and "blinks" with a Feelora
 * push notification on a loop. Same treatment as {@link FeeloraPhoneNotification}.
 */
export function FeeloraLaptopNotification({ className = '' }: DeviceNotificationProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute w-[132px] rotate-[-6deg] ${className}`}
    >
      {!reduceMotion && (
        <motion.div
          className="absolute inset-x-2 top-1 bottom-2 rounded-[18px] bg-primary/40 blur-xl"
          animate={{ opacity: [0, 0.7, 0], scale: [0.85, 1.12, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* screen */}
      <div className="relative rounded-t-[10px] rounded-b-[4px] border border-white/30 bg-[#2f3e46] p-[5px] shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[5px] bg-gradient-to-br from-[#e9f6f3] to-[#d9ccf0]">
          <NotificationCard reduceMotion={reduceMotion} />

          {!reduceMotion && (
            <motion.div
              className="absolute bottom-1 right-1 h-1 w-1 rounded-full bg-primary"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      </div>

      {/* base / keyboard deck */}
      <div
        className="relative mx-auto h-[7px] w-[118%] -translate-x-[7.6%] rounded-b-[5px] bg-[#b9a7e0]"
        style={{ clipPath: 'polygon(3% 0, 97% 0, 100% 100%, 0 100%)' }}
      >
        <div className="absolute left-1/2 top-[1.5px] h-[2px] w-6 -translate-x-1/2 rounded-full bg-[#2f3e46]/25" />
      </div>
    </div>
  );
}
