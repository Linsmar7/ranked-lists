
import { Form, Link, useLoaderData } from "react-router";
import { auth } from "~/utils/auth";
import type { Route } from "./+types/dashboard";
import { db } from "~/db.server";
import { desc } from "drizzle-orm";
import { lists } from "~/db/schema";
import { authClient } from "~/utils/auth-client";
import { Search, Bell, Plus, Flame, Filter, List, ListOrdered, Heart, Facebook, MessageCircle, Camera, Instagram } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  // Fetch latest public lists for the dashboard
  const latestLists = await db.query.lists.findMany({
    where: (lists, { eq }) => eq(lists.isPublic, true),
    orderBy: [desc(lists.createdAt)],
    limit: 10,
    with: {
      user: true,
      items: true // We might want to count items
    }
  });

  return { session, latestLists };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { session, latestLists } = loaderData;
  const user = session?.user;

  return (
    <div className="bg-background text-foreground font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-border bg-white/80 dark:bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
              R
            </div>
            <span className="text-xl font-bold tracking-tight">Rankly</span>
          </Link>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/create-list"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-[18px] h-[18px]" />
              <span>New List</span>
            </Link>
            {user ? (
               <div className="flex items-center gap-3">
                 <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px] cursor-pointer block">
                  {user.image ? (
                      <img
                          alt={user.name}
                          className="rounded-full w-full h-full object-cover border-2 border-background"
                          src={user.image}
                      />
                  ) : (
                      <div className="rounded-full w-full h-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border-2 border-background">
                          {user.name.charAt(0)}
                      </div>
                  )}
                </Link>
                 <button 
                   onClick={async () => {
                       await authClient.signOut({
                           fetchOptions: {
                               onSuccess: () => {
                                   window.location.href = "/login";
                               },
                           },
                       });
                   }}
                   className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                 >
                   Log out
                 </button>
               </div>
            ) : (
                <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
                    Login
                </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none translate-y-1/2"></div>
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Create. Rank. <br />
              <span className="text-primary">Share.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The definitive platform to curate your world. Build your Top 100,
              discover new favorites from experts, and debate the rankings that
              matter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create-list"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all transform hover:-translate-y-0.5"
              >
                Start Ranking
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard / Trending Section */}
        <section className="container mx-auto px-4 py-16">
          {/* Section Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Flame className="text-primary w-6 h-6" />
                Public Lists
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Discover what the community is ranking right now.
              </p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {latestLists.length > 0 ? (
                latestLists.map((list) => (
                    <Link to={`/list/${list.id}`} key={list.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col">
                        <div className="relative h-48 overflow-hidden bg-muted">
                             {/* Placeholder for list cover image (could be first item image) */}
                             {list.items && list.items.length > 0 && list.items[0].imageUrl ? (
                                <img
                                    src={list.items[0].imageUrl}
                                    alt={list.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <List className="w-10 h-10" />
                                </div>
                             )}
                             
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                            <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                                <ListOrdered className="w-[14px] h-[14px]" />
                                <span>{list.items?.length || 0} Items</span>
                            </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                Lists
                                </span>
                                <span className="text-xs text-muted-foreground">{new Date(list.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                                {list.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {list.description || "No description provided."}
                            </p>
                            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                     {list.user.image ? (
                                        <img
                                            alt={list.user.name}
                                            className="w-6 h-6 rounded-full object-cover"
                                            src={list.user.image}
                                        />
                                     ) : (
                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                                            {list.user.name.charAt(0)}
                                        </div>
                                     )}
                                    <span className="text-xs font-medium text-foreground">
                                        {list.user.name}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    {/* Like/Comment removed */}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))
            ) : (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                    No public lists found. Be the first to create one!
                </div>
            )}


            {/* Create Card (CTA) */}
            <Link to="/create-list" className="group bg-card border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[360px]">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Create Your Own List
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-[200px]">
                Share your expertise and see how your opinions stack up against
                the world.
              </p>
              <span className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                Get Started
              </span>
            </Link>
          </div>

          {/* Pagination / Load More */}
          {latestLists.length >= 10 && (
            <div className="mt-16 text-center">
                <button className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                <span>Load More Lists</span>
                </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                R
              </div>
              <span className="text-xl font-bold">
                Rankly
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
                © 2024 Rankly Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
