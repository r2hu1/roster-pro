"use client"
import type { MenuItemResponse } from "@workspace/shared/schemas/menu/menu-item/response"
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react"
import { useTableContext } from "./table-provider"

export type CartItemVariant = "half" | "full"

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  image: string | null
  variant: CartItemVariant
  quantity: number
  unitPrice: number
  notes: string | null
  prepTime: number | null
}

function loadCart(orgId: string): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(`cart-${orgId}`)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function saveCart(orgId: string, items: CartItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`cart-${orgId}`, JSON.stringify(items))
  } catch {
    /* noop */
  }
}

interface CartContextProps {
  items: CartItem[]
  addToCart: (
    item: MenuItemResponse,
    variant: CartItemVariant,
    quantity?: number,
    notes?: string
  ) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  estimateTime: number
}

const CartContext = createContext<CartContextProps | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: tableData } = useTableContext()
  const orgId = tableData?.organization.id

  const prevOrgId = useRef(orgId)
  const skipNextSave = useRef(false)

  const [items, setItems] = useState<CartItem[]>(() =>
    loadCart(orgId ?? "default")
  )

  useEffect(() => {
    if (!orgId) return
    if (prevOrgId.current !== orgId) {
      skipNextSave.current = true
      setItems(loadCart(orgId))
      prevOrgId.current = orgId
    }
  }, [orgId])

  useEffect(() => {
    if (!orgId) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    saveCart(orgId, items)
  }, [orgId, items])

  const addToCart = useCallback(
    (
      item: MenuItemResponse,
      variant: CartItemVariant,
      quantity = 1,
      notes?: string
    ) => {
      const unitPrice = variant === "half" ? item.price.half : item.price.full
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.menuItemId === item.id && i.variant === variant
        )
        if (existing) {
          return prev.map((i) =>
            i.menuItemId === item.id && i.variant === variant
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        }
        return [
          ...prev,
          {
            id: `${item.id}-${variant}`,
            menuItemId: item.id,
            name: item.name,
            image: item.image,
            variant,
            quantity,
            unitPrice,
            notes: notes ?? null,
            prepTime: item.preparationTime,
          },
        ]
      })
    },
    []
  )

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  )

  const estimateTime = useMemo(() => {
    const maxPrep = items.reduce((max, i) => Math.max(max, i.prepTime ?? 0), 0)
    return maxPrep
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        estimateTime,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
