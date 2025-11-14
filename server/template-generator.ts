import simpleGit from 'simple-git';
import tmp from 'tmp';
import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import { TemplateRequest, TemplateResponse } from '@shared/schema';

// Ensure temp directories are cleaned up on exit
tmp.setGracefulCleanup();

const MAX_CLONE_TIMEOUT_MS = 120000; // 120 seconds (increased for larger repos)

interface DetectionResult {
  language: 'nodejs' | 'python' | 'other';
  framework: string | null;
  runCommand: string;
}

/**
 * Detects language, framework, and run command from cloned repository
 */
async function detectProjectDetails(repoPath: string, hints?: Partial<TemplateRequest>): Promise<DetectionResult> {
  const files = await fs.readdir(repoPath);
  
  // Check for Node.js
  const hasPackageJson = files.includes('package.json');
  const hasRequirementsTxt = files.includes('requirements.txt');
  const hasPyprojectToml = files.includes('pyproject.toml');
  
  let language: 'nodejs' | 'python' | 'other' = 'other';
  let framework: string | null = null;
  let runCommand = 'echo "Please see README.md for instructions"';
  
  if (hasPackageJson) {
    language = 'nodejs';
    const packageJsonPath = path.join(repoPath, 'package.json');
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      // Detect framework
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (deps.next) {
        framework = 'nextjs';
      } else if (deps.vite) {
        framework = 'vite';
      } else if (deps.react) {
        framework = 'react';
      }
      
      // Determine run command
      const scripts = packageJson.scripts || {};
      if (scripts.dev) {
        runCommand = 'npm install && npm run dev';
      } else if (scripts.start) {
        runCommand = 'npm install && npm start';
      } else {
        runCommand = 'npm install && npm run dev';
      }
    } catch (error) {
      console.error('Error reading package.json:', error);
      runCommand = 'npm install && npm run dev';
    }
  } else if (hasRequirementsTxt || hasPyprojectToml) {
    language = 'python';
    
    // Detect Python framework
    const hasAppPy = files.includes('app.py');
    const hasMainPy = files.includes('main.py');
    const hasManagePy = files.includes('manage.py');
    
    try {
      const requirementsContent = hasRequirementsTxt 
        ? await fs.readFile(path.join(repoPath, 'requirements.txt'), 'utf-8')
        : '';
      
      if (requirementsContent.includes('flask') || hasAppPy) {
        framework = 'flask';
        runCommand = hasAppPy 
          ? 'pip install -r requirements.txt && python app.py'
          : 'pip install -r requirements.txt && python main.py';
      } else if (requirementsContent.includes('fastapi')) {
        framework = 'fastapi';
        runCommand = 'pip install -r requirements.txt && uvicorn main:app --reload';
      } else if (requirementsContent.includes('django') || hasManagePy) {
        framework = 'django';
        runCommand = 'pip install -r requirements.txt && python manage.py runserver';
      } else if (hasMainPy) {
        runCommand = 'pip install -r requirements.txt && python main.py';
      } else if (hasAppPy) {
        runCommand = 'pip install -r requirements.txt && python app.py';
      } else {
        runCommand = 'pip install -r requirements.txt && python main.py';
      }
    } catch (error) {
      console.error('Error detecting Python framework:', error);
      runCommand = 'pip install -r requirements.txt && python main.py';
    }
  }
  
  // Use hints if provided and detection failed
  if (hints?.language && language === 'other') {
    if (hints.language === 'nodejs' || hints.language === 'python') {
      language = hints.language;
    }
  }
  if (hints?.framework && !framework) {
    framework = hints.framework;
  }
  if (hints?.runCommand && runCommand === 'echo "Please see README.md for instructions"') {
    runCommand = hints.runCommand;
  }
  
  return { language, framework, runCommand };
}

/**
 * Removes unnecessary files/folders from template
 * More conservative: only removes build artifacts and environment-specific files
 */
