export interface Menu {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  description: string | null;
  ingredients: string[] | null;
  price: number;
  image: string | null;
  imageKey: string | null;
  category: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  preparationTime: number | null;
  createdAt: Date;
  updatedAt: Date;
}
