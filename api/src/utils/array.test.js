const { orderAscBy, orderDescBy, uniqBy } = require("./array");

describe("array utils", () => {
  describe("orderAscBy", () => {
    it("should be ordered ascendently", () => {
      const orderedArray = orderAscBy(
        [
          { price: 1.32 },
          { price: 4.22 },
          { price: 3.31 },
          { price: 2 },
          { price: 1.9 },
          { price: 4.1 },
          { price: 1.32 },
        ],
        (item) => item.price
      );
      expect(orderedArray).toEqual([
        { price: 1.32 },
        { price: 1.32 },
        { price: 1.9 },
        { price: 2 },
        { price: 3.31 },
        { price: 4.1 },
        { price: 4.22 },
      ]);
    });
  });

  describe("orderDescBy", () => {
    it("should be ordered descendently", () => {
      const orderedArray = orderDescBy(
        [
          { price: 1.32 },
          { price: 4.22 },
          { price: 3.31 },
          { price: 2 },
          { price: 1.9 },
          { price: 4.1 },
          { price: 1.32 },
        ],
        (item) => item.price
      );
      expect(orderedArray).toEqual([
        { price: 4.22 },
        { price: 4.1 },
        { price: 3.31 },
        { price: 2 },
        { price: 1.9 },
        { price: 1.32 },
        { price: 1.32 },
      ]);
    });
  });

  describe("uniqBy", () => {
    it("should remove repeated items", () => {
      const orderedArray = uniqBy(
        [
          { price: 1.32 },
          { price: 4.22 },
          { price: 3.31 },
          { price: 2 },
          { price: 1.9 },
          { price: 4.1 },
          { price: 1.32 },
        ],
        (item) => item.price
      );
      expect(orderedArray).toEqual([
        { price: 1.32 },
        { price: 4.22 },
        { price: 3.31 },
        { price: 2 },
        { price: 1.9 },
        { price: 4.1 },
      ]);
    });
  });
});
