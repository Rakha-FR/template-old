const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const ref = github.context.ref;
    const eventName = github.context.eventName;
    const deployToInput = core.getInput('deploy_to') || ''; 
    let deployTargets = [];

    console.log(deployToInput);

    core.info(`Event: ${eventName}`);
    core.info(`Ref: ${ref}`);

    // --- Default branches
    const defaultBranches = ['development', 'staging-qa'];
    const allowedBranchesInput = core.getInput('allowed_branches') || '';
    const allowedBranches = Array.from(
      new Set([
        ...defaultBranches,
        ...allowedBranchesInput
          .split(',')
          .map(b => b.trim())
          .filter(Boolean),
      ])
    );

    core.info(`Allowed branches: ${allowedBranches.join(', ')}`);

    const multideploy = (core.getInput('multideploy') || 'false').toLowerCase() === 'true';
    const semverTagRegex =
      /^[vV][0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

    let environment = 'development';
    let currentBranch = null;
    let isAllowed = false;

    // --- Detect branch / tag ---
    if (eventName === 'pull_request') {
      const baseBranch = github.context.payload.pull_request.base.ref;
      currentBranch = baseBranch;
      core.info(`PR base branch: ${baseBranch}`);
    } else if (ref.startsWith('refs/heads/')) {
      currentBranch = ref.replace('refs/heads/', '');
      core.info(`Branch: ${currentBranch}`);
    } else if (eventName === 'workflow_dispatch') {
      const inputTag = core.getInput('tag_name') || '';
      core.info(`Manual dispatch detected. tag_name input: ${inputTag}`);

      if (semverTagRegex.test(inputTag)) {
        core.info(`✅ Valid semver tag detected: ${inputTag}`);
        currentBranch = inputTag;
        isAllowed = true;
        environment = 'production';
      } else {
        core.warning(`⚠️ Invalid or missing tag format. Expected semver like v1.0.0`);
        process.exit(0);
      }
    } else if (ref.startsWith('refs/tags/')) {
      const tagName = ref.replace('refs/tags/', '');
      core.info(`Tag push detected: ${tagName}, skipping auto deploy.`);
      process.exit(0);
    }


    // --- Validate branch ---
    if (currentBranch) {
      isAllowed = allowedBranches.includes(currentBranch);
    }

    if (!isAllowed) {
      core.notice(`ℹ️ Skipping workflow because branch ${ref} is not in allowed list`);
      process.exit(0);
    }

    // --- Determine environment ---
    if (['main', 'master'].includes(currentBranch)) environment = 'production';
    else if (currentBranch === 'staging-qa') environment = 'staging';
    else if (currentBranch === 'development') environment = 'development';
    else environment = 'development';

    try {
      // Coba parse JSON kalau valid
      if (deployToInput.trim().startsWith('[')) {
        deployTargets = JSON.parse(deployToInput).map(x => x.toLowerCase().trim());
      } else {
        // Fallback ke split by comma
        deployTargets = deployToInput
          .split(',')
          .map(x => x.trim().toLowerCase())
          .filter(Boolean);
      }
    } catch (err) {
      core.warning(`⚠️ Failed to parse deploy_to input, fallback to comma split`);
      deployTargets = deployToInput
        .split(',')
        .map(x => x.trim().toLowerCase())
        .filter(Boolean);
    }

    core.info(`🚀 Deploy targets: ${deployTargets.join(', ')}`);
    // --- Generate APP_VERSION ---
    const runnerGroup = environment.charAt(0).toUpperCase() + environment.slice(1);
    const repoName = github.context.repo.repo.toLowerCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); 
    const commitHash = github.context.sha.substring(0, 7);
    const appVersion = `${repoName}_${currentBranch}_${date}_${commitHash}`;
    core.info(`✅ APP_VERSION=${appVersion}`);

    // --- Set outputs for workflow ---
    core.setOutput('environment', environment);
    core.setOutput('runner_group', runnerGroup);
    core.setOutput('repo_name', repoName);
    core.setOutput('repo_owner', github.context.repo.owner.toLowerCase());
    core.setOutput('app_version', appVersion);
    core.setOutput('deploy_targets', JSON.stringify(deployTargets));

    core.info(`✅ Environment set to: ${environment}`);
    core.info(`✅ Runner group set to: ${runnerGroup}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
