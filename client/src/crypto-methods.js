import {AES,SHA3, enc} from "crypto-js";
import forge from "node-forge";
import hex from "string-hex"; // This library provides method to convert string to hex without needing to write my own method


/* const CryptoJS = require("crypto-js")
/* define(function (require, exports, module) {
    module.exports = {
        encryptPreferences: function(pref, secretKey) {
        return CryptoJS.AES.encrypt(pref,secretKey);
        }
    }
});
 */
/* export function encryptPreferences(pref, secretKey){
    return AES.encrypt(pref,secretKey); // Returns CipherParams which current contract iteration can't store
    //return AES.encrypt(pref,secretKey).ciphertext.toString() // Returning just the ciphertext leaves AES.decrypt unable to decrypt as it needs CipherParams not string
}

export function decryptPreferences(encPref, secretKey){
    return AES.decrypt(encPref,secretKey).toString(enc.Utf8); // Doesn't work unless provided CipherParams
}
 */

export function genKey(){
 
    // This is a test at producing a secretKey which is a 16 byte forge key + 16 byte IV, then converting to hex from easier user storage
    var key = forge.random.getBytesSync(16);
    var iv = forge.random.getBytesSync(16);
    var combined = key + iv;
    console.log("combined = ", combined);

    var hexCombined = Buffer.from(combined, 'utf8').toString('hex');
    console.log("hexcombined = ", hexCombined);

    var combinedAgain = Buffer.from(hexCombined, 'hex').toString();
    console.log("combined again = ", combinedAgain);
    console.log(combined == combinedAgain); // Returns true, as the original utf8 combined key+iv and re-converted back from hex combined are the same
}

export function encryptPreferences(pref, secretKey){

   /*  var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(someBytes));
    cipher.finish();
    var encrypted = cipher.output;
    // outputs encrypted hex
    console.log(encrypted.toHex()); */

    return AES.encrypt(pref,secretKey); // Returns CipherParams which current contract iteration can't store
}

export function decryptPreferences(encPref, secretKey){
    return AES.decrypt(encPref,secretKey).toString(enc.Utf8); // Doesn't work unless provided CipherParams
}


