const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const ref = github.context.ref;
    const eventName = github.context.eventName;
    core.info(`Event: ${eventName}`);
    core.info(`Ref: ${ref}`);

    let environment = 'development';

    // Regex untuk mendeteksi tag versi semantik (v1.2.3, V1.2.3, dst.)
    const semverTagRegex = /^[vV][0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

    if (ref.startsWith('refs/tags/')) {
      const tagName = ref.replace('refs/tags/', '');
      if (semverTagRegex.test(tagName)) {
        environment = 'production';
      }
    } else if (eventName === 'pull_request') {
      const baseBranch = github.context.payload.pull_request.base.ref;
      core.info(`PR base branch: ${baseBranch}`);
      if (baseBranch === 'main') {
        environment = 'production';
      }
    } else if (ref.startsWith('refs/heads/')) {
      const branch = ref.replace('refs/heads/', '');
      core.info(`Branch: ${branch}`);
      if (branch === 'main') {
        environment = 'production';
      }
    }else if (eventName === 'pull_request') {
      const baseBranch = github.context.payload.pull_request.base.ref;
      core.info(`PR base branch: ${baseBranch}`);
      if (baseBranch === 'staging-qa') {
        environment = 'staging';
      }
    } else if (ref.startsWith('refs/heads/')) {
      const branch = ref.replace('refs/heads/', '');
      core.info(`Branch: ${branch}`);
      if (branch === 'staging-qa') {
        environment = 'staging';
      }
    }else if (eventName === 'pull_request') {
      const baseBranch = github.context.payload.pull_request.base.ref;
      core.info(`PR base branch: ${baseBranch}`);
      if (baseBranch === 'development') {
        environment = 'development';
      }
    } else if (ref.startsWith('refs/heads/')) {
      const branch = ref.replace('refs/heads/', '');
      core.info(`Branch: ${branch}`);
      if (branch === 'development') {
        environment = 'development';
      }
    }
    const runnerGroup = environment.charAt(0).toUpperCase() + environment.slice(1);
    core.setOutput('environment', environment);
    core.setOutput('runner_group', runnerGroup);
    core.info(`Environment set to: ${environment}`);
    core.info(`Runner group set to: ${runnerGroup}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
