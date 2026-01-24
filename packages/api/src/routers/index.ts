import { protectedProcedure, publicProcedure, router } from "../index";

import { listsRouter } from "./lists";

export const appRouter = router({
  lists: listsRouter,
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});
export type AppRouter = typeof appRouter;
