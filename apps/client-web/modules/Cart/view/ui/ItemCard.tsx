import FormatPrice from "@/util/FormatPrice";
import { Badge } from "@workspace/ui/components/badge";
import { Minus, Plus, Tag, Trash2 } from "lucide-react";
import React from "react";

export type CartItemType = {
    id: string;
    image: string | null;
    name: string;
    unitPrice: number;
    quantity: number;
    size: string;
    isVegetarian: boolean;
    note?: string;
};

interface ItemCardProps {
    item: CartItemType;
    onQuantityChange: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
}

export default function ItemCard({ item, onQuantityChange, onRemove }: ItemCardProps) {
    return (
        <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
            {/* Image */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img src={item.image || ""} alt={item.name} className="h-full w-full object-cover" />
                <span
                    className={`absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-[4px] border-[1.5px] bg-white ${
                        item.isVegetarian ? "border-green-600" : "border-red-600"
                    }`}
                    title={item.isVegetarian ? "Vegetarian" : "Non-vegetarian"}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${item.isVegetarian ? "bg-green-600" : "bg-red-600"}`} />
                </span>
            </div>

            {/* Details */}
            <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                    <h3 className="truncate font-heading text-base font-medium text-foreground">{item.name}</h3>
                    {item.size && (
                        <Badge variant="secondary" className="mt-1.5 gap-1">
                            <Tag className="size-3.5" />
                            {item.size}
                        </Badge>
                    )}
                </div>

                <div className="flex items-end justify-between gap-2 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-lg font-semibold tabular-nums text-foreground">{FormatPrice(item.unitPrice * item.quantity)}</span>
                        <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:text-destructive/80"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col  h-full items-center gap-3 rounded-full border border-border bg-muted px-2">
                <button
                    type="button"
                    onClick={() => onQuantityChange(item.id, -1)}
                    disabled={item.quantity <= 1}
                    className="flex h-6 w-6 pt-3 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-4 text-center text-sm font-semibold tabular-nums text-foreground">{item.quantity}</span>
                <button
                    type="button"
                    onClick={() => onQuantityChange(item.id, 1)}
                    className="flex h-6 w-6 pb-3 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
