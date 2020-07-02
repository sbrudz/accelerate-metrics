import { hello } from "./main";

describe("hello", () => {
  it("should return World", () => {
    expect(hello()).toEqual("World");
  });
});
