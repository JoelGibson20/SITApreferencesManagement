import aesjs from "aes-js"; // https://github.com/ricmoo/aes-js
import crypto from 'crypto';
import {sha3_512} from 'js-sha3'; // https://github.com/emn178/js-sha3

//  Methods using AES follow example here: https://github.com/ricmoo/aes-js

export function genKey(){
    var key = crypto.randomBytes(32);
    var hexKey = aesjs.utils.hex.fromBytes(key);
    return (hexKey);
}

export function encryptPreferences(pref, secretKey){
    var key = aesjs.utils.hex.toBytes(secretKey); // Convert hex secret key to bytes
    var prefBytes = aesjs.utils.utf8.toBytes(pref); // Convert preferences string to bytes

    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var encryptedBytes = aesCtr.encrypt(prefBytes); // Encrypt preferences

    var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes); // Convert encrypted preferences to hex for storage

    return(encryptedHex);

}

export function decryptPreferences(encPref, secretKey){
    var key = aesjs.utils.hex.toBytes(secretKey); // Convert hex secret key to bytes
    var encPrefBytes = aesjs.utils.hex.toBytes(encPref); // Convert encrypted preferences from hex to bytes

    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5)); 
    var decryptedBytes = aesCtr.decrypt(encPrefBytes); // Decrypt preferences

    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes); // Converts decrypted bytes to UTF-8 text
    return(decryptedText);
}

export function hashKey(secretKey){
    return(sha3_512(secretKey)); // Returns the SHA3-512 hash of the key as a string
}


