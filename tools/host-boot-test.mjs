/* Boots the real host entry (no plugin context) and checks the sidecar. */
import { apply } from '../index.js';

apply();
await new Promise((resolve) => setTimeout(resolve, 1500));
const res = await fetch('http://127.0.0.1:38651/health');
const json = await res.json();
if (!json.ok) throw new Error('health failed: ' + JSON.stringify(json));
console.log('host boot ok', json.port, json.protocol);
process.exit(0);
