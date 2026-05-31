import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PackageType, PACKAGES } from "@/lib/packages";

export interface BasketItem {
  raffleId:    string;
  raffleName:  string;
  packageType: PackageType;
  quantity:    number;
}

interface BasketStore {
  items:      BasketItem[];
  isOpen:     boolean;
  addItem:    (item: Omit<BasketItem, "quantity">) => void;
  removeItem: (raffleId: string, packageType: PackageType) => void;
  updateQty:  (raffleId: string, packageType: PackageType, quantity: number) => void;
  clearBasket:() => void;
  openBasket: () => void;
  closeBasket:() => void;
  totalTickets: () => number;
  totalPrice:   () => number;
}

export const useBasket = create<BasketStore>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      addItem(incoming) {
        set((state) => {
          const exists = state.items.find(
            (i) => i.raffleId === incoming.raffleId && i.packageType === incoming.packageType
          );
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.raffleId === incoming.raffleId && i.packageType === incoming.packageType
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...incoming, quantity: 1 }], isOpen: true };
        });
      },

      removeItem(raffleId, packageType) {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.raffleId === raffleId && i.packageType === packageType)
          ),
        }));
      },

      updateQty(raffleId, packageType, quantity) {
        if (quantity < 1) {
          get().removeItem(raffleId, packageType);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.raffleId === raffleId && i.packageType === packageType ? { ...i, quantity } : i
          ),
        }));
      },

      clearBasket: () => set({ items: [] }),
      openBasket:  () => set({ isOpen: true }),
      closeBasket: () => set({ isOpen: false }),

      totalTickets: () =>
        get().items.reduce(
          (sum, item) => sum + PACKAGES[item.packageType].total * item.quantity,
          0
        ),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + PACKAGES[item.packageType].price * item.quantity,
          0
        ),
    }),
    { name: "raffle-rumble-basket" }
  )
);
