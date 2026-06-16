import { Prisma } from "@prisma/client";

export const softDeleteExtension = Prisma.defineExtension({
  name: "soft-delete",
  query: {
    $allModels: {
      async findMany({ args, query }) {
        args.where = { ...(args.where as object), deleted_at: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...(args.where as object), deleted_at: null };
        return query(args);
      },
      async count({ args, query }) {
        args.where = { ...(args.where as object), deleted_at: null };
        return query(args);
      },
    },
  },
});

// NOTE: findUnique is intentionally excluded — Prisma's findUnique only accepts
// unique fields in `where`, so adding deleted_at would break it at runtime.
// Use findFirst instead of findUnique throughout the codebase.
