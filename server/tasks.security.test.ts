import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("tasks security", () => {
  it("rejects task creation without an authenticated session", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.tasks.create({ title: "Private task" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
