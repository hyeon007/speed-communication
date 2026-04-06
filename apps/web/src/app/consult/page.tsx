'use client';

import { FormEvent, useMemo, useState } from 'react';
import { MotionSection } from '@/components/motion-presets';
import { buildApiUrl } from '@/lib/api';

type FormState = {
  name: string;
  phone: string;
  interestDevice: string;
  contactTime: string;
};

const initialForm: FormState = {
  name: '',
  phone: '',
  interestDevice: '',
  contactTime: '',
};

export default function ConsultPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      /^01[0-9]-?\d{3,4}-?\d{4}$/.test(form.phone.trim()) &&
      form.interestDevice.trim().length >= 2 &&
      form.contactTime.trim().length >= 2
    );
  }, [form]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
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
        setErrorMessage(payload.message ?? '상담 신청 처리 중 오류가 발생했습니다.');
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
        <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1a1a] md:text-4xl">무료 상담 신청</h1>
        <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">아래 정보만 남겨주시면 24시간 내 연락드립니다.</p>
        <p className="mt-3 text-xs leading-6 text-[#8a8a8a]">
          최대 50만원 상당 지원 혜택은 가입 조건에 따라 달라질 수 있으며, 자세한 기준은 상담 시 안내됩니다.
        </p>
      </MotionSection>

      <MotionSection delay={0.06}>
        <form
          onSubmit={handleSubmit}
          className="mt-24 space-y-5 border-t border-[#e5e0d8] pt-8"
        >
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
          disabled={!canSubmit || isSubmitting}
          className="mt-6 w-full text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-5 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#9a6347] disabled:cursor-not-allowed disabled:bg-[#c9c4bc] disabled:text-[#8a8a8a]"
        >
          {isSubmitting ? '접수 중...' : '상담 신청하기'}
        </button>
        <p className="text-[11px] leading-5 text-[#8a8a8a]">
          *지원 혜택은 요금제·약정기간·번호이동 여부·제휴조건 등에 따라 상이합니다.
        </p>
        </form>
      </MotionSection>
    </main>
  );
}
