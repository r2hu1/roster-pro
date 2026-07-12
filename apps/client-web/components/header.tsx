"use client";
import { useTableContext } from "@/modules/providers/table-provider";
import { IconShoppingCart } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import Image from "next/image";

export default function Header() {
  const { data } = useTableContext();
  return (
    <header className="py-5 pb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image className="size-14 rounded-xl" src={data?.organization.logo ?? "/assets/roster-pro-logo.jpeg"} alt="Logo" width={100} height={100} />
          <div className="truncate space-y-px">
            <h1 className="text-base w-auto font-medium">{data?.organization.name}</h1>
            <p className="text-xs">{data?.organization.phone}</p>
          </div>
      </div>
      <Button size="icon-lg"><IconShoppingCart/></Button>
    </header>
  );
}
