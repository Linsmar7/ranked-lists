
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { auth } from "~/utils/auth";
import type { Route } from "./+types/lists.new";
import { db } from "~/db.server";
import { lists, listItems } from "~/db/schema";
import { useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/login");
  }

  return { session };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw redirect("/login");
  }

  const formData = await request.formData();
  // We expect 'items' to be a JSON string
  const itemsJson = formData.get("items") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("isPublic") === "on";

  if (!title) {
    return { error: "Title is required" };
  }

  let items: any[] = [];
  try {
    items = JSON.parse(itemsJson);
  } catch (e) {
    return { error: "Invalid items data" };
  }

  if (items.length === 0) {
    // Optionally allow empty lists as per requirement "Lists can be empty"
  }

  const listId = crypto.randomUUID();

  // Transaction to create list and items
  await db.transaction(async (tx) => {
    await tx.insert(lists).values({
      id: listId,
      title,
      description,
      isPublic,
      userId: session.user.id,
    });

    if (items.length > 0) {
      await tx.insert(listItems).values(
        items.map((item, index) => ({
          id: crypto.randomUUID(),
          listId: listId,
          name: item.name,
          note: item.note,
          imageUrl: item.imageUrl,
          rank: index + 1,
        }))
      );
    }
  });

  return redirect(`/list/${listId}`);
}

export default function CreateList({ loaderData, actionData }: Route.ComponentProps) {
  const { session } = loaderData;
  const user = session.user;
  const [items, setItems] = useState<
    { id: string; name: string; note: string; imageUrl: string }[]
  >([]);
  const [newItem, setNewItem] = useState({ name: "", note: "", imageUrl: "" });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleAddItem = () => {
    if (!newItem.name) return;
    setItems([
      ...items,
      { id: crypto.randomUUID(), ...newItem },
    ]);
    setNewItem({ name: "", note: "", imageUrl: "" });
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isPublic", isPublic ? "on" : "off");
      formData.append("items", JSON.stringify(items));
      submit(formData, { method: "post" });
  };

  return (
    <div className="bg-background font-display text-foreground min-h-screen flex flex-col">
       {/* Navbar (Simplified for Create Page) */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    R
                </div>
                <span className="font-bold text-lg tracking-tight text-foreground">Rankly</span>
            </Link>
          <div className="flex items-center gap-4">
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
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-70"
            >
              {isSubmitting ? "Publishing..." : "Publish List"}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
          {actionData?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{actionData.error}</span>
              </div>
          )}
        {/* List Configuration Header */}
        <header className="mb-10 space-y-6">
          <div className="group">
            <input
              className="w-full bg-transparent border-none text-4xl md:text-5xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-0 px-0 py-2 transition-all"
              placeholder="Give your list a title..."
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="h-0.5 w-0 group-focus-within:w-full bg-primary transition-all duration-300"></div>
          </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">
                  Public List
                </span>
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-500 hidden sm:inline-block">
                • Anyone can view this ranking
              </span>
            </div>
             {/* Tags placeholder removed */}
          </div>
          <textarea
            className="w-full bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 focus:ring-0 focus:border-primary resize-none px-0 py-2 h-auto min-h-[3rem] text-base"
            placeholder="Add a short description about this list (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </header>

        {/* Creation Area */}
        <section className="space-y-8">
          {/* Add Item Component */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary">add_circle</span>
              Add New Item
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Item Name
                  </label>
                  <input
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400 dark:placeholder-slate-600 transition-shadow"
                    placeholder="e.g. Dune: Part Two"
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Note / Review (Optional)
                  </label>
                  <input
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400 dark:placeholder-slate-600 transition-shadow"
                    placeholder="Why is this item ranked here?"
                    type="text"
                    value={newItem.note}
                    onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Image URL (Optional)
                  </label>
                  <input
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400 dark:placeholder-slate-600 transition-shadow"
                    placeholder="https://..."
                    type="text"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddItem}
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-primary/10 flex items-center gap-2"
                  >
                    Add to List
                    <span className="material-icons-round text-sm">
                      arrow_downward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative py-4">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background-light dark:bg-background-dark text-sm text-slate-500 dark:text-slate-500 font-medium">
                Your Ranking ({items.length} Items)
              </span>
            </div>
          </div>

          {/* Sortable List */}
          <div className="space-y-3" id="sortable-list">
             {items.map((item, index) => (
                <div
                    key={item.id}
                    className="group relative flex items-center gap-4 p-3 bg-card rounded-xl border border-border shadow-sm hover:border-primary/50 transition-all cursor-move"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-xl opacity-100"></div>
                    {/* Drag Handle */}
                    <div className="text-slate-400 dark:text-slate-600 cursor-grab hover:text-slate-600 dark:hover:text-slate-400 px-2">
                        <span className="material-icons-round text-xl">
                        drag_indicator
                        </span>
                    </div>
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20">
                        {index + 1}
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
                    {/* Actions */}
                    <div className="flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <span className="material-icons-round text-lg">delete</span>
                        </button>
                    </div>
                </div>
             ))}
             {items.length === 0 && (
                <div className="h-24 rounded-xl drag-placeholder flex items-center justify-center text-primary text-sm font-medium border-2 border-dashed border-primary/20 bg-primary/5">
                    Add items above to start ranking
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
