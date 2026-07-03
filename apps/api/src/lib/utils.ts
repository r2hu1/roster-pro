export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  PAYMENT_REQUIRED: 402,
}

export const parseFile = async (file: File): Promise<Buffer> => {
  if (!(file instanceof File)) {
    throw new Error("Expected a File");
  }

  return Buffer.from(await file.arrayBuffer());
};
