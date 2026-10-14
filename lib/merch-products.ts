export type MerchProduct = {
  id: string
  name: string
  price: number
  image: string
  colors: string[]
  category: string
  fit: string
  shortDescription: string
}

export const merchProducts: MerchProduct[] = [
  {
    id: "repchess-merch-08",
    name: "Футболка белая I Hate Chess Classic",
    price: 3500,
    image: "/merch/repchess-merch-08.jpg",
    colors: ["Белый"],
    category: "Футболка",
    fit: "оверсайз",
    shortDescription: "Белая футболка с синим принтом I Hate Chess. Классическая версия клубной иронии.",
  },
  {
    id: "repchess-merch-09",
    name: "Футболка графитовая Я ненавижу шахматы",
    price: 3500,
    image: "/merch/repchess-merch-09.jpg",
    colors: ["Графит"],
    category: "Футболка",
    fit: "оверсайз",
    shortDescription: "Графитовая футболка с надписью «Я ненавижу шахматы». Для тех, кому знакомо это чувство после зевка.",
  },
  {
    id: "repchess-merch-10",
    name: "Футболка красная I Hate Chess",
    price: 3500,
    image: "/merch/repchess-merch-10.jpg",
    colors: ["Красный"],
    category: "Футболка",
    fit: "оверсайз",
    shortDescription: "Красная футболка с контрастной надписью I Hate Chess. Та же шахматная ирония, только заметнее.",
  },
]
