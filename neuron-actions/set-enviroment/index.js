import core from '@actions/core';
import github from '@actions/github';
import fetch from 'node-fetch';

async function run() {
  try {
    const ref = github.context.ref;
    const eventName = github.context.eventName;
    core.info(`Event: ${eventName}`);
    core.info(`Ref: ${ref}`);


    const multideploy = (core.getInput('MULTIDEPLOY') || 'false') === 'true';
    let environment = 'development';

    // Regex semver untuk tag (v1.2.3, V1.2.3, v1.2.3-alpha+build)
    const semverTagRegex = /^[vV][0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

    if (eventName === 'pull_request') {
      const baseBranch = github.context.payload.pull_request.base.ref;
      core.info(`PR base branch: ${baseBranch}`);

      if (baseBranch === 'main') environment = 'production';
      else if (baseBranch === 'staging-qa') environment = 'staging';
      else if (baseBranch === 'development') environment = 'development';
    } else if (ref.startsWith('refs/heads/')) {
      const branch = ref.replace('refs/heads/', '');
      core.info(`Branch: ${branch}`);

      if (branch === 'main') environment = 'production';
      else if (branch === 'staging-qa') environment = 'staging';
      else if (branch === 'development') environment = 'development';
    } else if (ref.startsWith('refs/tags/')) {
      const tagName = ref.replace('refs/tags/', '');
      core.info(`Tag: ${tagName}`);

      if (semverTagRegex.test(tagName)) environment = 'production';
    }

    // ==== Runner group ====
    const runnerGroup = environment.charAt(0).toUpperCase() + environment.slice(1);

    core.setOutput('environment', environment);
    core.setOutput('runner_group', runnerGroup);

    core.info(`✅ Environment set to: ${environment}`);
    core.info(`✅ Runner group set to: ${runnerGroup}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
