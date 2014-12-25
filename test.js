var expect = require("chai").expect;
var eccrypto = require("./");

var privateKey = Buffer(32);
privateKey.fill(1);
var publicKey = eccrypto.getPublic(privateKey);
var msg = Buffer("test");

describe("Key", function() {
  it("should allow to convert private key to public", function() {
    expect(Buffer.isBuffer(publicKey)).to.be.true;
    expect(publicKey.toString("hex")).to.equal("041b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f70beaf8f588b541507fed6a642c5ab42dfdf8120a7f639de5122d47a69a8e8d1");
  });
});

describe("ECDSA", function() {
  it("should allow to sign and verify message", function() {
    return eccrypto.sign(privateKey, msg)
      .then(function(sig) {
        expect(Buffer.isBuffer(sig)).to.be.true;
        return eccrypto.verify(publicKey, msg, sig);
      });
  });

  it("shouldn't verify incorrect signature", function(done) {
    eccrypto.sign(privateKey, msg)
      .then(function(sig) {
        expect(Buffer.isBuffer(sig)).to.be.true;
        return eccrypto.verify(publicKey, Buffer("other msg"), sig);
      }).catch(function() {
        done();
      });
  });

  it("should reject promise on invalid key when signing", function(done) {
    eccrypto.sign(Buffer("test"), msg).catch(function() {
      done();
    });
  });

  it("should reject promise on invalid key when verifying", function(done) {
    eccrypto.sign(privateKey, msg)
      .then(function(sig) {
        expect(Buffer.isBuffer(sig)).to.be.true;
        return eccrypto.verify(Buffer("test"), msg, sig);
      }).catch(function() {
        done();
      });
  });

  it("should reject promise on invalid sig when verifying", function(done) {
    eccrypto.sign(privateKey, msg)
      .then(function(sig) {
        expect(Buffer.isBuffer(sig)).to.be.true;
        sig[0] ^= 1;
        return eccrypto.verify(publicKey, msg, sig);
      }).catch(function() {
        done();
      });
  });
});
