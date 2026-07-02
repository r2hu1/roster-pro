import React from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@workspace/ui/components/sheet";
import {  Search, Settings2 } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="flex w-full max-w-4xl gap-2 items-center  py-8 lg:py-15">
            {/* Search */}
            <div className="flex h-12 flex-1 items-center rounded-full  border border-border bg-primary/5 pl-4 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="mr-3 h-5 w-5 text-primary" />

                <input
                    type="text"
                    placeholder="Search templates..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
            </div>
            <Sheet>
                <SheetTrigger>
                    <button className="flex h-12 w-12 justify-center items-center gap-2 rounded-full border-2  border-primary/50  text-primary  text-sm font-medium transition-colors hover:bg-primary/10   hover:text-primary">
                        <Settings2 size={20} className=""/>
                    </button>
                </SheetTrigger>

                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>Narrow down your search results.</SheetDescription>
                    </SheetHeader>

                    {/* Filter options */}
                </SheetContent>
            </Sheet>
        </div>
    );
}
