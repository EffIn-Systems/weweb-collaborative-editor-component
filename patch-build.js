// patch-build.js - Patch the production build config
const fs = require('fs');

const buildPath = './node_modules/@weweb/cli/bin/controllers/build.js';

console.log('🔧 Patching build config for production...');

try {
  let content = fs.readFileSync(buildPath, 'utf8');
  
  // Remove React from externals in the production build
  const originalExternals = `externals: {
                vue: 'Vue',
            },`;
  
  const newExternals = `externals: {
                vue: 'Vue',
                // PATCHED: React removed from externals to bundle it
                // react: 'React',
                // 'react-dom': 'ReactDOM',
            },`;
  
  if (content.includes(originalExternals)) {
    content = content.replace(originalExternals, newExternals);
    fs.writeFileSync(buildPath, content);
    console.log('✅ Successfully patched build.js!');
  } else {
    console.log('✓ Build config already patched or different format.');
  }
  
} catch (error) {
  console.error('❌ Error patching build:', error.message);
  console.log('Continuing anyway - build might still work...');
}