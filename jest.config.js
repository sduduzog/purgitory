function makeModuleNameMapper(srcPath, tsconfigPath) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { paths } = require(tsconfigPath).compilerOptions;

  const aliases = {};

  Object.keys(paths).forEach(item => {
    const key = item.replace("/*", "/(.*)");
    const path = paths[item][0].replace("/*", "/$1");
    aliases[key] = srcPath + "/" + path;
  });
  return aliases;
}

const TS_CONFIG_PATH = "./tsconfig.json";
const SRC_PATH = "<rootDir>/src";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: [SRC_PATH],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH),
};
