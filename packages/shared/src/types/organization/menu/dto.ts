export interface CreateMenuDto {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateMenuDto {
  id: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateMenuItemDto {
  menuId: string;
  name: string;
  description?: string | null;
  ingredients?: string[] | null;
  price: Record<"half" | "full", number>;
  image?: string | null;
  imageKey?: string | null;
  category?: string | null;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  preparationTime?: number | null;
}

export interface UpdateMenuItemDto {
  id: string;
  name?: string;
  description?: string | null;
  ingredients?: string[] | null;
  price?: Record<"half" | "full", number>;
  image?: string | null;
  imageKey?: string | null;
  category?: string | null;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  preparationTime?: number | null;
}
