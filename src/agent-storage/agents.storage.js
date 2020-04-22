const EventEmitter = require('events');
const { AgentModel, STATUS } = require('./agent.model');

class AgentsStorage extends Map {
  constructor() {
    super();
    this.ee = new EventEmitter();
  }

  register(host, port) {
    const agent = new AgentModel({ host, port });
    this.set(agent.id, agent);
    this.ee.emit('register', agent);
  }

  getNotBusy() {
    return new Map([...this].filter((item) => item[1].status === STATUS.NOT_BUSY));
  }

  setNotBusy(id) {
    const agent = this.get(id);

    if (!agent) {
      console.error(`Not find agent with ${id} in storage`);
      return;
    }

    this.get(id).status = STATUS.NOT_BUSY;
    this.ee.emit('notBusy', id);
  }

  setBusy(id) {
    const agent = this.get(id);

    if (!agent) {
      console.error(`Not find agent with ${id} in storage`);
      return;
    }

    this.get(id).status = STATUS.BUSY;
    this.ee.emit('busy', id);
  }

  onRegister(callback) {
    this.ee.on('register', (agent) => callback(agent));
  }

  onNotBusy(callback) {
    this.ee.on('notBusy', (id) => callback(id));
  }

  onBusy(callback) {
    this.ee.on('busy', (id) => callback(id));
  }
}

module.exports = AgentsStorage;
