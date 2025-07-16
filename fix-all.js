// fix-all.js - Run this to automatically fix common issues
const fs = require('fs');
const path = require('path');

console.log('🔧 Auto-fixing your WeWeb component...\n');

// 1. Rename TypeScript files to JavaScript
console.log('📝 Step 1: Converting TypeScript files to JavaScript...');
const renames = [
  ['src/App.tsx', 'src/App.jsx'],
  ['src/Threads.tsx', 'src/Threads.jsx'],
  ['src/liveblocks.config.ts', 'src/liveblocks.config.js']
];

renames.forEach(([from, to]) => {
  if (fs.existsSync(from) && !fs.existsSync(to)) {
    fs.renameSync(from, to);
    console.log(`  ✅ Renamed ${from} to ${to}`);
  }
});

// 2. Add React imports to JSX files
console.log('\n📝 Step 2: Adding React imports to JSX files...');
const jsxFiles = ['src/App.jsx', 'src/Editor.jsx', 'src/Threads.jsx'];

jsxFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if React import already exists
    if (!content.includes("import React from 'react'") && 
        !content.includes('import React from "react"')) {
      
      // Add React import at the very beginning
      content = "import React from 'react'; // Added by fix script\n" + content;
      fs.writeFileSync(file, content);
      console.log(`  ✅ Added React import to ${file}`);
    } else {
      console.log(`  ✓ ${file} already has React import`);
    }
  }
});

// 3. Create ww-config.json if it doesn't exist
console.log('\n📝 Step 3: Creating ww-config.json...');
if (!fs.existsSync('ww-config.json')) {
  const config = {
    name: "collaborative-editor",
    componentPath: "./src/wwElement.vue",
    editor: {
      label: {
        en: "Collaborative Editor"
      },
      icon: "edit",
      category: "forms"
    },
    properties: {
      roomId: {
        label: { en: "Room ID" },
        type: "Text",
        defaultValue: "my-room",
        bindable: true,
        section: "settings",
        help: "Unique identifier for the collaborative room"
      },
      publicApiKey: {
        label: { en: "Liveblocks Public API Key" },
        type: "Text",
        defaultValue: "",
        bindable: true,
        section: "settings",
        required: true,
        help: "Get your public key from liveblocks.io dashboard"
      }
    }
  };
  
  fs.writeFileSync('ww-config.json', JSON.stringify(config, null, 2));
  console.log('  ✅ Created ww-config.json');
  
  // Remove old ww-config.js if exists
  if (fs.existsSync('ww-config.js')) {
    fs.unlinkSync('ww-config.js');
    console.log('  ✅ Removed old ww-config.js');
  }
} else {
  console.log('  ✓ ww-config.json already exists');
}

// 4. Update package.json
console.log('\n📝 Step 4: Updating package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  let updated = false;
  
  // Add weweb section if missing
  if (!pkg.weweb) {
    pkg.weweb = { componentPath: "./src/wwElement.vue" };
    updated = true;
  }
  
  // Add scripts if missing
  if (!pkg.scripts) pkg.scripts = {};
  if (!pkg.scripts.postinstall) {
    pkg.scripts.postinstall = "node patch-webpack-dev.js";
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('  ✅ Updated package.json');
  } else {
    console.log('  ✓ package.json already configured');
  }
} catch (e) {
  console.log('  ❌ Error updating package.json:', e.message);
}

// 5. Final summary
console.log('\n✅ Auto-fix complete!');
console.log('\n⚠️  IMPORTANT: You still need to manually:');
console.log('1. Replace the CONTENT of these files with the fixed versions from the artifacts:');
console.log('   - src/App.jsx');
console.log('   - src/Editor.jsx'); 
console.log('   - src/Threads.jsx');
console.log('   - src/wwElement.vue');
console.log('\n2. Then run: npx weweb serve');
console.log('\n💡 The main issue was missing "import React from \'react\';" in JSX files!');