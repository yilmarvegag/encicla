import { writeFile } from 'node:fs/promises';
await writeFile('.next/msw-ready', 'ok');