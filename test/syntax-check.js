/**
 * PadManiacs - Source Syntax Diagnostic Tool
 *
 * Scans every .js file under src/js and reports syntax validity using
 * Node's own parser (`node --check`). Build-time placeholder tokens (`%`)
 * are normalized before checking so they don't produce false positives.
 *
 * Usage: node test/syntax-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'src', 'js');

function normalizeSource(code) {
  // Replace build-time placeholder `%=...=%` assignments and string literals
  // with syntactically valid JS so `node --check` doesn't choke on raw `%`.
  return code
    .replace(/=\s*%;/g, '= null;')
    .replace(/=\s*"%";/g, '= "";')
    .replace(/=\s*'%';/g, "= '';");
}

function checkSyntax(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const normalized = normalizeSource(raw);
  const tmp = path.join(require('os').tmpdir(), `pm-syntax-${path.basename(filePath)}.js`);
  fs.writeFileSync(tmp, normalized);

  try {
    execSync(`node --check "${tmp}"`, { stdio: 'pipe' });
    return { ok: true, errors: [] };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : String(err);
    const lines = stderr.split('\n').filter(l => l.trim());
    return { ok: false, errors: lines };
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
}

/**
 * Collects .js files from the given targets (folders or files).
 * Targets default to SRC_DIR when none are provided.
 * Returns a sorted array of absolute .js file paths.
 */
function collectTargets(targets) {
  const results = [];
  const base = path.resolve(__dirname, '..');

  for (const target of targets) {
    const targetPath = path.resolve(base, target);
    if (!fs.existsSync(targetPath)) {
      console.warn(`Warning: target not found, skipping: ${target}`);
      continue;
    }

    const stat = fs.statSync(targetPath);
    if (stat.isFile()) {
      if (targetPath.endsWith('.js')) results.push(targetPath);
    } else if (stat.isDirectory()) {
      (function walk(current) {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.isFile() && entry.name.endsWith('.js')) results.push(full);
        }
      })(targetPath);
    }
  }

  return results.sort((a, b) => a.localeCompare(b));
}

function main() {
  const base = path.resolve(__dirname, '..');
  const args = process.argv.slice(2);
  const targets = args.length > 0 ? args : [SRC_DIR];
  const files = collectTargets(targets);
  const report = { total: files.length, pass: 0, fail: 0, failures: [] };

  for (const file of files) {
    const result = checkSyntax(file);
    if (result.ok) {
      report.pass++;
      process.stdout.write(`  ✔ ${path.relative(base, file)}\n`);
    } else {
      report.fail++;
      report.failures.push({ file: path.relative(base, file), errors: result.errors });
      process.stdout.write(`  ✖ ${path.relative(base, file)}\n`);
      for (const err of result.errors) {
        process.stdout.write(`      ${err}\n`);
      }
    }
  }

  console.log('\n────────────────────────────────────────────');
  console.log(`Syntax diagnosis: ${report.pass}/${report.total} files valid`);
  if (report.fail > 0) {
    console.log(`Errors found in ${report.fail} file(s):`);
    for (const f of report.failures) {
      console.log(`  • ${f.file}`);
      for (const err of f.errors) console.log(`    ${err}`);
    }
    process.exitCode = 1;
  } else {
    console.log('All source files pass syntax check.');
  }
}

main();
