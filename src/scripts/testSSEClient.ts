// Use require for CJS compatibility
// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { EventSource: ES } = require('eventsource');

const query = process.argv[2] || 'alexander';
const url = `http://localhost:4000/api/search?query=${encodeURIComponent(query)}&limit=5`;
console.log('Connecting to', url);
const es = new ES(url);

es.addEventListener('meta', e => console.log('[meta]', e.data));
(es as any).addEventListener('result', (e: MessageEvent) => console.log('[result]', e.data));
(es as any).addEventListener('end', (e: MessageEvent) => { console.log('[end]', e.data); es.close(); });
(es as any).addEventListener('error', (e: MessageEvent) => { console.log('[error]', e); });

setTimeout(()=>{ console.log('Timeout closing connection'); es.close(); }, 60000);
