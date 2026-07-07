import Header from "@/modules/Menu/view/ui/Top/Header";
import { restaurantData } from "@/dummy/Restaurant";
import MenuPage from "@/modules/Menu/MenuPage";

export default async function Page() {
    const data = await getMenuItems(); // replace the restaurantData with fetch call
    return (
        <div className="bg-background p-2 lg:py-8 lg:px-18">
            <Header data={data} />
            <MenuPage  />
        </div>
    );
}


// simulate an API call
async function getMenuItems() {
    await new Promise((resolve) => setTimeout(resolve, 2000));  
    return restaurantData;
}
