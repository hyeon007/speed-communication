'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch, clearAdminSession } from '@/lib/admin-auth';

type AdminRole = 'editor' | 'operator' | 'viewer';
type DeviceStatus = 'draft' | 'published' | 'archived';
type DeviceBrand = 'apple' | 'samsung';

type CatalogDevice = {
  slug: string;
  brand: DeviceBrand;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  colors: string[];
  storageOptions: string[];
  highlights: string[];
  status: DeviceStatus;
  sortOrder: number;
  releasedAt: string | null;
};

type DeviceDraft = CatalogDevice & { isNew: boolean };

const emptyDraft = (): DeviceDraft => ({
  isNew: true,
  slug: '',
  brand: 'apple',
  name: '',
  tagline: '',
  description: '색상, 용량, 개통 가능 여부를 확인한 뒤 고객님의 가입 조건에 맞춰 당일 정책 기준으로 상담 안내드립니다.',
  imageUrl: '',
  sourceUrl: '',
  colors: [],
  storageOptions: [],
  highlights: ['가격과 지원 혜택은 상담 후 안내'],
  status: 'draft',
  sortOrder: 0,
  releasedAt: null,
});

function splitItems(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinItems(value: string[]): string {
  return value.join(', ');
}

function formatStatus(status: DeviceStatus): string {
  if (status === 'published') return '공개';
  if (status === 'archived') return '판매 종료';
  return '작성 중';
}

export default function AdminDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<CatalogDevice[]>([]);
  const [draft, setDraft] = useState<DeviceDraft>(emptyDraft);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canWrite = role === 'editor' || role === 'operator';
  const selectedSlug = draft.isNew ? null : draft.slug;

  const sortedDevices = useMemo(
    () => [...devices].sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)),
    [devices],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [profileResponse, deviceResponse] = await Promise.all([
          adminFetch('/api/v1/admin/auth/me'),
          adminFetch('/api/v1/admin/devices'),
        ]);

        if (profileResponse.status === 401 || deviceResponse.status === 401) {
          await clearAdminSession();
          router.replace('/admin/login');
          return;
        }

        if (!profileResponse.ok || !deviceResponse.ok) {
          throw new Error('관리자 기기 정보를 불러오지 못했습니다.');
        }

        const profile = (await profileResponse.json()) as { role: AdminRole | null };
        const loadedDevices = (await deviceResponse.json()) as CatalogDevice[];

        if (!active) return;
        setRole(profile.role);
        setDevices(loadedDevices);
        if (loadedDevices[0]) {
          setDraft({ ...loadedDevices[0], isNew: false });
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : '관리자 기기 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [router]);

  function selectDevice(device: CatalogDevice) {
    setMessage(null);
    setDraft({ ...device, isNew: false });
  }

  function updateDraft<K extends keyof DeviceDraft>(key: K, value: DeviceDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite || isSaving) return;

    setIsSaving(true);
    setMessage(null);

    const payload = {
      slug: draft.slug.trim(),
      brand: draft.brand,
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      imageUrl: draft.imageUrl?.trim() || undefined,
      sourceUrl: draft.sourceUrl?.trim() || undefined,
      colors: draft.colors,
      storageOptions: draft.storageOptions,
      highlights: draft.highlights,
      status: draft.status,
      sortOrder: Number(draft.sortOrder),
      releasedAt: draft.releasedAt || undefined,
    };

    try {
      const response = await adminFetch(
        draft.isNew ? '/api/v1/admin/devices' : `/api/v1/admin/devices/${encodeURIComponent(selectedSlug ?? '')}`,
        {
          method: draft.isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as CatalogDevice | { message?: string | string[] };

      if (!response.ok) {
        const error = 'message' in result ? result.message : undefined;
        setMessage(Array.isArray(error) ? error.join(', ') : error ?? '기기 정보를 저장하지 못했습니다.');
        return;
      }

      const saved = result as CatalogDevice;
      setDevices((current) => {
        const withoutCurrent = current.filter((device) => device.slug !== (selectedSlug ?? saved.slug));
        return [...withoutCurrent, saved];
      });
      setDraft({ ...saved, isNew: false });
      setMessage(draft.status === 'published' ? '기기 정보가 공개되었습니다.' : '기기 정보가 저장되었습니다.');
    } catch {
      setMessage('네트워크 오류로 기기 정보를 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5e0d8] pb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#c17f59]">CATALOG MANAGEMENT</p>
          <h1 className="mt-4 font-serif text-3xl font-normal text-[#1a1a1a]">기기 관리</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5a5a5a]">기기 정보만 공개합니다. 가격·지원금·월 납부금은 저장하거나 노출하지 않고, 고객 상담에서 당일 정책 기준으로 안내합니다.</p>
        </div>
        <Link href="/admin/leads" className="rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-sm text-[#5a5a5a] transition hover:bg-[#f5f3f0]">
          상담 접수 관리
        </Link>
      </header>

      {message ? <p className="mt-6 rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-sm text-[#5a5a5a]">{message}</p> : null}

      {isLoading ? (
        <p className="mt-16 text-sm text-[#5a5a5a]">기기 정보를 불러오는 중...</p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside>
            <button type="button" onClick={() => setDraft(emptyDraft())} disabled={!canWrite} className="w-full rounded-xl bg-[#c17f59] px-4 py-3 text-sm text-[#faf9f7] transition hover:bg-[#9a6347] disabled:cursor-not-allowed disabled:opacity-50">
              새 기기 등록
            </button>
            <div className="mt-5 space-y-2">
              {sortedDevices.map((device) => (
                <button key={device.slug} type="button" onClick={() => selectDevice(device)} className={`w-full rounded-xl border px-4 py-3 text-left transition ${selectedSlug === device.slug ? 'border-[#c17f59] bg-[#fff8f3]' : 'border-[#e5e0d8] bg-[#faf9f7] hover:bg-[#f5f3f0]'}`}>
                  <p className="text-sm text-[#1a1a1a]">{device.name}</p>
                  <p className="mt-1 text-xs text-[#8a8a8a]">{formatStatus(device.status)} · 노출 순서 {device.sortOrder}</p>
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={save} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm text-[#5a5a5a]">제조사
                <select value={draft.brand} onChange={(event) => updateDraft('brand', event.target.value as DeviceBrand)} disabled={!canWrite} className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring">
                  <option value="apple">Apple</option><option value="samsung">Samsung</option>
                </select>
              </label>
              <label className="text-sm text-[#5a5a5a]">공개 상태
                <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as DeviceStatus)} disabled={!canWrite} className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring">
                  <option value="draft">작성 중</option><option value="published">공개</option><option value="archived">판매 종료</option>
                </select>
              </label>
              <label className="text-sm text-[#5a5a5a]">기기명
                <input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} disabled={!canWrite} placeholder="Galaxy S26 Ultra" required className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
              </label>
              <label className="text-sm text-[#5a5a5a]">URL 식별자
                <input value={draft.slug} onChange={(event) => updateDraft('slug', event.target.value)} disabled={!canWrite} placeholder="galaxy-s26-ultra" required pattern="[a-z0-9]+(-[a-z0-9]+)*" className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
              </label>
              <label className="text-sm text-[#5a5a5a]">한 줄 소개
                <input value={draft.tagline} onChange={(event) => updateDraft('tagline', event.target.value)} disabled={!canWrite} placeholder="최신 울트라 플래그십" required className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
              </label>
              <label className="text-sm text-[#5a5a5a]">노출 순서
                <input type="number" min="0" max="9999" value={draft.sortOrder} onChange={(event) => updateDraft('sortOrder', Number(event.target.value))} disabled={!canWrite} className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
              </label>
            </div>

            <label className="block text-sm text-[#5a5a5a]">기기 안내 문구
              <textarea value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} disabled={!canWrite} rows={4} required className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm text-[#5a5a5a]">사이트 이미지 경로
                <input value={draft.imageUrl ?? ''} onChange={(event) => updateDraft('imageUrl', event.target.value)} disabled={!canWrite} placeholder="/images/devices/model.jpg" className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
                <span className="mt-1 block text-xs text-[#8a8a8a]">공개 폴더에 저장한 이미지 경로만 입력합니다.</span>
              </label>
              <label className="text-sm text-[#5a5a5a]">제조사 공식 링크
                <input type="url" value={draft.sourceUrl ?? ''} onChange={(event) => updateDraft('sourceUrl', event.target.value)} disabled={!canWrite} placeholder="https://" className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
              </label>
              <label className="text-sm text-[#5a5a5a]">색상
                <input value={joinItems(draft.colors)} onChange={(event) => updateDraft('colors', splitItems(event.target.value))} disabled={!canWrite} placeholder="블랙, 화이트" className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
              </label>
              <label className="text-sm text-[#5a5a5a]">저장용량
                <input value={joinItems(draft.storageOptions)} onChange={(event) => updateDraft('storageOptions', splitItems(event.target.value))} disabled={!canWrite} placeholder="256GB, 512GB" className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
              </label>
            </div>
            <label className="block text-sm text-[#5a5a5a]">상담 포인트
              <textarea value={joinItems(draft.highlights)} onChange={(event) => updateDraft('highlights', splitItems(event.target.value))} disabled={!canWrite} rows={3} required placeholder="카메라와 성능을 우선으로 찾는 분께 추천, 가격과 지원 혜택은 상담 후 안내" className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring" />
              <span className="mt-1 block text-xs text-[#8a8a8a]">쉼표 또는 줄바꿈으로 구분합니다. 가격·지원금 수치는 넣지 마세요.</span>
            </label>
            <button type="submit" disabled={!canWrite || isSaving} className="rounded-xl bg-[#c17f59] px-6 py-3 text-sm text-[#faf9f7] transition hover:bg-[#9a6347] disabled:cursor-not-allowed disabled:opacity-50">
              {isSaving ? '저장 중...' : draft.status === 'published' ? '저장하고 공개하기' : '기기 정보 저장'}
            </button>
            {!canWrite && role ? <p className="text-xs text-[#8a8a8a]">읽기 전용 계정은 기기 정보를 수정할 수 없습니다.</p> : null}
          </form>
        </div>
      )}
    </main>
  );
}
