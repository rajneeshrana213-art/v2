const { spawn } = require('child_process');

// Strip ANSI escape codes to perform clean regex matches
const stripAnsi = (str) => {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
};

function colorizeLine(line, isStderr = false) {
  const cleanLine = stripAnsi(line);
  if (cleanLine.trim() === '') return line;

  // 1. Check for DB Slow Query logs
  // Pattern: [PERF][DB] Slow query - 5589.420999996364ms | SELECT ...
  const dbSlowQueryRegex = /^(\s*)\[PERF\]\[DB\] Slow query - (\d+(?:\.\d+)?)ms \| (.*)$/;
  const dbMatch = cleanLine.match(dbSlowQueryRegex);
  if (dbMatch) {
    const prefix = dbMatch[1];
    const duration = parseFloat(dbMatch[2]);
    const sql = dbMatch[3];

    let color = '\u001b[33m'; // Yellow
    if (duration >= 3000) {
      color = '\u001b[1m\u001b[31m'; // Bold Red for very slow (>3s)
    } else if (duration >= 1000) {
      color = '\u001b[33m'; // Yellow for slow (>1s)
    }

    return `${prefix}${color}[PERF][DB] Slow query - ${duration.toFixed(2)}ms\u001b[0m | \u001b[90m${sql}\u001b[0m`;
  }

  // 2. Check for Redis or Cache logs
  if (cleanLine.includes('[PERF][CACHE]') || cleanLine.includes('Redis error')) {
    return `\u001b[1m\u001b[31m${line}\u001b[0m`; // Bold Red
  }

  // 3. Check for API requests
  // Pattern: GET /api/v1/forum/subscription/plan 304 in 11.3s (compile: 91ms, proxy.ts: 11ms, render: 11.2s)
  const apiRegex = /^(.*?\s+)?(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+(\S+)\s+(\d{3})\s+in\s+(\d+(?:\.\d+)?m?s)(.*)$/;
  const apiMatch = cleanLine.match(apiRegex);
  if (apiMatch) {
    const prefix = apiMatch[1] || '';
    const method = apiMatch[2];
    const path = apiMatch[3];
    const status = parseInt(apiMatch[4], 10);
    const durationStr = apiMatch[5];
    const extra = apiMatch[6];

    // Method coloring
    let methodColor = '\u001b[1m'; // bold
    if (method === 'GET') methodColor += '\u001b[36m'; // Cyan
    else if (method === 'POST') methodColor += '\u001b[32m'; // Green
    else if (method === 'PUT' || method === 'PATCH') methodColor += '\u001b[33m'; // Yellow
    else if (method === 'DELETE') methodColor += '\u001b[31m'; // Red
    else methodColor += '\u001b[35m'; // Magenta for others
    const coloredMethod = `${methodColor}${method}\u001b[0m`;

    // Path coloring
    const coloredPath = `\u001b[37m${path}\u001b[0m`; // White

    // Status coloring
    let statusColor = '';
    if (status >= 200 && status < 300) {
      statusColor = '\u001b[32m'; // Green
    } else if (status >= 300 && status < 400) {
      statusColor = '\u001b[36m'; // Cyan for 3xx (Cached/Redirect)
    } else if (status >= 400 && status < 500) {
      statusColor = '\u001b[33m'; // Yellow
    } else if (status >= 500) {
      statusColor = '\u001b[1m\u001b[31m'; // Bold Red
    }
    const coloredStatus = `${statusColor}${status}\u001b[0m`;

    // Duration coloring
    let isSlow = false;
    let isVerySlow = false;
    const num = parseFloat(durationStr);
    if (durationStr.endsWith('s') && !durationStr.endsWith('ms')) {
      isSlow = num >= 1.0;
      isVerySlow = num >= 3.0;
    } else if (durationStr.endsWith('ms')) {
      isSlow = num >= 500;
      isVerySlow = num >= 1500;
    }

    let durationColor = '\u001b[32m'; // Green
    if (isVerySlow) {
      durationColor = '\u001b[1m\u001b[31m'; // Bold Red
    } else if (isSlow) {
      durationColor = '\u001b[33m'; // Yellow
    }
    const coloredDuration = `${durationColor}${durationStr}\u001b[0m`;

    // Extra components coloring (compile: 91ms, proxy.ts: 11ms, render: 11.2s)
    let coloredExtra = extra;
    if (extra.includes('(') && extra.includes(')')) {
      coloredExtra = extra.replace(/([\w\-_\.]+):\s*(\d+(?:\.\d+)?m?s)/g, (m, component, timeStr) => {
        const t = parseFloat(timeStr);
        let tSlow = false;
        let tVerySlow = false;
        if (timeStr.endsWith('s') && !timeStr.endsWith('ms')) {
          tSlow = t >= 1.0;
          tVerySlow = t >= 3.0;
        } else if (timeStr.endsWith('ms')) {
          tSlow = t >= 500;
          tVerySlow = t >= 1500;
        }
        
        let tColor = '\u001b[90m'; // Default gray
        if (tVerySlow) tColor = '\u001b[1m\u001b[31m';
        else if (tSlow) tColor = '\u001b[33m';
        else tColor = '\u001b[32m'; // Green

        return `\u001b[90m${component}:\u001b[0m ${tColor}${timeStr}\u001b[0m`;
      });
    }

    return `${prefix}${coloredMethod} ${coloredPath} ${coloredStatus} in ${coloredDuration}${coloredExtra}`;
  }

  // 4. Other performance logs
  // e.g. 🟡 [PERF] GET /api/v1/... took 200ms
  if (cleanLine.includes('[PERF]')) {
    if (cleanLine.includes('took')) {
      return line.replace(/took\s+(\d+(?:\.\d+)?ms)/g, (m, durationStr) => {
        const d = parseFloat(durationStr);
        const color = d >= 200 ? '\u001b[1m\u001b[31m' : '\u001b[33m';
        return `took ${color}${durationStr}\u001b[0m`;
      });
    }
  }

  // 5. Stderr default fallback coloring
  if (isStderr) {
    if (cleanLine.toLowerCase().includes('error')) {
      return `\u001b[31m${line}\u001b[0m`; // Red
    }
    if (cleanLine.toLowerCase().includes('warning') || cleanLine.toLowerCase().includes('warn')) {
      return `\u001b[33m${line}\u001b[0m`; // Yellow
    }
    return `\u001b[31m${line}\u001b[0m`; // Default stderr to red
  }

  // If no custom match, return original line with existing styling
  return line;
}

// Spawning the Next.js dev server with passed CLI args
const cmd = 'next';
const args = ['dev', ...process.argv.slice(2)];

const child = spawn(cmd, args, {
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    FORCE_COLOR: '1',
  }
});

