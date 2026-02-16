
import { Link, redirect, useLoaderData } from "react-router";
import { auth } from "~/utils/auth";
import type { Route } from "./+types/profile";
import { db } from "~/db.server";
import { desc } from "drizzle-orm";
import { Search, Bell, Edit, Share2, Plus, Heart, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { lists } from "~/db/schema";
import { useState } from "react";
import { authClient } from "~/utils/auth-client";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/login");
  }

  // Fetch user's lists
  const userLists = await db.query.lists.findMany({
    where: (lists, { eq }) => eq(lists.userId, session.user.id),
    orderBy: [desc(lists.createdAt)],
    with: {
      items: true
    }
  });

  return { session, userLists };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { session, userLists } = loaderData;
  const user = session.user;
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  const filteredLists = userLists.filter((list) => {
    if (filter === "public") return list.isPublic;
    if (filter === "private") return !list.isPublic;
    return true;
  });

  return (
    <div className="bg-background font-display text-foreground antialiased min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                R
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                Rankly
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                Discover
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden border border-border">
                {user.image ? (
                  <img
                    alt={user.name}
                    className="w-full h-full object-cover"
                    src={user.image}
                  />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {user.name.charAt(0)}
                    </div>
                )}
              </div>
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Profile Header */}
        <div className="relative mb-12">
          {/* Cover Image (Optional background decoration) */}
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-surface-dark to-surface-dark-lighter rounded-2xl overflow-hidden -z-10 opacity-50">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
          </div>
          <div className="pt-24 px-6 md:px-10 flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background-light dark:border-background-dark bg-surface-dark overflow-hidden shadow-xl flex items-center justify-center">
                 {user.image ? (
                    <img
                        alt={user.name}
                        className="w-full h-full object-cover"
                        src={user.image}
                    />
                 ) : (
                    <div className="text-4xl font-bold text-white">{user.name.charAt(0)}</div>
                 )}
              </div>
              <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-green-500 border-4 border-background-dark"></div>
            </div>
            {/* User Info */}
            <div className="flex-grow md:mb-4 w-full md:w-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                  <button className="bg-slate-200 dark:bg-surface-dark hover:bg-slate-300 dark:hover:bg-surface-dark-lighter text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors border border-slate-300 dark:border-slate-700">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl text-sm leading-relaxed">
                Digital curator. Ranking the world one list at a time.
              </p>
              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {userLists.length}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Lists
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
          <div className="flex gap-8">
            <button className="pb-3 border-b-2 border-primary text-primary font-semibold text-sm">
              My Lists
            </button>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-foreground hidden sm:block">
            All Lists
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto bg-muted p-1 rounded-lg border border-border">
            <button 
                onClick={() => setFilter("all")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-medium transition-colors ${filter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              All
            </button>
            <button 
                onClick={() => setFilter("public")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-medium transition-colors ${filter === 'public' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Public
            </button>
            <button 
                onClick={() => setFilter("private")}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-medium transition-colors ${filter === 'private' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Private
            </button>
          </div>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
          {/* Create New List Card */}
          <Link to="/create-list" className="group bg-card/50 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center h-full min-h-[300px] cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="text-muted-foreground group-hover:text-primary-foreground w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Create New List
            </h3>
            <p className="text-muted-foreground text-sm mt-2">
              Share your rankings with the world
            </p>
          </Link>

          {filteredLists.map((list) => (
             <Link to={`/list/${list.id}`} key={list.id} className="group bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 overflow-hidden flex flex-col h-full">
                {/* Card Header */}
                <div className="p-5 pb-3">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${list.isPublic ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                            {list.isPublic ? 'Public' : 'Private'}
                        </span>
                        <div className="text-muted-foreground text-xs">{new Date(list.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors cursor-pointer">
                        {list.title}
                    </h3>
                </div>
                {/* Preview List Items */}
                <div className="px-5 flex-grow">
                    <div className="space-y-3">
                         {list.items && list.items.slice(0, 3).map((item, index) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
                                <div className="flex-shrink-0 w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm shadow-primary/30">{item.rank || index + 1}</div>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {item.imageUrl ? (
                                        <img
                                            alt={item.name}
                                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                                            src={item.imageUrl}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                                            {item.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {item.name}
                                    </span>
                                </div>
                            </div>
                         ))}
                         {list.items && list.items.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-4">No items yet</div>
                         )}
                    </div>
                </div>
                {/* Footer */}
                <div className="p-5 pt-4 mt-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        {/* Like/Comment removed */}
                    </div>
                    <span className="text-primary hover:text-primary/80 font-medium hover:underline">
                        View Full List
                    </span>
                </div>
             </Link>
          ))}
          
        </div>

        {/* Pagination (Hidden if not enough items) */}
         {userLists.length > 9 && (
            <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-primary text-white font-medium flex items-center justify-center">
                1
                </button>
                <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </nav>
            </div>
         )}
      </main>
    </div>
  );
}
