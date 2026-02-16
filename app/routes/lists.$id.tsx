
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/lists.$id";
import { db } from "~/db.server";
import { lists, listItems } from "~/db/schema";
import { asc, eq } from "drizzle-orm";
import { auth } from "~/utils/auth";
// Custom 404 handler can be added but for now we throw basic error or return null

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const listId = params.id;
  const list = await db.query.lists.findFirst({
    where: (lists, { eq }) => eq(lists.id, listId),
    with: {
      user: true,
      items: {
        orderBy: [asc(listItems.rank)],
      },
    },
  });

  if (!list) {
    throw new Response("List Not Found", { status: 404 });
  }

  return { list, session };
}

export default function ViewList({ loaderData }: Route.ComponentProps) {
  const { list } = loaderData;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200 min-h-screen flex flex-col">
       {/* Navbar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#101322]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                    R
                </div>
                <span className="font-bold text-lg tracking-tight dark:text-white">Rankr</span>
            </Link>
          <div className="flex items-center gap-4">
             <Link to="/create-list" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
              Create New List
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        {/* List Header */}
        <header className="mb-10 space-y-6">
          <div className="group">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                {list.title}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                 {/* Author info */}
                 <div className="flex items-center gap-2">
                    {list.user.image ? (
                        <img src={list.user.image} alt={list.user.name} className="w-6 h-6 rounded-full" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">{list.user.name.charAt(0)}</div>
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        by {list.user.name}
                    </span>
                 </div>
              <span className="text-xs text-slate-500 dark:text-slate-500 hidden sm:inline-block">
                • {new Date(list.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2">
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${list.isPublic ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {list.isPublic ? 'Public' : 'Private'}
                 </span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            {list.description}
          </p>
        </header>

        {/* List Items */}
        <section className="space-y-8">
          <div className="relative py-4">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background-light dark:bg-background-dark text-sm text-slate-500 dark:text-slate-500 font-medium">
                The Ranking ({list.items.length} Items)
              </span>
            </div>
          </div>

          <div className="space-y-3">
             {list.items.map((item, index) => (
                <div
                    key={item.id}
                    className="group relative flex items-center gap-4 p-3 bg-white dark:bg-[#151a2e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl opacity-100"></div>
                    
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 ml-2">
                        {item.rank}
                    </div>
                    {/* Content */}
                    <div className="flex-grow flex items-center gap-4">
                        {item.imageUrl ? (
                             <img
                                alt={item.name}
                                className="w-16 h-24 object-cover rounded-lg shadow-sm bg-slate-800"
                                src={item.imageUrl}
                            />
                        ) : (
                            <div className="w-16 h-24 rounded-lg shadow-sm bg-slate-800 flex items-center justify-center text-slate-500">
                                <span className="material-icons-round text-2xl">image</span>
                            </div>
                        )}
                        <div className="flex-grow min-w-0">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                            {item.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.note}
                        </p>
                        </div>
                    </div>
                </div>
             ))}
             {list.items.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    This list is empty.
                </div>
             )}
          </div>
        </section>
      </main>

      <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            © 2023 Rankr. Create, Share, Debate.
          </p>
        </div>
      </footer>
    </div>
  );
}
