require("dotenv").config({ path: "./env-vars/.prod.env" });
const tsConfig = require("../tsconfig.json");
const tsConfigPaths = require("tsconfig-paths");

const baseUrl = "./dist";
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});
