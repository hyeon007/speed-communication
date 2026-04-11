'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminFetch,
  clearAdminSession,
  clearAdminToken,
  hasAdminSession,
} from '@/lib/admin-auth';

function toMessage(input: unknown): string {
  if (Array.isArray(input)) {
    return input.join(', ');
  }

  if (typeof input === 'string') {
    return input;
  }

  return '로그인 처리 중 오류가 발생했습니다.';
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('change-me-please');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void hasAdminSession().then((authenticated) => {
      if (!isMounted) {
        return;
      }

      if (authenticated) {
        router.replace('/admin/leads');
        return;
      }

      clearAdminToken();
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminFetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json()) as {
        message?: unknown;
      };

      if (!response.ok) {
        await clearAdminSession();
        setErrorMessage(toMessage(payload.message));
        return;
      }

      clearAdminToken();
      router.push('/admin/leads');
    } catch {
      setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
      <section className="border-t border-[#e5e0d8] p-8">
        <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1a1a]">관리자 로그인</h1>
        <p className="mt-6 text-sm leading-7 text-[#5a5a5a]">관리자 문의 목록을 확인하려면 로그인하세요.</p>
        <p className="mt-2 text-xs text-[#8a8a8a]">
          기본 계정: 편집(admin / change-me-please), 읽기 전용(viewer / change-me-viewer)
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm text-[#5a5a5a]">
            아이디
            <input
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              required
            />
          </label>

          <label className="block text-sm text-[#5a5a5a]">
            비밀번호
            <input
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e5e0d8] bg-[#faf9f7] px-4 py-3 text-[#1a1a1a] outline-none ring-[#c17f59] focus:ring"
              required
            />
          </label>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-400/40 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-xs tracking-[0.15em] uppercase text-[#faf9f7] bg-[#c17f59] px-5 py-4 transition-all duration-500 hover:bg-[#9a6347] disabled:cursor-not-allowed disabled:bg-[#c9c4bc] disabled:text-[#8a8a8a]"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </section>
    </main>
  );
}
