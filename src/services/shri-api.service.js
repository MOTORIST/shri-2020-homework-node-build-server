const axios = require('axios');
const https = require('https');
const { API_BASE_URL, API_TOKEN } = require('../config');

const httpApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

httpApi.defaults.headers.common.Authorization = `Bearer ${API_TOKEN}`;

async function buildStart(buildId) {
  try {
    const { status } = await httpApi.post('/build/start', { buildId, dateTime: new Date() });

    if (status !== 200) {
      return false;
    }

    return true;
  } catch (error) {
    const message = 'Failed to start build';
    console.error(message);
    throw error;
  }
}

async function buildFinish(buildId, duration, buildLog, success) {
  try {
    const { status: statusRes } = await httpApi.post('/build/finish', {
      buildId,
      duration,
      buildLog,
      success,
    });

    if (statusRes !== 200) {
      return false;
    }

    return true;
  } catch (error) {
    const message = 'Failed to start build';
    console.error(message);
    throw error;
  }
}

async function getConfig() {
  try {
    const { data } = await httpApi.get('conf');
    return data;
  } catch (error) {
    const message = 'Failed to get repository configuration (SHRI API: GET / conf)';
    console.error(message);
    throw error;
  }
}

async function getBuildList(offset = 0, limit = 25) {
  try {
    const { data } = await httpApi.get('build/list', { params: { offset, limit } });
    return data;
  } catch (error) {
    const message = 'Failed to get build list (SHRI API: GET /build/list)';
    console.error(message);
    throw error;
  }
}

module.exports = {
  buildStart,
  buildFinish,
  getConfig,
  getBuildList,
};
