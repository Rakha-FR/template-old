const core = require('@actions/core');
const { Octokit } = require('@octokit/core');

(async () => {
  try {
    const token = core.getInput('token');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const envName = core.getInput('environment_name');

    const octokit = new Octokit({ auth: token });

    const res = await octokit.request(
      'GET /repos/{owner}/{repo}/environments/{environment_name}/variables',
      { owner, repo, environment_name: envName }
    );

    const vars = res.data.variables;

    // Export ke env semua
    for (const v of vars) {
      core.exportVariable(v.name, v.value);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
