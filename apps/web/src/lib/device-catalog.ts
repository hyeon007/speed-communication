export type Device = {
  slug: string;
  name: string;
  highlight: string;
  imageUrl?: string;
  sourcePage: string;
  description?: string;
  colors?: string[];
  storageOptions?: string[];
  highlights?: string[];
};

type StaticDevice = Omit<Device, 'slug'>;

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function withSlugs(devices: StaticDevice[]): Device[] {
  return devices.map((device) => ({
    ...device,
    slug: createSlug(device.name),
  }));
}

export const appleDevices: Device[] = withSlugs([
  {
    name: 'iPhone 18 Pro',
    highlight: '최신 프로 성능·카메라 라인',
    sourcePage: 'https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/',
  },
  {
    name: 'iPhone 18 Pro Max',
    highlight: '최상위 대화면 프로 라인',
    sourcePage: 'https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/',
  },
  {
    name: 'iPhone 17 Pro',
    highlight: '직전 세대 프로 라인',
    imageUrl: '/images/devices/iphone-17-pro.png',
    sourcePage: 'https://www.apple.com/kr/iphone-17-pro/',
  },
  {
    name: 'iPhone 17 Pro Max',
    highlight: '직전 세대 대화면 프로 라인',
    imageUrl: '/images/devices/iphone-17-pro.png',
    sourcePage: 'https://www.apple.com/kr/iphone-17-pro/',
  },
  {
    name: 'iPhone 17',
    highlight: '기본형 밸런스 모델',
    imageUrl: '/images/devices/iphone-17.png',
    sourcePage: 'https://www.apple.com/kr/iphone-17/',
  },
  {
    name: 'iPhone Air',
    highlight: '경량·슬림 지향 라인',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/kr/iphone/',
  },
  {
    name: 'iPhone 17e',
    highlight: '실속형 라인업',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/kr/iphone/',
  },
]);

export const galaxyDevices: Device[] = withSlugs([
  {
    name: 'Galaxy Z Fold8 Ultra',
    highlight: '최신 대화면 폴더블',
    sourcePage:
      'https://www.samsungmobilepress.com/articles/first-look-galaxy-z-fold8-ultra-galaxy-z-fold8-galaxy-z-flip8',
  },
  {
    name: 'Galaxy Z Fold8',
    highlight: '최신 폴더블 멀티태스킹',
    sourcePage:
      'https://www.samsungmobilepress.com/articles/first-look-galaxy-z-fold8-ultra-galaxy-z-fold8-galaxy-z-flip8',
  },
  {
    name: 'Galaxy Z Flip8',
    highlight: '최신 컴팩트 폴더블',
    sourcePage:
      'https://www.samsungmobilepress.com/articles/first-look-galaxy-z-fold8-ultra-galaxy-z-fold8-galaxy-z-flip8',
  },
  {
    name: 'Galaxy S26 Ultra',
    highlight: '울트라 플래그십',
    imageUrl: '/images/devices/galaxy-s26-ultra.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy S26+',
    highlight: '대화면 플래그십',
    imageUrl: '/images/devices/galaxy-s26-plus.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy S26',
    highlight: '기본형 플래그십',
    imageUrl: '/images/devices/galaxy-s26.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy Z Flip7 FE',
    highlight: '실속형 폴더블',
    imageUrl: '/images/devices/galaxy-z-flip7-fe.jpg',
    sourcePage: 'https://www.samsung.com/sec/smartphones/galaxy-z-flip7-fe/',
  },
  {
    name: 'Galaxy Z TriFold',
    highlight: '트라이폴드 폼팩터',
    imageUrl: '/images/devices/galaxy-z-trifold.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-introducing-galaxy-z-trifold-shape-whats-next-mobile-innovation',
  },
  {
    name: 'Galaxy A37',
    highlight: '보급형 · 통신 3사 공통',
    sourcePage: '#',
  },
  {
    name: 'Galaxy Quantum7',
    highlight: '보급형 · SKT 전용 (Galaxy A57 기반)',
    sourcePage: '#',
  },
  {
    name: 'Galaxy Jump5',
    highlight: '보급형 · KT 전용 (Galaxy A27 기반)',
    sourcePage: '#',
  },
  {
    name: 'Galaxy Buddy5',
    highlight: '보급형 · LG U+ 전용 (Galaxy A17 기반)',
    sourcePage: '#',
  },
]);

export const allDevices = [...appleDevices, ...galaxyDevices];

export function findDevice(slug: string): Device | undefined {
  return allDevices.find((device) => device.slug === slug);
}
