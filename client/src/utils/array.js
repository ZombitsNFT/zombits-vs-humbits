export const paginate = (array, pageSize, pageIndex) =>
  array.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
