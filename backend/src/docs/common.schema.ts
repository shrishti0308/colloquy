export const paginationSchema = {
  type: 'object',
  properties: {
    currentPage: { type: 'integer', example: 1 },
    totalPages: { type: 'integer', example: 5 },
    totalItems: { type: 'integer', example: 47 },
    itemsPerPage: { type: 'integer', example: 10 },
    hasNextPage: { type: 'boolean', example: true },
    hasPrevPage: { type: 'boolean', example: false },
  },
};
