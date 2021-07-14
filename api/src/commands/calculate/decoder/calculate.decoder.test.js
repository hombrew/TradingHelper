const decodeCalculateData = require(".");

describe("calculate.decoder", () => {
  describe("Fail", () => {
    it("Message is not valid", () => {
      expect(() => decodeCalculateData("hola")).toThrow("Message is not valid");
    });

    it.each([[["nkjsdjifhsdfs"]], [["SYMBOL: BTCUSDT", "hola"]]])(
      "data is not valid",
      (data) => {
        expect(() => decodeCalculateData(data)).toThrow(
          "Data is not valid; it should be a dictionary '<KEY>: <VALUE>'"
        );
      }
    );

    it.each([
      ["'DIR' is missing.", ["SYMBOL: BTCUSDT"]],
      ["'EP' is missing.", ["SYMBOL: BTCUSDT", "DIR: LONG"]],
      ["'SL' is missing.", ["SYMBOL: BTCUSDT", "DIR: LONG", "EP: 29000"]],
      [
        "'TP' is missing.",
        ["SYMBOL: BTCUSDT", "DIR: LONG", "EP: 29000", "SL: 28000"],
      ],
      [
        "'RISKED' is missing.",
        ["SYMBOL: BTCUSDT", "DIR: LONG", "EP: 29000", "SL: 28000", "TP: 50000"],
      ],
    ])("should throw if %s", (message, data) => {
      expect(() => decodeCalculateData(data)).toThrow(message);
    });

    it("should throw if given more data", () => {
      const data = [
        "SYMBOL: BTCUSDT",
        "DIR: LONG",
        "EP: 29000",
        "SL: 28000",
        "TP: 50000",
        "RISKED: 100",
        "GAMES: 3",
      ];
      expect(() => decodeCalculateData(data)).toThrow(`'games' is not needed.`);
    });

    it("should throw if not instructed DCA but given parts", () => {
      const data = [
        "SYMBOL: BTCUSDT",
        "DIR: LONG",
        "EP: 29000",
        "SL: 28000",
        "TP: 50000",
        "RISKED: 100",
        "PARTS: 3",
      ];
      expect(() => decodeCalculateData(data)).toThrow(
        "'PARTS' not needed, as 'EP' is not a range"
      );
    });

    it("should throw if instructed DCA but not given parts", () => {
      const data = [
        "SYMBOL: BTCUSDT",
        "DIR: LONG",
        "EP: 30000 - 29000",
        "SL: 28000",
        "TP: 50000",
        "RISKED: 100",
      ];
      expect(() => decodeCalculateData(data)).toThrow(
        "'PARTS' is needed, as 'EP' is a range"
      );
    });

    it("should recive a valid EP range", () => {
      const data = [
        "SYMBOL: BTCUSDT",
        "DIR: LONG",
        "EP: 30000 - 29000 - 28000",
        "PARTS: 5",
        "SL: 28000",
        "TP: 50000",
        "RISKED: 100",
      ];
      expect(() => decodeCalculateData(data)).toThrow(
        "'EP' is not a valid range"
      );
    });

    it("should have a valid 'DIR' value", () => {
      const data = [
        "SYMBOL: BTCUSDT",
        "DIR: BUY",
        "EP: 30000 - 29000",
        "PARTS: 5",
        "SL: 28000",
        "TP: 50000",
        "RISKED: 100",
      ];
      expect(() => decodeCalculateData(data)).toThrow(
        "'DIR' can only take 'LONG' and 'SHORT' values"
      );
    });

    describe("LONG", () => {
      it("should throw if LONG and EP not in DESC order", () => {
        const data = [
          "SYMBOL: BTCUSDT",
          "DIR: LONG",
          "EP: 30000 - 31000",
          "SL: 28000",
          "TP: 50000",
          "RISKED: 100",
          "PARTS: 3",
        ];
        expect(() => decodeCalculateData(data)).toThrow(
          `'EP' is not valid because this is a LONG, it should be ordered DESC`
        );
      });

      it("should throw if LONG and SL not below last EP", () => {
        const data = [
          "SYMBOL: BTCUSDT",
          "DIR: LONG",
          "EP: 31000 - 30000",
          "SL: 30500",
          "TP: 50000",
          "RISKED: 100",
          "PARTS: 3",
        ];
        expect(() => decodeCalculateData(data)).toThrow(
          "'SL' is not valid as it should be below the last 'EP'"
        );
      });

      it("should throw if LONG and TP not in ASC order", () => {
        const data = [
          "SYMBOL: BTCUSDT",
          "DIR: LONG",
          "EP: 31000 - 30000",
          "SL: 27000",
          "TP: 50000 45000 51000",
          "RISKED: 100",
          "PARTS: 3",
        ];
        expect(() => decodeCalculateData(data)).toThrow(
          "'TP' is not valid because this is a LONG, it should be ordered ASC"
        );
      });

      it("should throw if LONG and TP < EP", () => {
        const data = [
          "SYMBOL: BTCUSDT",
          "DIR: LONG",
          "EP: 31000 - 30000",
          "SL: 27000",
          "TP: 30500 32000 33000",
          "RISKED: 100",
          "PARTS: 3",
        ];
        expect(() => decodeCalculateData(data)).toThrow(
          "'TP' is not valid because this is a LONG, it should be greater than 'EP'"
        );
      });
    });

    describe("SHORT", () => {
      it("should throw if SHORT and EP not in ASC order", () => {
        const data = [
          "SYMBOL: BTCUSDT",
          "DIR: SHORT",
          "EP: 31000 - 30000",
          "SL: 34000",
          "TP: 28000",
          "RISKED: 100",
          "PARTS: 3",
        ];
        expect(() => decodeCalculateData(data)).toThrow(
          `'EP' is not valid because this is a SHORT, it should be ordered ASC`
        );
      });

      it("should throw if SHORT and SL not above last EP", () => {
        const data = [
          "SYMBOL: BTCUSDT",
          "DIR: SHORT",
          "EP: 30000 - 31000",
          "SL: 30500",
          "TP: 28000",
          "RISKED: 100",
          "PARTS: 3",
        ];
        expect(() => decodeCalculateData(data)).toThrow(
          "'SL' is not valid as it should be above the last 'EP'"
        );
      });

      it("should throw if SHORT and TP not in DESC order", () => {
        const data = [
          "SYMBOL: BTCUSDT",
          "DIR: SHORT",
          "EP: 30000 - 31000",
          "SL: 32000",
          "TP: 28000 29000 27000",
          "RISKED: 100",
          "PARTS: 3",
        ];
        expect(() => decodeCalculateData(data)).toThrow(
          "'TP' is not valid because this is a SHORT, it should be ordered DESC"
        );
      });

      it("should throw if SHORT and TP > EP", () => {
        const data = [
          "SYMBOL: BTCUSDT",
          "DIR: SHORT",
          "EP: 30000 - 31000",
          "SL: 32000",
          "TP: 30500 29000 28000",
          "RISKED: 100",
          "PARTS: 3",
        ];
        expect(() => decodeCalculateData(data)).toThrow(
          "'TP' is not valid because this is a SHORT, it should be lower than 'EP'"
        );
      });
    });
  });

  describe("Success", () => {
    it("should return data", () => {
      const data = [
        "SYMBOL: BTCUSDT",
        "DIR: SHORT",
        "EP: 30000 - 31000",
        "SL: 34000",
        "TP: 28000",
        "RISKED: 100",
        "PARTS: 3",
      ];
      expect(decodeCalculateData(data)).toEqual({
        symbol: "BTCUSDT",
        direction: "SHORT",
        entries: [30000, 31000],
        stopLoss: 34000,
        takeProfits: [28000],
        risked: 100,
        parts: 3,
      });
    });

    it("should return data when 'PARTS' not given if EP is not a range", () => {
      const data = [
        "SYMBOL: BTCUSDT",
        "DIR: LONG",
        "EP: 31000",
        "SL: 30000",
        "TP: 40000",
        "RISKED: 100",
      ];
      expect(decodeCalculateData(data)).toEqual({
        symbol: "BTCUSDT",
        direction: "LONG",
        entries: [31000],
        stopLoss: 30000,
        takeProfits: [40000],
        risked: 100,
        parts: 1,
      });
    });
  });
});
