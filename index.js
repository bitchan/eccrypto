var secp256k1 = require("secp256k1");

exports.getPublic = secp256k1.createPublicKey.bind(null);
