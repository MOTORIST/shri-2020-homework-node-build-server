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
  }

  setStatus(value) {
    this.status = value;
  }

  _generateId(host, port) {
    return host + port;
  }
}

module.exports = {
  AgentModel,
  STATUS,
};
