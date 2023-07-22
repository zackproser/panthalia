import { Octokit } from "octokit";

const simpleGit = require('simple-git');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function createPullRequest(title, head, base, body) {

  const response = await octokit.rest.pulls.create({
    owner: "zackproser",
    repo: "portfolio",
    title,
    head,
    base,
    body
  });

  return response.data.html_url;
}

export async function cloneRepo() {

  console.log(`Cloning portfolio repo...`);

  const repo = simpleGit();

  await repo.clone('https://github.com/zackproser/portfolio.git', '/tmp/repo');

  await repo.cwd('/tmp/repo');

  await repo.checkout('main');

  await repo.checkout(['posts'], {
    cwd: '/tmp/repo/src/pages/blog'
  });

  return `/tmp/repo/src/pages/blog`;
}


