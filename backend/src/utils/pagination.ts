export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Extract and validate pagination parameters from query
 */
export const getPaginationParams = (query: any): PaginationParams => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));

  return { page, limit };
};

/**
 * Build pagination metadata
 */
export const buildPaginationMetadata = (
  totalItems: number,
  page: number,
  limit: number
): PaginationMetadata => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Apply pagination to Mongoose query
 */
export const applyPagination = <T>(
  query: any,
  page: number,
  limit: number
): any => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};
