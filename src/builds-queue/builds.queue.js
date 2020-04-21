class BuildsQueue {
  constructor() {
    this.map = new Map();
    this.removalIndex = null;
  }

  get first() {
    if (this.isEmpty) {
      return null;
    }

    return Array.from(this.map)[0][1];
  }

  get isEmpty() {
    return this.map.size === 0;
  }

  queue(build) {
    this.map.set(build.id, build);

    if (this.removalIndex) {
      this.removalIndex = this._getFirstKeyInMap();
    } else {
      this.removalIndex = build.id;
    }
  }

  dequeue() {
    const build = this.map.get(this.removalIndex);
    this.map.delete(this.removalIndex);
    this.removalIndex = this._getFirstKeyInMap();
    return build;
  }

  _getFirstKeyInMap() {
    const firstItem = Array.from(this.map)[0];
    return firstItem && firstItem[0];
  }
}

module.exports = BuildsQueue;
