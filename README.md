# eccrypto [![Build Status](https://travis-ci.org/bitchan/eccrypto.svg?branch=master)](https://travis-ci.org/bitchan/eccrypto)

JavaScript Elliptic curve cryptography library for both browserify and node.

## Motivation

There is currently no any isomorphic ECC library which provide ECDSA, ECDH and ECIES for both Node.JS and Browser. So `eccrypto` is an attempt to create one. Current goals:

* Implement ECDSA
* Implement ECDH
* Implement ECIES
* Support secp256k1 curve, HMAC-SHA256 for ECDH and AES-256-CBC for ECIES

Implementation details:

* Use Node.JS crypto module/library bindings where possible
* Use WebCryptoAPI where possible
* Promise-driven API

Possible future goals:

* Support other curves/KDF/MAC/symmetric encryption schemes

## Native crypto API limitations

### crypto

ECDH only works in Node 0.11+ (see https://github.com/joyent/node/pull/5854), ECDSA is only supported when keys are in PEM format (see https://github.com/joyent/node/issues/6904) and ECIES is not supported at all.

### WebCryptoAPI

ECDSA and ECDH are supported in Chrome [only on Windows](https://sites.google.com/a/chromium.org/dev/blink/webcrypto#TOC-Supported-algorithms-as-of-Chrome-41-) (see also [bug 338883](https://code.google.com/p/chromium/issues/detail?id=338883)), aren't supported by Firefox (fixed only in 36.0+, see [bug 1034854](https://bugzilla.mozilla.org/show_bug.cgi?id=1034854)) and ECIES is not defined at all in WebCryptoAPI draft. Also WebCryptoAPI draft [currently defines](http://www.w3.org/TR/WebCryptoAPI/#EcKeyGenParams-dictionary) only curves recommended by NIST which means that secp256k1 is not supported (see also: [[1]](http://lists.w3.org/Archives/Public/public-webcrypto-comments/2013Dec/0001.html), [[2]](https://bugzilla.mozilla.org/show_bug.cgi?id=1051509)).

So we use [seck256k1](https://www.npmjs.com/package/secp256k1) library in Node for ECDSA, [elliptic](https://www.npmjs.com/package/elliptic) in Browser for ECDSA and implement ECDH and ECIES manually with the help of native crypto API.

## Usage

With the help of browserify `eccrypto` provides different implementation for Browser and Node.js with the same API. Because WebCryptoAPI defines asynchronous promise-driven API, implementation for Node needs to use promises too.

```js
var eccrypto = require("eccrypto");
```

## License

eccrypto - JavaScript Elliptic curve cryptography library

Written in 2014 by Kagami Hiiragi <kagami@genshiken.org>

To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.

You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
