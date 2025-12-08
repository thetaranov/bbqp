import { DetailItem } from './types';

export const NAV_LINKS = [
  { name: "Особенности", href: "#features" },
  { name: "Автоподдув", href: "#autodraft" },
  { name: "Детали", href: "#details" },
  { name: "Персонализация", href: "#personalize" },
  { name: "Военная серия", href: "#military" },
  { name: "Конфигуратор", href: "#models" },
  { name: "Контакты", href: "#contact" },
];

export const DETAILS_ITEMS: DetailItem[] = [
  {
    id: 1,
    title: "Индикация температуры",
    description: "Встроенный высокоточный термометр. Полный контроль температуры внутри камеры для идеального результата.",
    image: "/assets/images/termo.png" 
  },
  {
    id: 2,
    title: "Удобное перемещение",
    description: "Плавные колесики. Перемещайте печь-мангал без усилий по любой поверхности.",
    image: "/assets/images/wheel.png" 
  },
  {
    id: 3,
    title: "Дозация поддува",
    description: "Регулируемая перегородка. Полный контроль интенсивности горения для идеального результата.",
    image: "/assets/images/turbo.png" 
  },
  {
    id: 4,
    title: "Лаконичный дизайн",
    description: "Эстетика в каждой линии. Идеально вписывается в любой ландшафт.",
    image: "/assets/images/design.png"
  },
  {
    id: 5,
    title: "Модульная система",
    description: "Легкость сборки и модификации под ваши задачи.",
    image: "/assets/images/modular.png"
  },
  {
    id: 6,
    title: "Надежность",
    description: "Прочная конструкция, рассчитанная на годы службы.",
    image: "/assets/images/reliability.png"
  },
  {
    id: 7,
    title: "Качественные материалы",
    description: "Использование стали высокого класса для максимальной долговечности.",
    image: "/assets/images/steel.png"
  }
];

// Список всех изображений для фоновой сетки
export const BACKGROUND_IMAGES = [
    "/assets/images/design.png",
    "/assets/images/military-bg.png",
    "/assets/images/model-preview.png",
    "/assets/images/modular.png",
    "/assets/images/partition-mechanism.png",
    "/assets/images/reliability.png",
    "/assets/images/steel.png",
    "/assets/images/termo.png",
    "/assets/images/turbo.png",
    "/assets/images/wheel.png",
    "/assets/images/photo1.png", 
    "/assets/images/photo2.png",  
    "/assets/images/photo3.png",  
    "/assets/images/photo4.png",
    "/assets/images/photo5.png",
    "/assets/images/photo6.png",
    "/assets/images/photo7.png",
    "/assets/images/photo8.png",
    "/assets/images/photo9.png",
    "/assets/images/photo10.png",
    "/assets/images/photo11.png",
    "/assets/images/photo12.png",
    "/assets/images/photo13.png",
    "/assets/images/photo14.png",
    "/assets/images/photo15.png",
    "/assets/images/photo16.png"
];