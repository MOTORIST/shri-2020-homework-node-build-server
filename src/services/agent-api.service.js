const axios = require('axios');

async function build(agent, id, commitHash, buildCommand, repoName) {
  const data = { agentId: agent.id, id, commitHash, buildCommand, repoName };

  return await axios.post(`${agent.host}:${agent.port}/build`, data);
}

module.exports = {
  build,
};
