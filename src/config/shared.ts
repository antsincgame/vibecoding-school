import type { HeaderConfig } from '@vibecoding/shared';
import type { FooterConfig } from '../components/Footer';

export const schoolHeaderConfig: HeaderConfig = {
  logoText: 'VIBECODING',
  logoImage: '/logo.png',
  logoTo: '/',
  navLinks: [
    { to: '/', label: 'Главная' },
    { to: '/courses', label: 'Курсы' },
    { to: '/trial', label: 'Пробный урок' },
    { to: '/about', label: 'Преподаватели' },
    { to: '/q-a', label: 'FAQ' },
    { to: '/blog', label: 'Блог' },
    { to: '/history', label: 'История' },
  ],
  telegramLink: 'https://t.me/vibecodingby',
  youtubeLink: 'https://www.youtube.com/@vibecodingby',
  loginPath: '/student/login',
  profilePath: '/student/dashboard',
  extraLinks: [
    {
      to: '/teacher',
      label: 'Работы учеников',
      style: {
        background: 'rgba(57, 255, 20, 0.1)',
        padding: '8px 16px',
        borderRadius: '4px',
        border: '1px solid var(--neon-green)',
      },
    },
    {
      to: '/admin',
      label: 'Админка',
      style: {
        background: 'rgba(255, 87, 51, 0.1)',
        padding: '8px 16px',
        borderRadius: '4px',
        border: '1px solid #ff5733',
      },
    },
  ],
};

export const schoolFooterConfig: FooterConfig = {
  brandName: 'Vibecoding',
  brandDescription: 'Школа программирования для подростков и взрослых, обучение веб разработки, веб приложений',
  showBlogArticles: true,
  contacts: {
    address: 'ул. Краснопартизанская 55-2, каб.29',
    addressUrl: 'https://yandex.by/maps/-/CLDYuCZU',
    phone: '+375 (29) 282-88-78',
    email: 'info@vibecoding.by',
    telegramUrl: 'https://t.me/vibecodingby',
    telegramLabel: 'Telegram',
    youtubeUrl: 'https://www.youtube.com/@vibecodingby',
  },
  copyrightText: '© 2025 Vibecoding. Все права защищены.',
  copyrightLinks: [
    { label: 'Политика конфиденциальности', to: '/privacy' },
    { label: 'Публичная оферта', to: '/offer' },
  ],
  legalText: 'Деятельность ведет Орлов Дмитрий Дмитриевич, УНП: НА8252796',
  loginPath: '/login',
};
