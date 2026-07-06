import Header from "@/components/Top/Header"
import { restaurantData } from "@/dummy/Restaurant"
import SearchBar from "@/components/Search/SearchBar"
import Menu from "@/components/MenuLayout/Menu"
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
