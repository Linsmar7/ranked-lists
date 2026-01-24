import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/lists/create")({
  component: CreateListComponent,
});

function CreateListComponent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([
    { name: "", rank: 1, description: "", imageUrl: "" },
  ]);

  const createList = useMutation(trpc.lists.create.mutationOptions());

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "", rank: items.length + 1, description: "", imageUrl: "" },
    ]);
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Recalculate ranks
    const reRankedItems = newItems.map((item, i) => ({
      ...item,
      rank: i + 1,
    }));
    setItems(reRankedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");
    if (items.some((item) => !item.name))
      return toast.error("All items must have a name");

    try {
      await createList.mutateAsync({
        title,
        description,
        category,
        items,
      });
      toast.success("List created successfully!");
      navigate({ to: "/lists" });
    } catch (error) {
       // Error handled by query client
       console.error(error);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Create Ranked List</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold">List Details</h2>
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border p-2"
              placeholder="e.g., Top 10 Sci-Fi Movies"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded border p-2"
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded border p-2"
              placeholder="e.g., Movies, Food, Music"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ranked Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-blue-600 hover:underline"
            >
              + Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="relative rounded border bg-gray-50 p-4">
              <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {item.rank}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="absolute right-2 top-2 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
              
              <div className="ml-8 grid gap-4">
                <div>
                   <label className="block text-xs font-medium uppercase text-gray-500">Name</label>
                   <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    className="w-full rounded border p-1"
                    placeholder="Item Name"
                    required
                  />
                </div>
                 <div>
                   <label className="block text-xs font-medium uppercase text-gray-500">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="w-full rounded border p-1"
                    placeholder="Short explanation"
                  />
                </div>
                 <div>
                   <label className="block text-xs font-medium uppercase text-gray-500">Image URL</label>
                  <input
                    type="text"
                    value={item.imageUrl}
                    onChange={(e) => handleItemChange(index, "imageUrl", e.target.value)}
                    className="w-full rounded border p-1"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createList.isPending}
            className="rounded bg-green-600 px-6 py-2 font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {createList.isPending ? "Creating..." : "Publish List"}
          </button>
        </div>
      </form>
    </div>
  );
}
