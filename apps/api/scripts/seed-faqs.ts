import { db } from '../src/config/db.js';
import { faqs } from '../src/schemas/faq.schema.js';

const faqData = [
  {
    question: {
      az: "Cahan Academy nədir?",
      en: "What is Cahan Academy?",
      ru: "Что такое Cahan Academy?"
    },
    answer: {
      az: "Cahan Academy müasir texnologiyalar və fərdi inkişaf sahəsində peşəkar təlimlər təklif edən tədris mərkəzidir.",
      en: "Cahan Academy is an educational center offering professional training in modern technologies and personal development.",
      ru: "Cahan Academy — это образовательный центр, предлагающий профессиональное обучение современным технологиям и личностному развитию."
    },
    order: 1
  },
  {
    question: {
      az: "Kurslar hansı formatda keçirilir?",
      en: "What is the format of the courses?",
      ru: "В каком формате проходят курсы?"
    },
    answer: {
      az: "Kurslarımız həm əyani (ofis şəraitində), həm də onlayn formatda keçirilir.",
      en: "Our courses are held both in-person (in the office) and online.",
      ru: "Наши курсы проводятся как очно (в офисе), так и в онлайн-формате."
    },
    order: 2
  },
  {
    question: {
      az: "Dərslər nə vaxt başlayır?",
      en: "When do the classes start?",
      ru: "Когда начинаются занятия?"
    },
    answer: {
      az: "Qruplar dolduqca dərslərə start verilir. Adətən hər ay yeni qruplarımız açılır.",
      en: "Classes start as groups are filled. Usually, new groups open every month.",
      ru: "Занятия начинаются по мере комплектования групп. Обычно новые группы открываются каждый месяц."
    },
    order: 3
  },
  {
    question: {
      az: "Sertifikat verilirmi?",
      en: "Is a certificate provided?",
      ru: "Выдается ли сертификат?"
    },
    answer: {
      az: "Bəli, kursu uğurla bitirən hər bir tələbəyə rəsmi sertifikat təqdim olunur.",
      en: "Yes, every student who successfully completes the course is presented with an official certificate.",
      ru: "Да, каждому студенту, успешно окончившему курс, выдается официальный сертификат."
    },
    order: 4
  },
  {
    question: {
      az: "Ödəniş şərtləri necədir?",
      en: "What are the payment terms?",
      ru: "Каковы условия оплаты?"
    },
    answer: {
      az: "Ödənişləri həm birdəfəlik, həm də aylıq hissə-hissə ödəməklə həyata keçirə bilərsiniz.",
      en: "You can make payments both in a lump sum and in monthly installments.",
      ru: "Вы можете производить оплату как единовременно, так и ежемесячными платежами."
    },
    order: 5
  }
];

async function seed() {
  console.log('🌱 Seeding FAQs...');
  try {
    await db.insert(faqs).values(faqData);
    console.log('✅ FAQs seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
  } finally {
    process.exit();
  }
}

seed();
