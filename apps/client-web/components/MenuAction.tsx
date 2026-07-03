"use client";
import { Button } from "@workspace/ui/components/button";
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
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

export default function MenuAction() {

    // function to run when Add to cart button is clicked
    const onAddToCart = useCallback((data: any) => {
        console.log("Add to Cart:", data);
    }, []);

    // function to run when order now button is clicked
    const onOrderNow = useCallback((data: any) => {
        console.log("Order Now:", data);
    }, []);

    const addToCart = useCallback(() => {
        return secondDrawer({
            text: "Add To Cart",
            onsubmit: onAddToCart,
            oncancel: (data) => {
                console.log(data);
            },
        });
    }, []);

    const OrderNow = useCallback(() => {
        return secondDrawer({
            text: "Order Now",
            onsubmit: onOrderNow,
            oncancel: (data) => {
                console.log(data);
            },
        });
    }, []);
    return (
        <div className="flex w-full items-center justify-between gap-4">
            <div className="w-1/2 text-center text-foreground border border-muted-foreground rounded-full">{addToCart()}</div>
            <div className="w-1/2 text-center bg-primary rounded-full text-white">{OrderNow()}</div>
        </div>
    );
}

function secondDrawer({ text, onsubmit, oncancel }: { text: string; onsubmit: (data: any) => void; oncancel: (data: any) => void }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    return (
        <Drawer>
            <DrawerTrigger>
                <div className="flex-1 py-2">{text}</div>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                    <DrawerDescription>This action cannot be undone.</DrawerDescription>
                </DrawerHeader>
                <form onSubmit={handleSubmit(onsubmit)}>
                    <span>Quantity: </span>
                    <input type="number" defaultValue="1" {...register("quantity", { valueAsNumber: true })} />
                    <DrawerFooter>
                        <div className="flex w-full items-center justify-between gap-4">
                            <DrawerClose className={"w-1/2 text-center border border-muted-foreground rounded-full"}>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                            <Button className={"w-1/2"} type="submit">
                                {text}
                            </Button>
                        </div>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
