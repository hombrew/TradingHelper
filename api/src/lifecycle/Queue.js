class Queue {
  _callback = null;
  _content = [];
  _isRunning = false;

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

  _startToRun() {
    if (this._isRunning) {
      this._run();
    }
  }

  async _run() {
    if (!this._checkCallback()) {
      return;
    }

    if (this.content.length < 1) {
      this._isRunning = false;
      return;
    }

    this._isRunning = true;

    const [first, ...rest] = this._content;
    this.content = rest;

    await this.callback(first);
    await this._run();
  }

  _checkCallback() {
    return !!this._callback && typeof this._callback === "function";
  }
}

module.exports.Queue = Queue;
