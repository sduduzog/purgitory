/* eslint-disable @typescript-eslint/no-var-requires */

const mockApp = {
  start: jest.fn().mockResolvedValue(Promise.resolve()),
  dryRunStart: jest.fn().mockResolvedValue(Promise.resolve()),
};

describe(`purgit.js`, () => {
  const originalProcess = process;
  const originalConsole = console;
  const mockExit = (jest.fn() as never) as (code: number) => never;

  beforeEach(() => {
    global.process = { ...originalProcess, exit: mockExit };
    global.console = { ...originalConsole, log: jest.fn() };
    jest.resetModules();
    jest.doMock("./app", () => mockApp);
  });
  afterEach(() => {
    global.process = originalProcess;
    global.console = originalConsole;
  });

  describe(`when invoked`, () => {
    it(`should start the app`, () => {
      // arrange
      const spy = spyOn(mockApp, "start");

      // act
      require("./purgit");

      // assert
      expect(spy).toHaveBeenCalled();
    });
    describe(`with --version or --help flag`, () => {
      it(`should not start the app`, () => {
        // arrange
        process.argv = ["node", "jest", "--help"];

        // act
        require("./purgit");

        // assert
        expect(mockExit).toHaveBeenCalledWith(0);
      });
    });
    describe(`with --dry-run flag`, () => {
      it(`should run start app with no side effects`, () => {
        // arrange
        process.argv = ["node", "jest", "--dry-run"];
        const spy = spyOn(mockApp, "start");

        // act
        require("./purgit");

        // assert
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
