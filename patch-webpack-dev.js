// patch-webpack-dev.js - Run this to patch the WeWeb CLI
const fs = require('fs');
const path = require('path');

// Path to the webpack dev config
const configPath = './node_modules/@weweb/cli/webpack.dev.config.js';

console.log('🔧 Patching WeWeb CLI to remove React externals...');

try {
  // Read the current config
  let content = fs.readFileSync(configPath, 'utf8');
  
  // Check if already patched
  if (content.includes('PATCHED_BY_SCRIPT')) {
    console.log('✅ Already patched!');
    process.exit(0);
  }
  
  // Find and replace the externals section
  const originalExternals = `externals: {
            vue: "Vue",
            react: "React",
            "react-dom": "ReactDOM",
        },`;
  
  const newExternals = `// PATCHED_BY_SCRIPT - React bundled instead of external
        externals: {
            vue: "Vue",
            // react: "React",          // COMMENTED OUT TO BUNDLE
            // "react-dom": "ReactDOM", // COMMENTED OUT TO BUNDLE
        },`;
  
  if (content.includes(originalExternals)) {
    content = content.replace(originalExternals, newExternals);
    
    // Write the patched file
    fs.writeFileSync(configPath, content);
    console.log('✅ Successfully patched webpack.dev.config.js!');
    console.log('📦 React and ReactDOM will now be bundled.');
    console.log('\n🚀 Run "npx weweb serve" to test!');
  } else {
    console.log('❌ Could not find externals section to patch.');
    console.log('The file may have already been modified or has a different format.');
  }
  
} catch (error) {
  console.error('❌ Error patching file:', error.message);
}
