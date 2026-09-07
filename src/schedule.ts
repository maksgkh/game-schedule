import { RegularEvent, SpecialEvent } from "./types";

// Обычные события — просто список по времени
export const REGULAR_EVENTS: RegularEvent[] = [
  { id: "d1", name: "Дроп", time: "00:00", color: "#7c5cfc" },
  { id: "t1", name: "Тайники", time: "02:00", color: "#4a90e2" },
  { id: "d2", name: "Дроп", time: "04:00", color: "#7c5cfc" },
  { id: "t2", name: "Тайники", time: "06:00", color: "#4a90e2" },
  { id: "d3", name: "Дроп", time: "08:00", color: "#7c5cfc" },
  { id: "t3", name: "Тайники", time: "10:00", color: "#4a90e2" },
  { id: "dl1", name: "Дилеры", time: "10:45", color: "#e04060" },
  { id: "d4", name: "Дроп", time: "12:00", color: "#7c5cfc" },
  { id: "t4", name: "Тайники", time: "14:00", color: "#4a90e2" },
  { id: "c1", name: "Цеха", time: "14:45", color: "#f5a623" },
  { id: "d5", name: "Дроп", time: "16:00", color: "#7c5cfc" },
  { id: "t5", name: "Тайники", time: "18:00", color: "#4a90e2" },
  { id: "dl2", name: "Дилеры", time: "18:45", color: "#e04060" },
  { id: "d6", name: "Дроп", time: "20:00", color: "#7c5cfc" },
  { id: "t6", name: "Тайники", time: "22:00", color: "#4a90e2" },
  { id: "c2", name: "Цеха", time: "22:45", color: "#f5a623" },
];

// Особые события — с условиями подсветки
export const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    id: "gov",
    name: "Поставки гос.организаций",
    description: "Поставка материалов 15:00–22:30",
    color: "#50c878",
    timeRange: { start: "15:00", end: "22:30" },
    highlightRange: { start: "15:00", end: "16:00" }, // безопасный час
  },
  {
    id: "smuggle",
    name: "Контрабанда",
    description: "На 30-й минуте каждого часа",
    color: "#ff6b6b",
    minuteMark: 30,
  },
  {
    id: "island",
    name: "Нападение на Остров / Форт-Занкудо",
    description: "16:00–23:00",
    color: "#95e1d3",
    timeRange: { start: "16:00", end: "23:00" },
    subEvents: [
      { name: "Остров", days: [2, 4, 0] },       // вт, чт, вс
      { name: "Форт-Занкудо", days: [1, 3, 5, 6] }, // пн, ср, пт, сб
    ],
  },
  {
    id: "captures",
    name: "Капты",
    description: "15:00–21:00",
    color: "#c44569",
    timeRange: { start: "15:00", end: "21:00" },
    days: [1, 3, 5, 6], // пн, ср, пт, сб
  },
];