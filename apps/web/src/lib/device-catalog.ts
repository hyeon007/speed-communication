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
    name: 'iPhone 17 Pro',
    highlight: '최신 프로 성능·카메라 라인',
    imageUrl: '/images/devices/iphone-17-pro.png',
    sourcePage: 'https://www.apple.com/kr/iphone-17-pro/',
  },
  {
    name: 'iPhone 17 Pro Max',
    highlight: '최상위 대화면 프로 라인',
    imageUrl: '/images/devices/iphone-17-pro.png',
    sourcePage: 'https://www.apple.com/kr/iphone-17-pro/',
  },
  {
    name: 'iPhone 17',
    highlight: '최신 기본형 밸런스 모델',
    imageUrl: '/images/devices/iphone-17.png',
    sourcePage: 'https://www.apple.com/kr/iphone-17/',
  },
  {
    name: 'iPhone Air',
    highlight: '경량·슬림 지향 신형 라인',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/kr/iphone/',
  },
  {
    name: 'iPhone 17e',
    highlight: '최신 실속형 라인업',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/kr/iphone/',
  },
  {
    name: 'iPhone 16',
    highlight: '신형 밸런스 모델',
    imageUrl: '/images/devices/iphone-16.jpg',
    sourcePage: 'https://www.apple.com/shop/buy-iphone/iphone-16',
  },
  {
    name: 'iPhone 16 Plus',
    highlight: '대화면 신형 라인업',
    imageUrl: '/images/devices/iphone-16.jpg',
    sourcePage: 'https://www.apple.com/shop/buy-iphone/iphone-16',
  },
  {
    name: 'iPhone 16 Pro',
    highlight: '프로 성능·카메라 강화',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/iphone/',
  },
  {
    name: 'iPhone 16 Pro Max',
    highlight: '최상위 프로 라인업',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/iphone/',
  },
  {
    name: 'iPhone 15',
    highlight: '검증된 퍼포먼스 세대',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/kr/iphone/',
  },
  {
    name: 'iPhone 15 Plus',
    highlight: '대화면·배터리 지향',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/kr/iphone/',
  },
  {
    name: 'iPhone 15 Pro',
    highlight: '티타늄 세대 프로',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/kr/iphone/',
  },
  {
    name: 'iPhone 15 Pro Max',
    highlight: '프로 맥스 카메라 강점',
    imageUrl: '/images/devices/iphone-home-og.png',
    sourcePage: 'https://www.apple.com/kr/iphone/',
  },
  {
    name: 'iPhone 14',
    highlight: '일상형 밸런스 모델',
    imageUrl: '/images/devices/iphone-14.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2022/09/apple-introduces-iphone-14-and-iphone-14-plus/',
  },
  {
    name: 'iPhone 14 Plus',
    highlight: '대화면·긴 배터리 지향',
    imageUrl: '/images/devices/iphone-14.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2022/09/apple-introduces-iphone-14-and-iphone-14-plus/',
  },
  {
    name: 'iPhone 14 Pro',
    highlight: '프로 라인 카메라/성능',
    imageUrl: '/images/devices/iphone-14-pro.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2022/09/apple-debuts-iphone-14-pro-and-iphone-14-pro-max/',
  },
  {
    name: 'iPhone 14 Pro Max',
    highlight: '최상위 대화면 프로',
    imageUrl: '/images/devices/iphone-14-pro.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2022/09/apple-debuts-iphone-14-pro-and-iphone-14-pro-max/',
  },
]);

export const galaxyDevices: Device[] = withSlugs([
  {
    name: 'Galaxy S26 Ultra',
    highlight: '최신 울트라 플래그십',
    imageUrl: '/images/devices/galaxy-s26-ultra.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy S26+',
    highlight: '최신 대화면 플래그십',
    imageUrl: '/images/devices/galaxy-s26-plus.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy S26',
    highlight: '최신 기본형 플래그십',
    imageUrl: '/images/devices/galaxy-s26.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy Z Fold7',
    highlight: '최신 폴더블 멀티태스킹',
    imageUrl: '/images/devices/galaxy-z-fold7.jpg',
    sourcePage:
      'https://news.samsung.com/global/samsung-launches-galaxy-z-fold7-galaxy-z-flip7-and-galaxy-watch8-series-globally-starting-today',
  },
  {
    name: 'Galaxy Z Flip7',
    highlight: '최신 컴팩트 폴더블',
    imageUrl: '/images/devices/galaxy-z-flip7.jpg',
    sourcePage:
      'https://news.samsung.com/global/samsung-launches-galaxy-z-fold7-galaxy-z-flip7-and-galaxy-watch8-series-globally-starting-today',
  },
  {
    name: 'Galaxy Z Flip7 FE',
    highlight: '최신 FE 폴더블 라인',
    imageUrl: '/images/devices/galaxy-z-flip7-fe.jpg',
    sourcePage: 'https://www.samsung.com/sec/smartphones/galaxy-z-flip7-fe/',
  },
  {
    name: 'Galaxy Z TriFold',
    highlight: '신규 트라이폴드 폼팩터',
    imageUrl: '/images/devices/galaxy-z-trifold.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-introducing-galaxy-z-trifold-shape-whats-next-mobile-innovation',
  },
]);

export const fallbackDevices = [...appleDevices, ...galaxyDevices];

export function findFallbackDevice(slug: string): Device | undefined {
  return fallbackDevices.find((device) => device.slug === slug);
}
