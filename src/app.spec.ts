const mockChildProcess = {
  execSync: jest.fn(),
};

jest.mock("child_process", () => mockChildProcess);

import { gitReady, directoryIsGitRepository } from "./app";
describe(`app.ts`, () => {
  const originalProcess = process;
  const exitFn = (jest.fn() as unknown) as () => never;

  const originalConsole = console;
  const errorFn = (jest.fn() as unknown) as (message: string) => never;

  beforeEach(() => {
    global.process = { ...originalProcess, exit: exitFn };
    global.console = { ...originalConsole, error: errorFn };
  });
  afterEach(() => {
    global.process = originalProcess;
  });
  describe(`gitReady()`, () => {
    describe(`when git not installed`, () => {
      it(`should return false`, () => {
        // arrange
        mockChildProcess.execSync.mockImplementation(throwErr);

        // act
        const result = gitReady();

        // assert
        expect(result).toEqual(false);
      });
    });
    describe(`when git is installed`, () => {
      it(`should return false`, () => {
        // arrange
        mockChildProcess.execSync.mockImplementation(
          () => "git version 1.23.4"
        );

        // act
        const result = gitReady();

        // assert
        expect(result).toEqual(true);
      });
    });
  });
  describe(`directoryIsGitRepository()`, () => {
    describe(`when not in git directory`, () => {
      it(`should return false`, () => {
        // arrage
        mockChildProcess.execSync.mockReturnValue("false");

        // act
        const result = directoryIsGitRepository();

        // assert
        expect(result).toEqual(false);
      });
      it(`should return false`, () => {
        // arrage
        mockChildProcess.execSync.mockImplementation(throwErr);

        // act
        const result = directoryIsGitRepository();

        // assert
        expect(result).toEqual(false);
      });
    });
    describe(`when in git repository`, () => {
      it(`should return true`, () => {
        // arrange
        mockChildProcess.execSync.mockReturnValue("true");

        // act
        const result = directoryIsGitRepository();

        // assert
        expect(result).toEqual(true);
      });
    });
  });
});

function throwErr() {
  throw Error("Some error");
}
