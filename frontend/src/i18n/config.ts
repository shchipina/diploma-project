import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      home: 'Home',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',

      error404Title: 'Page Not Found',
      error404Message: 'Sorry, the page you are looking for does not exist.',
      error404Action: 'Go to Homepage',

      error500Title: 'Server Error',
      error500Message: 'Something went wrong on our end. Please try again later.',
      error500Action: 'Refresh Page',
      error500Report: 'Report Problem',

      errorBoundaryTitle: 'Oops, Something Went Wrong',
      errorBoundaryMessage: 'An unexpected error occurred. Please refresh the page.',
      errorBoundaryAction: 'Refresh',

      networkError: 'Network error. Please check your internet connection.',
      timeoutError: 'Request timeout. Please try again.',
      unknownError: 'An unexpected error occurred.',

      errorReportTitle: 'Report a Problem',
      errorReportDescription: 'Please describe what happened:',
      errorReportPlaceholder: 'What were you doing when the error occurred?',
      errorReportId: 'Error ID',
      errorReportTraceId: 'Trace ID',
      errorReportSubmit: 'Submit Report',
      errorReportCancel: 'Cancel',
      errorReportSuccess: 'Thank you! Your report has been submitted.',
      errorReportFailed: 'Failed to submit report. Please try again.',

      loading: 'Loading...',
      retry: 'Retry',
      close: 'Close',
      submit: 'Submit',
      cancel: 'Cancel',
    },
  },
  uk: {
    translation: {
      home: 'Головна',
      login: 'Вхід',
      register: 'Реєстрація',
      logout: 'Вийти',

      error404Title: 'Сторінку не знайдено',
      error404Message: 'Вибачте, сторінка, яку ви шукаєте, не існує.',
      error404Action: 'На головну',

      error500Title: 'Помилка сервера',
      error500Message: 'Щось пішло не так на нашій стороні. Будь ласка, спробуйте пізніше.',
      error500Action: 'Оновити сторінку',
      error500Report: 'Повідомити про проблему',

      errorBoundaryTitle: 'Ой, щось пішло не так',
      errorBoundaryMessage: 'Виникла непередбачена помилка. Будь ласка, оновіть сторінку.',
      errorBoundaryAction: 'Оновити',

      networkError: 'Помилка мережі. Перевірте підключення до інтернету.',
      timeoutError: 'Час очікування вичерпано. Спробуйте ще раз.',
      unknownError: 'Виникла непередбачена помилка.',

      errorReportTitle: 'Повідомити про проблему',
      errorReportDescription: 'Будь ласка, опишіть що сталося:',
      errorReportPlaceholder: 'Що ви робили, коли виникла помилка?',
      errorReportId: 'ID помилки',
      errorReportTraceId: 'ID відстеження',
      errorReportSubmit: 'Надіслати',
      errorReportCancel: 'Скасувати',
      errorReportSuccess: 'Дякуємо! Ваше повідомлення надіслано.',
      errorReportFailed: 'Не вдалося надіслати повідомлення. Спробуйте ще раз.',

      loading: 'Завантаження...',
      retry: 'Повторити',
      close: 'Закрити',
      submit: 'Відправити',
      cancel: 'Скасувати',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang: 'en' | 'uk') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('language', lang);
};

export const getCurrentLanguage = (): 'en' | 'uk' => {
  return (i18n.language as 'en' | 'uk') || 'en';
};

export default i18n;
