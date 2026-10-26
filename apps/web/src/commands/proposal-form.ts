import type { ApiClient } from "@schellingboard/api-client";
import type {
  proposalCreateSchema,
  proposalUpdateSchema,
} from "@schellingboard/contracts/proposal";

export type ProposalCreateBody = (typeof proposalCreateSchema)["_input"];
export type ProposalUpdateBody = (typeof proposalUpdateSchema)["_input"];

/** The proposal form's calls; it waits for each answer, so none is a command. */
export function proposalFormCalls(api: ApiClient) {
  return {
    create: (body: ProposalCreateBody, key: string) =>
      api.POST("/api/v1/proposals", {
        body,
        headers: { "Idempotency-Key": key },
      }),
    update: (id: string, body: ProposalUpdateBody, key: string) =>
      api.PUT("/api/v1/proposals/{id}", {
        params: { path: { id } },
        body,
        headers: { "Idempotency-Key": key },
      }),
    remove: (id: string, key: string) =>
      api.DELETE("/api/v1/proposals/{id}", {
        params: { path: { id } },
        headers: { "Idempotency-Key": key },
      }),
  };
}

export type ProposalFormCalls = ReturnType<typeof proposalFormCalls>;
