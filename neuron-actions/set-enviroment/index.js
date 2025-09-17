const core = require('@actions/core');
const github = require('@actions/github');


try {
  const branch = github.context.ref.replace('refs/heads/', '');
  console.log(`Current branch is: ${branch}`);
  core.setOutput('branch', branch);
} catch (error) {
  core.setFailed(error.message);
}
