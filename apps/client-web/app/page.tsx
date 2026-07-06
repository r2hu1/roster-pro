import Header from "@/components/Menu/Top/Header"
import { restaurantData } from "@/dummy/Restaurant"
import SearchBar from "@/components/Menu/Search/SearchBar"
import Menu from "@/components/Menu/MenuLayout/Menu"
import { menuItems } from "@/dummy/menu"

export default function Page() {
  return (
    <div className="bg-background p-2 lg:py-8 lg:px-18">
      <Header data={restaurantData} />
      <div className="flex w-full items-center justify-center">
        <SearchBar />
      </div>
      <Menu MenuItems={menuItems} />
    </div>
  )
}
