// apps/web-admin/src/types/paging.ts
export type Paged<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

