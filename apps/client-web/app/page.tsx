import Header from "@/components/Menu/Top/Header";
import { restaurantData } from "@/dummy/Restaurant";
import SearchBar from "@/components/Menu/Search/SearchBar";
import Menu from "@/components/Menu/MenuLayout/Menu";
import { menuItems as data } from "@/dummy/menu";   // remove this one API is integrated

export default async function Page() {
    const menuItems = await getMenuItems(); // replace the fetMenuItem with fetch call
    return (
        <div className="bg-background p-2 lg:py-8 lg:px-18">
            <Header data={restaurantData} />
            <div className="flex w-full items-center justify-center">
                <SearchBar />
            </div>
            
            {/* menu card layout */}
            <Menu MenuItems={menuItems} /> //menuItem = backend data
        </div>
    );
}


// simulate an API call
async function getMenuItems() {
    await new Promise((resolve) => setTimeout(resolve, 2000));  
    return data;
}
