const { COMMANDS } = require("../../config/commands");
const { decodeCommand } = require(".");

describe("commands.decoder", () => {
  it("should return the command and data", () => {
    const [command, data] = decodeCommand(`
      /calculate
      SYMBOL: BTCUSDT
      EP: 33000
    `);
    expect(command).toBe("/calculate");
    expect(data).toEqual(["SYMBOL: BTCUSDT", "EP: 33000"]);
  });

  it.each([COMMANDS])("should decode command '%s'", (givenCommand) => {
    const [command] = decodeCommand(`
      ${givenCommand}
      SYMBOL: BTCUSDT
      EP: 33000
    `);
    expect(command).toBe(givenCommand);
  });

  it("should not decode commands not in 'COMMANDS'", () => {
    const command = "/play";
    expect(() => decodeCommand(`${command}\nBALL`)).toThrow(
      `Command '${command}' is not valid.`
    );
  });
});
