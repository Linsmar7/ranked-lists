import { db } from "@ranked-lists/db";
import { listItems, lists } from "@ranked-lists/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

export const listsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        items: z.array(
          z.object({
            name: z.string().min(1),
            rank: z.number().int(),
            description: z.string().optional(),
            imageUrl: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newList] = await db
        .insert(lists)
        .values({
          userId: ctx.session.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
        })
        .returning();

      if (input.items.length > 0) {
        await db.insert(listItems).values(
          input.items.map((item) => ({
            listId: newList.id,
            name: item.name,
            rank: item.rank,
            description: item.description,
            imageUrl: item.imageUrl,
          })),
        );
      }

      return newList;
    }),

  getAll: publicProcedure.query(async () => {
    return await db.query.lists.findMany({
      with: {
        items: true,
        user: true,
      },
      orderBy: (lists, { desc }) => [desc(lists.createdAt)],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.query.lists.findFirst({
        where: eq(lists.id, input.id),
        with: {
          items: {
            orderBy: (items, { asc }) => [asc(items.rank)],
          },
          user: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Ensure user owns the list
      const list = await db.query.lists.findFirst({
        where: eq(lists.id, input.id),
      });

      if (!list) return null;
      if (list.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await db.delete(lists).where(eq(lists.id, input.id));
      return { success: true };
    }),
});
