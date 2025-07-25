#!/usr/bin/env node

/**
 * QA Test Validation Script
 * 
 * This script is used by QA agents to validate story completion
 * and ensure 100% test pass rate before marking stories as complete.
 * 
 * Usage: node scripts/qa-test-validation.js [story-name]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${message}`, 'bold');
  log(`${'='.repeat(60)}`, 'blue');
}

function logSection(message) {
  log(`\n${'-'.repeat(40)}`, 'yellow');
  log(`  ${message}`, 'yellow');
  log(`${'-'.repeat(40)}`, 'yellow');
}

function runCommand(command, description) {
  try {
    log(`Running: ${description}`, 'blue');
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });
    log(`✅ ${description} - PASSED`, 'green');
    return { success: true, output: result };
  } catch (error) {
    log(`❌ ${description} - FAILED`, 'red');
    log(`Error: ${error.message}`, 'red');
    if (error.stdout) log(`Output: ${error.stdout}`, 'red');
    if (error.stderr) log(`Stderr: ${error.stderr}`, 'red');
    return { success: false, error: error.message, output: error.stdout || '', stderr: error.stderr || '' };
  }
}

function checkTestCoverage(output) {
  const coverageMatch = output.match(/All files\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)\s+\|\s+(\d+)/);
  if (coverageMatch) {
    const [, statements, branches, functions, lines] = coverageMatch;
    return {
      statements: parseInt(statements),
      branches: parseInt(branches),
      functions: parseInt(functions),
      lines: parseInt(lines)
    };
  }
  return null;
}

function validateStoryTests(storyName) {
  logHeader('QA Test Validation Script');
  log(`Story: ${storyName || 'All Stories'}`, 'bold');
  log(`Date: ${new Date().toISOString()}`, 'blue');
  
  const results = {
    linting: false,
    typeCheck: false,
    unitTests: false,
    coverage: false,
    integrationTests: false,
    storySpecificTests: false
  };

  // 1. Linting
  logSection('1. Code Linting');
  const lintResult = runCommand('npm run lint', 'ESLint Code Linting');
  results.linting = lintResult.success;

  // 2. TypeScript Type Check
  logSection('2. TypeScript Type Check');
  const typeResult = runCommand('npm run type-check', 'TypeScript Type Check');
  results.typeCheck = typeResult.success;

  // 3. Unit Tests
  logSection('3. Unit Tests');
  const unitResult = runCommand('npm test', 'Jest Unit Tests');
  results.unitTests = unitResult.success;

  // 4. Test Coverage
  logSection('4. Test Coverage');
  const coverageResult = runCommand('npm run test:coverage', 'Test Coverage Analysis');
  results.coverage = coverageResult.success;

  if (coverageResult.success) {
    const coverage = checkTestCoverage(coverageResult.output);
    if (coverage) {
      log(`Coverage Results:`, 'blue');
      log(`  Statements: ${coverage.statements}%`, coverage.statements === 100 ? 'green' : 'red');
      log(`  Branches: ${coverage.branches}%`, coverage.branches === 100 ? 'green' : 'red');
      log(`  Functions: ${coverage.functions}%`, coverage.functions === 100 ? 'green' : 'red');
      log(`  Lines: ${coverage.lines}%`, coverage.lines === 100 ? 'green' : 'red');
      
      if (coverage.statements < 100 || coverage.branches < 100 || 
          coverage.functions < 100 || coverage.lines < 100) {
        log(`❌ Coverage below 100% - FAILED`, 'red');
        results.coverage = false;
      }
    }
  }

  // 5. Integration Tests
  logSection('5. Integration Tests');
  const integrationResult = runCommand('npm run test:complete', 'Integration Tests');
  results.integrationTests = integrationResult.success;

  // 6. Story-Specific Tests (if story name provided)
  if (storyName) {
    logSection('6. Story-Specific Tests');
    const storyResult = runCommand(`npm test -- --testNamePattern="${storyName}"`, `Story-Specific Tests for "${storyName}"`);
    results.storySpecificTests = storyResult.success;
  }

  // Summary
  logHeader('Validation Summary');
  
  const allPassed = Object.values(results).every(result => result);
  const passedCount = Object.values(results).filter(result => result).length;
  const totalCount = Object.keys(results).length;
  
  log(`Overall Status: ${passedCount}/${totalCount} checks passed`, allPassed ? 'green' : 'red');
  
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`  ${check}: ${status}`, color);
  });

  if (allPassed) {
    log(`\n🎉 ALL TESTS PASSED - Story ready for completion!`, 'green');
    log(`\nNext Steps:`, 'blue');
    log(`1. Mark story as "Done" in story file`, 'blue');
    log(`2. Update completion status in tracking files with "X"`, 'blue');
    log(`3. Reactivate Dev agent for next task/story`, 'blue');
    return true;
  } else {
    log(`\n❌ VALIDATION FAILED - Story not ready for completion`, 'red');
    log(`\nRequired Actions:`, 'yellow');
    log(`1. Fix failing tests`, 'yellow');
    log(`2. Ensure 100% test coverage`, 'yellow');
    log(`3. Re-run validation after fixes`, 'yellow');
    return false;
  }
}

// Main execution
if (require.main === module) {
  const storyName = process.argv[2];
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    log('QA Test Validation Script', 'bold');
    log('Usage: node scripts/qa-test-validation.js [story-name]', 'blue');
    log('', 'reset');
    log('This script validates that all tests pass and coverage requirements are met', 'blue');
    log('before marking a story as complete.', 'blue');
    log('', 'reset');
    log('Arguments:', 'yellow');
    log('  story-name    Optional: Name of specific story to validate', 'blue');
    log('', 'reset');
    log('Exit Codes:', 'yellow');
    log('  0 - All tests passed, story ready for completion', 'green');
    log('  1 - Tests failed, story not ready for completion', 'red');
    process.exit(0);
  }

  try {
    const success = validateStoryTests(storyName);
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`❌ Validation script failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

module.exports = { validateStoryTests }; 