import crypto from "crypto";

class SecurityManager {
    private encryptionKey: Buffer;
    private signingKey: Buffer;

    constructor(masterKey: string) {
        this.encryptionKey = crypto.scryptSync(masterKey, 'encrypt-salt', 32);
        this.signingKey = crypto.scryptSync(masterKey, 'signing-salt', 32);
    }

    encrypt(data: any, additionalData?: string): string {
        const iv = crypto.randomBytes(16);
        const payload = JSON.stringify(data);

        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

        if (additionalData) {
            cipher.setAAD(Buffer.from(additionalData));
        }

        let encrypted = cipher.update(payload, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag();

        return Buffer.concat([
            iv,
            authTag,
            Buffer.from(encrypted, 'base64')
        ]).toString('base64');
    }

    decrypt(encryptedData: string, additionalData?: string): any {
        const buffer = Buffer.from(encryptedData, 'base64');

        const iv = buffer.subarray(0, 16);
        const authTag = buffer.subarray(16, 32);
        const encrypted = buffer.subarray(32);

        const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
        decipher.setAuthTag(authTag);

        if (additionalData) {
            decipher.setAAD(Buffer.from(additionalData));
        }

        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    }

    sign(data: any): string {
        const payload = JSON.stringify(data);
        return crypto.createHmac('sha256', this.signingKey)
            .update(payload)
            .digest('base64');
    }

    verify(data: any, signature: string): boolean {
        const expectedSignature = this.sign(data);
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'base64'),
            Buffer.from(expectedSignature, 'base64')
        );
    }

    generateToken(payload: any, expiresIn: number = 3600): string {
        const tokenData = {
            payload,
            exp: Date.now() + (expiresIn * 1000),
            iat: Date.now()
        };

        return this.encrypt(tokenData);
    }

    verifyToken(token: string): any {
        try {
            const data = this.decrypt(token);

            if (Date.now() > data.exp) {
                throw new Error('Token expired');
            }

            return data.payload;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
;
export default SecurityManager;