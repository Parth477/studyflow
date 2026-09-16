import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { tasks } from "../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { getDb } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(tasks).where(eq(tasks.userId, ctx.user.id)).orderBy(asc(tasks.createdAt));
    }),
    create: protectedProcedure
      .input(z.object({ title: z.string().trim().min(1).max(160) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database is not configured");
        await db.insert(tasks).values({ userId: ctx.user.id, title: input.title, completed: 0 });
        return { success: true } as const;
      }),
    toggle: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), completed: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database is not configured");
        await db.update(tasks).set({ completed: input.completed ? 1 : 0 }).where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
