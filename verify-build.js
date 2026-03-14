#!/usr/bin/env node

// Frontend build verification script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying frontend build...');

// Check required files exist
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'postcss.config.mjs',
  'app/layout.tsx',
  'app/page.tsx',
  'services/verificationService.ts',
  'app/admin/evaluations/[id]/page.tsx'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'start', 'lint', 'test'];

console.log('\n📦 Package.json scripts:');
requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
  } else {
    console.log(`❌ ${script} - MISSING`);
    allFilesExist = false;
  }
});

// Check key dependencies
console.log('\n📚 Key Dependencies:');
const keyDeps = ['next', 'react', 'react-dom', 'typescript', 'tailwindcss'];

keyDeps.forEach(dep => {
  const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
  if (version) {
    console.log(`✅ ${dep}: ${version}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    allFilesExist = false;
  }
});

// Check Next.js configuration
console.log('\n⚙️ Next.js Configuration:');
try {
  const nextConfigPath = 'next.config.ts';
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    if (nextConfigContent.includes('res.cloudinary.com')) {
      console.log('✅ Cloudinary images configured');
    } else {
      console.log('⚠️ Cloudinary images not configured - may cause image loading issues');
    }
    if (nextConfigContent.includes('remotePatterns')) {
      console.log('✅ Remote patterns configured');
    } else {
      console.log('⚠️ Remote patterns not configured');
    }
  }
} catch (error) {
  console.log('⚠️ Could not check Next.js configuration');
}

if (!allFilesExist) {
  console.log('\n❌ Build verification FAILED! Some files or dependencies are missing.');
  process.exit(1);
}

// Try to build the project
console.log('\n🔨 Building project...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed');
  console.error(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Try to run tests
console.log('\n🧪 Running tests...');
try {
  execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
  console.log('✅ Tests passed');
} catch (error) {
  console.log('❌ Tests failed');
  console.error(error.stdout?.toString() || error.message);
  process.exit(1);
}

console.log('\n🎉 Frontend build verification PASSED!');
console.log('\nTo start the application:');
console.log('  npm run dev      # Start development server');
console.log('  npm run build    # Build for production');
console.log('  npm run start    # Start production server');
console.log('  npm run lint     # Run linting');
console.log('  npm test         # Run tests');

process.exit(0);