#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function usage() {
  console.log(`Install Codex/Cloud-compatible skills from a repository.

Usage:
  skills add [skill-name] [--force] [--dir <skills-dir>]
  skills add --repo <owner/repo|git-url|local-path> [skill-name] [--force] [--dir <skills-dir>]

Examples:
  npx skills add
  npx skills add risk-oriented-code-review
  npx skills add --force
  npx skills add --dir ~/.codex/skills
  npx skills add --repo jimliu/baoyu-skills risk-oriented-code-review

Destination priority:
  1. --dir <skills-dir>
  2. SKILLS_DIR
  3. CODEX_HOME/skills
  4. ~/.codex/skills`);
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = [...argv];
  const options = { command: args.shift(), repo: undefined, skillName: undefined, force: false, dir: undefined };

  if (!options.command || options.command === '-h' || options.command === '--help') {
    usage();
    process.exit(options.command ? 0 : 1);
  }

  if (options.command !== 'add') {
    fail(`unknown command: ${options.command}`);
  }

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === '-h' || arg === '--help') {
      usage();
      process.exit(0);
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--dir') {
      options.dir = args.shift();
      if (!options.dir) fail('--dir requires a value');
      continue;
    }
    if (arg.startsWith('--dir=')) {
      options.dir = arg.slice('--dir='.length);
      continue;
    }
    if (arg === '--repo') {
      options.repo = args.shift();
      if (!options.repo) fail('--repo requires a value');
      continue;
    }
    if (arg.startsWith('--repo=')) {
      options.repo = arg.slice('--repo='.length);
      continue;
    }
    if (arg.startsWith('--')) {
      fail(`unknown option: ${arg}`);
    }
    if (!options.skillName) {
      options.skillName = arg;
      continue;
    }
    fail('only one optional skill name can be provided');
  }

  if (options.skillName && (options.skillName.includes('/') || options.skillName.includes('..'))) {
    fail(`invalid skill name: ${options.skillName}`);
  }

  return options;
}

function expandHome(inputPath) {
  if (!inputPath) return inputPath;
  if (inputPath === '~') return os.homedir();
  if (inputPath.startsWith(`~${path.sep}`)) return path.join(os.homedir(), inputPath.slice(2));
  return inputPath;
}

function destinationRoot(options) {
  if (options.dir) return path.resolve(expandHome(options.dir));
  if (process.env.SKILLS_DIR) return path.resolve(expandHome(process.env.SKILLS_DIR));
  if (process.env.CODEX_HOME) return path.join(path.resolve(expandHome(process.env.CODEX_HOME)), 'skills');
  return path.join(os.homedir(), '.codex', 'skills');
}

function repoToGitUrl(repo) {
  if (fs.existsSync(expandHome(repo))) return null;
  if (/^(https?:|git@|ssh:|file:)/.test(repo)) return repo;
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return `https://github.com/${repo}.git`;
  fail(`unsupported repository format: ${repo}`);
}

function prepareRepo(repo) {
  if (!repo) return { repoRoot: path.resolve(__dirname, '..'), label: 'bundled skills', cleanup: () => {} };

  const localPath = expandHome(repo);
  if (fs.existsSync(localPath)) return { repoRoot: path.resolve(localPath), label: repo, cleanup: () => {} };

  const gitUrl = repoToGitUrl(repo);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-repo-'));
  const result = spawnSync('git', ['clone', '--depth', '1', gitUrl, tempDir], { stdio: 'inherit' });
  if (result.status !== 0) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    fail(`failed to clone repository: ${repo}`);
  }
  return { repoRoot: tempDir, label: repo, cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }) };
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`failed to read ${filePath}: ${error.message}`);
  }
}

function discoverSkills(repoRoot) {
  const indexPath = path.join(repoRoot, 'skills.json');
  if (fs.existsSync(indexPath)) {
    const index = readJson(indexPath);
    if (!Array.isArray(index.skills)) fail('skills.json must contain a skills array');
    return index.skills
      .filter((skill) => skill && skill.installable !== false)
      .map((skill) => ({
        name: skill.name,
        sourcePath: path.join(repoRoot, skill.path || `skills/${skill.name}`),
      }));
  }

  const skillsDir = path.join(repoRoot, 'skills');
  if (!fs.existsSync(skillsDir)) fail('repository does not contain skills.json or a skills/ directory');

  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, sourcePath: path.join(skillsDir, entry.name) }))
    .filter((skill) => fs.existsSync(path.join(skill.sourcePath, 'SKILL.md')));
}

function installSkill(skill, destRoot, force) {
  if (!skill.name) fail('skill entry is missing name');
  if (skill.name.includes('/') || skill.name.includes('..')) fail(`invalid skill name in repository: ${skill.name}`);
  if (!fs.existsSync(path.join(skill.sourcePath, 'SKILL.md'))) {
    fail(`skill is missing SKILL.md: ${skill.sourcePath}`);
  }

  fs.mkdirSync(destRoot, { recursive: true });
  const destDir = path.join(destRoot, skill.name);
  if (fs.existsSync(destDir)) {
    if (!force) fail(`destination already exists: ${destDir} (use --force to overwrite)`);
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.cpSync(skill.sourcePath, destDir, { recursive: true });
  return destDir;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const { repoRoot, label, cleanup } = prepareRepo(options.repo);

  try {
    const availableSkills = discoverSkills(repoRoot);
    const selectedSkills = options.skillName
      ? availableSkills.filter((skill) => skill.name === options.skillName)
      : availableSkills;

    if (selectedSkills.length === 0) {
      const available = availableSkills.map((skill) => skill.name).join(', ') || '(none)';
      fail(`skill not found: ${options.skillName || '(none)'}. Available skills: ${available}`);
    }

    const destRoot = destinationRoot(options);
    const installed = selectedSkills.map((skill) => ({ name: skill.name, destDir: installSkill(skill, destRoot, options.force) }));

    console.log(`Installed ${installed.length} skill${installed.length === 1 ? '' : 's'} from ${label}:`);
    for (const skill of installed) {
      console.log(`  - ${skill.name} -> ${skill.destDir}`);
    }
    console.log('\nNext steps: restart Codex/Cloud session if it does not pick up new skills automatically.');
  } finally {
    cleanup();
  }
}

main();
