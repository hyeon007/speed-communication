import nodemailer from 'nodemailer';
import { LeadNotifierService } from './lead-notifier.service';

type MockMailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

jest.mock('nodemailer', () => {
  return {
    __esModule: true,
    default: {
      createTransport: jest.fn(),
    },
  };
});

function getMockTransporter(): {
  sendMail: jest.Mock<Promise<unknown>, [MockMailOptions]>;
} {
  return {
    sendMail: jest
      .fn<Promise<unknown>, [MockMailOptions]>()
      .mockResolvedValue({}),
  };
}

describe('LeadNotifierService', () => {
  const originalEnabled = process.env.LEAD_NOTIFY_EMAIL_ENABLED;
  const originalHost = process.env.LEAD_NOTIFY_EMAIL_SMTP_HOST;
  const originalPort = process.env.LEAD_NOTIFY_EMAIL_SMTP_PORT;
  const originalSecure = process.env.LEAD_NOTIFY_EMAIL_SMTP_SECURE;
  const originalUser = process.env.LEAD_NOTIFY_EMAIL_SMTP_USER;
  const originalPass = process.env.LEAD_NOTIFY_EMAIL_SMTP_PASS;
  const originalFrom = process.env.LEAD_NOTIFY_EMAIL_FROM;
  const originalTo = process.env.LEAD_NOTIFY_EMAIL_TO;
  const originalTimeout = process.env.LEAD_NOTIFY_EMAIL_TIMEOUT_MS;
  const originalRetryCount = process.env.LEAD_NOTIFY_EMAIL_RETRY_COUNT;
  const originalRetryDelay = process.env.LEAD_NOTIFY_EMAIL_RETRY_DELAY_MS;

  beforeEach(() => {
    delete process.env.LEAD_NOTIFY_EMAIL_ENABLED;
    delete process.env.LEAD_NOTIFY_EMAIL_SMTP_HOST;
    delete process.env.LEAD_NOTIFY_EMAIL_SMTP_PORT;
    delete process.env.LEAD_NOTIFY_EMAIL_SMTP_SECURE;
    delete process.env.LEAD_NOTIFY_EMAIL_SMTP_USER;
    delete process.env.LEAD_NOTIFY_EMAIL_SMTP_PASS;
    delete process.env.LEAD_NOTIFY_EMAIL_FROM;
    delete process.env.LEAD_NOTIFY_EMAIL_TO;
    delete process.env.LEAD_NOTIFY_EMAIL_TIMEOUT_MS;
    delete process.env.LEAD_NOTIFY_EMAIL_RETRY_COUNT;
    delete process.env.LEAD_NOTIFY_EMAIL_RETRY_DELAY_MS;
    jest.restoreAllMocks();

    const createTransportMock = nodemailer.createTransport as jest.Mock;
    createTransportMock.mockReset();
  });

  afterAll(() => {
    process.env.LEAD_NOTIFY_EMAIL_ENABLED = originalEnabled;
    process.env.LEAD_NOTIFY_EMAIL_SMTP_HOST = originalHost;
    process.env.LEAD_NOTIFY_EMAIL_SMTP_PORT = originalPort;
    process.env.LEAD_NOTIFY_EMAIL_SMTP_SECURE = originalSecure;
    process.env.LEAD_NOTIFY_EMAIL_SMTP_USER = originalUser;
    process.env.LEAD_NOTIFY_EMAIL_SMTP_PASS = originalPass;
    process.env.LEAD_NOTIFY_EMAIL_FROM = originalFrom;
    process.env.LEAD_NOTIFY_EMAIL_TO = originalTo;
    process.env.LEAD_NOTIFY_EMAIL_TIMEOUT_MS = originalTimeout;
    process.env.LEAD_NOTIFY_EMAIL_RETRY_COUNT = originalRetryCount;
    process.env.LEAD_NOTIFY_EMAIL_RETRY_DELAY_MS = originalRetryDelay;
  });

  it('skips sending when email notifier is disabled', async () => {
    const service = new LeadNotifierService();
    const createTransportMock = nodemailer.createTransport as jest.Mock;

    await service.notifyLeadCreated({
      id: 1,
      name: '홍길동',
      phone: '01012345678',
      interestDevice: 'iPhone 16 Pro',
      contactTime: '오후 7시',
      memo: null,
      status: 'new',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(createTransportMock).not.toHaveBeenCalled();
  });

  it('sends email payload when configured', async () => {
    process.env.LEAD_NOTIFY_EMAIL_ENABLED = 'true';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_HOST = '127.0.0.1';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_PORT = '1025';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_SECURE = 'false';
    process.env.LEAD_NOTIFY_EMAIL_FROM = 'from@example.com';
    process.env.LEAD_NOTIFY_EMAIL_TO = 'to@example.com';
    process.env.LEAD_NOTIFY_EMAIL_TIMEOUT_MS = '2500';

    const service = new LeadNotifierService();
    const createTransportMock = nodemailer.createTransport as jest.Mock;
    const transporter = getMockTransporter();
    createTransportMock.mockReturnValue(transporter);

    await service.notifyLeadStatusChanged({
      leadId: 42,
      previousStatus: 'new',
      nextStatus: 'in_progress',
      changedBy: 'admin',
    });

    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);

    const firstMail = transporter.sendMail.mock.calls[0]?.[0];

    if (!firstMail) {
      throw new Error('Expected sendMail payload');
    }

    expect(firstMail.from).toBe('from@example.com');
    expect(firstMail.to).toBe('to@example.com');
    expect(typeof firstMail.subject).toBe('string');
    expect(firstMail.text).toContain('event: lead.status_changed');
    expect(firstMail.text).toContain('leadId: 42');
    expect(firstMail.text).toContain('previousStatus: new');
    expect(firstMail.text).toContain('nextStatus: in_progress');
    expect(firstMail.text).toContain('changedBy: admin');
    expect(firstMail.html).toContain('상태 변경 #42');
    expect(firstMail.html).toContain('previousStatus');
    expect(firstMail.html).toContain('nextStatus');
  });

  it('never throws when email send fails', async () => {
    process.env.LEAD_NOTIFY_EMAIL_ENABLED = 'true';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_HOST = '127.0.0.1';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_PORT = '1025';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_SECURE = 'false';
    process.env.LEAD_NOTIFY_EMAIL_FROM = 'from@example.com';
    process.env.LEAD_NOTIFY_EMAIL_TO = 'to@example.com';

    const service = new LeadNotifierService();
    const createTransportMock = nodemailer.createTransport as jest.Mock;
    const transporter = getMockTransporter();
    transporter.sendMail.mockRejectedValue(new Error('smtp down'));
    createTransportMock.mockReturnValue(transporter);

    await expect(
      service.notifyBulkStatusChanged({
        requested: 2,
        updated: 1,
        updatedIds: [1],
        notFoundIds: [2],
        nextStatus: 'completed',
        changedBy: 'admin',
      }),
    ).resolves.toBeUndefined();
  });

  it('retries failed email delivery when retry is configured', async () => {
    process.env.LEAD_NOTIFY_EMAIL_ENABLED = 'true';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_HOST = '127.0.0.1';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_PORT = '1025';
    process.env.LEAD_NOTIFY_EMAIL_SMTP_SECURE = 'false';
    process.env.LEAD_NOTIFY_EMAIL_FROM = 'from@example.com';
    process.env.LEAD_NOTIFY_EMAIL_TO = 'to@example.com';
    process.env.LEAD_NOTIFY_EMAIL_RETRY_COUNT = '2';
    process.env.LEAD_NOTIFY_EMAIL_RETRY_DELAY_MS = '0';

    const service = new LeadNotifierService();
    const createTransportMock = nodemailer.createTransport as jest.Mock;
    const transporter = getMockTransporter();
    transporter.sendMail.mockRejectedValue(new Error('smtp still down'));
    createTransportMock.mockReturnValue(transporter);

    await expect(
      service.notifyLeadStatusChanged({
        leadId: 88,
        previousStatus: 'new',
        nextStatus: 'in_progress',
        changedBy: 'admin',
      }),
    ).resolves.toBeUndefined();

    expect(transporter.sendMail).toHaveBeenCalledTimes(3);
  });
});
