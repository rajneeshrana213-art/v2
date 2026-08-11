const fs = require('fs');
const content = fs.readFileSync('C:/Users/DELL/.gemini/antigravity-ide/brain/18a7c288-70dd-4b1f-988b-2b8489237398/.system_generated/logs/transcript.jsonl', 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  if (line.includes('toc-nav')) {
    try {
      const obj = JSON.parse(line);
      console.log(`Step ${obj.step_index} keys:`, Object.keys(obj));
      if (obj.content) {
        console.log(`- content length: ${obj.content.length}`);
        if (obj.content.includes('toc-nav')) {
          const idx = obj.content.indexOf('toc-nav');
          console.log(`- content snippet around toc-nav:`, obj.content.substring(idx - 100, idx + 400));
        }
      }
      if (obj.output) {
        console.log(`- output: ${typeof obj.output}`);
        const outStr = typeof obj.output === 'string' ? obj.output : JSON.stringify(obj.output);
        if (outStr.includes('toc-nav')) {
          const idx = outStr.indexOf('toc-nav');
          console.log(`- output snippet around toc-nav:`, outStr.substring(idx - 100, idx + 400));
        }
      }
    } catch (e) {
      console.log('JSON parse error on line with toc-nav:', e.message);
    }
  }
}
