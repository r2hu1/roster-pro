import { Check } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const Tost = {
    success,
};

function success({ heading, description }: { heading: string; description?: string }) {
    toast(
        <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500 p-1">
                <Check size={20} className=" text-white font-black" />
            </div>

            <div>
                <p className="font-semibold text-lg">{heading}</p>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
        </div>,
        {
            position: "bottom-center",
            cancel: {
                label: "x",
                onClick: () => {},
            },
        }
    );
}

export default Tost;
