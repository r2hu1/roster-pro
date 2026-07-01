export interface CreateMenuDto {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateMenuDto {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateMenuItemDto {
  id: string;
  menuId: string;
  name: string;
  description?: string | null;
  ingredients?: string[] | null;
  price: number;
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
  name?: string;
  description?: string | null;
  ingredients?: string[] | null;
  price?: number;
  image?: string | null;
  imageKey?: string | null;
  category?: string | null;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  preparationTime?: number | null;
}