async function cleanTemplate(repoPath: string): Promise<void> {
  const foldersToRemove = [
    '.github',      // CI/CD workflows not needed for templates
    '.git',         // Will reinitialize
    '.vscode',      // Editor config
    '.idea',        // Editor config
    'node_modules', // Dependencies will be reinstalled
    'dist',         // Build output
    'build',        // Build output
    '__pycache__',  // Python cache
    '.next',        // Next.js build
    'venv',         // Python virtual env
    'env',          // Python virtual env
    '.pytest_cache', // Test cache
    '.mypy_cache',  // Type check cache
  ];
  
  // Keep tests and docs - they may be valuable for learning
  
  for (const folder of foldersToRemove) {
    const folderPath = path.join(repoPath, folder);
    try {
      await fs.rm(folderPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors - folder might not exist
    }
  }
}

/**
 * Creates .replit configuration file (only if one doesn't exist)
 */
async function createReplitConfig(repoPath: string, language: string, runCommand: string): Promise<void> {
  const replitPath = path.join(repoPath, '.replit');
  
  // Check if .replit already exists
  try {
    await fs.access(replitPath);
    console.log('[Template] .replit file already exists, skipping creation');
    return;
  } catch {
    // File doesn't exist, proceed with creation
  }
  
  const replitLang = language === 'nodejs' ? 'nodejs-20' : language === 'python' ? 'python3-11' : 'bash';
  
  const replitConfig = `run = "${runCommand}"

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "${runCommand}"]
`;
  
  await fs.writeFile(replitPath, replitConfig, 'utf-8');
}

/**
 * Creates new README.md with template information
 */
async function createTemplateReadme(
  repoPath: string,
  sourceOwner: string,
  sourceRepo: string,
  language: string,
  framework: string | null,
  runCommand: string
): Promise<void> {
  const readme = `# ${sourceRepo} - Replit Template

This is a Replit-ready starter template generated from [\`${sourceOwner}/${sourceRepo}\`](https://github.com/${sourceOwner}/${sourceRepo}).

## 🚀 Quick Start on Replit

1. Click "Fork" or "Use Template"
2. The project will automatically set up
3. Click "Run" to start the application

## 🛠 What This Template Includes

- **Language**: ${language === 'nodejs' ? 'Node.js' : language === 'python' ? 'Python' : language}
${framework ? `- **Framework**: ${framework}\n` : ''}- **Pre-configured**: Ready to run on Replit with one click
- **Clean**: Unnecessary files removed for a minimal starter

## 📦 How to Run

The template is configured to run automatically with:

\`\`\`bash
${runCommand}
\`\`\`

## 🔧 Template Generation

This template was automatically generated by Tutorial Tinder's template converter, which:

1. Cloned the original repository
2. Detected the language and framework
3. Removed development artifacts (tests, build folders, etc.)
4. Added Replit configuration (\`.replit\` file)
5. Created this README with setup instructions

## 📝 Original Project

For the original source code, documentation, and license information, visit:
[${sourceOwner}/${sourceRepo}](https://github.com/${sourceOwner}/${sourceRepo})

## 🤝 Contributing

To suggest improvements to this template or the template generator, visit:
[Tutorial Tinder](https://github.com/your-org/tutorial-tinder)

---

**Happy coding on Replit! 🎉**
`;
  
  await fs.writeFile(path.join(repoPath, 'README.md'), readme, 'utf-8');
}

/**
 * Main template generation function
 */
export async function generateTemplate(
  request: TemplateRequest,
  githubToken: string,
  targetOwner?: string
): Promise<TemplateResponse> {
  if (!githubToken) {
    throw new Error('GitHub authentication required: please connect your GitHub account');
  }
  
  const { owner, repo, defaultBranch = 'main' } = request;
  
  // Validate GitHub origin
  if (!owner || !repo) {
    throw new Error('Invalid repository: owner and repo are required');
  }
  
  // Create temporary directory
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  const repoPath = tmpDir.name;
  let cleanupNeeded = true;
  
  try {
    console.log(`[Template] Step 1/6: Cloning ${owner}/${repo}...`);
    
    // Clone repository with timeout
    const git = simpleGit();
    const cloneUrl = `https://github.com/${owner}/${repo}.git`;
    
    await Promise.race([
      git.clone(cloneUrl, repoPath, ['--depth', '1', '--branch', defaultBranch, '--single-branch']),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Repository clone timeout (120 seconds)')), MAX_CLONE_TIMEOUT_MS)
      ),
    ]);
    
    // Verify clone succeeded by checking for files
    const files = await fs.readdir(repoPath);
    if (files.length === 0) {
      throw new Error('Clone verification failed: directory is empty');
    }
    
    console.log(`[Template] Clone complete (${files.length} files), detecting project details...`);
    
    // Detect language, framework, and run command
    console.log('[Template] Step 2/6: Detecting language and framework...');
    const { language, framework, runCommand } = await detectProjectDetails(repoPath, request);
    
    console.log(`[Template] Detected: ${language}, ${framework || 'no framework'}`);
    
    // Clean template (remove build artifacts and environment-specific files)
    console.log('[Template] Step 3/6: Cleaning unnecessary files...');
    await cleanTemplate(repoPath);
    
    // Create .replit config (only if doesn't exist)
    console.log('[Template] Step 4/6: Creating .replit configuration...');
    await createReplitConfig(repoPath, language, runCommand);
    
    // Create new README
    console.log('[Template] Creating template README...');
    await createTemplateReadme(repoPath, owner, repo, language, framework, runCommand);
    
    // Initialize new git repo with user config
    console.log('[Template] Step 5/6: Initializing new git repository...');
    const repoGit = simpleGit(repoPath);
    await repoGit.init();
    await repoGit.addConfig('user.name', 'Tutorial Tinder Bot');
    await repoGit.addConfig('user.email', 'bot@tutorial-tinder.app');
    
    // Make the initial commit first (this creates the branch)
    await repoGit.add('.');
    await repoGit.commit(`chore: generate Replit-friendly template from ${owner}/${repo}`);
    
    // AFTER the first commit, rename the branch to 'main' if needed
    try {
      const branches = await repoGit.branchLocal();
      const currentBranch = branches.current;
      if (currentBranch && currentBranch !== 'main') {
        await repoGit.branch(['-M', 'main']);
        console.log(`[Template] Renamed branch from '${currentBranch}' to 'main'`);
      } else {
        console.log('[Template] Branch already named main');
      }
    } catch (branchError) {
      console.log('[Template] Warning: Could not rename branch:', branchError);
    }
    
    // Create GitHub repo and push
    console.log('[Template] Step 6/6: Creating GitHub repository and pushing...');
    const octokit = new Octokit({ auth: githubToken });
    
    const timestamp = Date.now();
    const templateName = `${repo}-replit-template-${timestamp}`;
    
    let newRepo;
    
    // If targetOwner is specified, try to create in that org, otherwise create in user's account
    if (targetOwner) {
      try {
        const { data } = await octokit.repos.createInOrg({
          org: targetOwner,
          name: templateName,
          description: `Replit-ready template generated from ${owner}/${repo}`,
          public: true,
          auto_init: false,
        });
        newRepo = data;
        console.log(`[Template] Created in organization: ${targetOwner}`);
      } catch (orgError: any) {
        // Fallback to user repo if org creation fails
        console.log(`[Template] Org creation failed (${orgError.message}), falling back to user repo`);
        const { data } = await octokit.repos.createForAuthenticatedUser({
          name: templateName,
          description: `Replit-ready template generated from ${owner}/${repo}`,
          public: true,
          auto_init: false,
        });
        newRepo = data;
      }
    } else {
      // Create in user's personal account
      const { data } = await octokit.repos.createForAuthenticatedUser({
        name: templateName,
        description: `Replit-ready template generated from ${owner}/${repo}`,
        public: true,
        auto_init: false,
      });
      newRepo = data;
      console.log('[Template] Created in user account');
    }
    
    console.log(`[Template] Step 5/6: Pushing to ${newRepo.html_url}...`);
    
    // Add remote and push
    const authCloneUrl = newRepo.clone_url.replace('https://', `https://${githubToken}@`);
    await repoGit.addRemote('origin', authCloneUrl);
    
    // Push to main branch
    await repoGit.push('origin', 'main', ['--set-upstream']);
    console.log('[Template] Successfully pushed to main branch');
    
    // Update the default branch to 'main' so files are visible
    console.log('[Template] Setting default branch to main...');
    try {
      await octokit.repos.update({
        owner: newRepo.owner.login,
        repo: templateName,
        default_branch: 'main',
      });
      console.log('[Template] Default branch updated to main');
    } catch (branchError: any) {
      console.log('[Template] Warning: Could not update default branch:', branchError.message);
      // This is non-fatal, continue anyway
    }
    
    const templateRepoUrl = newRepo.html_url;
    const replitImportUrl = `https://replit.com/github/${newRepo.full_name}`;
    
    console.log(`[Template] Success! Template available at ${templateRepoUrl}`);
    
    cleanupNeeded = false; // Mark that we no longer need manual cleanup
    
    return {
      templateRepoUrl,
      replitImportUrl,
      templateName,
      detectedLanguage: language,
      detectedFramework: framework,
      runCommand,
    };
  } catch (error: any) {
    console.error('[Template] Error generating template:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('timeout')) {
      throw new Error('Repository clone timeout: repository is too large or network is slow');
    } else if (error.message?.includes('authentication required')) {
      throw error; // Pass through auth errors
    } else if (error.message?.includes('not found')) {
      throw new Error(`Repository not found: ${owner}/${repo}`);
    } else if (error.status === 422) {
      throw new Error('GitHub repository creation failed: name already exists or invalid');
    } else if (error.status === 401 || error.status === 403) {
      throw new Error('GitHub authentication failed: please reconnect your GitHub account');
    } else {
      throw new Error(`Template generation failed: ${error.message || 'Unknown error'}`);
    }
  } finally {
    // Always cleanup temp directory, even on failure
    if (cleanupNeeded) {
      try {
        tmpDir.removeCallback();
      } catch (error) {
        console.error('[Template] Error cleaning up temp directory:', error);
      }
    }
  }
}
