import {AES,SHA3, enc} from "crypto-js";
import forge from "node-forge";

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
 
   /*  // This is a test at producing a secretKey which is a 16 byte forge key + 16 byte IV, then converting to hex from easier user storage
    var key = forge.random.getBytesSync(16);
    var iv = forge.random.getBytesSync(16);
    var combined = key + iv;
    console.log("combined = ", combined);

    var hexCombined = Buffer.from(combined, 'utf8').toString('hex');
    console.log("hexcombined = ", hexCombined);

    var combinedAgain = Buffer.from(hexCombined, 'hex').toString();
    console.log("combined again = ", combinedAgain);
    console.log(combined == combinedAgain); // Returns true, as the original utf8 combined key+iv and re-converted back from hex combined are the same */

    var key = forge.random.getBytesSync(32);
    var iv = forge.random.getBytesSync(16);
    console.log("key = ", key);
    console.log("iv= ", iv);
    console.log("combined = ", key + iv);

    return(Buffer.from(key + iv, 'utf8').toString('hex'));
    
}

export function encryptPreferences(pref, secretKey){
    var combined = Buffer.from(secretKey, 'hex').toString();
    console.log("combined = ", combined);
    var keyIV = combined.match(/.{1,32}/g); // Splits the combined key + iv into [key,iv]
    console.log(keyIV[0]);
    console.log(keyIV[1]);
    var key = keyIV[0];
    var iv = keyIV[1];

    var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(pref));
    cipher.finish();
    var encrypted = cipher.output;
    // outputs encrypted hex
    console.log(encrypted);
    console.log(encrypted.toHex());

    decryptPreferences(encrypted, secretKey);
    

}

export function decryptPreferences(encPref, secretKey){
    var combined = Buffer.from(secretKey, 'hex').toString();
    var keyIV = combined.match(/.{1,32}/g); // Splits the combined key + iv into [key,iv]
    var key = keyIV[0];
    var iv = keyIV[1];


    var decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(encPref);
    var result = decipher.finish(); // check 'result' for true/false
    // outputs decrypted hex
    console.log(decipher.output);
    console.log(decipher.output.toHex());
    var result = Buffer.from(decipher.output.toHex(), 'hex').toString();
    console.log("result = ", result);
}


