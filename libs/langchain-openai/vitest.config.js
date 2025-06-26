import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig((env) => {
  /** @type {import("vitest/config").UserConfigExport} */
  const common = {
    test: {
      hideSkippedTests: true,
      // TODO: remove this once standard tests are updated to use vitest
      // globals: true,
      testTimeout: 30_000,
      maxWorkers: 0.5,
      exclude: ["**/*.int.test.ts", ...configDefaults.exclude],
      setupFiles: ["dotenv/config", "vitest.setup.js"],
    },
  };

  if (env.mode === "standard-unit") {
    return {
      test: {
        ...common.test,
        testTimeout: 100_000,
        exclude: configDefaults.exclude,
        include: ["**/*.standard.test.ts"],
        name: "standard-unit",
        environment: "node",
      },
    };
  }

  if (env.mode === "standard-int") {
    return {
      test: {
        ...common.test,
        testTimeout: 100_000,
        exclude: configDefaults.exclude,
        include: ["**/*.standard.int.test.ts"],
        name: "standard-int",
        environment: "node",
      },
    };
  }

  if (env.mode === "int") {
    return {
      test: {
        ...common.test,
        globals: false,
        testTimeout: 100_000,
        exclude: ["**/*.standard.int.test.ts", ...configDefaults.exclude],
        include: ["**/*.int.test.ts"],
        name: "int",
        environment: "node",
      },
    };
  }

  return {
    test: {
      ...common.test,
      environment: "node",
      include: configDefaults.include,
      typecheck: { enabled: true },
    },
  };
});
