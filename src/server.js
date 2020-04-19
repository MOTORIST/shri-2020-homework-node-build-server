require('dotenv').config();
const { check, validationResult } = require('express-validator');
const app = require('./config/express');
const { PORT, ENV } = require('./config');
const { AgentsStorage } = require('./agent-storage');

const agentsStorage = new AgentsStorage();

app.get('/', (req, res) => res.json({ ok: true }));

app.post(
  '/notify-agent',
  [check('host').isString().exists(), check('port').isNumeric().exists()],
  (req, res) => {
    const { host, port } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    agentsStorage.register(host, port);

    return res.json({ ok: true });
  },
);

app.get('/agents', (req, res) => {
  return res.json({ data: [...agentsStorage.values()] });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Build server started on port ${PORT} - env (${ENV})`);
});
