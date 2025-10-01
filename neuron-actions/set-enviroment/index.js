const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

async function run() {
  try {
    const ref = github.context.ref;
    const eventName = github.context.eventName;

    core.info(`Event: ${eventName}`);
    core.info(`Ref: ${ref}`);

    const allowedBranches = ['development', 'staging-qa', 'main', 'master'];
    const semverTagRegex = /^[vV][0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

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

    // --- Reject if not allowed ---
    if (!isAllowed) {
      core.setFailed(`⛔ This workflow is not allowed to run on branch/ref: ${ref}`);
      return; // stop execution
    }

    // --- Determine environment ---
    if (currentBranch === 'main' || currentBranch === 'master') environment = 'production';
    else if (currentBranch === 'staging-qa') environment = 'staging';
    else if (currentBranch === 'development') environment = 'development';

    // --- Runner group ---
    const runnerGroup = environment.charAt(0).toUpperCase() + environment.slice(1);

    // --- Output ---
    core.setOutput('environment', environment);
    core.setOutput('runner_group', runnerGroup);

    core.info(`✅ Environment set to: ${environment}`);
    core.info(`✅ Runner group set to: ${runnerGroup}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
