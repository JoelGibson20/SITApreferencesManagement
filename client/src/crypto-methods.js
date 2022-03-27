import {AES,SHA3} from "crypto-js";


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
    return AES.encrypt(pref,secretKey);
}

export function decryptPreferences(encPref, secretKey){
    return AES.decrypt(encPref,secretKey);
}


