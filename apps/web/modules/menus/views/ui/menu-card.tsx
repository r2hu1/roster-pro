'use client';

import Link from 'next/link';
import type { MenuResponse } from '@workspace/shared/schemas/menu/response';
import { IconArrowUpRight, IconImageInPicture } from '@tabler/icons-react';


export default function MenuCard({
  menu,
  orgId,
}: {
  menu: MenuResponse;
  orgId: string;
}) {
  return (
    <Link
      href={`/${orgId}/menus/${menu.id}`}
      className="bg-card group grid gap-6 overflow-hidden rounded-md border p-4 sm:max-w-52 dark:shadow-none"
    >
      <div className="flex items-center justify-between gap-4 truncate">
        <div className="group truncate">
          <h1 className="relative -mb-px truncate text-sm font-medium">
            <span className="inline-flex items-center gap-1">
              <IconArrowUpRight className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-x-2 -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
              <span className="transition-[padding] duration-200 group-hover:pl-5">
                {menu.name}
              </span>
            </span>
          </h1>

          <p className="text-muted-foreground truncate text-xs">
            {menu.description ? (
              menu.description
            ) : (
              <span className="text-muted-foreground text-xs italic">
                No description added.
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="bg-border -mr-28 -mb-20 ml-4 w-fit -rotate-8 overflow-visible rounded-md border">
          <div className="bg-foreground/5 flex h-12 w-12 items-center justify-center rounded-md italic">
            <IconImageInPicture className="text-foreground/50 size-3.5" />
          </div>
      </div>
    </Link>
  );
}
