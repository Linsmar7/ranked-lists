import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/dashboard.tsx"),
    route("register", "routes/register.tsx"),
    route("login", "routes/login.tsx"),
    route("profile", "routes/profile.tsx"),
    route("create-list", "routes/lists.new.tsx"),
    route("list/:id", "routes/lists.$id.tsx"),
    route("api/auth/*", "routes/api.auth.ts"),
] satisfies RouteConfig;
