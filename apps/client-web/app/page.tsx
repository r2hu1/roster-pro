import { Button } from "@workspace/ui/components/button"
import Header from "@/components/Header"
import {restaurantData} from "@/dummy/Restaurant"
import SearchBar from "@/components/SearchBar"
import Menu from "@/components/Menu"

export default function Page() {
  return (
    <div className="bg-background p-2 lg:py-8 lg:px-18">
      <Header data={restaurantData}/>
      <div className="flex w-full items-center justify-center">
        <SearchBar />
      </div>
      <Menu/>
    </div>
  )
}
