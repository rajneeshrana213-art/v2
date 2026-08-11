import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const reqPaths = [
  'rit-ai/face-attendance/requirements.txt',
  'rit-ai/timetableAi/requirements.txt'
];

function checkCommand(command, args = []) {
  try {
    const result = spawnSync(command, args, { stdio: 'ignore' });
    return result.status === 0;
  } catch (e) {
    return false;
  }
}

function runSetup() {
  console.log('--- Starting AI Dependency Setup ---');

  // Try to find the best python/pip command
  let pythonCmd = null;
  const candidates = ['python', 'python3', 'py'];
  
  for (const cmd of candidates) {
    if (checkCommand(cmd, ['--version'])) {
      pythonCmd = cmd;
      break;
    }
  }

  if (!pythonCmd) {
    console.log('Skipping AI dependencies: Python not found in system PATH.');
    return;
  }

  console.log(`Using: ${pythonCmd}`);

  // Construct absolute paths for requirements
  const absReqPaths = reqPaths.map(rp => path.join(rootDir, rp));
  
  const args = ['-m', 'pip', 'install'];
  absReqPaths.forEach(rp => {
    args.push('-r', rp);
  });

  console.log(`Running: ${pythonCmd} ${args.join(' ')}`);

  const result = spawnSync(pythonCmd, args, { 
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  if (result.status !== 0) {
    console.error(`AI dependency setup failed with exit code ${result.status}`);
    // We don't exit with non-zero to keep npm install going, 
    // unless you want it to hard fail.
  } else {
    console.log('--- AI Dependency Setup Completed Successfully ---');
  }
}

runSetup();
