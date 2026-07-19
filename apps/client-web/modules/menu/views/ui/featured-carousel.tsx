"use client"

import { useRef, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import type { MenuWithItemsListResponse } from "@workspace/shared/schemas/menu/index"
import FeaturedMenuItemCard from "./featured-item-card"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@workspace/ui/components/carousel"

export default function FeaturedCarousel({
  menus,
}: {
  menus: MenuWithItemsListResponse
}) {
  const [api, setApi] = useState<CarouselApi>()
  const autoplay = useRef(
    Autoplay({
      delay: 2000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  const featuredItems = menus.flatMap((menu) =>
    menu.items.filter((item) => item.isFeatured)
  )

  if (featuredItems.length === 0) return null

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[autoplay.current]}
      className="w-full px-6 pt-6 pb-3"
    >
      <CarouselContent>
        {featuredItems.map((item) => (
          <CarouselItem
            key={item.id}
            className="basis-full md:basis-1/2 lg:basis-1/3"
          >
            <FeaturedMenuItemCard item={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
