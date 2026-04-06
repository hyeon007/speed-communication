import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { ConsultModalProvider } from '@/components/consult-modal-provider';
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | 프리미엄 휴대폰 상담`,
    template: `%s | ${siteConfig.name}`,
  },
  description: 'PG 없이 빠르게 연결되는 프리미엄 휴대폰 상담 플랫폼. 기기 추천, 요금 최적화, 전문가 상담으로 가장 유리한 조건을 찾아드립니다.',
  keywords: [
    '휴대폰 상담',
    '요금제 비교',
    '기기 추천',
    '프리미엄 휴대폰',
    '통신 상담',
    '개통 서비스',
    '요금 최적화',
    siteConfig.name,
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: siteConfig.name,
    title: `${siteConfig.name} | 프리미엄 휴대폰 상담`,
    description: 'PG 없이 빠르게 연결되는 프리미엄 휴대폰 상담 플랫폼. 기기 추천, 요금 최적화, 전문가 상담으로 가장 유리한 조건을 찾아드립니다.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - 프리미엄 휴대폰 상담`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | 프리미엄 휴대폰 상담`,
    description: 'PG 없이 빠르게 연결되는 프리미엄 휴대폰 상담 플랫폼. 기기 추천, 요금 최적화, 전문가 상담으로 가장 유리한 조건을 찾아드립니다.',
    images: ['/og-image.png'],
    creator: '@speed_comm',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConsultModalProvider>{children}</ConsultModalProvider>
        <footer className="mx-auto mt-auto w-full max-w-6xl px-6 pb-12 pt-8 text-xs tracking-widest text-[#8a8a8a] md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e5e0d8] pt-6">
            <p className="font-light">© {new Date().getFullYear()} {siteConfig.name}</p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/faq" className="hover:text-[#1a1a1a] transition-colors duration-500">
                FAQ
              </Link>
              <Link href="/privacy" className="hover:text-[#1a1a1a] transition-colors duration-500">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="hover:text-[#1a1a1a] transition-colors duration-500">
                이용약관
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
