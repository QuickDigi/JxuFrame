import path from "path";
import { metricsCollector, processPool } from "../../../define";
import fs from "fs";

interface SendPhpOptions {
    phpPath?: string;
    env?: NodeJS.ProcessEnv;
    timeout?: number;
}

function splitPhpResponse(raw: string) {
    const hasSeparator = raw.includes("\r\n\r\n") || raw.includes("\n\n");
    if (!hasSeparator) {
        // لا هيدرات: أرجع البادىء بالكامل كـ body
        return {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            body: raw,
            statusCode: 200
        };
    }

    const separator = raw.includes("\r\n\r\n") ? "\r\n\r\n" : "\n\n";
    const [rawHeaders, ...bodyParts] = raw.split(separator);
    const body = bodyParts.join(separator);

    const headers: Record<string, string> = {};
    let statusCode = 200;

    rawHeaders
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((line) => {
            if (/^HTTP\/\d\.\d\s+\d+/.test(line)) {
                statusCode = parseInt(line.split(" ")[1], 10);
            } else if (/^Status:/i.test(line)) {
                const code = parseInt(line.split(":")[1], 10);
                if (!isNaN(code)) statusCode = code;
            } else if (/^[A-Za-z0-9\-]+:\s*.+$/.test(line)) {      // key: value
                const [key, ...rest] = line.split(":");
                headers[key.trim()] = rest.join(":").trim();
            }
            // أى سطر غير ذلك يُتجاهَل
        });

    // تأكيد Content-Type
    if (!headers["Content-Type"])
        headers["Content-Type"] = "text/plain; charset=utf-8";

    return { headers, body, statusCode };
}


async function SendPHPFile(
    filePath: string,
    res: any,
    req: any,
    options: SendPhpOptions = {}
) {
    const startTime = performance.now();
    const phpExePath =
        options.phpPath ||
        path.resolve(__dirname, "../../../../runner/php/php.exe");
    const phpScriptPath = path.resolve(
        __dirname,
        `../../../../Controller/${filePath}`
    );

    try {
        const result = await processPool.executeTask("php", {
            phpExePath,
            phpScriptPath,
            env: options.env || {},
            timeout: options.timeout || 30000,
        });

        const { headers, body, statusCode } = splitPhpResponse(result.stdout);

        // سجّل الميتريكس
        const duration = performance.now() - startTime;
        metricsCollector.recordRequest(
            req.route?.path || req.path,
            req.method,
            statusCode,
            duration
        );

        if (!res.headersSent) {
            // طبّق الهيدرز القادمة من PHP
            Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
            res.status(statusCode).send(body);
        } else {
            console.warn("Headers were already sent! Nothing returned to client.");
        }
    } catch (error: any) {
        const duration = performance.now() - startTime;
        metricsCollector.recordRequest(
            req.route?.path || req.path,
            req.method,
            500,
            duration
        );

        console.error("PHP execution error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 500,
                message: "PHP execution failed",
                errorMessage: error.message,
                requestId: req.headers["x-request-id"],
            });
        }
    }
}

export default SendPHPFile;
