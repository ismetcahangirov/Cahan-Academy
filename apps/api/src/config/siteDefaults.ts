/**
 * Values the site starts from (and falls back to while the site_settings row is missing). They are the copy the
 * site shipped with; the owner replaces them in the admin panel (Site details). Also used by scripts/migrate.ts
 * to seed the first row and the first testimonials.
 */
export type L3 = { az: string; en: string; ru: string };

export interface ContactSettings {
  phone: string;
  email: string;
  address: L3;
  hours: L3;
  social: { instagram: string; facebook: string; youtube: string };
}

export const DEFAULT_CONTACT: ContactSettings = {
  phone: '+994 50 123 45 67',
  email: 'info@cahanacademy.az',
  address: {
    az: 'Bakı şəhəri, Nizami küç. 12',
    en: '12 Nizami St., Baku',
    ru: 'Баку, ул. Низами, 12',
  },
  hours: {
    az: 'Bazar ertəsi – Şənbə: 09:00 – 18:00\nBazar: istirahət günü',
    en: 'Monday – Saturday: 09:00 – 18:00\nSunday: closed',
    ru: 'Понедельник – суббота: 09:00 – 18:00\nВоскресенье: выходной',
  },
  social: {
    instagram: 'https://instagram.com/cahanacademy',
    facebook: 'https://facebook.com/cahanacademy',
    youtube: 'https://youtube.com/@cahanacademy',
  },
};

export const DEFAULT_TESTIMONIALS = [
  {
    name: 'Aysel Məmmədova',
    role: 'Front-end Developer @ Kapital Bank',
    text: 'Cahan Academy-dən əvvəl proqramlaşdırma haqqında heç bir bilgim yox idi. Yalnız 6 ayda ilk işimi tapdım. Müəllimlər həmişə əlçatan idi, praktiki tapşırıqlar isə real işdə lazım olan hər şeyi öyrətdi.',
    rating: 5,
    order: 1,
  },
  {
    name: 'Rauf Hüseynov',
    role: 'UI/UX Designer @ Pashabank',
    text: 'Dizayn kursunu bitirdikdən sonra portfolio hazırladım və 2 ay içərisində tam zamanlı dizayner kimi işə başladım. Müəllim Nicat müəllim hər dərsi çox peşəkar aparırdı.',
    rating: 5,
    order: 2,
  },
  {
    name: 'Leyla Əliyeva',
    role: 'Digital Marketing Specialist',
    text: 'Rəqəmsal marketinq kursunda öyrəndiklərimi dərhal öz biznesimə tətbiq etdim. 3 ay ərzində sosial media hesablarım 10 dəfə böyüdü. Çox tövsiyyə edirəm!',
    rating: 5,
    order: 3,
  },
  {
    name: 'Orxan Quliyev',
    role: 'Back-end Developer @ ABB',
    text: 'Kurs materialları çox strukturlaşdırılmış idi. Hər mövzu üzrə praktiki layihə var idi. İndi tam zamanlı developer kimi işləyirəm. Cahan Academy həyatımı dəyişdi.',
    rating: 5,
    order: 4,
  },
];
