export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export function createSuccessResponse<T>(data: T): ServiceResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(message: string, code: string): ServiceResponse {
  return {
    success: false,
    error: {
      message,
      code,
    },
    timestamp: new Date().toISOString(),
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const hasNext = page * limit < total;
  const hasPrev = page > 1;

  return {
    success: true,
    data: {
      items,
      total,
      page,
      limit,
      hasNext,
      hasPrev,
    },
    timestamp: new Date().toISOString(),
  };
} 