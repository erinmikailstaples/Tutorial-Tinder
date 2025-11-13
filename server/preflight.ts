import simpleGit from 'simple-git';
import tmp from 'tmp';
import fs from 'fs/promises';
import path from 'path';
import type { PreflightResult, PreflightIssue } from '@shared/schema';

// Cleanup temp directories on exit
tmp.setGracefulCleanup();

const CLONE_TIMEOUT_MS = 30000; // 30 seconds
const MAX_REPO_SIZE_MB = 500; // Skip repos larger than 500MB

interface DetectedFiles {
  hasPackageJson: boolean;
  hasRequirementsTxt: boolean;
  hasPyprojectToml: boolean;
  hasDockerfile: boolean;
  hasReplitFile: boolean;
  packageJson?: any;
  pyprojectToml?: any;
}

export async function analyzeRepository(
  owner: string,
  repo: string
): Promise<PreflightResult> {
  const repoUrl = `https://github.com/${owner}/${repo}.git`;
  let tmpDir: tmp.DirResult | null = null;

  try {
    // Create temporary directory
    tmpDir = tmp.dirSync({ unsafeCleanup: true, prefix: 'replit-preflight-' });
    const clonePath = tmpDir.name;

    console.log(`[Preflight] Cloning ${owner}/${repo} to ${clonePath}`);

    // Shallow clone with depth=1 for speed
    const git = simpleGit({
      timeout: { block: CLONE_TIMEOUT_MS },
    });

    await git.clone(repoUrl, clonePath, {
      '--depth': 1,
      '--single-branch': null,
    });

    console.log(`[Preflight] Clone complete, analyzing files...`);

    // Detect files and parse manifests
    const detected = await detectFiles(clonePath);

    // Analyze and return results
    const result = await performAnalysis(detected, owner, repo);

    console.log(`[Preflight] Analysis complete: ${result.language || 'unknown'}, confidence: ${result.confidence}`);

    return result;
  } catch (error: any) {
    console.error(`[Preflight] Error analyzing ${owner}/${repo}:`, error);

    // Return error result
    return {
      language: null,
      framework: null,
      runCommand: null,
      confidence: 0,
      issues: [
        {
          severity: 'error',
          message: `Failed to clone or analyze repository: ${error.message}`,
        },
      ],
    };
  } finally {
    // Cleanup
    if (tmpDir) {
      try {
        tmpDir.removeCallback();
      } catch (err) {
        console.error('[Preflight] Failed to cleanup temp directory:', err);
      }
    }
  }
}

async function detectFiles(clonePath: string): Promise<DetectedFiles> {
  const detected: DetectedFiles = {
    hasPackageJson: false,
    hasRequirementsTxt: false,
    hasPyprojectToml: false,
    hasDockerfile: false,
    hasReplitFile: false,
  };

  try {
    // Check for package.json
    const packageJsonPath = path.join(clonePath, 'package.json');
    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      detected.hasPackageJson = true;
      detected.packageJson = JSON.parse(packageJsonContent);
    } catch (err) {
      // File doesn't exist or isn't valid JSON
    }

    // Check for requirements.txt
    const requirementsPath = path.join(clonePath, 'requirements.txt');
    try {
      await fs.access(requirementsPath);
      detected.hasRequirementsTxt = true;
    } catch (err) {
      // File doesn't exist
    }

    // Check for pyproject.toml
    const pyprojectPath = path.join(clonePath, 'pyproject.toml');
    try {
      const pyprojectContent = await fs.readFile(pyprojectPath, 'utf-8');
      detected.hasPyprojectToml = true;
      // Basic TOML parsing (just check for tool.poetry section)
      detected.pyprojectToml = pyprojectContent;
    } catch (err) {
      // File doesn't exist
    }

    // Check for Dockerfile
    const dockerfilePath = path.join(clonePath, 'Dockerfile');
    try {
      await fs.access(dockerfilePath);
      detected.hasDockerfile = true;
    } catch (err) {
      // File doesn't exist
    }

    // Check for .replit file
    const replitFilePath = path.join(clonePath, '.replit');
    try {
      await fs.access(replitFilePath);
      detected.hasReplitFile = true;
    } catch (err) {
      // File doesn't exist
    }
  } catch (error) {
    console.error('[Preflight] Error detecting files:', error);
  }

  return detected;
}

