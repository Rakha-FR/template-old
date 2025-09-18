import core from '@actions/core';
import github from '@actions/github';
import fetch from 'node-fetch';

async function run() {
  try {
    const token = core.getInput('token', { required: true });
    const target = core.getInput('target', { required: true });
    const { owner, repo } = github.context.repo;

    const url = `https://api.github.com/repos/${owner}/${repo}/environments?per_page=100`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    const matched = (data.environments || [])
      .filter(env => env.name.includes(target))
      .map(env => ({ project: env.name }));

    const matrix = { include: matched };

    core.setOutput('matrix', JSON.stringify(matrix));
    core.setOutput('count', matched.length);

    core.info(`Found ${matched.length} environments matching "${target}"`);
    matched.forEach(m => core.info(`- ${m.project}`));

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
