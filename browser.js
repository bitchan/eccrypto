/**
 * Browser eccrypto implementation.
 */

"use strict";

require("es6-promise").polyfill();
var EC = require("elliptic").ec;

var ec = new EC("secp256k1");

exports.getPublic = function(privateKey) {
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

exports.verify = function(publicKey, msg, sig) {
  var key = ec.keyPair(null, publicKey);
  if (key.verify(msg, sig)) {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
};
