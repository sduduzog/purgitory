/* eslint-disable @typescript-eslint/no-var-requires */
const mockApp = {
  start: jest.fn(),
};

describe(`purgit.js`, () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("./app", () => mockApp);
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
      const originalProcess = process;
      const originalConsole = console;
      const mockExit = (jest.fn() as never) as (code: number) => never;

      beforeEach(() => {
        global.process = { ...originalProcess, exit: mockExit };
        global.console = { ...originalConsole, log: jest.fn() };
      });
      afterEach(() => {
        global.process = originalProcess;
        global.console = originalConsole;
      });
      it(`should not start the app`, () => {
        // arrange
        process.argv = ["node", "jest", "--help"];

        // act
        require("./purgit");

        // assert
        expect(mockExit).toHaveBeenCalledWith(0);
      });
    });
  });
});
