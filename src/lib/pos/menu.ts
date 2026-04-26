import burger from "@/assets/burger.jpg";
import fries from "@/assets/fries.jpg";
import pizza from "@/assets/pizza.jpg";
import cola from "@/assets/cola.jpg";
import chickenSandwich from "@/assets/chicken-sandwich.jpg";
import nuggets from "@/assets/nuggets.jpg";
import milkshake from "@/assets/milkshake.jpg";
import salad from "@/assets/salad.jpg";
import hotdog from "@/assets/hotdog.jpg";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  image: string;
  category: "Burgers" | "Sides" | "Drinks" | "Combos";
};

export const MENU: MenuItem[] = [
  { id: "m1", name: "Classic Cheeseburger", price: 5.99, costPrice: 2.4, image: burger, category: "Burgers" },
  { id: "m2", name: "Crispy Chicken Sandwich", price: 6.49, costPrice: 2.6, image: chickenSandwich, category: "Burgers" },
  { id: "m3", name: "Loaded Hot Dog", price: 4.49, costPrice: 1.7, image: hotdog, category: "Burgers" },
  { id: "m4", name: "Pepperoni Pizza Slice", price: 4.99, costPrice: 1.9, image: pizza, category: "Combos" },
  { id: "m5", name: "Golden French Fries", price: 2.99, costPrice: 0.9, image: fries, category: "Sides" },
  { id: "m6", name: "Chicken Nuggets (8pc)", price: 5.49, costPrice: 2.1, image: nuggets, category: "Sides" },
  { id: "m7", name: "Garden Fresh Salad", price: 4.99, costPrice: 1.8, image: salad, category: "Sides" },
  { id: "m8", name: "Iced Cola", price: 1.99, costPrice: 0.5, image: cola, category: "Drinks" },
  { id: "m9", name: "Chocolate Milkshake", price: 3.99, costPrice: 1.3, image: milkshake, category: "Drinks" },
];

export const CATEGORIES = ["All", "Burgers", "Sides", "Drinks", "Combos"] as const;
export type Category = (typeof CATEGORIES)[number];

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
