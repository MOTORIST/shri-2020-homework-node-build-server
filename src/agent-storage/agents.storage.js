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

  hasAgent(host, port) {
    return !!this.get(AgentModel.generateId(host, port));
  }

  getNotBusy() {
    return new Map([...this].filter((item) => item[1].status === STATUS.NOT_BUSY));
  }

  getBusy() {
    return new Map([...this].filter((item) => item[1].status === STATUS.BUSY));
  }

  setNotBusy(id) {
    const agent = this.get(id);

    if (!agent) {
      console.error(`Not find agent with ${id} in storage`);
      return;
    }

    agent.removeBuild(id).setStatus(STATUS.NOT_BUSY);
    this.ee.emit('notBusy', id);
  }

  setBusy(id, buildId) {
    const agent = this.get(id);

    if (!agent) {
      console.error(`Not find agent with ${id} in storage`);
      return;
    }

    agent.assignBuild(buildId).setStatus(STATUS.BUSY);

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
