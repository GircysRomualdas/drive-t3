import "server-only";

import { db } from "~/server/db";
import {
  files_table as fileSchema,
  folders_table as folderSchema,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const QUERIES = {
  getAllParentsForFolder: async function (folderId: number) {
    const parents = [];
    let currentId: number | null = folderId;
    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(folderSchema)
        .where(eq(folderSchema.id, currentId));

      if (!folder[0]) {
        throw new Error(`Folder with ID ${currentId} not found`);
      }

      parents.unshift(folder[0]);
      currentId = folder[0]?.parent;
    }

    return parents;
  },

  getFolders: function (folderId: number) {
    return db
      .select()
      .from(folderSchema)
      .where(eq(folderSchema.parent, folderId));
  },
  getFiles: function (folderId: number) {
    return db.select().from(fileSchema).where(eq(fileSchema.parent, folderId));
  },
};
