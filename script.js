import fetch from 'node-fetch';
import { formatISO, subWeeks } from 'date-fns';

const GITHUB_USERNAME = 'someone';
const GITHUB_TOKEN = 'supersecret';
const ORG = 'coolplacetowork';
const SINCE = formatISO(subWeeks(new Date(), 2));

const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json'
};

async function getRepos() {
  let repos = [];
  let page = 1;
  while (true) {
    const res = await fetch(`https://api.github.com/orgs/${ORG}/repos?per_page=100&page=${page}`, { headers });
    const data = await res.json();
    if (data.length === 0) break;
    repos.push(...data);
    page++;
  }
  return repos;
}

async function getCommits(repoFullName) {
  const res = await fetch(
    `https://api.github.com/repos/${repoFullName}/commits?author=${GITHUB_USERNAME}&since=${SINCE}`,
    { headers }
  );
  if (!res.ok) return [];
  return res.json();
}

(async () => {
  const repos = await getRepos();
  console.log(`Checking commits in ${repos.length} repos...`);
  for (const repo of repos) {
    const commits = await getCommits(repo.full_name);
    if (commits.length > 0) {
      console.log(`\n${repo.full_name}`);
      commits.forEach(commit =>
        console.log(`- ${commit.commit.author.date}: ${commit.commit.message}`)
      );
    }
  }
})();
