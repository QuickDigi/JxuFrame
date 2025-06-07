// src/loadEnv.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

export function DotEnv(path: string = '.ENV'): string | any | undefined {
    const envPath = resolve(process.cwd(), path);
    const file = readFileSync(envPath, 'utf-8');

    file.split('\n').forEach((line) => {
        const clean = line.trim();
        if (!clean || clean.startsWith('#')) return;

        const [key, ...rest] = clean.split('=');
        const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');

        if (!process.env[key]) {
            process.env[key] = value;
        }
    });
}
;