import { Loader } from "lucide-react";
import React from "react";

export default function Loading() {
    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <Loader className="animate-spin" />
        </div>
    );
}
