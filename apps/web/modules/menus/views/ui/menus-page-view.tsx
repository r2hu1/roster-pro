"use client";

import EmptyData from "@/components/empty";
import api from "@/lib/axios";
import { IconCirclePlus, IconToolsKitchen2Off } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { MenuResponse } from "@workspace/shared/schemas/menu/response";
import { Button } from "@workspace/ui/components/button";

export default function MenusPageView() {
  const { data: menus, isPending: menusLoading, error: menusError } = useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const req = await api.get("/organization/menu");
      return req.data.data as MenuResponse[];
    }
  })
  return (
    <div>
      <EmptyData
        title="No menu added yet."
        description="Start by creating your first menu, click the button below to get started."
        action={
          <Button size="lg">
            Create Menu <IconCirclePlus />
          </Button>
        }
        icon={<IconToolsKitchen2Off/>}
      />
    </div>
  );
}
