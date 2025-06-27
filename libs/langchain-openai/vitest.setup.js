import { awaitAllCallbacks } from "@langchain/core/callbacks/promises";
import { net } from "@langchain/net-mocks";
import { afterAll, beforeAll, vi } from "vitest";

afterAll(awaitAllCallbacks);

beforeAll(() =>
  net.setupVitest({
    includeKeys: ["x-stainless-package-version"],
  })
);

if (process.env.DISABLE_CONSOLE_LOGS === "true") {
  console.log = vi.fn();
}
