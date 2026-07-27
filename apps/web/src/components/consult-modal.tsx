'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { buildApiUrl, isLeadSubmissionConfigured } from '@/lib/api';

type FormState = {
  name: string;
  phone: string;
  interestDevice: string;
  consultationType: string;
  preferredCarrier: string;
  contactTime: string;
};

const initialForm: FormState = {
  name: '',
  phone: '',
  interestDevice: '',
  consultationType: '',
  preferredCarrier: '',
  contactTime: '',
};

type ConsultModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  defaultInterestDevice?: string;
};

export function ConsultModal({
  isOpen,
  onCloseAction,
  defaultInterestDevice = '',
}: ConsultModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isLeadSubmissionAvailable, setIsLeadSubmissionAvailable] = useState<boolean | null>(null);

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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm({ ...initialForm, interestDevice: defaultInterestDevice });
      setServerMessage(null);
      setErrorMessage(null);
    }
  }, [defaultInterestDevice, isOpen]);

  useEffect(() => {
    setIsLeadSubmissionAvailable(isLeadSubmissionConfigured());
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCloseAction();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCloseAction]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 30);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const getFocusableElements = () => {
    if (!modalRef.current) {
      return [];
    }

    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const elements = getFocusableElements();
      if (!elements.length) {
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      const currentIndex = activeElement ? elements.indexOf(activeElement) : -1;
      const lastIndex = elements.length - 1;

      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? lastIndex
          : currentIndex - 1
        : currentIndex === -1 || currentIndex >= lastIndex
          ? 0
          : currentIndex + 1;

      event.preventDefault();
      elements[nextIndex]?.focus();
    };

    window.addEventListener('keydown', handleFocusTrap, true);
    return () => window.removeEventListener('keydown', handleFocusTrap, true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (!modalRef.current) {
        return;
      }

      const target = event.target as Node | null;
      if (target && !modalRef.current.contains(target)) {
        const elements = getFocusableElements();
        elements[0]?.focus();
      }
    };

    document.addEventListener('focusin', handleFocusIn, true);
    return () => document.removeEventListener('focusin', handleFocusIn, true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) {
      return;
    }

    const bodyChildren = Array.from(document.body.children) as HTMLElement[];
    const backdrop = bodyChildren.find(
      (element) =>
        element !== modalRef.current &&
        element.className.includes('fixed inset-0') &&
        element.className.includes('bg-black/50'),
    );

    const keepElements = new Set<HTMLElement>([modalRef.current]);
    if (backdrop) {
      keepElements.add(backdrop);
    }

    const hiddenElements: HTMLElement[] = [];

    for (const element of bodyChildren) {
      if (keepElements.has(element)) {
        continue;
      }

      element.setAttribute('data-consult-modal-hidden', 'true');
      element.setAttribute('aria-hidden', 'true');
      element.setAttribute('inert', '');
      hiddenElements.push(element);
    }

    return () => {
      for (const element of hiddenElements) {
        element.removeAttribute('aria-hidden');
        element.removeAttribute('inert');
        element.removeAttribute('data-consult-modal-hidden');
      }
    };
  }, [isOpen]);

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onCloseAction}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-modal-title"
            ref={modalRef}
            className="fixed inset-4 z-50 mx-auto my-auto flex max-h-[90vh] max-w-lg flex-col overflow-hidden rounded-2xl bg-[#faf9f7] shadow-2xl md:inset-auto md:top-1/2 md:left-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5e0d8] px-6 py-4">
              <h2 id="consult-modal-title" className="font-serif text-xl font-normal text-[#1a1a1a]">
                상담 신청 접수
              </h2>
              <button
                onClick={onCloseAction}
                className="rounded-full p-2 text-[#5a5a5a] transition-colors duration-300 hover:bg-[#e5e0d8] hover:text-[#1a1a1a]"
                aria-label="닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <p className="text-sm leading-7 text-[#5a5a5a]">
                  아래 정보를 남겨주시면 접수 후 확인 뒤 24시간 내 연락드립니다.
                </p>
                <p className="mt-2 text-[11px] leading-5 text-[#8a8a8a]">
                  가격·지원금은 고정으로 안내하지 않으며, 가입 조건을 확인한 뒤 당일 정책 기준으로 연락드립니다.
                </p>

                <div className="mt-6 space-y-5">
                  <label className="block text-sm text-[#5a5a5a]">
                    이름
                    <input
                      ref={firstInputRef}
                      name="name"
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-white px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
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
                      className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-white px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
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
                      className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-white px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
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
                        className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-white px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
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
                        className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-white px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
                        required
                      >
                        <option value="">선택하세요</option>
                        <option value="SKT">SKT</option>
                        <option value="KT">KT</option>
                        <option value="LGU+">LG U+</option>
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
                      className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-white px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
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
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#e5e0d8] px-6 py-4">
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isLeadSubmissionAvailable !== true}
                  className="w-full text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-5 py-4 transition-all duration-500 hover:bg-[#9a6347] disabled:cursor-not-allowed disabled:bg-[#c9c4bc] disabled:text-[#8a8a8a]"
                >
                  {isSubmitting ? '접수 중...' : '상담 신청 접수하기'}
                </button>
                {isLeadSubmissionAvailable === true ? (
                  <p className="mt-2 text-[11px] leading-5 text-[#8a8a8a]">
                    *당일 정책은 기기·요금제·가입 유형에 따라 달라지므로, 남겨주신 번호로 확인 후 안내드립니다.
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] leading-5 text-[#a45f3f]" role="status">
                    상담 접수 시스템을 준비 중입니다. 연결이 완료되면 이 화면에서 바로 접수할 수 있습니다.
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
