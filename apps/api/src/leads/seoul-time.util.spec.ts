import {
  formatSeoulDateKey,
  getCurrentSeoulDateRange,
  getSeoulRecentDateWindow,
  parseSeoulDateOnlyBoundary,
} from './seoul-time.util';

describe('Seoul time utilities', () => {
  it('formats Seoul date keys from UTC timestamps', () => {
    expect(formatSeoulDateKey(new Date('2026-04-10T15:00:00.000Z'))).toBe(
      '2026-04-11',
    );
  });

  it('converts date-only boundaries to Seoul day UTC ranges', () => {
    expect(parseSeoulDateOnlyBoundary('2026-04-11', 'start')).toEqual(
      new Date('2026-04-10T15:00:00.000Z'),
    );
    expect(parseSeoulDateOnlyBoundary('2026-04-11', 'end')).toEqual(
      new Date('2026-04-11T14:59:59.999Z'),
    );
  });

  it('builds today and recent windows in Seoul time', () => {
    const currentRange = getCurrentSeoulDateRange(
      new Date('2026-04-11T02:30:00.000Z'),
    );
    const recentWindow = getSeoulRecentDateWindow(
      7,
      new Date('2026-04-11T02:30:00.000Z'),
    );

    expect(currentRange.dateKey).toBe('2026-04-11');
    expect(currentRange.start).toEqual(new Date('2026-04-10T15:00:00.000Z'));
    expect(currentRange.end).toEqual(new Date('2026-04-11T14:59:59.999Z'));
    expect(recentWindow.dateKeys).toEqual([
      '2026-04-05',
      '2026-04-06',
      '2026-04-07',
      '2026-04-08',
      '2026-04-09',
      '2026-04-10',
      '2026-04-11',
    ]);
  });
});