async function performAnalysis(
  detected: DetectedFiles,
  owner: string,
  repo: string
): Promise<PreflightResult> {
  const issues: PreflightIssue[] = [];
  let language: string | null = null;
  let framework: string | null = null;
  let runCommand: string | null = null;
  let confidence = 0;

  // Already has .replit file - high confidence
  if (detected.hasReplitFile) {
    return {
      language: 'pre-configured',
      framework: 'Replit',
      runCommand: 'Already configured in .replit file',
      confidence: 1.0,
      issues: [
        {
          severity: 'info',
          message: 'Repository already has a .replit configuration file.',
        },
      ],
      detectedFiles: {
        hasPackageJson: detected.hasPackageJson,
        hasRequirementsTxt: detected.hasRequirementsTxt,
        hasPyprojectToml: detected.hasPyprojectToml,
        hasDockerfile: detected.hasDockerfile,
        hasReplitFile: detected.hasReplitFile,
      },
    };
  }

  // Node.js detection
  if (detected.hasPackageJson && detected.packageJson) {
    language = 'Node.js';
    const pkg = detected.packageJson;

    // Detect framework
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps['next']) {
      framework = 'Next.js';
      runCommand = 'npm install && npm run dev';
      confidence = 0.9;
    } else if (deps['react'] && deps['vite']) {
      framework = 'Vite + React';
      runCommand = 'npm install && npm run dev';
      confidence = 0.9;
    } else if (deps['react']) {
      framework = 'React';
      runCommand = pkg.scripts?.start ? 'npm install && npm start' : 'npm install && npm run dev';
      confidence = 0.8;
    } else if (deps['express']) {
      framework = 'Express';
      runCommand = pkg.scripts?.start ? 'npm install && npm start' : 'npm install && node index.js';
      confidence = 0.7;
      issues.push({
        severity: 'warning',
        message: 'Express app detected. Make sure to bind to 0.0.0.0:5000 for Replit compatibility.',
      });
    } else if (pkg.scripts?.dev) {
      framework = 'Unknown';
      runCommand = 'npm install && npm run dev';
      confidence = 0.6;
    } else if (pkg.scripts?.start) {
      framework = 'Unknown';
      runCommand = 'npm install && npm start';
      confidence = 0.6;
    } else {
      framework = 'Unknown';
      runCommand = 'npm install && node index.js';
      confidence = 0.4;
      issues.push({
        severity: 'warning',
        message: 'No clear start script found in package.json. May need manual configuration.',
      });
    }
  }

  // Python detection
  else if (detected.hasRequirementsTxt || detected.hasPyprojectToml) {
    language = 'Python';

    if (detected.hasPyprojectToml) {
      framework = 'Poetry';
      runCommand = 'poetry install && poetry run python main.py';
      confidence = 0.7;
      issues.push({
        severity: 'info',
        message: 'Poetry project detected. May need to adjust entry point (main.py, app.py, etc.).',
      });
    } else {
      // Try to detect framework from requirements.txt content
      framework = 'Unknown';
      runCommand = 'pip install -r requirements.txt && python main.py';
      confidence = 0.6;
      issues.push({
        severity: 'warning',
        message: 'Python project detected. May need to specify correct entry point (main.py, app.py, manage.py, etc.).',
      });
    }
  }

  // Docker-only projects
  else if (detected.hasDockerfile) {
    language = 'Docker';
    framework = 'Containerized';
    runCommand = null;
    confidence = 0.3;
    issues.push({
      severity: 'warning',
      message: 'Dockerfile detected. Replit supports Docker, but may need manual configuration.',
    });
  }

  // No clear language detected
  else {
    language = null;
    framework = null;
    runCommand = null;
    confidence = 0;
    issues.push({
      severity: 'error',
      message: 'Could not detect language or framework. No package.json, requirements.txt, or pyproject.toml found.',
    });
  }

  return {
    language,
    framework,
    runCommand,
    issues,
    confidence,
    detectedFiles: {
      hasPackageJson: detected.hasPackageJson,
      hasRequirementsTxt: detected.hasRequirementsTxt,
      hasPyprojectToml: detected.hasPyprojectToml,
      hasDockerfile: detected.hasDockerfile,
      hasReplitFile: detected.hasReplitFile,
    },
  };
}
