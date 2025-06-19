const fs = require('fs')
const path = require('path')
const md5 = require('md5')
const CryptoJS = require('crypto-js')
const self = process.argv[1]
const jsonFile = process.argv[2]

if (!jsonFile) {
  console.log(`Usage: node ${path.basename(self)} json_file > encrypted_json`)
  process.exit()
}

const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

const encryptWithAES = (text, passphrase) => {
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

const decryptWithAES = (ciphertext, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

const encryptJson = (json, key) => ({
  ...json,
  accessCode: md5(key),
  ...(json.ios && {
    ios: {
      ...json.ios,
      url: encryptWithAES(json.ios.url, key)
    }
  }),
  ...(json.android && {
    android: {
      ...json.android,
      url: encryptWithAES(json.android.url, key)
    }
  })
})

const decryptJson = (json, key) => ({
  ...json,
  ...(json.ios && {
    ios: {
      ...json.ios,
      url: decryptWithAES(json.ios.url, key)
    }
  }),
  ...(json.android && {
    android: {
      ...json.android,
      url: decryptWithAES(json.android.url, key)
    }
  })
})

const encryptedJson = encryptJson(json, json.accessCode)

console.log(JSON.stringify(encryptedJson, null, 2))

// console.log(`test with decryption:`)
// console.log(JSON.stringify(decryptJson(encryptedJson, json.accessCode), null, 2))