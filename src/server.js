require('dotenv').config();
const app = require('./config/express');
const { PORT, ENV } = require('./config');

app.get('/', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Build server started on port ${PORT} - env (${ENV})`);
});
