import type { commentViewSchema } from "@schellingboard/contracts/comment";
import type { Comment } from "@schellingboard/domain/comment";
import type { z } from "zod";

export function toCommentView(c: Comment): z.input<typeof commentViewSchema> {
  return {
    id: c.id,
    parentId: c.parentId,
    body: c.body,
    deleted: c.deleted,
    createdTime: c.createdTime.toISOString(),
    editedTime: c.editedTime?.toISOString() ?? null,
    author: c.author && { id: c.author.id, name: c.author.name },
    likes: c.likes.map(({ id, name, avatarUrl }) => ({
      id,
      name,
      avatarUrl: avatarUrl ?? null,
    })),
  };
}
