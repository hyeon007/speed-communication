const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SEOUL_UTC_OFFSET_HOURS = 9;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const seoulDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

type DateKeyParts = {
  year: number;
  month: number;
  day: number;
};

function padDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

function toDateKey(parts: DateKeyParts): string {
  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}`;
}

function parseDateKey(dateKey: string): DateKeyParts {
  if (!DATE_ONLY_PATTERN.test(dateKey)) {
    throw new Error(`Invalid Seoul date key: ${dateKey}`);
  }

  const [year, month, day] = dateKey.split('-').map(Number);

  return {
    year,
    month,
    day,
  };
}

function getUtcNoonForDateKey(dateKey: string): Date {
  const { year, month, day } = parseDateKey(dateKey);

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function formatSeoulDateKey(date: Date): string {
  const parts = seoulDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Failed to format Seoul date key.');
  }

  return `${year}-${month}-${day}`;
}

export function getSeoulDateRangeForDateKey(dateKey: string): {
  dateKey: string;
  start: Date;
  end: Date;
} {
  const { year, month, day } = parseDateKey(dateKey);

  return {
    dateKey,
    start: new Date(
      Date.UTC(year, month - 1, day, -SEOUL_UTC_OFFSET_HOURS, 0, 0, 0),
    ),
    end: new Date(
      Date.UTC(year, month - 1, day, 23 - SEOUL_UTC_OFFSET_HOURS, 59, 59, 999),
    ),
  };
}

export function parseSeoulDateOnlyBoundary(
  input: string,
  boundary: 'start' | 'end',
): Date | null {
  if (!DATE_ONLY_PATTERN.test(input)) {
    return null;
  }

  const range = getSeoulDateRangeForDateKey(input);
  return boundary === 'start' ? range.start : range.end;
}

export function getCurrentSeoulDateRange(now = new Date()): {
  dateKey: string;
  start: Date;
  end: Date;
} {
  return getSeoulDateRangeForDateKey(formatSeoulDateKey(now));
}

export function getSeoulRecentDateWindow(
  days: number,
  now = new Date(),
): {
  start: Date;
  end: Date;
  dateKeys: string[];
} {
  const safeDays = Math.max(1, days);
  const endDateKey = formatSeoulDateKey(now);
  const endReference = getUtcNoonForDateKey(endDateKey);
  const dateKeys = Array.from({ length: safeDays }, (_, index) => {
    const offset = safeDays - index - 1;
    const current = new Date(
      endReference.getTime() - offset * DAY_IN_MILLISECONDS,
    );

    return toDateKey({
      year: current.getUTCFullYear(),
      month: current.getUTCMonth() + 1,
      day: current.getUTCDate(),
    });
  });

  const startRange = getSeoulDateRangeForDateKey(dateKeys[0]);
  const endRange = getSeoulDateRangeForDateKey(dateKeys[dateKeys.length - 1]);

  return {
    start: startRange.start,
    end: endRange.end,
    dateKeys,
  };
}
