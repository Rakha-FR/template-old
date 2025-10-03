const core = require('@actions/core');
const { Octokit } = require('@octokit/core');

(async () => {
  try {
    const token = core.getInput('token');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');
    const environment = core.getInput('environment');

    const octokit = new Octokit({ auth: token });

    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/environments/{environment_name}/variables',
      {
        owner,
        repo,
        environment_name: environment,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    const variables = response.data.variables || [];

    console.log('✅ Variables found:', variables.map(v => v.name).join(', '));

    // Set output ke GitHub Action
    core.setOutput('variables', JSON.stringify(variables));
  } catch (error) {
    core.setFailed(error.message);
  }
})();