// Forward standard input to let keyboard commands pass through
process.stdin.pipe(child.stdin);

// Process stdout stream
let stdoutRemainder = '';
child.stdout.on('data', (data) => {
  const lines = (stdoutRemainder + data.toString()).split(/\r?\n/);
  stdoutRemainder = lines.pop();

  for (const line of lines) {
    process.stdout.write(colorizeLine(line, false) + '\n');
  }
});

child.stdout.on('end', () => {
  if (stdoutRemainder) {
    process.stdout.write(colorizeLine(stdoutRemainder, false) + '\n');
  }
});

// Process stderr stream
let stderrRemainder = '';
child.stderr.on('data', (data) => {
  const lines = (stderrRemainder + data.toString()).split(/\r?\n/);
  stderrRemainder = lines.pop();

  for (const line of lines) {
    process.stderr.write(colorizeLine(line, true) + '\n');
  }
});

child.stderr.on('end', () => {
  if (stderrRemainder) {
    process.stderr.write(colorizeLine(stderrRemainder, true) + '\n');
  }
});

// Sync parent exit with child exit
child.on('close', (code) => {
  process.exit(code || 0);
});

// Listen to standard termination signals and clean up child
const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach((sig) => {
  process.on(sig, () => {
    child.kill(sig);
    process.exit();
  });
});
