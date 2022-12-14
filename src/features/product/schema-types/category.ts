/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface CategoryCreateInput {
  data: {
    description?: string;
    name: string;
  };
}

export interface CategorySearchInput {
  searchBy?: {
    id?: number;
    name?: string;
  };
}

export interface CategoryUpdateInput {
  data: {
    description?: string;
    name?: string;
  };
  searchBy: {
    id: number;
  };
}
