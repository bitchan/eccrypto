/**
 * Node.js eccrypto implementation.
 * @module eccrypto
 */

"use strict";

require("es6-promise").polyfill();
var secp256k1 = require("secp256k1");

/**
 * Compute the public key for a given private key.
 * @param {Buffer} privateKey - A 32-byte private key
 * @return {Buffer} A 65-byte public key.
 * @function
 */
var getPublic = exports.getPublic = secp256k1.createPublicKey;

/**
 * Create an ECDSA signature.
 * @param {Buffer} privateKey - A 32-byte private key
 * @param {Buffer} msg - The message being signed
 * @return {Promise.<Buffer>} A promise that resolves with the
 * signature and rejects on bad key or message.
 */
// FIXME(Kagami): What to do in case of invalid nonce?
exports.sign = function(privateKey, msg) {
  return new Promise(function(resolve, reject) {
    try {
      secp256k1.sign(privateKey, msg, function(code, sig) {
        if (code === 1) {
          resolve(sig);
        } else {
          reject();
        }
      });
    } catch(e) {
      reject();
    }
  });
};

/**
 * Verify an ECDSA signature.
 * @param {Buffer} key - A private or public key
 * @param {Buffer} msg - The message being verified
 * @param {Buffer} sig - The signature
 * @return {Promise.<undefined>} A promise that resolves on correct
 * signature and rejects on bad key or signature.
 */
exports.verify = function(key, msg, sig) {
  var publicKey = key.length === 32 ? getPublic(key) : key;
  return new Promise(function(resolve, reject) {
    secp256k1.verify(publicKey, msg, sig, function(code) {
      if (code === 1) {
        resolve();
      } else {
        reject();
      }
    });
  });
};
