import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      // navLayout="around" renders the prev/next buttons as siblings of the
      // caption (instead of one absolutely-positioned bar spanning the full
      // width) — combined with the grid below, this keeps the chevrons right
      // next to the month name instead of pinned to the box's outer edges.
      navLayout="around"
      showOutsideDays={showOutsideDays}
      className={cn('p-4 w-full', className)}
      classNames={{
        months: cn(defaultClassNames.months, 'flex flex-col sm:flex-row gap-2 w-full'),
        // [prev button | month caption | next button] as one row, with the
        // day grid spanning all 3 columns underneath (see month_grid below).
        month: cn(defaultClassNames.month, 'grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-4 w-full'),
        month_caption: cn(defaultClassNames.month_caption, 'flex justify-center items-center'),
        caption_label: cn(defaultClassNames.caption_label, 'text-base font-semibold text-foreground'),
        button_previous: cn(
          defaultClassNames.button_previous,
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 text-muted-foreground hover:opacity-100',
        ),
        button_next: cn(
          defaultClassNames.button_next,
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 text-muted-foreground hover:opacity-100',
        ),
        // col-span-3 makes the grid occupy the full width of the 3-column
        // `month` row above, rather than being squeezed into column 1.
        month_grid: cn(defaultClassNames.month_grid, 'col-span-3 w-full border-collapse'),
        weekdays: cn(defaultClassNames.weekdays, 'flex w-full'),
        // `flex-1` on both weekday and day (below) makes every column share
        // the row's width equally, so the 7-day grid always fills the box
        // instead of sitting at a fixed size with empty space on the right.
        weekday: cn(
          defaultClassNames.weekday,
          'flex-1 text-center text-muted-foreground rounded-md font-medium text-xs',
        ),
        week: cn(defaultClassNames.week, 'flex w-full mt-2'),
        day: cn(
          defaultClassNames.day,
          'relative flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20',
        ),
        // The button itself stays a fixed-size circle, centered (mx-auto)
        // within its now-flexible-width day cell.
        day_button: cn(
          defaultClassNames.day_button,
          'relative mx-auto h-10 w-10 rounded-full font-medium text-foreground transition-colors hover:bg-muted aria-selected:opacity-100',
        ),
        selected: cn(
          defaultClassNames.selected,
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
        ),
        today: cn(defaultClassNames.today, '[&>button]:font-bold [&>button]:text-primary'),
        outside: cn(defaultClassNames.outside, 'text-muted-foreground opacity-50'),
        disabled: cn(defaultClassNames.disabled, 'text-muted-foreground opacity-30'),
        hidden: cn(defaultClassNames.hidden, 'invisible'),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" {...chevronProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...chevronProps} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
