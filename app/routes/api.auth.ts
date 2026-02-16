import { auth } from "~/utils/auth";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  return auth.handler(request);
}

export async function action({ request }: Route.ActionArgs) {
  return auth.handler(request);
}
