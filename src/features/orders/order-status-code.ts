/** Soft-deleted from admin UI — row remains in the database. */
export const ORDER_STATUS_CODE_ACTIVE = 0;
export const ORDER_STATUS_CODE_DELETED = 255;

export const activeOrderWhere = {
  statusCode: ORDER_STATUS_CODE_ACTIVE,
} as const;

export const deletedOrderWhere = {
  statusCode: ORDER_STATUS_CODE_DELETED,
} as const;
