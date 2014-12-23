var expect = require("chai").expect;
var eccrypto = require("./");

describe("Key", function() {
  it("should allow to convert private key to  public", function() {
    var privateKey = Buffer(32);
    privateKey.fill(1);
    expect(eccrypto.getPublic(privateKey).toString("hex")).to.equal("041b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f70beaf8f588b541507fed6a642c5ab42dfdf8120a7f639de5122d47a69a8e8d1");
  });
});
