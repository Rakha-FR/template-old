const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require('@octokit/core');

async function getEnvironments(mainEnv) {
  const token = core.getInput('token', { required: true });
  const repoOwner = core.getInput('repo_owner') || github.context.repo.owner;
  const repoName = core.getInput('repo_name') || github.context.repo.repo;

  core.info(`🔍 Fetching environments from ${repoOwner}/${repoName}...`);

  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/environments', {
      owner: repoOwner,
      repo: repoName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const environments = response.data.environments || [];

    if (environments.length === 0) {
      core.warning('⚠️ No environments found in repository.');
      return [];
    }

    const filtered = environments
      .map(env => env.name)
      .filter(name => name.toLowerCase().includes(mainEnv.toLowerCase()));

    core.info(`✅ Found environments related to "${mainEnv}": ${filtered.join(', ') || 'None'}`);
    return filtered;
  } catch (err) {
    core.error(`❌ Failed to fetch environments: ${err.message}`);
    return [];
  }
}

async function run() {
  try {
    const ref = github.context.ref;
    const eventName = github.context.eventName;

    core.info(`Event: ${eventName}`);
    core.info(`Ref: ${ref}`);

    // --- Default branches
    const defaultBranches = ['development', 'staging-qa', 'main', 'master'];
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
    } else if (ref.startsWith('refs/tags/')) {
      const tagName = ref.replace('refs/tags/', '');
      core.info(`Tag: ${tagName}`);
      if (semverTagRegex.test(tagName)) {
        isAllowed = true;
        environment = 'production';
      }
    }

    // --- Validate branch ---
    if (currentBranch) {
      isAllowed = allowedBranches.includes(currentBranch);
    }

    if (!isAllowed) {
      core.notice(`ℹ️ Skipping workflow because branch ${ref} is not in allowed list`);
      process.exit(0); // exits successfully
    }

    // --- Determine environment ---
    if (['main', 'master'].includes(currentBranch)) environment = 'production';
    else if (currentBranch === 'staging-qa') environment = 'staging';
    else if (currentBranch === 'development') environment = 'development';
    else environment = 'development';

    const runnerGroup = environment.charAt(0).toUpperCase() + environment.slice(1);

    core.setOutput('environment', environment);
    core.setOutput('runner_group', runnerGroup);

    core.info(`✅ Environment set to: ${environment}`);
    core.info(`✅ Runner group set to: ${runnerGroup}`);

    // --- Multi-deploy mode ---
    if (multideploy) {
      core.info('🚀 Multi-deploy mode enabled!');
      const environmentsList = await getEnvironments(environment);
      core.setOutput('environments_list', JSON.stringify(environmentsList));
    } else {
      core.info('ℹ️ Multi-deploy disabled, skipping environment discovery.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
