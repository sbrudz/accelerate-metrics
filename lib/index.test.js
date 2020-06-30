import { hello } from "./index";

describe("hello", () => {
  it("should return World", () => {
    expect(hello()).toEqual("World");
  });
});
