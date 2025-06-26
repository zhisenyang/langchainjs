import { createRequire } from "module";

const require = createRequire(import.meta.url);

async function getExpect() {
  // eslint-disable-next-line no-process-env
  if (process.env.JEST_WORKER_ID) {
    return require("@jest/globals").expect;
  }
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
    const { expect } = await import("vitest");
    return expect;
  } catch (e) {
    throw new Error(
      "Could not import `expect` from `vitest`. Please install it as a dev dependency."
    );
  }
}

export const expect = await getExpect();
