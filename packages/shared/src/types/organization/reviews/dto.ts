export interface CreateReviewDto {
  rating: number;
  comment: string;
  organizationId: string;
  orderId: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
  orderId?: string;
  organizationId?: string;
}
