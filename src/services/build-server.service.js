const EventEmitter = require('events');
const { ENV, REQUEST_PERIOD } = require('../config');
const Binder = require('../helpers/binder');
const agentApi = require('../services/agent-api.service');
const shriApi = require('../services/shri-api.service');
const retry = require('../helpers/retry');

class BuildServer {
  constructor(agentsStorage, buildQueue) {
    this.ee = new EventEmitter();
    this.requestPeriod = REQUEST_PERIOD * 60 * 1000;
    this.agentsStorage = agentsStorage;
    this.buildQueue = buildQueue;

    Binder.bind(this);
  }

  run() {
    this._init();
  }

  async _init() {
    await this._fillQueue();
    this._fillQueueLoop();

    this.agentsStorage.onRegister((agent) => {
      if (ENV === 'dev') {
        console.log(`-- ON REGISTER AGENT ${agent.id}`);
      }

      this._assignBuildToAgent(agent.id);
    });

    this.agentsStorage.onNotBusy((id) => {
      if (ENV === 'dev') {
        console.log(`-- ON NOT BUSY AGENT ${id}`);
      }

      this._assignBuildToAgent(id);
    });

    this.agentsStorage.onBusy((id) => {
      if (ENV === 'dev') {
        console.log(`-- ON BUSY AGENT ${id}`);
      }
    });

    this.ee.on('fillQueue', () => {
      if (ENV === 'dev') {
        console.log('-- ON FILL QUEUE');
      }

      this._assignBuildsToAgents().catch(console.error);
    });
  }

  async _assignBuildsToAgents() {
    const notBusyAgents = this.agentsStorage.getNotBusy();

    if (notBusyAgents.length === 0) {
      return;
    }

    for (const agent of notBusyAgents.values()) {
      if (this.buildQueue.isEmpty) {
        break;
      }

      await this._assignBuildToAgent(agent.id).catch(console.error);
    }
  }

  async _assignBuildToAgent(agentId) {
    if (this.buildQueue.isEmpty) {
      return;
    }

    const agent = this.agentsStorage.get(agentId);

    try {
      const build = this.buildQueue.first;
      this.agentsStorage.setBusy(agentId);
      const isStartBuild = await this._startBuildRetry(build.id);

      if (!isStartBuild) {
        this.agentsStorage.setNotBust(agentId);
        return;
      }

      this.buildQueue.dequeue();

      const { id, commitHash, buildCommand, repoName } = build;

      if (ENV === 'dev') {
        console.log('---ASSIGN BUILD TO AGENT SERVER---');
      }

      agentApi.build(agent, id, commitHash, buildCommand, repoName);
    } catch (error) {
      console.error(error);
    }
  }

  async _startBuildRetry(buildId) {
    return retry(shriApi.buildStart, 3, 1000, true)(buildId);
  }

  async _loadWaitingBuilds() {
    const { data: builds } = await shriApi.getBuildList(0, 25);

    if (!builds || builds.length === 0) {
      return null;
    }

    return builds.filter((build) => build.status === 'Waiting');
  }

  async _loadSetting() {
    const { data: config } = await shriApi.getConfig();
    return config;
  }

  async _fillQueue() {
    const loadSettingRetry = retry(this._loadSetting, 3, 1000, true);
    const loadWaitingBuildsRetry = retry(this._loadWaitingBuilds, 3, 1000, true);

    try {
      const [settings, builds] = await Promise.all([loadSettingRetry(), loadWaitingBuildsRetry()]);

      if (!settings || !builds) {
        return;
      }

      builds.forEach((build) => {
        this.buildQueue.queue({
          ...build,
          repoName: settings.repoName,
          buildCommand: settings.buildCommand,
        });
      });

      this.ee.emit('fillQueue');

      if (ENV === 'dev') {
        console.log('-FILL QUEUE-');
      }
    } catch (error) {
      console.log('ERROR FILL QUEUE', error);
    }
  }

  async _fillQueueLoop() {
    setTimeout(async () => {
      if (ENV === 'dev') {
        console.log('Fill QUEUE LOOP');
      }

      try {
        await this._fillQueue();
        this._fillQueueLoop();
      } catch (error) {
        console.error('Error! Fill QUEUE LOOP.', error);
      }
    }, this.requestPeriod);
  }
}

module.exports = BuildServer;
