const STATUS = {
  BUSY: 'busy',
  NOT_BUSY: 'not_busy',
};

class AgentModel {
  constructor({ host, port }) {
    this.id = this._generateId(host, port);
    this.host = host;
    this.port = port;
    this.status = STATUS.NOT_BUSY;
    this.buildId = null;
  }

  setStatus(value) {
    this.status = value;
    return this;
  }

  setBusy() {
    this.status = STATUS.BUSY;
    return this;
  }

  setNotBusy() {
    this.status = STATUS.NOT_BUSY;
    return this;
  }

  assignBuild(id) {
    this.buildId = id;
    return this;
  }

  removeBuild() {
    this.buildId = null;
    return this;
  }

  _generateId(host, port) {
    return host + port;
  }
}

module.exports = {
  AgentModel,
  STATUS,
};
