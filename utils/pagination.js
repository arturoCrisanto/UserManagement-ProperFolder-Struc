// this utility function validates pagination parameters: page and limit
export const validatePaginationParams = (page, limit) => {
  const error = [];

  if (isNaN(page) || page < 1 || !Number.isInteger(Number(page))) {
    error.push("Page must be a positive integer greater than 0.");
  }
  if (isNaN(limit) || limit < 1 || !Number.isInteger(Number(limit))) {
    error.push("Limit must be a positive integer greater than 0.");
  }
  if (limit > 100) {
    error.push("Limit cannot exceed 100.");
  }
  return {
    isValid: error.length === 0,
    errors: error,
  };
};
// this utility function calculates pagination metadata
export const calculatePaginationMetadata = (totalItems, Page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (Page - 1) * limit;
  const endIndex = Math.min(startIndex + limit - 1, totalItems - 1);

  return {
    totalItems,
    totalPages,
    currentPage: Page,
    pageSize: limit,
    startIndex,
    endIndex,
  };
};
// this utility function sorts an array based on a specified field and order
export const sortArray = (items, sortBy = "createdAt", order = "desc") => {
  const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    // Handle undefined/null values
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    // Handle dates
    if (sortBy === "createdAt" || sortBy === "updatedAt") {
      return sortOrder * (new Date(aValue) - new Date(bValue));
    }

    // Handle strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      return (
        sortOrder *
        aValue.localeCompare(bValue, undefined, {
          sensitivity: "base",
        })
      );
    }

    // Handle numbers
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder * (aValue - bValue);
    }

    // Handle booleans
    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return sortOrder * (aValue === bValue ? 0 : aValue ? 1 : -1);
    }
  });
};

// this utility function paginates an array based on page number and limit
export const paginateArray = (items, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return items.slice(startIndex, endIndex);
};
// this utility function parses pagination query parameters from request
export const parsePaginationQuery = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const sortBy = query.sortBy || "createdAt";
  const order = query.order || "desc";

  return { page, limit, sortBy, order };
};
// this is the main pagination function that combines validation, sorting, and pagination
export const paginate = (items, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = options;
  const validation = validatePaginationParams(page, limit);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(" "));
  }
  const sortedItems = sortArray(items, sortBy, order);
  const paginatedItems = paginateArray(sortedItems, page, limit);
  const metadata = calculatePaginationMetadata(items.length, page, limit);
  return {
    data: paginatedItems,
    metadata,
  };
};
// this utility function filters an array based on a search query and specified fields
export const filterItems = (items, searchQuery, searchFields = []) => {
  if (!searchQuery || searchFields.length === 0) {
    return items;
  }

  const query = searchQuery.toLowerCase().trim();

  return items.filter((item) => {
    return searchFields.some((field) => {
      const value = item[field];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(query);
    });
  });
};

export const generatePaginationLinks = (baseUrl, metadata, queryParams = {}) => {
  const buildUrl = (page) => {
    const params = new URLSearchParams({ ...queryParams, page: page.toString() });
    return `${baseUrl}?${params.toString()}`;
  };

  const links = {
    self: buildUrl(metadata.currentPage),
    first: buildUrl(1),
    last: buildUrl(metadata.totalPages),
  };

  if (metadata.hasPreviousPage) {
    links.previous = buildUrl(metadata.previousPage);
  }

  if (metadata.hasNextPage) {
    links.next = buildUrl(metadata.nextPage);
  }

  return links;
};