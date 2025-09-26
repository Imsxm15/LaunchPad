import { execSync } from 'child_process';

function checkNodeVersion(): void {
  const requiredVersion = '20.0.0';
  const currentVersion = process.version.slice(1); // Remove 'v' prefix
  
  const [currentMajor] = currentVersion.split('.').map(Number);
  const [requiredMajor] = requiredVersion.split('.').map(Number);
  
  if (currentMajor < requiredMajor) {
    console.error(`❌ Node.js ${requiredVersion}+ is required. Current version: ${process.version}`);
    console.error(`Please upgrade Node.js or use nvm: nvm use`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version check passed: ${process.version}`);
}

checkNodeVersion();