export type Device = {
  name: string;
  highlight: string;
  imageUrl?: string;
  sourcePage: string;
};

export const appleDevices: Device[] = [
  {
    name: 'iPhone 17 Pro',
    highlight: '최신 프로 성능·카메라 라인',
    sourcePage: 'https://www.apple.com/iphone-17-pro/',
  },
  {
    name: 'iPhone 17 Pro Max',
    highlight: '최상위 대화면 프로 라인',
    sourcePage: 'https://www.apple.com/iphone-17-pro/',
  },
  {
    name: 'iPhone 17',
    highlight: '최신 기본형 밸런스 모델',
    sourcePage: 'https://www.apple.com/iphone-17/',
  },
  {
    name: 'iPhone Air',
    highlight: '경량·슬림 지향 신형 라인',
    sourcePage: 'https://www.apple.com/iphone-air/',
  },
  {
    name: 'iPhone 17e',
    highlight: '최신 실속형 라인업',
    sourcePage: 'https://www.apple.com/iphone-17e/',
  },
  {
    name: 'iPhone 16',
    highlight: '신형 밸런스 모델',
    imageUrl:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-model-unselect-gallery-1-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1723991997435',
    sourcePage: 'https://www.apple.com/shop/buy-iphone/iphone-16',
  },
  {
    name: 'iPhone 16 Plus',
    highlight: '대화면 신형 라인업',
    imageUrl:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-model-unselect-gallery-1-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1723991997435',
    sourcePage: 'https://www.apple.com/shop/buy-iphone/iphone-16',
  },
  {
    name: 'iPhone 16 Pro',
    highlight: '프로 성능·카메라 강화',
    imageUrl:
      'https://www.apple.com/v/iphone/home/cj/images/meta/iphone__bh930eyjnj0i_og.png?202603251025',
    sourcePage: 'https://www.apple.com/iphone/',
  },
  {
    name: 'iPhone 16 Pro Max',
    highlight: '최상위 프로 라인업',
    imageUrl:
      'https://www.apple.com/v/iphone/home/cj/images/meta/iphone__bh930eyjnj0i_og.png?202603251025',
    sourcePage: 'https://www.apple.com/iphone/',
  },
  {
    name: 'iPhone 15',
    highlight: '검증된 퍼포먼스 세대',
    sourcePage: 'https://www.apple.com/iphone/',
  },
  {
    name: 'iPhone 15 Plus',
    highlight: '대화면·배터리 지향',
    sourcePage: 'https://www.apple.com/iphone/',
  },
  {
    name: 'iPhone 15 Pro',
    highlight: '티타늄 세대 프로',
    sourcePage: 'https://www.apple.com/iphone/',
  },
  {
    name: 'iPhone 15 Pro Max',
    highlight: '프로 맥스 카메라 강점',
    sourcePage: 'https://www.apple.com/iphone/',
  },
  {
    name: 'iPhone 14',
    highlight: '일상형 밸런스 모델',
    imageUrl:
      'https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-iPhone-14-Plus-hero-220907.jpg.og.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2022/09/apple-introduces-iphone-14-and-iphone-14-plus/',
  },
  {
    name: 'iPhone 14 Plus',
    highlight: '대화면·긴 배터리 지향',
    imageUrl:
      'https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-iPhone-14-Plus-hero-220907.jpg.og.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2022/09/apple-introduces-iphone-14-and-iphone-14-plus/',
  },
  {
    name: 'iPhone 14 Pro',
    highlight: '프로 라인 카메라/성능',
    imageUrl:
      'https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-Pro-iPhone-14-Pro-Max-hero-220907.jpg.og.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2022/09/apple-debuts-iphone-14-pro-and-iphone-14-pro-max/',
  },
  {
    name: 'iPhone 14 Pro Max',
    highlight: '최상위 대화면 프로',
    imageUrl:
      'https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-Pro-iPhone-14-Pro-Max-hero-220907.jpg.og.jpg',
    sourcePage: 'https://www.apple.com/newsroom/2022/09/apple-debuts-iphone-14-pro-and-iphone-14-pro-max/',
  },
];

export const galaxyDevices: Device[] = [
  {
    name: 'Galaxy S26 Ultra',
    highlight: '최신 울트라 플래그십',
    imageUrl:
      'https://img.us.news.samsung.com/us/wp-content/uploads/2026/02/25143558/Galaxy-S26Ultra_Plus_S26_Hero-Color-Family-619x464.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy S26+',
    highlight: '최신 대화면 플래그십',
    imageUrl:
      'https://img.us.news.samsung.com/us/wp-content/uploads/2026/02/25143515/Galaxy-S26Plus_Family-scaled.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy S26',
    highlight: '최신 기본형 플래그십',
    imageUrl: 'https://img.us.news.samsung.com/us/wp-content/uploads/2026/02/25131245/Galaxy-S26_Family-scaled.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-unveils-galaxy-s26-series-most-intuitive-galaxy-ai-phone-yet',
  },
  {
    name: 'Galaxy Z Fold7',
    highlight: '최신 폴더블 멀티태스킹',
    imageUrl:
      'https://img.global.news.samsung.com/global/wp-content/uploads/2025/07/Samsung-Mobile-Galaxy-Unpacked-July-2025-Unboxing-Galaxy-Z-Fold7-Versatility-Thinnest-Lightest_thumb728.jpg',
    sourcePage:
      'https://news.samsung.com/global/samsung-launches-galaxy-z-fold7-galaxy-z-flip7-and-galaxy-watch8-series-globally-starting-today',
  },
  {
    name: 'Galaxy Z Flip7',
    highlight: '최신 컴팩트 폴더블',
    imageUrl:
      'https://img.global.news.samsung.com/global/wp-content/uploads/2025/07/Samsung-Mobile-Galaxy-Z-Flip-series-Galaxy-Z-Flip7-Unboxing_Thumb728.jpg',
    sourcePage:
      'https://news.samsung.com/global/samsung-launches-galaxy-z-fold7-galaxy-z-flip7-and-galaxy-watch8-series-globally-starting-today',
  },
  {
    name: 'Galaxy Z Flip7 FE',
    highlight: '최신 FE 폴더블 라인',
    sourcePage:
      'https://news.samsung.com/global/samsung-launches-galaxy-z-fold7-galaxy-z-flip7-and-galaxy-watch8-series-globally-starting-today',
  },
  {
    name: 'Galaxy Z TriFold',
    highlight: '신규 트라이폴드 폼팩터',
    imageUrl:
      'https://img.us.news.samsung.com/us/wp-content/uploads/2025/12/01163731/001-Introducing-Galaxy-Z-TriFold-The-Shape-of-Whats-Next-in-Mobile-Innovaion-Newsbody.jpg',
    sourcePage: 'https://news.samsung.com/us/samsung-introducing-galaxy-z-trifold-shape-whats-next-mobile-innovation',
  },
];
