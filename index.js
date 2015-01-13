/**
 * Node.js eccrypto implementation.
 * @module eccrypto
 */

"use strict";

var promise = typeof Promise === "undefined" ?
              require("es6-promise").Promise :
              Promise;
// TODO(Kagami): We may fallback to pure JS implementation
// (`browser.js`) if this modules are failed to load.
var secp256k1 = require("secp256k1");
var ecdh = require("./build/Release/ecdh");

/**
 * Compute the public key for a given private key.
 * @param {Buffer} privateKey - A 32-byte private key
 * @return {Buffer} A 65-byte public key.
 * @function
 */
exports.getPublic = secp256k1.createPublicKey;

/**
 * Create an ECDSA signature.
 * @param {Buffer} privateKey - A 32-byte private key
 * @param {Buffer} msg - The message being signed
 * @return {Promise.<Buffer>} A promise that resolves with the
 * signature and rejects on bad key or message.
 */
exports.sign = function(privateKey, msg) {
  return new promise(function(resolve) {
    resolve(secp256k1.sign(privateKey, msg));
  });
};

/**
 * Verify an ECDSA signature.
 * @param {Buffer} publicKey - A 65-byte public key
 * @param {Buffer} msg - The message being verified
 * @param {Buffer} sig - The signature
 * @return {Promise.<undefined>} A promise that resolves on correct
 * signature and rejects on bad key or signature.
 */
exports.verify = function(publicKey, msg, sig) {
  return new promise(function(resolve, reject) {
    return secp256k1.verify(publicKey, msg, sig) === 1 ? resolve() : reject();
  });
};

/**
 * Derive shared secret for given private and public keys.
 * @param {Buffer} privateKeyA - Sender's private key
 * @param {Buffer} publicKeyB - Recipient's public key
 * @return {Promise.<Buffer>} A promise that resolves with the derived
 * shared secret (Px) and rejects on bad key.
 */
exports.derive = function(privateKeyA, publicKeyB) {
  return new promise(function(resolve) {
    resolve(ecdh.derive(privateKeyA, publicKeyB));
  });
};
