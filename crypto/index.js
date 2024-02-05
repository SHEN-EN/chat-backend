const NodeRSA = require('node-rsa');

class cryptoRSA {
    constructor() {
        this.key = new NodeRSA({ b: 1024 });
        this.key.setOptions({ encryptionScheme: 'pkcs1' })
        this.publicKey = this.key.exportKey('pkcs8-public');
        this.privateKey = this.key.exportKey('pkcs8-private');
    }
    decrypt(data) {
        this.key.importKey(this.key.exportKey('pkcs8-private'))
        return this.key.decrypt(data, 'utf8');
    }
}
module.exports = cryptoRSA