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

    // Splits the secret key back into key and IV
    var key = combined.substring(0,32)
    console.log("substring key = ", key);
    var iv = combined.substring(32)
    console.log("substring iv = ", iv);

    var cipher = forge.cipher.createCipher('AES-CBC', forge.util.createBuffer(key)); // Forge uses its own buffer format so create buffer to avoid errors
    cipher.start({iv: forge.util.createBuffer(iv)}); // Forge uses its own buffer format so create buffer to avoid errors
    cipher.update(forge.util.createBuffer(pref));
    cipher.finish();
    var encrypted = cipher.output;
    // outputs encrypted hex
    console.log("encrypted = ", encrypted);
    console.log(encrypted.toHex());

    decryptPreferences(encrypted, secretKey);
    

}

export function decryptPreferences(encPref, secretKey){
    var combined = Buffer.from(secretKey, 'hex').toString();
    
    // Splits the secret key back into key and IV
    var key = combined.substring(0,32)
    console.log("substring key = ", key);
    var iv = combined.substring(32)
    console.log("substring iv = ", iv);



    var decipher = forge.cipher.createDecipher('AES-CBC', forge.util.createBuffer(key)); // Forge uses its own buffer format so create buffer to avoid errors
    decipher.start({iv: forge.util.createBuffer(iv)}); // Forge uses its own buffer format so create buffer to avoid errors
    decipher.update(encPref);
    var result = decipher.finish(); // check 'result' for true/false
    // outputs decrypted hex
    console.log(decipher.output);
    console.log(decipher.output.toHex());
    var result = Buffer.from(decipher.output.toHex(), 'hex').toString();
    console.log("result = ", result);
}


