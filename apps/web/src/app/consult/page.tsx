'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { MotionSection } from '@/components/motion-presets';
import { buildApiUrl, isLeadSubmissionConfigured } from '@/lib/api';

type FormState = {
  name: string;
  phone: string;
  interestDevice: string;
  consultationType: string;
  preferredCarrier: string;
  contactTime: string;
  website: string;
};

const initialForm: FormState = {
  name: '',
  phone: '',
  interestDevice: '',
  consultationType: '',
  preferredCarrier: '',
  contactTime: '',
  website: '',
};

export default function ConsultPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLeadSubmissionAvailable, setIsLeadSubmissionAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLeadSubmissionAvailable(isLeadSubmissionConfigured());
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      /^01[0-9]-?\d{3,4}-?\d{4}$/.test(form.phone.trim()) &&
      form.interestDevice.trim().length >= 2 &&
      form.consultationType.length > 0 &&
      form.preferredCarrier.length > 0 &&
      form.contactTime.trim().length >= 2
    );
  }, [form]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    if (isLeadSubmissionAvailable !== true) {
      setErrorMessage('상담 접수 시스템을 준비 중입니다. 잠시 후 다시 이용해주세요.');
      return;
    }

    setIsSubmitting(true);
    setServerMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl('/api/v1/leads'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.message ?? '상담 신청 접수 중 오류가 발생했습니다.');
        return;
      }

      setServerMessage(payload.message ?? '상담 신청이 접수되었습니다.');
      setForm(initialForm);
    } catch {
      setErrorMessage('네트워크 오류로 신청이 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-24 pt-12 md:px-12 md:pt-16">
      <MotionSection>
        <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-4xl">상담 신청 접수</h1>
        <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">아래 정보를 남겨주시면 접수 후 확인 뒤 24시간 내 연락드립니다.</p>
        <p className="mt-3 text-xs leading-6 text-[#8a8a8a]">
          가격·지원금은 고정으로 안내하지 않습니다. 기기와 가입 조건을 확인한 뒤 당일 정책 기준으로 연락드립니다.
        </p>
        {isLeadSubmissionAvailable === false ? (
          <p className="mt-3 text-xs leading-6 text-[#a45f3f]" role="status">
            현재 상담 접수 시스템을 준비 중입니다. 연결이 완료되면 이 화면에서 바로 접수할 수 있습니다.
          </p>
        ) : null}
      </MotionSection>

      <MotionSection delay={0.06}>
        <form
          onSubmit={handleSubmit}
          className="mt-24 space-y-5 border-t border-[#e5e0d8] pt-8"
        >
          {/* Honeypot: hidden from people, filled in by bots. */}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
        <label className="block text-sm text-[#5a5a5a]">
          이름
          <input
            name="name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
            placeholder="홍길동"
            minLength={2}
            required
          />
        </label>

        <label className="block text-sm text-[#5a5a5a]">
          연락처
          <input
            name="phone"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
            placeholder="01012345678"
            inputMode="tel"
            pattern="^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$"
            required
          />
        </label>

        <label className="block text-sm text-[#5a5a5a]">
          관심 기기
          <input
            name="interestDevice"
            value={form.interestDevice}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, interestDevice: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
            placeholder="iPhone 17 Pro"
            minLength={2}
            required
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm text-[#5a5a5a]">
            가입 유형
            <select
              name="consultationType"
              value={form.consultationType}
              onChange={(event) => setForm((prev) => ({ ...prev, consultationType: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              required
            >
              <option value="">선택하세요</option>
              <option value="number_transfer">번호이동</option>
              <option value="device_change">기기변경</option>
              <option value="new_subscription">신규가입</option>
              <option value="undecided">상담 후 결정</option>
            </select>
          </label>
          <label className="block text-sm text-[#5a5a5a]">
            희망 통신사
            <select
              name="preferredCarrier"
              value={form.preferredCarrier}
              onChange={(event) => setForm((prev) => ({ ...prev, preferredCarrier: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              required
            >
              <option value="">선택하세요</option>
              <option value="SKT">SKT</option>
              <option value="KT">KT</option>
              <option value="LGU+">LG U+</option>
              <option value="MVNO">알뜰폰</option>
              <option value="undecided">상담 후 결정</option>
            </select>
          </label>
        </div>

        <label className="block text-sm text-[#5a5a5a]">
          연락 가능 시간
          <input
            name="contactTime"
            value={form.contactTime}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, contactTime: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
            placeholder="19:00~21:00"
            minLength={2}
            required
          />
        </label>

        {serverMessage ? (
          <p className="rounded-xl border border-emerald-400/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {serverMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-xl border border-rose-400/40 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
            disabled={!canSubmit || isSubmitting || isLeadSubmissionAvailable !== true}
          className="mt-6 w-full text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-5 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#9a6347] disabled:cursor-not-allowed disabled:bg-[#c9c4bc] disabled:text-[#8a8a8a]"
        >
          {isSubmitting ? '접수 중...' : '상담 신청 접수하기'}
        </button>
        <p className="text-[11px] leading-5 text-[#8a8a8a]">
          *당일 정책은 기기·요금제·가입 유형에 따라 달라지므로, 남겨주신 번호로 확인 후 안내드립니다.
        </p>
        </form>
      </MotionSection>
    </main>
  );
}
