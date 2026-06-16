import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);
console.log("HASH:", process.env.AUTH_PASSWORD_HASH);
