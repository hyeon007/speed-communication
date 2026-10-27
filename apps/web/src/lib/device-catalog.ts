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
    imageUrl: '/images/devices/iphone-18-pro.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/',
  },
  {
    name: 'iPhone 18 Pro Max',
    highlight: '최상위 대화면 프로 라인',
    imageUrl: '/images/devices/iphone-18-pro.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/',
  },
  {
    name: 'iPhone Duo',
    highlight: '애플 첫 폴더블',
    imageUrl: '/images/devices/iphone-duo.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/',
    colors: ['스타 화이트', '나이트 스카이'],
    storageOptions: ['256GB', '512GB', '1TB', '2TB'],
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
    imageUrl: '/images/devices/iphone-air.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2025/09/introducing-iphone-air-a-powerful-new-iphone-with-a-breakthrough-design/',
  },
  {
    name: 'iPhone 17e',
    highlight: '실속형 라인업',
    imageUrl: '/images/devices/iphone-17e.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2026/03/apple-introduces-iphone-17e/',
    storageOptions: ['256GB', '512GB'],
  },
]);

const FOLD8_SOURCE =
  'https://news.samsung.com/global/samsung-galaxy-z-fold8-ultra-fold8-and-flip8foldables-perfected-for-every-way-of-living';

export const galaxyDevices: Device[] = withSlugs([
  {
    name: 'Galaxy Z Fold8 Ultra',
    highlight: '최신 대화면 폴더블',
    imageUrl: '/images/devices/galaxy-z-fold8-ultra.jpg',
    sourcePage: FOLD8_SOURCE,
  },
  {
    name: 'Galaxy Z Fold8',
    highlight: '최신 폴더블 멀티태스킹',
    imageUrl: '/images/devices/galaxy-z-fold8.jpg',
    sourcePage: FOLD8_SOURCE,
  },
  {
    name: 'Galaxy Z Flip8',
    highlight: '최신 컴팩트 폴더블',
    imageUrl: '/images/devices/galaxy-z-flip8.jpg',
    sourcePage: FOLD8_SOURCE,
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
    name: 'Galaxy S26 FE',
    highlight: '플래그십 실속형',
    imageUrl: '/images/devices/galaxy-s26-fe.jpg',
    sourcePage:
      'https://news.samsung.com/global/samsung-galaxy-s26-fe-delivering-the-latest-flagship-experience-focused-on-what-matters-most',
    colors: ['블루베리', '그라파이트', '피스타치오'],
    storageOptions: ['256GB'],
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
    imageUrl: '/images/devices/galaxy-a37.jpg',
    sourcePage:
      'https://news.samsung.com/kr/%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90-%EA%B0%A4%EB%9F%AD%EC%8B%9C-a37-5g-%EA%B5%AD%EB%82%B4-%EC%B6%9C%EC%8B%9C',
    colors: ['어썸 라벤더', '어썸 화이트', '어썸 차콜'],
    storageOptions: ['128GB'],
  },
  {
    name: 'Galaxy Quantum7',
    highlight: '준플래그십 · SKT 전용',
    imageUrl: '/images/devices/galaxy-quantum7.jpg',
    sourcePage: 'https://news.sktelecom.com/229704',
    colors: ['어썸 그레이', '아이스블루', '라일락'],
  },
  {
    name: 'Galaxy Wide9',
    highlight: '보급형 · SKT 전용',
    imageUrl: '/images/devices/galaxy-wide9.jpg',
    sourcePage: 'https://news.sktelecom.com/227414',
  },
  {
    name: 'Galaxy Jump5',
    highlight: '보급형 · KT 전용 (Galaxy A27 기반)',
    // KT sells the Galaxy A27 5G under this name; image is Samsung's A27 5G press render.
    imageUrl: '/images/devices/galaxy-jump5.jpg',
    sourcePage: '#',
    colors: ['블랙', '라이트 그린', '라이트 핑크'],
  },
  {
    name: 'Galaxy Buddy5',
    highlight: '보급형 · LG U+ 전용 (Galaxy A17 기반)',
    // LG U+ sells the Galaxy A17 5G under this name; image is Samsung's A17 5G press render.
    imageUrl: '/images/devices/galaxy-buddy5.jpg',
    sourcePage: '#',
    colors: ['블랙', '블루', '그레이'],
  },
]);

export const allDevices = [...appleDevices, ...galaxyDevices];

export function findDevice(slug: string): Device | undefined {
  return allDevices.find((device) => device.slug === slug);
}
