import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/lists")({
  component: ListsComponent,
});

function ListsComponent() {
  const lists = useQuery(trpc.lists.getAll.queryOptions());

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ranked Lists</h1>
        <Link
          to="/lists/create"
          className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Create New List
        </Link>
      </div>

      {lists.isLoading ? (
        <div>Loading...</div>
      ) : lists.error ? (
        <div className="text-red-500">Error: {lists.error.message}</div>
      ) : lists.data?.length === 0 ? (
        <div className="text-gray-500">No lists found. Create one!</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.data?.map((list) => (
            <Link
              key={list.id}
              to="/lists/$listId"
              params={{ listId: list.id }}
              className="block rounded-lg border p-4 shadow transition hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold">{list.title}</h2>
              {list.description && (
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {list.description}
                </p>
              )}
              <div className="text-xs text-gray-500">
                Created by: {list.user.name}
                <br />
                {new Date(list.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
