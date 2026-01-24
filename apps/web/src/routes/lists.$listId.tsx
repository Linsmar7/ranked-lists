import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/lists/$listId")({
  component: ListDetailComponent,
});

function ListDetailComponent() {
  const { listId } = Route.useParams();
  const list = useQuery(trpc.lists.getById.queryOptions({ id: listId }));

  if (list.isLoading) return <div className="p-8">Loading...</div>;
  if (list.error || !list.data) return <div className="p-8 text-red-500">List not found</div>;

  const { data } = list;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-extrabold">{data.title}</h1>
        {data.description && (
          <p className="text-xl text-gray-600">{data.description}</p>
        )}
        <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
           <span>By {data.user.name}</span>
           <span>•</span>
           <span>{new Date(data.createdAt).toLocaleDateString()}</span>
           {data.category && (
               <>
                <span>•</span>
                <span className="font-semibold">{data.category}</span>
               </>
           )}
        </div>
      </div>

      <div className="space-y-4">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm md:flex-row md:items-center"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
              {item.rank}
            </div>
            
            {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="h-24 w-24 rounded object-cover" />
            )}

            <div className="flex-grow">
              <h3 className="text-2xl font-bold">{item.name}</h3>
              {item.description && (
                <p className="mt-1 text-gray-600">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
