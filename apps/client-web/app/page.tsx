import { Button } from "@workspace/ui/components/button"
import Header from "@/components/Header"
import {restaurantData} from "@/util/data"
import Search from "@/components/Search"

export default function Page() {
  return (
    <div className="bg-background p-2">
      <Header data={restaurantData}/>
      <Search />
    </div>
  )
}
