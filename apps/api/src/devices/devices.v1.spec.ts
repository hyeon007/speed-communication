import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected an object response body.');
  }

  return value as Record<string, unknown>;
}

describe('Device catalog (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
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
  });

  async function loginAsEditor(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .set('x-forwarded-for', '198.51.100.244')
      .send({ username: 'admin', password: 'change-me-please' })
      .expect(201);

    const body = toRecord(response.body as unknown);
    const accessToken = body['accessToken'];

    if (typeof accessToken !== 'string') {
      throw new Error('Expected access token.');
    }

    return accessToken;
  }

  it('publishes only approved device information and never stores price data', async () => {
    const publicCatalog = await request(app.getHttpServer())
      .get('/api/v1/devices')
      .expect(200);

    expect(publicCatalog.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'iphone-17-pro',
          status: 'published',
        }),
      ]),
    );

    const token = await loginAsEditor();
    const input = {
      brand: 'samsung',
      slug: 'galaxy-test-consult',
      name: 'Galaxy Test Consult',
      tagline: '상담형 안내 테스트 기기',
      description: '가격과 지원금은 가입 조건을 확인한 뒤 상담으로 안내합니다.',
      imageUrl: '/images/devices/galaxy-s26.jpg',
      colors: ['블랙'],
      storageOptions: ['256GB'],
      highlights: ['기기 정보만 공개', '가격과 지원 혜택은 상담 후 안내'],
      status: 'draft',
      sortOrder: 1,
    };

    await request(app.getHttpServer())
      .post('/api/v1/admin/devices')
      .set('Authorization', `Bearer ${token}`)
      .send(input)
      .expect(201)
      .expect((response) => {
        expect(response.body).not.toHaveProperty('price');
        expect(response.body).not.toHaveProperty('subsidy');
      });

    await request(app.getHttpServer())
      .get('/api/v1/devices/galaxy-test-consult')
      .expect(404);

    await request(app.getHttpServer())
      .patch('/api/v1/admin/devices/galaxy-test-consult')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'published' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/devices/galaxy-test-consult')
      .expect(200)
      .expect((response) => {
        const body = toRecord(response.body as unknown);
        expect(body['status']).toBe('published');
        expect(body['colors']).toEqual(['블랙']);
      });
  });
});
