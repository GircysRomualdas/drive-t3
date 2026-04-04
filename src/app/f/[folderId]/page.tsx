import { db } from "~/server/db";
import {
  files as fileSchema,
  folders as folderSchema,
} from "~/server/db/schema";
import DriveContents from "../../drive-contents";
import { eq } from "drizzle-orm";

async function getAllParents(folderId: number) {
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
}

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;
  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>;
  }

  const foldersPromise = db
    .select()
    .from(folderSchema)
    .where(eq(folderSchema.parent, parsedFolderId));
  const filesPromise = db
    .select()
    .from(fileSchema)
    .where(eq(fileSchema.parent, parsedFolderId));

  const parentsPromise = getAllParents(parsedFolderId);

  const [folders, files, parents] = await Promise.all([
    foldersPromise,
    filesPromise,
    parentsPromise,
  ]);

  return <DriveContents files={files} folders={folders} parents={parents} />;
}
