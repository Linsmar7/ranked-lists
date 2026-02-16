import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { useLoaderData } from "react-router";
import { db } from "~/db.server";
import { sql } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ranked Lists" },
    { name: "description", content: "Ranked Lists" },
  ];
}

export async function loader() {
  try {
    const resultado = await db.execute(sql`SELECT NOW() as hora_atual`);

    return { 
      status: "conectado", 
      hora: resultado.rows[0].hora_atual 
    };
  } catch (erro) {
    console.error(erro);
    return { status: "erro", hora: null };
  }
}

export default function Home() {
  const dados = useLoaderData<typeof loader>();

  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão Drizzle</h1>
      
      <div className="p-4 border rounded bg-slate-50">
        <p>
          Status: 
          <span className={dados.status === "conectado" ? "text-green-600 font-bold ml-2" : "text-red-600 font-bold ml-2"}>
            {dados.status.toUpperCase()}
          </span>
        </p>
        
        {dados.hora && (
          <p className="mt-2 text-gray-700">
            Horário vindo do Postgres: <br/>
            <code className="bg-gray-200 px-2 py-1 rounded">{String(dados.hora)}</code>
          </p>
        )}
      </div>
    </div>
  );
}
