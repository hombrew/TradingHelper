const { flushPromises } = require("../../../test.helpers/flushPromises");
const { mockConsole } = require("../../../test.helpers/mockConsole");
const { sleep } = require("../../utils");
const { QueueService } = require(".");

jest.mock("console");

function expectQueueLengthToBe(length) {
  expect(QueueService.getQueued()).toHaveLength(length);
}

function expectQueueToBeRunning(state) {
  expect(QueueService.isRunning()).toBe(state);
}

function addNtoQueue(items) {
  let toAdd;

  if (Array.isArray(items) && items.length > 0) {
    toAdd = items;
  }

  if (Number.isInteger(items)) {
    toAdd = [...Array(items).keys()];
  }

  toAdd.forEach(QueueService.add.bind(QueueService));
}

describe("Queue", () => {
  beforeEach(async () => {
    QueueService.reset();
    jest.useRealTimers();
  });

  it("should add elements to a list on 'add' method call", () => {
    expectQueueLengthToBe(0);
    addNtoQueue(10);
    expectQueueLengthToBe(10);
  });

  it("should not call callback until items are added to the queue", async () => {
    const callback = jest.fn();
    QueueService.on(callback);
    expect(callback).toHaveBeenCalledTimes(0);
    addNtoQueue(2);
    expect(callback).not.toHaveBeenCalledTimes(2);
    await flushPromises();
    expect(callback).toHaveBeenCalledTimes(2);
    expectQueueLengthToBe(0);
  });

  it("should end up calling all items no matter when they were added", async () => {
    const callback = jest.fn();
    QueueService.on(callback);
    expectQueueToBeRunning(false);
    addNtoQueue(4);
    expectQueueToBeRunning(true);
    addNtoQueue(3);
    await flushPromises();
    expect(callback).toHaveBeenCalledTimes(7);
    expectQueueLengthToBe(0);
  });

  it("should wait for a run to end to start the next one", async () => {
    jest.useFakeTimers();
    const callback = jest.fn().mockImplementation(sleep.bind(null, 1000));
    QueueService.on(callback);
    expectQueueToBeRunning(false);
    addNtoQueue(4);
    expect(callback).toHaveBeenCalledTimes(1);
    for (let i = 3; i >= 0; i--) {
      expectQueueToBeRunning(true);
      expectQueueLengthToBe(i);
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    }
    expectQueueToBeRunning(false);
  });

  it("should be able to reset the queue while on a run", async () => {
    jest.useFakeTimers();
    const callback = jest.fn().mockImplementation(sleep.bind(null, 1000));
    QueueService.on(callback);
    expectQueueToBeRunning(false);
    addNtoQueue(4);
    expectQueueToBeRunning(true);
    expectQueueLengthToBe(3);
    QueueService.reset();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expectQueueToBeRunning(false);
    expectQueueLengthToBe(0);
  });

  it("should log run errors with a nice message", async () => {
    const restoreConsole = mockConsole(["warn", "error"]);
    const spy = jest.spyOn(global.console, "warn");
    const callback = jest
      .fn()
      .mockRejectedValue(new Error("Houston we have a problem"));
    QueueService.on(callback);
    addNtoQueue(1);
    await flushPromises();
    expect(spy).toHaveBeenNthCalledWith(
      1,
      "there was an error while trying to run this:",
      0
    );
    restoreConsole();
  });
});
