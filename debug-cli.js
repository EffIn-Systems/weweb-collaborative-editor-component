// debug-cli.js - Run this to investigate WeWeb CLI
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Investigating WeWeb CLI Setup\n');

// 1. Find where weweb CLI is installed
try {
  const cliPath = execSync('npm list @weweb/cli', { encoding: 'utf8' });
  console.log('📦 WeWeb CLI location:');
  console.log(cliPath);
} catch (e) {
  console.log('❌ Could not find @weweb/cli in node_modules');
}

// 2. Check current directory structure
console.log('\n📁 Current directory:', process.cwd());
console.log('Files in current directory:');
const files = fs.readdirSync('.');
files.forEach(file => {
  const stats = fs.statSync(file);
  console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
});

// 3. Look for config loading in CLI
const possibleCliPaths = [
  './node_modules/@weweb/cli',
  '../node_modules/@weweb/cli',
  './node_modules/.bin/weweb'
];

console.log('\n🔎 Searching for CLI files that might load config:');
possibleCliPaths.forEach(cliPath => {
  try {
    if (fs.existsSync(cliPath)) {
      console.log(`\n✅ Found: ${cliPath}`);
      
      // Look for files that might load ww-config
      const findConfigLoaders = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        entries.forEach(entry => {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && !entry.name.includes('node_modules')) {
            findConfigLoaders(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('ww-config') || content.includes('webpack(')) {
              console.log(`  📝 ${fullPath} mentions ww-config or webpack`);
              
              // Look for the actual require/import statement
              const requireMatch = content.match(/require\(['"](.*ww-config.*)['"]\)/);
              const importMatch = content.match(/import.*from\s+['"](.*ww-config.*)['"]/);
              
              if (requireMatch) {
                console.log(`     → require('${requireMatch[1]}')`);
              }
              if (importMatch) {
                console.log(`     → import from '${importMatch[1]}'`);
              }
            }
          }
        });
      };
      
      if (fs.statSync(cliPath).isDirectory()) {
        findConfigLoaders(cliPath);
      }
    }
  } catch (e) {
    // Silently skip if path doesn't exist
  }
});

// 4. Test loading config directly
console.log('\n🧪 Testing config loading:');
try {
  const config = require('./ww-config.js');
  console.log('✅ require("./ww-config.js") works!');
  console.log('   Config name:', config.name);
  console.log('   Has webpack function:', typeof config.webpack === 'function');
} catch (e) {
  console.log('❌ require("./ww-config.js") failed:', e.message);
}