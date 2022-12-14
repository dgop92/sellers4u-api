/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface ProductCreateInput {
  data: {
    businessId: number;
    categoryId: number;
    code: string;
    description?: string;
    name: string;
    price: number;
  };
}

export interface ProductOptions {
  fetchBusiness?: boolean;
  fetchCategory?: boolean;
  fetchPhotos?: boolean;
}

export interface ProductPagination {
  /**
   * Limit results per request, max 500. must be used with skip
   */
  limit?: number;
  /**
   * Skips results per request. must be used with limit
   */
  skip?: number;
}

export interface ProductSearchInput {
  filterBy?: {
    price?: {
      max?: number;
      min?: number;
    };
  };
  options?: ProductOptions;
  pagination?: ProductPagination;
  searchBy?: {
    businessId?: number;
    categoryId?: number;
    code?: string;
    description?: string;
    id?: number;
    name?: string;
  };
}

export interface ProductUpdateInput {
  data: {
    categoryId?: number;
    code?: string;
    description?: string;
    name?: string;
    price?: number;
  };
  searchBy: {
    id: number;
  };
}
