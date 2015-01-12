var expect = require("chai").expect;
var crypto = require("crypto");
var eccrypto = require("./");

var msg = crypto.createHash("sha256").update("test").digest();
var otherMsg = crypto.createHash("sha256").update("test2").digest();

var privateKey = Buffer(32);
privateKey.fill(1);
var publicKey = eccrypto.getPublic(privateKey);

var privateKeyA = Buffer(32);
privateKeyA.fill(2);
var publicKeyA = eccrypto.getPublic(privateKeyA);

var privateKeyB = Buffer(32);
privateKeyB.fill(3);
var publicKeyB = eccrypto.getPublic(privateKeyB);

describe("Key convertion", function() {
  it("should allow to convert private key to public", function() {
    expect(Buffer.isBuffer(publicKey)).to.be.true;
    expect(publicKey.toString("hex")).to.equal("041b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f70beaf8f588b541507fed6a642c5ab42dfdf8120a7f639de5122d47a69a8e8d1");
  });

  it("should throw on invalid private key", function() {
    expect(eccrypto.getPublic.bind(null, Buffer("00", "hex"))).to.throw(Error);
    expect(eccrypto.getPublic.bind(null, Buffer("test"))).to.throw(Error);
  });
});

describe("ECDSA", function() {
  it("should allow to sign and verify message", function() {
    return eccrypto.sign(privateKey, msg).then(function(sig) {
      expect(Buffer.isBuffer(sig)).to.be.true;
      expect(sig.toString("hex")).to.equal("3044022078c15897a34de6566a0d396fdef660698c59fef56d34ee36bef14ad89ee0f6f8022016e02e8b7285d93feafafbe745702f142973a77d5c2fa6293596357e17b3b47c");
      return eccrypto.verify(publicKey, msg, sig);
    });
  });

  it("should allow to verify using private key", function() {
    return eccrypto.sign(privateKey, msg)
      .then(function(sig) {
        expect(Buffer.isBuffer(sig)).to.be.true;
        return eccrypto.verify(privateKey, msg, sig);
      });
  });

  it("shouldn't verify incorrect signature", function(done) {
    eccrypto.sign(privateKey, msg).then(function(sig) {
      expect(Buffer.isBuffer(sig)).to.be.true;
      eccrypto.verify(publicKey, otherMsg, sig).catch(function() {
        done();
      });
    });
  });

  it("should reject promise on invalid key when signing", function(done) {
    eccrypto.sign(Buffer("test"), msg).catch(function() {
      done();
    });
  });

  it("should reject promise on invalid key when verifying", function(done) {
    eccrypto.sign(privateKey, msg).then(function(sig) {
      expect(Buffer.isBuffer(sig)).to.be.true;
      eccrypto.verify(Buffer("test"), msg, sig).catch(function() {
        done();
      });
    });
  });

  it("should reject promise on invalid sig when verifying", function(done) {
    eccrypto.sign(privateKey, msg).then(function(sig) {
      expect(Buffer.isBuffer(sig)).to.be.true;
      sig[0] ^= 1;
      eccrypto.verify(publicKey, msg, sig).catch(function() {
        done();
      });
    });
  });
});

if (typeof window !== "undefined") {
describe("ECDH", function() {
  it("should derive shared secret from privkey A and pubkey B", function() {
    return eccrypto.derive(privateKeyA, publicKeyB).then(function(Px) {
      expect(Buffer.isBuffer(Px)).to.be.true;
      expect(Px.length).to.equal(32);
      expect(Px.toString("hex")).to.equal("aca78f27d5f23b2e7254a0bb8df128e7c0f922d47ccac72814501e07b7291886");
      return eccrypto.derive(privateKeyB, publicKeyA).then(function(Px2) {
        expect(Buffer.isBuffer(Px2)).to.be.true;
        expect(Px2.length).to.equal(32);
        expect(Px.toString("hex")).to.equal(Px2.toString("hex"));
      });
    });
  });
});
}
