import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Soup } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@workspace/ui/components/hover-card";
import { useRouter } from "next/navigation";

export default function OrderPageIcon() {
    const [open, setOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setOpen(true);

            setTimeout(() => {
                setOpen(false);
                clearInterval(interval)
            }, 2500);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-background fixed bottom-0 right-0 p-2 flex justify-end lg:px-18 lg:py-8">
            <HoverCard open={open}>
                <HoverCardTrigger>
                    <motion.button
                        onClick={() => router.push("/order")}
                        initial={{ opacity: 0, y: 80, scale: 0.6 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                        whileHover={{
                            scale: 1.12,
                            rotate: -8,
                        }}
                        whileTap={{
                            scale: 0.92,
                        }}
                        className="bg-primary p-3 text-white rounded-full aspect-square flex justify-center items-center shadow-xl"
                    >
                        <motion.div
                            animate={{
                                y: [0, -4, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <Soup size={40} />
                        </motion.div>
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/30"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 0, 0.4],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                        />
                    </motion.button>
                </HoverCardTrigger>

                <HoverCardContent side="top" className="bg-[#F7E9CD] shadow-lg w-auto! font-semibold">
                    Check your order status
                </HoverCardContent>
            </HoverCard>
        </div>
    );
}
