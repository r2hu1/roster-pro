"use client";

import { useEffect, useState } from "react";
import FormatPrice from "@/util/FormatPrice";
import Top from "@/components/Cart/Top";
import { CreateOrderDto } from "@workspace/shared";
import ItemCard, { CartItemType } from "@/components/Cart/ItemCard";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@workspace/ui/components/drawer";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
    const { tableNumber }: Pick<CreateOrderDto, "tableNumber"> = { tableNumber: "1" };
    const [cartItem, setCartItem] = useState<CartItemType[]>([]);

    useEffect(() => {
        const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
        setCartItem(cart);
    }, []);

    function handleQuantityChange(id: string, delta: number) {
        setCartItem((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)));
    }

    function handleRemove(id: string) {
        setCartItem((prev) => prev.filter((item) => item.id !== id));
    }

    function placeOrder(){
        console.log(cartItem);
    }

    const total = cartItem.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return (
        <div className="p-2">
            <Top tableNumber={tableNumber} />
            {cartItem.length > 0 ? (
                <div className="mt-15 flex w-full flex-col gap-3">
                    {cartItem.map((item) => (
                        <ItemCard key={item.id} item={item} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
                    ))}
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                        <span className="text-sm font-medium text-muted-foreground">Total</span>
                        <span className="text-xl font-bold text-foreground">{FormatPrice(total)}</span>
                    </div>
                </div>
            ) : (
                <div className="mt-15 flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <p className="text-base font-medium text-foreground">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground">Add items from the menu to see them here.</p>
                </div>
            )}
            <div className="fixed bottom-0 w-full flex items-center justify-center">
                <div className="w-full">
                    <Drawer>
                        <DrawerTrigger className="w-full pr-5 pb-2">
                            <Button className="w-full py-5 px-auto">Place an Order</Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                                <DrawerDescription>This action cannot be undone.</DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4">{/* Content here */}</div>
                            <DrawerFooter>
                                <Button onClick={placeOrder}>Submit</Button>
                                <DrawerClose>Cancel</DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>
        </div>
    );
}
