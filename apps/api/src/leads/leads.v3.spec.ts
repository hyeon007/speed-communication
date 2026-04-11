import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected object response body');
  }

  return value as Record<string, unknown>;
}

describe('Admin Leads v3 (integration)', () => {
  let app: INestApplication<App>;
  const originalRateLimitTrustProxy = process.env.RATE_LIMIT_TRUST_PROXY_HEADER;
  let loginRequestSequence = 0;

  beforeAll(async () => {
    process.env.RATE_LIMIT_TRUST_PROXY_HEADER = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env.RATE_LIMIT_TRUST_PROXY_HEADER = originalRateLimitTrustProxy;
  });

  async function login(username: string, password: string): Promise<string> {
    const forwardedIp = `198.51.100.${100 + loginRequestSequence}`;
    loginRequestSequence += 1;

    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .set('x-forwarded-for', forwardedIp)
      .send({
        username,
        password,
      })
      .expect(201);

    const body = toRecord(response.body as unknown);
    const accessToken = body['accessToken'];

    if (typeof accessToken !== 'string') {
      throw new Error('Expected accessToken to be string');
    }

    return accessToken;
  }

  async function loginAsEditor(): Promise<string> {
    return login('admin', 'change-me-please');
  }

  async function loginAsViewer(): Promise<string> {
    return login('viewer', 'change-me-viewer');
  }

  async function loginAsOperator(): Promise<string> {
    return login('operator', 'change-me-operator');
  }

  it('returns recentNewCount, supports bulk status update, and exports CSV', async () => {
    const token = await loginAsEditor();
    const authHeader = `Bearer ${token}`;

    const createFirst = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({
        name: '테스트 사용자A',
        phone: '01012345678',
        interestDevice: 'iPhone 16 Pro',
        contactTime: '오후 2시',
      })
      .expect(201);

    const createFirstBody = toRecord(createFirst.body as unknown);
    const createFirstData = toRecord(createFirstBody['data']);
    const firstLeadIdValue = createFirstData['id'];

    if (typeof firstLeadIdValue !== 'number') {
      throw new Error('Expected created lead id to be number');
    }

    const firstLeadId = firstLeadIdValue;

    await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({
        name: '테스트 사용자B',
        phone: '01098765432',
        interestDevice: 'iPhone 16',
        contactTime: '오후 4시',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/leads/${firstLeadId}/memo`)
      .set('Authorization', authHeader)
      .send({ memo: 'Line "A"\nLine B' })
      .expect(200);

    const listResponse = await request(app.getHttpServer())
      .get(
        '/api/v1/admin/leads?page=1&pageSize=10&sortBy=createdAt&sortDirection=desc',
      )
      .set('Authorization', authHeader)
      .expect(200);

    const statsResponse = await request(app.getHttpServer())
      .get('/api/v1/admin/leads/stats')
      .set('Authorization', authHeader)
      .expect(200);

    const trendResponse = await request(app.getHttpServer())
      .get('/api/v1/admin/leads/stats/trend?days=7')
      .set('Authorization', authHeader)
      .expect(200);

    const listBody = toRecord(listResponse.body as unknown);
    const countValue = listBody['count'];
    const recentNewCountValue = listBody['recentNewCount'];
    const dataValue = listBody['data'];

    const statsBody = toRecord(statsResponse.body as unknown);
    expect(typeof statsBody['total'] === 'number').toBe(true);
    expect(typeof statsBody['newCount'] === 'number').toBe(true);
    expect(typeof statsBody['inProgressCount'] === 'number').toBe(true);
    expect(typeof statsBody['completedCount'] === 'number').toBe(true);
    expect(typeof statsBody['todayCount'] === 'number').toBe(true);
    expect(typeof statsBody['last7DaysCount'] === 'number').toBe(true);

    const trendBody = toRecord(trendResponse.body as unknown);
    expect(trendBody['days']).toBe(7);
    expect(typeof trendBody['startDate']).toBe('string');
    expect(typeof trendBody['endDate']).toBe('string');
    expect(Array.isArray(trendBody['daily'])).toBe(true);
    expect((trendBody['daily'] as unknown[]).length).toBe(7);
    expect(typeof trendBody['newCount'] === 'number').toBe(true);
    expect(typeof trendBody['inProgressCount'] === 'number').toBe(true);
    expect(typeof trendBody['completedCount'] === 'number').toBe(true);

    expect(typeof countValue === 'number' && countValue >= 2).toBe(true);
    expect(
      typeof recentNewCountValue === 'number' && recentNewCountValue >= 2,
    ).toBe(true);
    expect(Array.isArray(dataValue)).toBe(true);

    const bulkResponse = await request(app.getHttpServer())
      .patch('/api/v1/admin/leads/bulk-status')
      .set('Authorization', authHeader)
      .send({
        ids: [firstLeadId, 999999],
        status: 'in_progress',
      })
      .expect(200);

    const bulkBody = toRecord(bulkResponse.body as unknown);
    const requestedValue = bulkBody['requested'];
    const updatedValue = bulkBody['updated'];
    const updatedIdsValue = bulkBody['updatedIds'];
    const notFoundIdsValue = bulkBody['notFoundIds'];

    expect(requestedValue).toBe(2);
    expect(updatedValue).toBe(1);
    expect(Array.isArray(updatedIdsValue)).toBe(true);
    expect(Array.isArray(notFoundIdsValue)).toBe(true);
    expect(updatedIdsValue).toContain(firstLeadId);
    expect(notFoundIdsValue).toContain(999999);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/leads/${firstLeadId}/status`)
      .set('Authorization', authHeader)
      .send({ status: 'completed' })
      .expect(200);

    const activityResponse = await request(app.getHttpServer())
      .get(
        '/api/v1/admin/leads/activity?limit=20&changedBy=admin&nextStatus=completed',
      )
      .set('Authorization', authHeader)
      .expect(200);

    const auditResponse = await request(app.getHttpServer())
      .get(`/api/v1/admin/leads/${firstLeadId}/status-audits?limit=10`)
      .set('Authorization', authHeader)
      .expect(200);

    const auditBody = toRecord(auditResponse.body as unknown);
    const auditCountValue = auditBody['count'];
    const auditDataValue = auditBody['data'];

    expect(typeof auditCountValue === 'number' && auditCountValue >= 2).toBe(
      true,
    );
    expect(Array.isArray(auditDataValue)).toBe(true);

    const firstAudit = Array.isArray(auditDataValue)
      ? (auditDataValue[0] as Record<string, unknown>)
      : null;

    const activityBody = toRecord(activityResponse.body as unknown);
    const activityData = activityBody['data'];
    const activityRows = Array.isArray(activityData)
      ? (activityData as Array<Record<string, unknown>>)
      : [];
    const firstActivity = activityRows[0];

    expect(typeof activityBody['count'] === 'number').toBe(true);
    expect(activityBody['page']).toBe(1);
    expect(activityBody['pageSize']).toBe(20);
    expect(typeof activityBody['totalPages'] === 'number').toBe(true);
    expect(activityRows.length >= 1).toBe(true);
    expect(firstActivity?.['leadId']).toBe(firstLeadId);
    expect(firstActivity?.['changedBy']).toBe('admin');
    expect(firstActivity?.['nextStatus']).toBe('completed');
    expect(activityRows.every((item) => item['changedBy'] === 'admin')).toBe(
      true,
    );
    expect(
      activityRows.every((item) => item['nextStatus'] === 'completed'),
    ).toBe(true);

    expect(firstAudit).not.toBeNull();
    expect(firstAudit?.['changedBy']).toBe('admin');
    expect(firstAudit?.['nextStatus']).toBe('completed');

    const csvResponse = await request(app.getHttpServer())
      .get('/api/v1/admin/leads/export.csv?sortBy=createdAt&sortDirection=desc')
      .set('Authorization', authHeader)
      .expect(200);

    const activityCsvResponse = await request(app.getHttpServer())
      .get('/api/v1/admin/leads/activity.csv?limit=20&nextStatus=completed')
      .set('Authorization', authHeader)
      .expect(200);

    expect(csvResponse.headers['content-type']).toContain('text/csv');
    expect(csvResponse.text).toContain(
      'id,name,phone,interestDevice,contactTime,status,memo,createdAt',
    );
    expect(csvResponse.text).toContain('"completed"');
    expect(csvResponse.text).toContain('Line ""A""\\nLine B');
    expect(activityCsvResponse.headers['content-type']).toContain('text/csv');
    expect(activityCsvResponse.text).toContain(
      'auditId,leadId,leadName,leadPhone,previousStatus,nextStatus,changedBy,changedAt',
    );
    expect(activityCsvResponse.text).toContain('"completed"');
  });

  it('supports activity paging and combined filters', async () => {
    const editorToken = await loginAsEditor();
    const editorAuth = `Bearer ${editorToken}`;
    const operatorToken = await loginAsOperator();
    const operatorAuth = `Bearer ${operatorToken}`;

    const createA = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .set('x-forwarded-for', '198.51.100.120')
      .send({
        name: '필터조합A',
        phone: '01023456780',
        interestDevice: 'Galaxy S26 Ultra',
        contactTime: '오후 1시',
      })
      .expect(201);

    const createB = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .set('x-forwarded-for', '198.51.100.121')
      .send({
        name: '필터조합B',
        phone: '01023456781',
        interestDevice: 'iPhone 17 Pro',
        contactTime: '오후 3시',
      })
      .expect(201);

    const leadA = toRecord(toRecord(createA.body as unknown)['data'])['id'];
    const leadB = toRecord(toRecord(createB.body as unknown)['data'])['id'];

    if (typeof leadA !== 'number' || typeof leadB !== 'number') {
      throw new Error('Expected lead ids for filter/paging test');
    }

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/leads/${leadA}/status`)
      .set('Authorization', operatorAuth)
      .send({ status: 'in_progress' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/leads/${leadB}/status`)
      .set('Authorization', editorAuth)
      .send({ status: 'completed' })
      .expect(200);

    const today = new Date().toISOString().slice(0, 10);

    const combinedFilter = await request(app.getHttpServer())
      .get(
        `/api/v1/admin/leads/activity?limit=5&page=1&changedBy=operator&previousStatus=new&nextStatus=in_progress&startDate=${today}&endDate=${today}`,
      )
      .set('Authorization', editorAuth)
      .expect(200);

    const combinedBody = toRecord(combinedFilter.body as unknown);
    const combinedData = combinedBody['data'];

    expect(combinedBody['page']).toBe(1);
    expect(combinedBody['pageSize']).toBe(5);
    expect(Array.isArray(combinedData)).toBe(true);
    expect((combinedData as unknown[]).length >= 1).toBe(true);

    const first = ((combinedData as unknown[])[0] ?? null) as Record<
      string,
      unknown
    > | null;
    expect(first?.['changedBy']).toBe('operator');
    expect(first?.['previousStatus']).toBe('new');
    expect(first?.['nextStatus']).toBe('in_progress');

    const pagedResult = await request(app.getHttpServer())
      .get('/api/v1/admin/leads/activity?limit=1&page=2')
      .set('Authorization', editorAuth)
      .expect(200);

    const pagedBody = toRecord(pagedResult.body as unknown);
    expect(pagedBody['page']).toBe(2);
    expect(pagedBody['pageSize']).toBe(1);
    expect(typeof pagedBody['count'] === 'number').toBe(true);
    expect(typeof pagedBody['totalPages'] === 'number').toBe(true);
  });

  it('allows viewer to read but forbids write operations', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({
        name: '뷰어테스트',
        phone: '01011112222',
        interestDevice: 'iPhone 16 Plus',
        contactTime: '오전 11시',
      })
      .expect(201);

    const createBody = toRecord(create.body as unknown);
    const createData = toRecord(createBody['data']);
    const leadId = createData['id'];

    if (typeof leadId !== 'number') {
      throw new Error('Expected lead id to be number');
    }

    const token = await loginAsViewer();
    const authHeader = `Bearer ${token}`;

    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/admin/auth/me')
      .set('Authorization', authHeader)
      .expect(200);

    const meBody = toRecord(meResponse.body as unknown);
    expect(meBody['role']).toBe('viewer');
    expect(meBody['username']).toBe('viewer');

    await request(app.getHttpServer())
      .get('/api/v1/admin/leads?page=1&pageSize=10')
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/admin/leads/stats')
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/admin/leads/activity?limit=5')
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/admin/leads/activity.csv?limit=5')
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/admin/leads/stats/trend?days=30')
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/admin/leads/${leadId}/status-audits?limit=5`)
      .set('Authorization', authHeader)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/leads/${leadId}/status`)
      .set('Authorization', authHeader)
      .send({ status: 'in_progress' })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/leads/${leadId}/memo`)
      .set('Authorization', authHeader)
      .send({ memo: 'viewer cannot edit' })
      .expect(403);

    await request(app.getHttpServer())
      .patch('/api/v1/admin/leads/bulk-status')
      .set('Authorization', authHeader)
      .send({
        ids: [leadId],
        status: 'completed',
      })
      .expect(403);
  });

  it('enforces public lead creation rate limits per IP', async () => {
    const forwardedIp = '198.51.100.77';

    for (let index = 0; index < 10; index += 1) {
      await request(app.getHttpServer())
        .post('/api/v1/leads')
        .set('x-forwarded-for', forwardedIp)
        .send({
          name: `속도제한테스트${index}`,
          phone: `0105555${String(1000 + index)}`,
          interestDevice: 'iPhone 16',
          contactTime: '오후 5시',
        })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post('/api/v1/leads')
      .set('x-forwarded-for', forwardedIp)
      .send({
        name: '속도제한테스트초과',
        phone: '01055559999',
        interestDevice: 'iPhone 16',
        contactTime: '오후 5시',
      })
      .expect(429);
  });

  it('enforces admin login rate limits per IP', async () => {
    const forwardedIp = '203.0.113.200';

    for (let index = 0; index < 5; index += 1) {
      await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .set('x-forwarded-for', forwardedIp)
        .send({
          username: 'admin',
          password: 'wrong-password',
        })
        .expect(401);
    }

    await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .set('x-forwarded-for', forwardedIp)
      .send({
        username: 'admin',
        password: 'wrong-password',
      })
      .expect(429);
  });

  it('allows operator to perform single-item writes but forbids bulk update', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({
        name: '운영자테스트',
        phone: '01077778888',
        interestDevice: 'iPhone 16 Pro Max',
        contactTime: '오후 6시',
      })
      .expect(201);

    const createBody = toRecord(create.body as unknown);
    const createData = toRecord(createBody['data']);
    const leadId = createData['id'];

    if (typeof leadId !== 'number') {
      throw new Error('Expected lead id to be number');
    }

    const token = await loginAsOperator();
    const authHeader = `Bearer ${token}`;

    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/admin/auth/me')
      .set('Authorization', authHeader)
      .expect(200);

    const meBody = toRecord(meResponse.body as unknown);
    expect(meBody['role']).toBe('operator');
    expect(meBody['username']).toBe('operator');

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/leads/${leadId}/status`)
      .set('Authorization', authHeader)
      .send({ status: 'in_progress' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/leads/${leadId}/memo`)
      .set('Authorization', authHeader)
      .send({ memo: 'operator memo ok' })
      .expect(200);

    await request(app.getHttpServer())
      .patch('/api/v1/admin/leads/bulk-status')
      .set('Authorization', authHeader)
      .send({
        ids: [leadId],
        status: 'completed',
      })
      .expect(403);
  });
});
