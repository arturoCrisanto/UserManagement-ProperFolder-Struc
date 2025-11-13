import {
  validatePaginationParams,
  calculatePaginationMetadata,
  sortArray,
  paginateArray,
  parsePaginationQuery,
  paginate,
  filterItems,
  generatePaginationLinks,
} from "../../utils/pagination.js";

describe("Pagination Helper Tests", () => {
  describe("validatePaginationParams", () => {
    it("should validate correct pagination parameters", () => {
      const result = validatePaginationParams(1, 10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject page number less than 1", () => {
      const result = validatePaginationParams(0, 10);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject negative page number", () => {
      const result = validatePaginationParams(-1, 10);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject limit greater than 100", () => {
      const result = validatePaginationParams(1, 101);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Limit cannot exceed 100.");
    });

    it("should reject negative limit", () => {
      const result = validatePaginationParams(1, -5);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject non-integer page number", () => {
      const result = validatePaginationParams(1.5, 10);
      expect(result.isValid).toBe(false);
    });

    it("should reject non-integer limit", () => {
      const result = validatePaginationParams(1, 10.5);
      expect(result.isValid).toBe(false);
    });

    it("should accept valid boundary values", () => {
      const result = validatePaginationParams(1, 100);
      expect(result.isValid).toBe(true);
    });
  });

  describe("calculatePaginationMetadata", () => {
    it("should calculate correct metadata for first page", () => {
      const metadata = calculatePaginationMetadata(50, 1, 10);
      expect(metadata.currentPage).toBe(1);
      expect(metadata.totalPages).toBe(5);
      expect(metadata.totalItems).toBe(50);
      expect(metadata.pageSize).toBe(10);
      expect(metadata.startIndex).toBe(0);
      expect(metadata.endIndex).toBe(9);
    });

    it("should calculate correct metadata for middle page", () => {
      const metadata = calculatePaginationMetadata(50, 3, 10);
      expect(metadata.currentPage).toBe(3);
      expect(metadata.startIndex).toBe(20);
      expect(metadata.endIndex).toBe(29);
    });

    it("should calculate correct metadata for last page", () => {
      const metadata = calculatePaginationMetadata(50, 5, 10);
      expect(metadata.currentPage).toBe(5);
      expect(metadata.startIndex).toBe(40);
      expect(metadata.endIndex).toBe(49);
    });

    it("should handle partial last page", () => {
      const metadata = calculatePaginationMetadata(47, 5, 10);
      expect(metadata.totalPages).toBe(5);
      expect(metadata.endIndex).toBe(46); // Last item index
    });

    it("should handle single page", () => {
      const metadata = calculatePaginationMetadata(5, 1, 10);
      expect(metadata.totalPages).toBe(1);
      expect(metadata.startIndex).toBe(0);
      expect(metadata.endIndex).toBe(4);
    });

    it("should handle empty result set", () => {
      const metadata = calculatePaginationMetadata(0, 1, 10);
      expect(metadata.totalPages).toBe(0);
      expect(metadata.totalItems).toBe(0);
    });
  });

  describe("sortArray", () => {
    const testUsers = [
      { id: 1, name: "Charlie", age: 30, createdAt: new Date("2025-01-15") },
      { id: 2, name: "Alice", age: 25, createdAt: new Date("2025-01-10") },
      { id: 3, name: "Bob", age: 35, createdAt: new Date("2025-01-20") },
    ];

    it("should sort by string field ascending", () => {
      const sorted = sortArray(testUsers, "name", "asc");
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Bob");
      expect(sorted[2].name).toBe("Charlie");
    });

    it("should sort by string field descending", () => {
      const sorted = sortArray(testUsers, "name", "desc");
      expect(sorted[0].name).toBe("Charlie");
      expect(sorted[1].name).toBe("Bob");
      expect(sorted[2].name).toBe("Alice");
    });

    it("should sort by number field ascending", () => {
      const sorted = sortArray(testUsers, "age", "asc");
      expect(sorted[0].age).toBe(25);
      expect(sorted[1].age).toBe(30);
      expect(sorted[2].age).toBe(35);
    });

    it("should sort by number field descending", () => {
      const sorted = sortArray(testUsers, "age", "desc");
      expect(sorted[0].age).toBe(35);
      expect(sorted[1].age).toBe(30);
      expect(sorted[2].age).toBe(25);
    });

    it("should sort by date field ascending", () => {
      const sorted = sortArray(testUsers, "createdAt", "asc");
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[2].name).toBe("Bob");
    });

    it("should sort by date field descending", () => {
      const sorted = sortArray(testUsers, "createdAt", "desc");
      expect(sorted[0].name).toBe("Bob");
      expect(sorted[2].name).toBe("Alice");
    });

    it("should handle null values", () => {
      const itemsWithNull = [
        { id: 1, name: "Alice" },
        { id: 2, name: null },
        { id: 3, name: "Bob" },
      ];
      const sorted = sortArray(itemsWithNull, "name", "asc");
      expect(sorted).toHaveLength(3);
    });

    it("should not mutate original array", () => {
      const original = [...testUsers];
      sortArray(testUsers, "name", "asc");
      expect(testUsers).toEqual(original);
    });
  });

  describe("paginateArray", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    it("should return correct items for first page", () => {
      const paginated = paginateArray(items, 1, 10);
      expect(paginated).toHaveLength(10);
      expect(paginated[0].id).toBe(1);
      expect(paginated[9].id).toBe(10);
    });

    it("should return correct items for second page", () => {
      const paginated = paginateArray(items, 2, 10);
      expect(paginated).toHaveLength(10);
      expect(paginated[0].id).toBe(11);
      expect(paginated[9].id).toBe(20);
    });

    it("should return remaining items on last page", () => {
      const paginated = paginateArray(items, 3, 10);
      expect(paginated).toHaveLength(5);
      expect(paginated[0].id).toBe(21);
      expect(paginated[4].id).toBe(25);
    });

    it("should return empty array for page beyond range", () => {
      const paginated = paginateArray(items, 10, 10);
      expect(paginated).toHaveLength(0);
    });

    it("should handle limit larger than array size", () => {
      const paginated = paginateArray(items, 1, 100);
      expect(paginated).toHaveLength(25);
    });

    it("should handle single item per page", () => {
      const paginated = paginateArray(items, 5, 1);
      expect(paginated).toHaveLength(1);
      expect(paginated[0].id).toBe(5);
    });
  });

  describe("parsePaginationQuery", () => {
    it("should parse valid query parameters", () => {
      const query = { page: "2", limit: "20", sortBy: "name", order: "asc" };
      const result = parsePaginationQuery(query);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe("name");
      expect(result.order).toBe("asc");
    });

    it("should use default values for missing parameters", () => {
      const query = {};
      const result = parsePaginationQuery(query);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sortBy).toBe("createdAt");
      expect(result.order).toBe("desc");
    });

    it("should handle invalid numeric strings", () => {
      const query = { page: "abc", limit: "xyz" };
      const result = parsePaginationQuery(query);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("should parse numeric strings correctly", () => {
      const query = { page: "5", limit: "25" };
      const result = parsePaginationQuery(query);
      expect(result.page).toBe(5);
      expect(result.limit).toBe(25);
    });
  });

  describe("paginate", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      createdAt: new Date(2025, 0, i + 1),
    }));

    it("should paginate items correctly", () => {
      const result = paginate(items, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(10);
      expect(result.metadata.totalItems).toBe(25);
      expect(result.metadata.totalPages).toBe(3);
    });

    it("should sort items before paginating", () => {
      const result = paginate(items, {
        page: 1,
        limit: 5,
        sortBy: "name",
        order: "asc",
      });
      expect(result.data[0].name).toBe("User 1");
    });

    it("should handle last page with fewer items", () => {
      const result = paginate(items, { page: 3, limit: 10 });
      expect(result.data).toHaveLength(5);
    });

    it("should throw error for invalid page", () => {
      expect(() => {
        paginate(items, { page: 0, limit: 10 });
      }).toThrow();
    });

    it("should throw error for invalid limit", () => {
      expect(() => {
        paginate(items, { page: 1, limit: 101 });
      }).toThrow();
    });

    it("should use default options", () => {
      const result = paginate(items);
      expect(result.data).toHaveLength(10);
      expect(result.metadata.currentPage).toBe(1);
    });
  });

  describe("filterItems", () => {
    const items = [
      { id: 1, name: "Alice Smith", email: "alice@example.com", role: "Admin" },
      { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "User" },
      {
        id: 3,
        name: "Charlie Brown",
        email: "charlie@example.com",
        role: "User",
      },
      {
        id: 4,
        name: "Diana Prince",
        email: "diana@example.com",
        role: "Moderator",
      },
    ];

    it("should filter items by search query in name field", () => {
      const filtered = filterItems(items, "alice", ["name", "email"]);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Alice Smith");
    });

    it("should filter items by search query in email field", () => {
      const filtered = filterItems(items, "bob@", ["email"]);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].email).toBe("bob@example.com");
    });

    it("should return all items when no search query", () => {
      const filtered = filterItems(items, "", ["name", "email"]);
      expect(filtered).toHaveLength(4);
    });

    it("should return all items when search query is null", () => {
      const filtered = filterItems(items, null, ["name", "email"]);
      expect(filtered).toHaveLength(4);
    });

    it("should search across multiple fields", () => {
      const filtered = filterItems(items, "example", ["email"]);
      expect(filtered).toHaveLength(4);
    });

    it("should be case insensitive", () => {
      const filtered = filterItems(items, "ALICE", ["name"]);
      expect(filtered).toHaveLength(1);
    });

    it("should handle partial matches", () => {
      const filtered = filterItems(items, "son", ["name"]);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Bob Johnson");
    });

    it("should return empty array when no matches", () => {
      const filtered = filterItems(items, "xyz123", ["name", "email"]);
      expect(filtered).toHaveLength(0);
    });

    it("should handle undefined fields gracefully", () => {
      const filtered = filterItems(items, "test", ["nonexistent"]);
      expect(filtered).toHaveLength(0);
    });

    it("should trim whitespace from search query", () => {
      const filtered = filterItems(items, "  alice  ", ["name"]);
      expect(filtered).toHaveLength(1);
    });
  });

  describe("generatePaginationLinks", () => {
    it("should generate correct pagination links", () => {
      const metadata = {
        currentPage: 2,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
        nextPage: 3,
        previousPage: 1,
      };
      const links = generatePaginationLinks("/api/users", metadata, {
        limit: 10,
      });

      expect(links.self).toContain("page=2");
      expect(links.first).toContain("page=1");
      expect(links.last).toContain("page=5");
      expect(links.next).toContain("page=3");
      expect(links.previous).toContain("page=1");
    });

    it("should not include previous link on first page", () => {
      const metadata = {
        currentPage: 1,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
        nextPage: 2,
        previousPage: null,
      };
      const links = generatePaginationLinks("/api/users", metadata);

      expect(links.previous).toBeUndefined();
      expect(links.next).toBeDefined();
    });

    it("should not include next link on last page", () => {
      const metadata = {
        currentPage: 5,
        totalPages: 5,
        hasNextPage: false,
        hasPreviousPage: true,
        nextPage: null,
        previousPage: 4,
      };
      const links = generatePaginationLinks("/api/users", metadata);

      expect(links.next).toBeUndefined();
      expect(links.previous).toBeDefined();
    });
  });
});
