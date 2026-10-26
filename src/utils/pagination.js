const MAX_LIMIT = 50;

function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function parsePagination(query) {
  const page = parsePositiveInteger(query.page, 1);
  const requestedLimit = parsePositiveInteger(query.limit, 10);

  if (page === null || requestedLimit === null) {
    return { error: "page and limit must be positive integers" };
  }

  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) {
    return { error: "page and limit must be positive integers" };
  }

  return { page, limit, skip };
}

function parseSort(query, allowedFields, sortByError) {
  const sortBy = query.sortBy === undefined ? allowedFields[0] : query.sortBy;
  if (typeof sortBy !== "string" || !allowedFields.includes(sortBy)) {
    return { error: sortByError };
  }

  const order = query.order === undefined ? "desc" : query.order;
  if (order !== "asc" && order !== "desc") {
    return { error: "order must be asc or desc" };
  }

  return { sortBy, order };
}

function createMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { parsePagination, parseSort, createMeta };
