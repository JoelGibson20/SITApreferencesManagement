//import {AES,SHA3, enc} from "crypto-js";
import forge from "node-forge";
import Web3 from "web3";
import aesjs from "aes-js";
import crypto from 'crypto';

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

export function testAESjs(){
    //var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
    var key = crypto.randomBytes(32);

    // Convert text to bytes
    var text = '1234';
    var textBytes = aesjs.utils.utf8.toBytes(text);

    // The counter is optional, and if omitted will begin at 1
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var encryptedBytes = aesCtr.encrypt(textBytes);

    // To print or store the binary data, you may convert it to hex
    var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    console.log("encryptedHex = ",encryptedHex);
    // "a338eda3874ed884b6199150d36f49988c90f5c47fe7792b0cf8c7f77eeffd87
    //  ea145b73e82aefcf2076f881c88879e4e25b1d7b24ba2788"

    // When ready to decrypt the hex string, convert it back to bytes
    var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    console.log("decrypted text = ", decryptedText);
}

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
    //var iv = forge.random.getBytesSync(16);
    /* console.log("key = ", key);
    console.log("iv= ", iv);
    console.log("combined = ", key + iv); */

    return(Buffer.from(key, 'utf8').toString('hex'));
    
}

export function encryptPreferences(pref, secretKey){
    var combined = Buffer.from(secretKey, 'hex').toString();

    console.log("combined = ", combined);

    // Splits the secret key back into key and IV
    var key = combined.substring(0,32)
   /*  console.log("substring key = ", key); */
    var iv = combined.substring(32)
    /* console.log("substring iv = ", iv); */

    var cipher = forge.cipher.createCipher('AES-CBC', forge.util.createBuffer(key)); // Forge uses its own buffer format so create buffer to avoid errors
    cipher.start({iv: forge.util.createBuffer(iv)}); // Forge uses its own buffer format so create buffer to avoid errors
    cipher.update(forge.util.createBuffer(pref));
    cipher.finish();
    var encrypted = cipher.output;
    // outputs encrypted hex
    console.log("encrypted = ", encrypted);
    var encryptedHex = encrypted.toHex();

    console.log("encryptedHex = ", encryptedHex);

    var test = Buffer.from(encryptedHex,'hex');
    console.log("test = ", test);
    var test2 = Web3.utils.hexToBytes(encryptedHex);
    console.log("test = ", test2);

    return(encrypted.toHex());
    

}

export function decryptPreferences(encPref, secretKey){
    // How do I either store ByteStringBuffer in contract, or convert string enc(pref) back into ByteStringBuffer for decryption
    var combined = Buffer.from(secretKey, 'hex').toString();
    
    // Splits the secret key back into key and IV
    var key = combined.substring(0,32);
    //console.log("substring key = ", key);
    var iv = combined.substring(32);
    //console.log("substring iv = ", iv);

    var encPreFBuffer = encPref;
    console.log("encPrefBuffer = ", encPreFBuffer);
    var decipher = forge.cipher.createDecipher('AES-CBC', forge.util.createBuffer(key)); // Forge uses its own buffer format so create buffer to avoid errors
    decipher.start({iv: forge.util.createBuffer(iv)}); // Forge uses its own buffer format so create buffer to avoid errors
    decipher.update(new forge.util.ByteBuffer(encPref));
    var result = decipher.finish(); // check 'result' for true/false
    // outputs decrypted hex
    console.log("decipher output = ",decipher.output);
    console.log("decipher hex output = ",decipher.output.toHex());
    var result = Buffer.from(decipher.output.toHex(), 'hex').toString();
    console.log("result = ", result);
    console.log("result2 = ", forge.util.encode64(decipher.output.getBytes()));

    return(result);
}


