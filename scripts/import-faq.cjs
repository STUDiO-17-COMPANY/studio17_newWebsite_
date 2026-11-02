'use strict';
// The connector or authenticated Sheets API supplies the three approved ranges via stdin.
// Never persist raw editorial ranges in the deployable repository.
const fs = require('node:fs');
const path = require('node:path');
const { saveSnapshot } = require('../server/_faq-import.cjs');
const run = input => {
  try {
    const output = saveSnapshot(JSON.parse(input), path.resolve(__dirname, '../faq-data/approved.json'));
    console.log(`Validated ${output.records} FAQs, ${output.categories} categories; excluded ${output.excluded}. No editorial fields persisted.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
};
if (process.argv[2] === '--sheet') {
  const token = process.env.FAQ_GOOGLE_ACCESS_TOKEN;
  if (!token) { console.error('FAQ import: missing FAQ_GOOGLE_ACCESS_TOKEN; last-known-good snapshot unchanged'); process.exitCode = 1; }
  else (async () => {
    const sheetId = '1h6KHaRDvlmw5Hy2MaHvNYnVms4f3dcCy1IEjXFRk-5E';
    const read = async range => {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`FAQ Sheets read failed (${response.status}); existing snapshot unchanged`);
      return response.json();
    };
    const [content, routes, ctaDirectory] = await Promise.all([read("'FAQ Content'!A1:AC250"), read("'Routes'!A1:I40"), read("'CTA Directory'!A1:F34")]);
    run(JSON.stringify({ values: content.values, routes, ctaDirectory }));
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
}
else if (process.argv[2]) run(fs.readFileSync(process.argv[2], 'utf8'));
else {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => run(input));
}
