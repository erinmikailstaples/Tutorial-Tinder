import simpleGit from 'simple-git';
import tmp from 'tmp';
import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import { TemplateRequest, TemplateResponse } from '@shared/schema';

// Ensure temp directories are cleaned up on exit
tmp.setGracefulCleanup();

const MAX_CLONE_TIMEOUT_MS = 60000; // 60 seconds
const TEMPLATE_BOT_TOKEN = process.env.TEMPLATE_BOT_TOKEN || process.env.GITHUB_TOKEN;
const TEMPLATE_ORG = process.env.TEMPLATE_ORG || 'tutorial-tinder-templates';

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
 */
async function cleanTemplate(repoPath: string): Promise<void> {
  const foldersToRemove = [
    '.github',
    '.git',
    '.vscode',
    '.idea',
    'node_modules',
    'dist',
    'build',
    '__pycache__',
    'tests',
    'test',
    'docs',
    '.next',
    'venv',
    'env',
  ];
  
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
 * Creates .replit configuration file
 */
async function createReplitConfig(repoPath: string, language: string, runCommand: string): Promise<void> {
  const replitLang = language === 'nodejs' ? 'nodejs' : language === 'python' ? 'python3' : 'bash';
  
  const replitConfig = `run = "${runCommand}"

[interpreter]
language = "${replitLang}"

[nix]
channel = "stable-23_11"
`;
  
  await fs.writeFile(path.join(repoPath, '.replit'), replitConfig, 'utf-8');
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
export async function generateTemplate(request: TemplateRequest): Promise<TemplateResponse> {
  if (!TEMPLATE_BOT_TOKEN) {
    throw new Error('TEMPLATE_BOT_TOKEN or GITHUB_TOKEN environment variable is required for template generation');
  }
  
  const { owner, repo, defaultBranch = 'main' } = request;
  
  // Create temporary directory
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  const repoPath = tmpDir.name;
  
  try {
    console.log(`[Template] Cloning ${owner}/${repo}...`);
    
    // Clone repository
    const git = simpleGit();
    const cloneUrl = `https://github.com/${owner}/${repo}.git`;
    
    await Promise.race([
      git.clone(cloneUrl, repoPath, ['--depth', '1', '--branch', defaultBranch]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Clone timeout')), MAX_CLONE_TIMEOUT_MS)
      ),
    ]);
    
    console.log('[Template] Clone complete, detecting project details...');
    
    // Detect language, framework, and run command
    const { language, framework, runCommand } = await detectProjectDetails(repoPath, request);
    
    console.log(`[Template] Detected: ${language}, ${framework || 'no framework'}`);
    
    // Clean template
    console.log('[Template] Cleaning unnecessary files...');
    await cleanTemplate(repoPath);
    
    // Create .replit config
    console.log('[Template] Creating .replit configuration...');
    await createReplitConfig(repoPath, language, runCommand);
    
    // Create new README
    console.log('[Template] Creating template README...');
    await createTemplateReadme(repoPath, owner, repo, language, framework, runCommand);
    
    // Initialize new git repo
    console.log('[Template] Initializing new git repository...');
    const repoGit = simpleGit(repoPath);
    await repoGit.init();
    await repoGit.add('.');
    await repoGit.commit(`chore: generate Replit-friendly template from ${owner}/${repo}`);
    
    // Create GitHub repo and push
    console.log('[Template] Creating GitHub repository...');
    const octokit = new Octokit({ auth: TEMPLATE_BOT_TOKEN });
    
    const timestamp = Date.now();
    const templateName = `${repo}-replit-template-${timestamp}`;
    
    const { data: newRepo } = await octokit.repos.createInOrg({
      org: TEMPLATE_ORG,
      name: templateName,
      description: `Replit-ready template generated from ${owner}/${repo}`,
      public: true,
      auto_init: false,
    }).catch(async () => {
      // Fallback to user repo if org creation fails
      return octokit.repos.createForAuthenticatedUser({
        name: templateName,
        description: `Replit-ready template generated from ${owner}/${repo}`,
        public: true,
        auto_init: false,
      });
    });
    
    console.log(`[Template] Pushing to ${newRepo.html_url}...`);
    
    // Add remote and push
    await repoGit.addRemote('origin', newRepo.clone_url.replace('https://', `https://${TEMPLATE_BOT_TOKEN}@`));
    await repoGit.push('origin', 'main', ['--set-upstream']);
    
    const templateRepoUrl = newRepo.html_url;
    const replitImportUrl = `https://replit.com/github/${newRepo.full_name}`;
    
    console.log(`[Template] Success! Template available at ${templateRepoUrl}`);
    
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
    throw new Error(`Template generation failed: ${error.message}`);
  } finally {
    // Cleanup temp directory
    try {
      tmpDir.removeCallback();
    } catch (error) {
      console.error('[Template] Error cleaning up temp directory:', error);
    }
  }
}
