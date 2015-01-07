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

exports.getPublic = function(privateKey) {
  // `elliptic` doesn't have such checkings so we do it by ourself. We
  // should always ensure that library user doesn't try to do something
  // dumb.
  if (privateKey.length !== 32) {
    throw new Error("Bad private key");
  }
  // XXX(Kagami): `elliptic.utils.encode` returns array for every
  // encoding except `hex`.
  return new Buffer(ec.keyPair(privateKey).getPublic("arr"));
};

exports.sign = function(privateKey, msg) {
  var key = ec.keyPair(privateKey);
  var sig;
  try {
    sig = new Buffer(key.sign(msg).toDER());
    return Promise.resolve(sig);
  } catch(e) {
    return Promise.reject();
  }
};

exports.verify = function(key, msg, sig) {
  key = ec.keyPair(key);
  if (key.verify(msg, sig)) {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
};
