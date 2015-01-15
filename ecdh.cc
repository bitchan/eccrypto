#include <node.h>
#include <nan.h>
#include <openssl/evp.h>
#include <openssl/ec.h>

using node::Buffer;
using v8::Handle;
using v8::FunctionTemplate;
using v8::Object;
using v8::String;

static const size_t PRIVKEY_SIZE = 32;
static const size_t PUBKEY_SIZE = 65;

#define CHECK(cond) do { if (!(cond)) goto error; } while (0)

int derive(const uint8_t* privkey_a, const uint8_t* pubkey_b, uint8_t* shared) {
  int rc = -1;
  int res;
  BIGNUM* pkey_bn = NULL;
  BIGNUM* peerkey_bn_x = NULL;
  BIGNUM* peerkey_bn_y = NULL;
  EC_KEY* pkey = NULL;
  EC_KEY* peerkey = NULL;
  EVP_PKEY* evp_pkey = NULL;
  EVP_PKEY* evp_peerkey = NULL;
  EVP_PKEY_CTX* ctx = NULL;
  size_t shared_len = PRIVKEY_SIZE;

  // Private key A.
  CHECK((pkey_bn = BN_bin2bn(privkey_a, PRIVKEY_SIZE, NULL)) != NULL);
  CHECK((pkey = EC_KEY_new_by_curve_name(NID_secp256k1)) != NULL);
  CHECK(EC_KEY_set_private_key(pkey, pkey_bn) == 1);
  CHECK((evp_pkey = EVP_PKEY_new()) != NULL);
  CHECK(EVP_PKEY_set1_EC_KEY(evp_pkey, pkey) == 1);

  // Public key B.
  CHECK((peerkey_bn_x = BN_bin2bn(pubkey_b+1, PRIVKEY_SIZE, NULL)) != NULL);
  CHECK((peerkey_bn_y = BN_bin2bn(pubkey_b+33, PRIVKEY_SIZE, NULL)) != NULL);
  CHECK((peerkey = EC_KEY_new_by_curve_name(NID_secp256k1)) != NULL);
  res = EC_KEY_set_public_key_affine_coordinates(peerkey,
                                                 peerkey_bn_x,
                                                 peerkey_bn_y);
  CHECK(res == 1);
  CHECK((evp_peerkey = EVP_PKEY_new()) != NULL);
  CHECK(EVP_PKEY_set1_EC_KEY(evp_peerkey, peerkey) == 1);

  // Derive shared secret.
  CHECK((ctx = EVP_PKEY_CTX_new(evp_pkey, NULL)) != NULL);
  CHECK(EVP_PKEY_derive_init(ctx) == 1);
  CHECK(EVP_PKEY_derive_set_peer(ctx, evp_peerkey) == 1);
  CHECK((EVP_PKEY_derive(ctx, shared, &shared_len)) == 1);
  CHECK(shared_len == PRIVKEY_SIZE);

  rc = 0;
error:
  EVP_PKEY_CTX_free(ctx);
  EVP_PKEY_free(evp_peerkey);
  EC_KEY_free(peerkey);
  BN_free(peerkey_bn_y);
  BN_free(peerkey_bn_x);
  EVP_PKEY_free(evp_pkey);
  EC_KEY_free(pkey);
  BN_free(pkey_bn);
  return rc;
}

#undef CHECK

NAN_METHOD(Derive) {
  NanScope();

  if (args.Length() != 2 ||
      !args[0]->IsObject() ||  // privkey_a
      !args[1]->IsObject()) {  // pubkey_b
    return NanThrowError("Bad input");
  }

  char* privkey_a = Buffer::Data(args[0]->ToObject());
  size_t privkey_a_len = Buffer::Length(args[0]->ToObject());
  char* pubkey_b = Buffer::Data(args[1]->ToObject());
  size_t pubkey_b_len = Buffer::Length(args[1]->ToObject());
  if (privkey_a == NULL ||
      privkey_a_len != PRIVKEY_SIZE ||
      pubkey_b == NULL ||
      pubkey_b_len != PUBKEY_SIZE ||
      pubkey_b[0] != 4) {
    return NanThrowError("Bad input");
  }

  uint8_t* shared = (uint8_t *)malloc(PRIVKEY_SIZE);
  if (shared == NULL ||
      derive((uint8_t *)privkey_a, (uint8_t *)pubkey_b, shared)) {
    free(shared);
    return NanThrowError("Internal error");
  }
  NanReturnValue(NanBufferUse((char *)shared, PRIVKEY_SIZE));
}

void InitAll(Handle<Object> exports) {
  exports->Set(
      NanNew<String>("derive"),
      NanNew<FunctionTemplate>(Derive)->GetFunction());
}

NODE_MODULE(ecdh, InitAll)
