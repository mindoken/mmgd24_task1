import { Vector } from "../Vector";
import { randomNumber } from "../utils";
import { Cube } from "./Cube";

describe("Cube tests", () => {
  const center = new Vector(randomNumber(1, 10), randomNumber(1, 10));
  const radius = randomNumber(1, 10);
  const height = (radius * Cube.sqrt3) / 2;
  const cube = new Cube(center, radius);

  describe("contains tests", () => {
    it("center", () => {
      expect(cube.contains(center)).toBe(true);
    });

    it("vertices", () => {
      expect(
        Object.values(cube.vertices).map((point) => cube.contains(point))
      ).not.toEqual(expect.arrayContaining([false]));
    });

    it("point on edge", () => {
      const point = new Vector(
        (cube.vertices.bottomLeft.x + cube.vertices.bottomRight.x) / 2,
        cube.vertices.bottomLeft.y
      );

      expect(cube.contains(point)).toBe(true);
    });

    it("far", () => {
      const point = new Vector(center.x, center.y + radius);

      expect(cube.contains(point)).toBe(false);
    });
  });

  describe("distance to edges tests", () => {
    it("center", () => {
      expect(cube.distanceToEdges(center)).toEqual(
        expect.arrayContaining(
          Array.from(Array(6), () => expect.closeTo(-height))
        )
      );
    });

    it("vertices", () => {
      const results = Object.values(cube.vertices).map((point) =>
        cube.distanceToEdges(point)
      );

      expect(results).toEqual(
        expect.arrayContaining(
          Array.from(Array(6), () =>
            expect.arrayContaining([
              expect.closeTo(0),
              expect.closeTo(0),
              expect.closeTo(-height),
              expect.closeTo(-height),
              expect.closeTo(-2 * height),
              expect.closeTo(-2 * height),
            ])
          )
        )
      );
    });

    it("far", () => {
      const point = new Vector(center.x, center.y + 2 * height);

      expect(cube.distanceToEdges(point)).toEqual(
        expect.arrayContaining([
          expect.closeTo(0),
          expect.closeTo(0),
          expect.closeTo(height),
          expect.closeTo(-2 * height),
          expect.closeTo(-2 * height),
          expect.closeTo(-3 * height),
        ])
      );
    });
  });
});
