import { describe, expect, it } from "vitest";
import { DEFAULT_MINIMUM_ORDER, meetsMinimumOrder, isTripleClick } from "@/lib/admin-rules";
describe("Admin rules", () => {
  it("opens only on the third click", () => { expect(isTripleClick(2)).toBe(false); expect(isTripleClick(3)).toBe(true); expect(isTripleClick(4)).toBe(false); });
  it("applies the reference default minimum of R$24", () => { expect(DEFAULT_MINIMUM_ORDER).toBe(24); expect(meetsMinimumOrder(23.99, DEFAULT_MINIMUM_ORDER)).toBe(false); expect(meetsMinimumOrder(24, DEFAULT_MINIMUM_ORDER)).toBe(true); });
  it("applies an administrator changed minimum", () => { expect(meetsMinimumOrder(49.99, 50)).toBe(false); expect(meetsMinimumOrder(50, 50)).toBe(true); });
});