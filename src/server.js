require('dotenv').config();
const { check, validationResult } = require('express-validator');
const app = require('./config/express');
const { PORT, ENV } = require('./config');
const { AgentsStorage } = require('./agent-storage');
const retry = require('./helpers/retry');
const shriApi = require('./services/shri-api.service');
const BuildsQueue = require('./builds-queue/builds.queue');
const BuildServer = require('./services/build-server.service');

const agentsStorage = new AgentsStorage();
const buildsQueue = new BuildsQueue();
const buildServer = new BuildServer(agentsStorage, buildsQueue);

buildServer.run();

const validationHandler = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
};

const buildFinishRetry = retry(shriApi.buildFinish, 7, 1000, true);

app.get('/', (req, res) => res.json({ ok: true }));

app.post(
  '/notify-agent',
  [check('host').isString().exists(), check('port').isNumeric().exists()],
  (req, res) => {
    const { host, port } = req.body;

    validationHandler(req, res);
    agentsStorage.register(host, port);

    return res.json({ ok: true });
  },
);

app.get('/agents', (req, res) => {
  return res.json({ data: [...agentsStorage.values()] });
});

app.post(
  '/notify-build-result',
  [
    check('agentId').isString().exists(),
    check('buildId').isString().exists(),
    check('status').isBoolean().exists(),
    check('buildLog').isString().exists(),
    check('duration').isNumeric().exists(),
  ],
  (req, res) => {
    const { agentId, buildId, status, buildLog, duration } = req.body;

    validationHandler(req, res);
    agentsStorage.setNotBusy(agentId);

    buildFinishRetry(buildId, Number(duration), buildLog, Boolean(status))
      .then(() => {
        if (ENV === 'dev') {
          console.log('---BUILD FINISH---');
        }
      })
      .catch((error) => console.error('---ERROR BUILD FINISH---', error));

    return res.json({ data: { agentId, buildId, status, buildLog, duration } });
  },
);

app.get('/queue', (req, res) => {
  return res.json({ data: [...buildsQueue.map.values()] });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Build server started on port ${PORT} - env (${ENV})`);
});
