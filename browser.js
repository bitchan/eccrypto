/**
 * Browser eccrypto implementation.
 */

// NOTE(Kagami): We don't use promise shim in Browser implementation
// because it's supported natively in new browsers (see
// <http://caniuse.com/#feat=promises>) and we can use only new browsers
// because of the WebCryptoAPI (see
// <http://caniuse.com/#feat=cryptography>).

"use strict";

var EC = require("elliptic").ec;

var ec = new EC("secp256k1");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

exports.getPublic = function(privateKey) {
  // This function has sync API so we throw an error immediately.
  // (`elliptic` doesn't do this).
  assert(privateKey.length === 32, "Bad private key");
  // XXX(Kagami): `elliptic.utils.encode` returns array for every
  // encoding except `hex`.
  return new Buffer(ec.keyPair(privateKey).getPublic("arr"));
};

exports.sign = function(privateKey, msg) {
  return new Promise(function(resolve) {
    var key = ec.keyPair(privateKey);
    resolve(new Buffer(key.sign(msg).toDER()));
  });
};

exports.verify = function(key, msg, sig) {
  return new Promise(function(resolve, reject) {
    key = ec.keyPair(key);
    return key.verify(msg, sig) ? resolve() : reject();
  });
};

exports.derive = function(privateKeyA, publicKeyB) {
  return new Promise(function(resolve) {
    var keyA = ec.keyPair(privateKeyA);
    var keyB = ec.keyPair(publicKeyB);
    var Px = keyA.derive(keyB.getPublic());  // BN instance
    resolve(new Buffer(Px.toString(16), "hex"));
  });
};
