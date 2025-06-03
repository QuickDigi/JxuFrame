import os from 'os';
import { spawn } from "child_process";

interface PhpTaskData {
    phpExePath: string;
    phpScriptPath: string;
    env?: NodeJS.ProcessEnv;
    timeout?: number;
}

class ProcessPoolManager {
    private workers = new Map<string, any>();
    private taskQueue: any[] = [];
    private maxWorkers: number;

    constructor(maxWorkers = os.cpus().length) {
        this.maxWorkers = maxWorkers;
    }

    async executeTask(type: string, data: PhpTaskData): Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
    }> {
        if (type !== "php") {
            throw new Error(`Unsupported type: ${type}`);
        }

        const { phpExePath, phpScriptPath, env = {}, timeout = 30000 } = data;

        return new Promise((resolve, reject) => {
            const child = spawn(phpExePath, [phpScriptPath], {
                env: { ...process.env, ...env }
            });

            let stdout = "";
            let stderr = "";

            const timer = setTimeout(() => {
                child.kill("SIGTERM");
                reject(new Error(`PHP execution timed out after ${timeout}ms`));
            }, timeout);

            child.stdout.on("data", (chunk) => {
                stdout += chunk.toString();
            });

            child.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
            });

            child.on("close", (code) => {
                clearTimeout(timer);
                resolve({ stdout, stderr, exitCode: code ?? -1 });
            });

            child.on("error", (err) => {
                clearTimeout(timer);
                reject(err);
            });
        });
    }
}

export default ProcessPoolManager;
