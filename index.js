const express = require("express");
const axios = require("axios");

require("dotenv").config();

const app = express();

app.use(express.json());  

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_URL = "https://api.github.com";
 
app.get("/github", async (req, res) => {
    try {
        const profileResponse = await axios.get(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}`);
        const reposResponse = await axios.get(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}/repos`);

        res.json({
            username: profileResponse.data.login,
            followers: profileResponse.data.followers,
            following: profileResponse.data.following,
            public_repos: profileResponse.data.public_repos,
            repositories: reposResponse.data.map(repo => ({
                name: repo.name,
                url: repo.html_url,
                stars: repo.stargazers_count
            }))
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching GitHub data" });
    }
});

// 👉 GET /github/:repoName → Fetch details of a specific repo
app.get("/github/:repoName", async (req, res) => {
    const { repoName } = req.params;
    try {
        const repoResponse = await axios.get(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repoName}`);

        res.json({
            name: repoResponse.data.name,
            description: repoResponse.data.description,
            stars: repoResponse.data.stargazers_count,
            forks: repoResponse.data.forks_count,
            open_issues: repoResponse.data.open_issues_count,
            url: repoResponse.data.html_url
        });
    } catch (error) {
        res.status(500).json({ error: "Repository not found" });
    }
});
 
app.post("/github/:repoName/issues", async (req, res) => {

    const { repoName } = req.params;
    const { title, body } = req.body;

    if (!title || !body) return res.status(400).json({ error: "Title and body are required" });
  

    try {
        const issueResponse = await axios.post(
            `${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repoName}/issues`,
            { title, body },
            {
                headers: {
                    "Authorization": `token ${GITHUB_TOKEN}`,
                    "Accept": "application/vnd.github.v3+json"
                }
            }
        );

        res.json({ issue_url: issueResponse.data.html_url });
    } catch (error) {
        res.status(500).json({ error: "Error creating issue. Check authentication and repo name." });
    }
});

const PORT = 3000;

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
