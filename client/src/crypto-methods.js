import {AES,SHA3, enc} from "crypto-js";


/* const CryptoJS = require("crypto-js")
/* define(function (require, exports, module) {
    module.exports = {
        encryptPreferences: function(pref, secretKey) {
        return CryptoJS.AES.encrypt(pref,secretKey);
        }
    }
});
 */
export function encryptPreferences(pref, secretKey){
    return AES.encrypt(pref,secretKey).ciphertext.toString();
}

export function decryptPreferences(encPref, secretKey){
    return AES.decrypt(encPref,secretKey).toString(enc.Utf8);
}


