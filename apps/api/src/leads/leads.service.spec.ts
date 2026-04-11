import { LeadsService } from './leads.service';
import { LeadNotifierService } from './lead-notifier.service';
import type { LeadRepository } from './repositories/lead.repository';

describe('LeadsService date filters', () => {
  function createRepository(): jest.Mocked<LeadRepository> {
    return {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        recentNewCount: 0,
      }),
      findForExport: jest.fn().mockResolvedValue([]),
      getStats: jest.fn(),
      getTrend: jest.fn(),
      getActivity: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
      bulkUpdateStatus: jest.fn(),
      findStatusAudits: jest.fn(),
      updateStatus: jest.fn(),
      updateMemo: jest.fn(),
    } as unknown as jest.Mocked<LeadRepository>;
  }

  function createService(repository: jest.Mocked<LeadRepository>) {
    return new LeadsService(repository, {
      notifyLeadCreated: jest.fn(),
      notifyBulkStatusChanged: jest.fn(),
      notifyLeadStatusChanged: jest.fn(),
    } as unknown as LeadNotifierService);
  }

  it('converts date-only lead filters to Seoul day boundaries', async () => {
    const repository = createRepository();
    const service = createService(repository);

    await service.findAll({
      startDate: '2026-04-11',
      endDate: '2026-04-11',
    });

    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date('2026-04-10T15:00:00.000Z'),
        endDate: new Date('2026-04-11T14:59:59.999Z'),
      }),
    );
  });

  it('converts date-only activity filters to Seoul day boundaries', async () => {
    const repository = createRepository();
    const service = createService(repository);

    await service.getActivity({
      startDate: '2026-04-11',
      endDate: '2026-04-11',
    });

    expect(repository.getActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date('2026-04-10T15:00:00.000Z'),
        endDate: new Date('2026-04-11T14:59:59.999Z'),
      }),
    );
  });
});
