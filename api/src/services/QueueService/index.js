class QueueService {
  _callback = null;
  _content = [];
  _isRunning = false;
  _reset = false;

  on(callback) {
    this._callback = callback;
    this._startToRun();
  }

  add(item) {
    this._content.push(item);
    this._startToRun();
  }

  getQueued() {
    return this._content;
  }

  reset() {
    if (this._isRunning) {
      this._reset = true;
    }

    this._content = [];
    this._callback = null;
  }

  isRunning() {
    return this._isRunning;
  }

  _startToRun() {
    if (!this._isRunning) {
      this._run().catch(console.error);
    }
  }

  async _run() {
    if (this._reset) {
      this._reset = false;
      this._isRunning = false;
      return;
    }

    if (!this._checkCallback()) {
      return;
    }

    if (this._content.length < 1) {
      this._isRunning = false;
      return;
    }

    this._isRunning = true;

    const [first, ...rest] = this._content;
    this._content = rest;

    try {
      await this._callback(first);
    } catch (e) {
      console.warn("there was an error while trying to run this:", first);
      throw e;
    }
    this._run();
  }

  _checkCallback() {
    return !!this._callback && typeof this._callback === "function";
  }
}

module.exports.QueueService = new QueueService();
