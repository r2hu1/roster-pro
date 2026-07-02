export interface Review {
  id: string;
  rating: number;
  orderId: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}
