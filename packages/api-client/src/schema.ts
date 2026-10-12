// Generated from packages/contracts/openapi.json by `make openapi`. Do not edit.

export interface paths {
  "/api/v1/health": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The server is up */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** @enum {string} */
              status: "ok";
            };
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/sessions/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The session */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Session"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    /** @description Replaces a session the acting guest hosts. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            dayId: string;
            title: string;
            /** @default  */
            description?: string;
            /** @default false */
            closed?: boolean;
            hostIds: string[];
            /**
             * Format: date-time
             * @description Start of the slot picked; the session starts after the event's break
             */
            startTime: string;
            durationMinutes: number;
            /** @description Attendee maximum, 0 for none; absent takes the room's */
            capacity?: number;
            proposalId?: string;
            locationIds: string[];
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated session */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Session"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Session"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Deletes a session the acting guest hosts. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/sessions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description An event's sessions, in id order. */
    get: {
      parameters: {
        query: {
          /** @description How many items to answer at most */
          limit?: number;
          /** @description The `nextCursor` of the previous page; left out for the first */
          cursor?: string;
          eventId: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The event's sessions, scheduled or not */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              items: components["schemas"]["Session"][];
              /** @description Pass as `cursor` for the next page; null on the last */
              nextCursor: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Books a session as the acting guest, during scheduling. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            dayId: string;
            title: string;
            /** @default  */
            description?: string;
            /** @default false */
            closed?: boolean;
            hostIds: string[];
            /**
             * Format: date-time
             * @description Start of the slot picked; the session starts after the event's break
             */
            startTime: string;
            durationMinutes: number;
            /** @description Attendee maximum, 0 for none; absent takes the room's */
            capacity?: number;
            proposalId?: string;
            locationId: string;
          };
        };
      };
      responses: {
        /** @description The booked session */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Session"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/sessions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            title: string;
            /** @default  */
            description?: string;
            /** Format: date-time */
            startTime: string | null;
            /** Format: date-time */
            endTime: string | null;
            /** @default 0 */
            capacity?: number;
            /** @default false */
            adminManaged?: boolean;
            /** @default false */
            blocker?: boolean;
            /** @default false */
            closed?: boolean;
            /** @default [] */
            hostIds?: string[];
            /** @default [] */
            locationIds?: string[];
            eventId: string;
          };
        };
      };
      responses: {
        /** @description The created session */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Session"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/sessions/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            title: string;
            description: string;
            /** Format: date-time */
            startTime: string | null;
            /** Format: date-time */
            endTime: string | null;
            capacity: number;
            adminManaged: boolean;
            blocker: boolean;
            closed: boolean;
            hostIds: string[];
            locationIds: string[];
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated session */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Session"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Session"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/sessions/{id}/rsvps": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Who RSVPed to the session */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              rsvps: components["schemas"]["Rsvp"][];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/guests/{id}/rsvps": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description A protected guest's RSVPs need that guest's verified cookie. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The guest's RSVPs in every event */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              rsvps: components["schemas"]["Rsvp"][];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/sessions/{id}/rsvps/{guestId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description RSVPs the named guest during scheduling; a protected guest needs its verified cookie. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
          guestId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description RSVPed */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Withdraws the named guest's RSVP during scheduling. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
          guestId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Withdrawn */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/sessions/{id}/rsvps/{guestId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description RSVPs the guest in any phase, keeping a hard capacity limit, and adds them to the event. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
          guestId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The guest had already RSVPed */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Rsvp"];
          };
        };
        /** @description RSVPed */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Rsvp"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
          guestId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Removed */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/proposals/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The proposal */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Proposal"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    /** @description Replaces a proposal the acting guest hosts, or one nobody hosts. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            title: string;
            description?: string;
            /** @default [] */
            hostIds?: string[];
            durationMinutes?: number;
            /** @default false */
            cohostWanted?: boolean;
            cohostWantedNote?: string;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated proposal */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Proposal"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Proposal"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Deletes a proposal the acting guest hosts, or one nobody hosts. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/proposals": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description An event's proposals, oldest first. */
    get: {
      parameters: {
        query: {
          /** @description How many items to answer at most */
          limit?: number;
          /** @description The `nextCursor` of the previous page; left out for the first */
          cursor?: string;
          eventId: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The event's proposals */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              items: components["schemas"]["Proposal"][];
              /** @description Pass as `cursor` for the next page; null on the last */
              nextCursor: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Proposes a session as the acting guest, until scheduling starts. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            eventId: string;
            title: string;
            description?: string;
            /** @default [] */
            hostIds?: string[];
            durationMinutes?: number;
            /** @default false */
            cohostWanted?: boolean;
            cohostWantedNote?: string;
          };
        };
      };
      responses: {
        /** @description The new proposal */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Proposal"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/proposals/{id}/hosts": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Adds the acting guest as a host of a proposal that wants one; its hosts are notified. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Joined */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/proposals": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Creates a proposal in any phase; its hosts are added to the event. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            title: string;
            /** @default  */
            description?: string;
            /** @default null */
            durationMinutes?: number | null;
            /** @default [] */
            hostIds?: string[];
            eventId: string;
          };
        };
      };
      responses: {
        /** @description The new proposal */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Proposal"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/proposals/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            title: string;
            /** @default  */
            description?: string;
            /** @default null */
            durationMinutes?: number | null;
            /** @default [] */
            hostIds?: string[];
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated proposal */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Proposal"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Proposal"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/guests/{id}/votes": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description A protected guest's votes need that guest's verified cookie. */
    get: {
      parameters: {
        query: {
          eventId: string;
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The guest's votes in the event */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              votes: components["schemas"]["Vote"][];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/proposals/{id}/votes/{guestId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Casts or replaces the named guest's vote during voting; a protected guest needs its verified cookie. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
          guestId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @enum {string} */
            choice: "interested" | "maybe" | "skip";
          };
        };
      };
      responses: {
        /** @description Voted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Withdraws the named guest's vote during voting. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
          guestId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Withdrawn */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/proposals/{id}/comments": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The proposal's comments and replies, oldest first; `parentId` places a reply in its thread. */
    get: {
      parameters: {
        query?: {
          /** @description How many items to answer at most */
          limit?: number;
          /** @description The `nextCursor` of the previous page; left out for the first */
          cursor?: string;
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The proposal's comments */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              items: components["schemas"]["Comment"][];
              /** @description Pass as `cursor` for the next page; null on the last */
              nextCursor: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Comments on a proposal as the acting guest; its hosts or owner and earlier commenters are notified. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @description The comment this replies to, on the same subject */
            parentId?: string;
            body: string;
          };
        };
      };
      responses: {
        /** @description The new comment */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Comment"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/sessions/{id}/comments": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The session's comments and replies, oldest first; `parentId` places a reply in its thread. */
    get: {
      parameters: {
        query?: {
          /** @description How many items to answer at most */
          limit?: number;
          /** @description The `nextCursor` of the previous page; left out for the first */
          cursor?: string;
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The session's comments */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              items: components["schemas"]["Comment"][];
              /** @description Pass as `cursor` for the next page; null on the last */
              nextCursor: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Comments on a session as the acting guest; its hosts or owner and earlier commenters are notified. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @description The comment this replies to, on the same subject */
            parentId?: string;
            body: string;
          };
        };
      };
      responses: {
        /** @description The new comment */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Comment"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/guests/{id}/comments": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The guest's profile's comments and replies, oldest first; `parentId` places a reply in its thread. */
    get: {
      parameters: {
        query?: {
          /** @description How many items to answer at most */
          limit?: number;
          /** @description The `nextCursor` of the previous page; left out for the first */
          cursor?: string;
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The guest's profile's comments */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              items: components["schemas"]["Comment"][];
              /** @description Pass as `cursor` for the next page; null on the last */
              nextCursor: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Comments on a guest's profile as the acting guest; its hosts or owner and earlier commenters are notified. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @description The comment this replies to, on the same subject */
            parentId?: string;
            body: string;
          };
        };
      };
      responses: {
        /** @description The new comment */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Comment"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/comments/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Replaces the body of the acting guest's own comment. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            body: string;
          };
        };
      };
      responses: {
        /** @description The edited comment */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Comment"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Deletes the acting guest's own comment; one with replies stays as a placeholder. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/comments/{id}/like": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Likes a comment as the acting guest. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Liked */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Takes back the acting guest's like. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description No longer liked */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/meetings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The acting guest's own 1-on-1s at an event, and the slots they declared themselves free. */
    get: {
      parameters: {
        query: {
          eventId: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The caller's 1-on-1s and availability */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** @description The caller's own, by slot */
              meetings: components["schemas"]["Meeting"][];
              /** @description The slot starts the caller declared themselves free */
              availability: string[];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Asks another attendee for a 1-on-1 as the acting guest; the recipient is notified. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            eventId: string;
            recipientId: string;
            slotStart: string;
            /** @default 1 */
            slotCount?: number;
            meetingPoint: string;
            message?: string;
          };
        };
      };
      responses: {
        /** @description The pending request */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              eventId: string;
              requesterId: string;
              recipientId: string;
              /** Format: date-time */
              slotStart: string;
              /** Format: date-time */
              slotEnd: string;
              meetingPoint: string;
              message: string;
              cancelNote: string;
              /** @enum {string} */
              status: "pending" | "accepted" | "declined" | "canceled";
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              respondedAt: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/meeting-candidates": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Who the acting guest could ask for a 1-on-1 starting at a slot, for slotCount consecutive slots. */
    get: {
      parameters: {
        query: {
          eventId: string;
          slotStart: string;
          slotCount?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The slot and who is free in it */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              eventName: string;
              dayLabel: string;
              slotLabel: string;
              slotCount: number;
              lengths: {
                slotCount: number;
                minutes: number;
              }[];
              meetingPoints: {
                id: string;
                name: string;
                description: string;
              }[];
              yourClashes: {
                guestName: string;
                /** @enum {string} */
                kind: "hosting" | "attending" | "meeting" | "busy";
                title: string | null;
                isViewer: boolean;
              }[];
              candidates: {
                id: string;
                name: string;
                pronouns: string | null;
                basedIn: string | null;
                avatarUrl: string | null;
                isHost: boolean;
                /** @description They have something then; what it is stays theirs */
                busy: boolean;
              }[];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/meetings/{id}/accept": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description The person asked accepts a pending request; the requester is notified. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The answered 1-on-1 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              eventId: string;
              requesterId: string;
              recipientId: string;
              /** Format: date-time */
              slotStart: string;
              /** Format: date-time */
              slotEnd: string;
              meetingPoint: string;
              message: string;
              cancelNote: string;
              /** @enum {string} */
              status: "pending" | "accepted" | "declined" | "canceled";
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              respondedAt: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/meetings/{id}/decline": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description The person asked declines a pending request; the requester is notified. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The answered 1-on-1 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              eventId: string;
              requesterId: string;
              recipientId: string;
              /** Format: date-time */
              slotStart: string;
              /** Format: date-time */
              slotEnd: string;
              meetingPoint: string;
              message: string;
              cancelNote: string;
              /** @enum {string} */
              status: "pending" | "accepted" | "declined" | "canceled";
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              respondedAt: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/meetings/{id}/cancel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Calls a 1-on-1 off: the requester at any time before its slot, the recipient once agreed. The other party is notified. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          "application/json": {
            note?: string;
          };
        };
      };
      responses: {
        /** @description The canceled 1-on-1 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              eventId: string;
              requesterId: string;
              recipientId: string;
              /** Format: date-time */
              slotStart: string;
              /** Format: date-time */
              slotEnd: string;
              meetingPoint: string;
              message: string;
              cancelNote: string;
              /** @enum {string} */
              status: "pending" | "accepted" | "declined" | "canceled";
              /** Format: date-time */
              createdAt: string;
              /** Format: date-time */
              respondedAt: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/meeting-availability": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Replaces the slots the acting guest declares themselves free for 1-on-1s at an event. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            eventId: string;
            slotStarts: string[];
          };
        };
      };
      responses: {
        /** @description Saved */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/meetings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Switches 1-on-1s on or off for an event, with its request cap. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            meetingsEnabled: boolean;
            /** @description Required, at least 1, when meetingsEnabled is true */
            maxOpenMeetingRequests?: number;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated event */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Event"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Event"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/meeting-points": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Adds a suggested place to meet, after the event's others. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            description?: string;
          };
        };
      };
      responses: {
        /** @description The new meeting point */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              eventId: string;
              name: string;
              description: string;
              sortIndex: number;
              version: number;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{eventId}/meeting-points/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          eventId: string;
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            description?: string;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The renamed meeting point */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              eventId: string;
              name: string;
              description: string;
              sortIndex: number;
              version: number;
            };
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: {
                id: string;
                eventId: string;
                name: string;
                description: string;
                sortIndex: number;
                version: number;
              };
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          eventId: string;
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/sessions/{id}/attendee-count": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description How many came, for a host once the session has finished. Anyone else, and an unknown session, get the same 403 attendeeCount.notHost. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The recorded count, or null */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              count: number | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    /** @description Records how many came, as a host once the session has finished. The range is checked only after who is asking (400 attendeeCount.invalid). */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @description A whole number between 0 and 1000, or null to clear it */
            count: number | null;
          };
        };
      };
      responses: {
        /** @description The stored count */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              count: number | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/guests": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The public profiles of an event's guests, in id order; for the event's guests and admins. */
    get: {
      parameters: {
        query: {
          /** @description How many items to answer at most */
          limit?: number;
          /** @description The `nextCursor` of the previous page; left out for the first */
          cursor?: string;
          /** @description The event whose guests to list */
          eventId: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The event's guests */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              items: components["schemas"]["PublicProfile"][];
              /** @description Pass as `cursor` for the next page; null on the last */
              nextCursor: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/guests/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description A guest's public profile. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The public profile */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["PublicProfile"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/profile": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Replaces the acting guest's public profile; the photo is kept (see /me/avatar). */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            /** @default null */
            aboutMe?: string | null;
            /** @default null */
            pronouns?: string | null;
            /** @default null */
            basedIn?: string | null;
            /** @default null */
            prompts?:
              | {
                  prompt: string;
                  answer: string;
                }[]
              | null;
            /** @default null */
            languages?: string[] | null;
            /** @default null */
            contacts?:
              | {
                  /** @enum {string} */
                  type:
                    | "email"
                    | "phone"
                    | "whatsapp"
                    | "signal"
                    | "telegram"
                    | "discord"
                    | "website"
                    | "other";
                  label?: string;
                  value: string;
                }[]
              | null;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The saved profile */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["PublicProfile"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["PublicProfile"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/avatar": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Replaces the acting guest's photo, cropped to a square. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "multipart/form-data": {
            /**
             * Format: binary
             * @description JPEG, PNG or WebP, at most 5 MiB, at least 256 px square
             */
            avatar: string;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: string;
          };
        };
      };
      responses: {
        /** @description The profile with its new photo */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["PublicProfile"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["PublicProfile"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Removes the acting guest's photo. */
    delete: {
      parameters: {
        query: {
          /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
          expectedVersion: string;
        };
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The profile without a photo */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["PublicProfile"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["PublicProfile"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/push/key": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The instance's public push key, needed before a browser can subscribe. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The public key */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** @description The VAPID key a browser passes to pushManager.subscribe */
              publicKey: string;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/notifications": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The acting guest's notifications, newest first. */
    get: {
      parameters: {
        query?: {
          /** @description How many items to answer at most */
          limit?: number;
          /** @description The `nextCursor` of the previous page; left out for the first */
          cursor?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The caller's notifications */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              items: components["schemas"]["Notification"][];
              /** @description Pass as `cursor` for the next page; null on the last */
              nextCursor: string | null;
              /** @description Unread across every page */
              unreadCount: number;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/notifications/read": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Marks the acting guest's notifications read; ids that are not theirs are skipped. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            ids: string[];
          };
        };
      };
      responses: {
        /** @description Marked read */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/notifications/delete": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Deletes the acting guest's notifications; ids that are not theirs are skipped. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            ids: string[];
          };
        };
      };
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/notifications/{id}/read": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Marks one of the acting guest's notifications read. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The notification, read */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Notification"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/email-settings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Which emails the acting guest receives. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The caller's email settings */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              rsvpChange: boolean;
              hostChange: boolean;
              cohostAdd: boolean;
              proposalJoin: boolean;
              proposalComment: boolean;
              sessionComment: boolean;
              profileComment: boolean;
              commentThread: boolean;
              meetingRequest: boolean;
              meetingResponse: boolean;
              sessionHeadsUp: boolean;
              attendeeCountReminder: boolean;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    /** @description Replaces which emails the acting guest receives. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            rsvpChange: boolean;
            hostChange: boolean;
            cohostAdd: boolean;
            proposalJoin: boolean;
            proposalComment: boolean;
            sessionComment: boolean;
            profileComment: boolean;
            commentThread: boolean;
            meetingRequest: boolean;
            meetingResponse: boolean;
            sessionHeadsUp: boolean;
            attendeeCountReminder: boolean;
          };
        };
      };
      responses: {
        /** @description Saved */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/push-subscriptions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Remembers a browser's push subscription for the acting guest. Subscriptions are never sent back. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** Format: uri */
            endpoint: string;
            p256dh: string;
            auth: string;
          };
        };
      };
      responses: {
        /** @description Remembered */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/push-subscriptions/remove": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Forgets the acting guest's subscription with this endpoint; anyone else's is left alone, and the answer is the same. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            endpoint: string;
          };
        };
      };
      responses: {
        /** @description Forgotten */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/me/push-subscriptions/check": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Whether the subscription with this endpoint is the acting guest's. Changes nothing. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            endpoint: string;
          };
        };
      };
      responses: {
        /** @description Whether this device notifies the caller */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              enabled: boolean;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/events": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Every event, past ones included */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              events: components["schemas"]["Event"][];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/events/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The event's settings, phase dates and days. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The event and its days */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              event: components["schemas"]["Event"];
              days: {
                /** Format: date-time */
                start: string;
                /** Format: date-time */
                end: string;
                /**
                 * Format: date-time
                 * @description When sessions may start
                 */
                startBookings: string;
                /**
                 * Format: date-time
                 * @description When sessions must end
                 */
                endBookings: string;
                id: string;
                eventId: string;
                version: number;
              }[];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/events/{slug}/snapshot": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The event's schedule, normalized, and `seq`, the last change it includes. `me` holds the RSVPs, meetings and free slots of the guest the `guest` cookie names; it is null without that cookie, or for a protected guest whose cookie is not verified. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          slug: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The snapshot */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Snapshot"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/events/{slug}/feed": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description A `text/event-stream` of the event's changes after `since` (the snapshot's `seq`), filtered to what the `guest` cookie may see. Each message has `id` = its `seq`, `event` = its type and the message as JSON `data`; a browser's reconnect sends `Last-Event-ID`, which wins over `since`. An `event: reset` message, after which the stream ends, means the resume point cannot be served: load the snapshot again. An `event: ping` every 25 seconds keeps proxies from closing it and lets a client notice a dead connection; it ends after 10 minutes. */
    get: {
      parameters: {
        query?: {
          since?: string;
        };
        header?: never;
        path: {
          slug: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Changes as server-sent events; each `data` is a FeedMessage */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "text/event-stream": components["schemas"]["FeedMessage"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Creates an event; its URL slug is derived from the name. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            /** @default  */
            description?: string;
            /** @default  */
            website?: string;
            /**
             * @description IANA time zone the event's times are shown in
             * @default UTC
             */
            timezone?: string;
            /** @description Minutes */
            maxSessionDuration: number;
            /** @description Break before each session, in minutes */
            breakMinutes: number;
            /** @description One of 15, 30, 45, 60 */
            slotIncrementMinutes: number;
            /** @default false */
            rsvpCapacityHardLimit?: boolean;
            /** @enum {string|null} */
            icon?:
              | "AcademicCapIcon"
              | "BeakerIcon"
              | "BoltIcon"
              | "BookOpenIcon"
              | "BriefcaseIcon"
              | "BuildingOfficeIcon"
              | "CakeIcon"
              | "CalendarIcon"
              | "ChatBubbleLeftIcon"
              | "CloudIcon"
              | "CodeBracketIcon"
              | "CogIcon"
              | "CommandLineIcon"
              | "ComputerDesktopIcon"
              | "CpuChipIcon"
              | "FireIcon"
              | "GlobeAltIcon"
              | "HeartIcon"
              | "HomeIcon"
              | "MicrophoneIcon"
              | "MusicalNoteIcon"
              | "PaintBrushIcon"
              | "RocketLaunchIcon"
              | "SparklesIcon"
              | "StarIcon"
              | "SunIcon"
              | "TrophyIcon"
              | "UserGroupIcon"
              | "WrenchIcon"
              | null;
          };
        };
      };
      responses: {
        /** @description The new event */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Event"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Replaces the event's settings; phase dates, 1-on-1 settings and the slug stay. A new slot increment clears declared 1-on-1 availability. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            /** @default  */
            description?: string;
            /** @default  */
            website?: string;
            /**
             * @description IANA time zone the event's times are shown in
             * @default UTC
             */
            timezone?: string;
            /** @description Minutes */
            maxSessionDuration: number;
            /** @description Break before each session, in minutes */
            breakMinutes: number;
            /** @description One of 15, 30, 45, 60 */
            slotIncrementMinutes: number;
            /** @default false */
            rsvpCapacityHardLimit?: boolean;
            /** @enum {string|null} */
            icon?:
              | "AcademicCapIcon"
              | "BeakerIcon"
              | "BoltIcon"
              | "BookOpenIcon"
              | "BriefcaseIcon"
              | "BuildingOfficeIcon"
              | "CakeIcon"
              | "CalendarIcon"
              | "ChatBubbleLeftIcon"
              | "CloudIcon"
              | "CodeBracketIcon"
              | "CogIcon"
              | "CommandLineIcon"
              | "ComputerDesktopIcon"
              | "CpuChipIcon"
              | "FireIcon"
              | "GlobeAltIcon"
              | "HeartIcon"
              | "HomeIcon"
              | "MicrophoneIcon"
              | "MusicalNoteIcon"
              | "PaintBrushIcon"
              | "RocketLaunchIcon"
              | "SparklesIcon"
              | "StarIcon"
              | "SunIcon"
              | "TrophyIcon"
              | "UserGroupIcon"
              | "WrenchIcon"
              | null;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated event */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Event"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Event"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Deletes the event with its days, proposals, sessions and everything attached. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/phases": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /**
             * Format: date-time
             * @description null clears it
             */
            proposalPhaseStart: string | null;
            /**
             * Format: date-time
             * @description null clears it
             */
            proposalPhaseEnd: string | null;
            /**
             * Format: date-time
             * @description null clears it
             */
            votingPhaseStart: string | null;
            /**
             * Format: date-time
             * @description null clears it
             */
            votingPhaseEnd: string | null;
            /**
             * Format: date-time
             * @description null clears it
             */
            schedulingPhaseStart: string | null;
            /**
             * Format: date-time
             * @description null clears it
             */
            schedulingPhaseEnd: string | null;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated event */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Event"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Event"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/days": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** Format: date-time */
            start: string;
            /** Format: date-time */
            end: string;
            /**
             * Format: date-time
             * @description When sessions may start
             */
            startBookings: string;
            /**
             * Format: date-time
             * @description When sessions must end
             */
            endBookings: string;
          };
        };
      };
      responses: {
        /** @description The new day */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** Format: date-time */
              start: string;
              /** Format: date-time */
              end: string;
              /**
               * Format: date-time
               * @description When sessions may start
               */
              startBookings: string;
              /**
               * Format: date-time
               * @description When sessions must end
               */
              endBookings: string;
              id: string;
              eventId: string;
              version: number;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/days/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Refused while a session scheduled in the day would fall outside it. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** Format: date-time */
            start: string;
            /** Format: date-time */
            end: string;
            /**
             * Format: date-time
             * @description When sessions may start
             */
            startBookings: string;
            /**
             * Format: date-time
             * @description When sessions must end
             */
            endBookings: string;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated day */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** Format: date-time */
              start: string;
              /** Format: date-time */
              end: string;
              /**
               * Format: date-time
               * @description When sessions may start
               */
              startBookings: string;
              /**
               * Format: date-time
               * @description When sessions must end
               */
              endBookings: string;
              id: string;
              eventId: string;
              version: number;
            };
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: {
                /** Format: date-time */
                start: string;
                /** Format: date-time */
                end: string;
                /**
                 * Format: date-time
                 * @description When sessions may start
                 */
                startBookings: string;
                /**
                 * Format: date-time
                 * @description When sessions must end
                 */
                endBookings: string;
                id: string;
                eventId: string;
                version: number;
              };
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Deletes the day and every session overlapping it. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/locations": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Every location in display order, hidden ones included; with `eventId`, those assigned to that event. */
    get: {
      parameters: {
        query?: {
          eventId?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The locations */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              locations: components["schemas"]["Location"][];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Adds a location after the others; its image is set with PUT /admin/locations/{id}/image. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            capacity: number;
            /** @default  */
            description?: string;
            areaDescription?: string;
            /** @default slate */
            color?: string;
            /** @default false */
            bookable?: boolean;
            /** @default [] */
            eventIds?: string[];
          };
        };
      };
      responses: {
        /** @description The new location */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Location"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/locations/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Replaces the location's fields and events; its image and place in the order stay. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            capacity: number;
            /** @default  */
            description?: string;
            areaDescription?: string;
            /** @default slate */
            color?: string;
            /** @default false */
            bookable?: boolean;
            /** @default [] */
            eventIds?: string[];
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated location */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Location"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Location"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/locations/{id}/image": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Replaces the location's image. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "multipart/form-data": {
            /**
             * Format: binary
             * @description JPEG, PNG or WebP, at most 5 MiB, at least 400 px wide, 4:3
             */
            image: string;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: string;
          };
        };
      };
      responses: {
        /** @description The location with its new image */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Location"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Location"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Removes the location's image. */
    delete: {
      parameters: {
        query: {
          /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
          expectedVersion: string;
        };
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The location without an image */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["Location"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Location"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/locations/{id}/move": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Swaps the location with its neighbour in the display order. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @enum {string} */
            direction: "up" | "down";
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description Every location in the new order; unchanged when already at that end */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              locations: components["schemas"]["Location"][];
            };
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["Location"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/locations/assign": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            locationIds: string[];
          };
        };
      };
      responses: {
        /** @description Assigned */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/locations/remove": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            locationIds: string[];
          };
        };
      };
      responses: {
        /** @description Removed */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/location-unavailability": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description When the event's rooms cannot be booked, ordered by start. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The periods */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              periods: components["schemas"]["Unavailability"][];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Marks the rooms, all assigned to the event, unavailable for one period. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            locationIds: string[];
            /** Format: date-time */
            start: string;
            /** Format: date-time */
            end: string;
          };
        };
      };
      responses: {
        /** @description The new periods, one per room */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              periods: components["schemas"]["Unavailability"][];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/location-unavailability/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/guests": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Every guest with their email and the events they belong to, in id order. */
    get: {
      parameters: {
        query?: {
          /** @description How many items to answer at most */
          limit?: number;
          /** @description The `nextCursor` of the previous page; left out for the first */
          cursor?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The guests */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              items: components["schemas"]["AdminGuest"][];
              /** @description Pass as `cursor` for the next page; null on the last */
              nextCursor: string | null;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    put?: never;
    /** @description Adds a guest; an email another guest has (in any case) is 409 guest.emailTaken. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            email: string;
          };
        };
      };
      responses: {
        /** @description The new guest */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["AdminGuest"];
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/guests/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** @description Replaces the guest's name and email. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            name: string;
            email: string;
            /** @description The version the edit was made from; a later change refuses it with `<subject>.versionConflict` */
            expectedVersion: number;
          };
        };
      };
      responses: {
        /** @description The updated guest */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": components["schemas"]["AdminGuest"];
          };
        };
        /** @description A conflict; `<subject>.versionConflict`, with `current`, when the subject changed since `expectedVersion` */
        409: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": {
              type: string;
              title: string;
              status: number;
              code: string;
              detail?: string;
              errors?: {
                path: string;
                message: string;
              }[];
              current?: components["schemas"]["AdminGuest"];
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    /** @description Deletes the guest with their votes, RSVPs, hosting and meetings; their comments stay without an author. */
    delete: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/guests/{id}/test-email": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Mails the guest a test message; a mail server failure is 503 mail.failed. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Sent */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/guests/import": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Creates the CSV's guests not yet known by email and adds every row's guest to the events. Any bad row refuses the whole file with 400 guestImport.invalid, one `errors` entry per problem. */
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @description A header row naming `name` and `email` columns, then one guest per row */
            csv: string;
            eventIds: string[];
          };
        };
      };
      responses: {
        /** @description Imported */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              created: number;
              /** @description Rows matching a guest by email, left unchanged but assigned */
              existing: number;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/guests/assign": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            guestIds: string[];
          };
        };
      };
      responses: {
        /** @description Assigned */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/events/{id}/guests/remove": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            guestIds: string[];
          };
        };
      };
      responses: {
        /** @description Removed */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/admin/settings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description The site's title, description and venue map. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The site settings */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              title: string;
              description: string;
              /** @description Empty when there is no map */
              mapImageUrl: string;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    /** @description Replaces the title and description; the map is replaced by `image`, removed by `removeMap`, or else kept. */
    put: {
      parameters: {
        query?: never;
        header?: {
          /** @description Retries with the same key get the first response (24 h) */
          "idempotency-key"?: string;
        };
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "multipart/form-data": {
            title: string;
            description?: string;
            /**
             * Format: binary
             * @description The venue map: JPEG, PNG or WebP, at most 5 MiB
             */
            image?: string;
            /**
             * @description Removes the map when no image is sent
             * @enum {string}
             */
            removeMap?: "true" | "false" | "on";
          };
        };
      };
      responses: {
        /** @description The saved settings */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              title: string;
              description: string;
              /** @description Empty when there is no map */
              mapImageUrl: string;
            };
          };
        };
        /** @description Problem details (RFC 9457); clients branch on `code` */
        default: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/problem+json": components["schemas"]["Problem"];
          };
        };
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    Session: {
      id: string;
      eventId: string;
      title: string;
      description: string;
      /** Format: date-time */
      startTime: string | null;
      /** Format: date-time */
      endTime: string | null;
      capacity: number;
      adminManaged: boolean;
      blocker: boolean;
      closed: boolean;
      proposalId: string | null;
      hosts: {
        id: string;
        name: string;
      }[];
      locations: {
        id: string;
        name: string;
        color: string;
      }[];
      numRsvps: number;
      version: number;
    };
    Problem: {
      type: string;
      title: string;
      status: number;
      code: string;
      detail?: string;
      errors?: {
        path: string;
        message: string;
      }[];
    };
    Rsvp: {
      id: string;
      sessionId: string;
      guestId: string;
    };
    Proposal: {
      id: string;
      eventId: string;
      title: string;
      description: string | null;
      durationMinutes: number | null;
      /** Format: date-time */
      createdTime: string;
      /** Format: date-time */
      updatedTime: string;
      hosts: {
        id: string;
        name: string;
      }[];
      cohostWanted: boolean;
      cohostWantedNote: string | null;
      sessionIds: string[];
      /** @description The public tally, from the scheduling phase on; skip votes are only in the breakdown */
      tally: {
        interested: number;
        maybe: number;
      } | null;
      /** @description From the scheduling phase on, shown to a proposal's hosts, and to everyone for a proposal nobody hosts */
      breakdown: {
        attendees: number;
        interested: number;
        maybe: number;
        skip: number;
        votes: number;
        votesPctOfAttendees: number | null;
        nonVoters: number;
        nonVotersPctOfAttendees: number | null;
        interestedPctOfVotes: number | null;
        maybePctOfVotes: number | null;
        skipPctOfVotes: number | null;
        /** @description A very rough 50% range of how many people to expect */
        estimatedAttendance: {
          low: number;
          high: number;
        } | null;
        /** @enum {string|null} */
        noEstimateReason:
          "low-turnout" | "no-interest" | "unknown-event" | null;
      } | null;
      version: number;
    };
    Vote: {
      id: string;
      proposalId: string;
      guestId: string;
      /** @enum {string} */
      choice: "interested" | "maybe" | "skip";
    };
    Comment: {
      id: string;
      parentId: string | null;
      body: string;
      /** @description A deleted comment with replies stays in the thread, without body or author */
      deleted: boolean;
      /** Format: date-time */
      createdTime: string;
      /** Format: date-time */
      editedTime: string | null;
      author: {
        id: string;
        name: string;
      } | null;
      /** @description Who liked the comment, oldest first */
      likes: {
        id: string;
        name: string;
        avatarUrl: string | null;
      }[];
    };
    Meeting: {
      id: string;
      /**
       * @description expired: a request nobody answered before its slot began
       * @enum {string}
       */
      status: "pending" | "accepted" | "declined" | "canceled" | "expired";
      /**
       * @description Which side the caller is on; only a recipient can answer
       * @enum {string}
       */
      role: "requester" | "recipient";
      otherId: string;
      otherName: string;
      /** Format: date-time */
      slotStart: string;
      /** Format: date-time */
      slotEnd: string;
      /** @description In the event's time zone */
      dayLabel: string;
      /** @description In the event's time zone */
      timeLabel: string;
      meetingPoint: string;
      message: string;
      /** @description What the canceller said, if anything; empty otherwise */
      cancelNote: string;
      /** @description Either party's commitments in the slot */
      clashes: {
        guestName: string;
        /** @enum {string} */
        kind: "hosting" | "attending" | "meeting" | "busy";
        title: string | null;
        isViewer: boolean;
      }[];
    };
    Event: {
      id: string;
      slug: string;
      name: string;
      description: string;
      website: string;
      timezone: string;
      maxSessionDuration: number;
      breakMinutes: number;
      slotIncrementMinutes: number;
      rsvpCapacityHardLimit: boolean;
      icon: string | null;
      meetingsEnabled: boolean;
      maxOpenMeetingRequests: number;
      /** Format: date-time */
      firstDayStart: string | null;
      /** Format: date-time */
      lastDayStart: string | null;
      /**
       * Format: date-time
       * @description null clears it
       */
      proposalPhaseStart: string | null;
      /**
       * Format: date-time
       * @description null clears it
       */
      proposalPhaseEnd: string | null;
      /**
       * Format: date-time
       * @description null clears it
       */
      votingPhaseStart: string | null;
      /**
       * Format: date-time
       * @description null clears it
       */
      votingPhaseEnd: string | null;
      /**
       * Format: date-time
       * @description null clears it
       */
      schedulingPhaseStart: string | null;
      /**
       * Format: date-time
       * @description null clears it
       */
      schedulingPhaseEnd: string | null;
      version: number;
    };
    PublicProfile: {
      id: string;
      name: string;
      aboutMe: string | null;
      avatarUrl: string | null;
      pronouns: string | null;
      basedIn: string | null;
      prompts:
        | {
            prompt: string;
            answer: string;
          }[]
        | null;
      languages: string[] | null;
      contacts:
        | {
            /** @enum {string} */
            type:
              | "email"
              | "phone"
              | "whatsapp"
              | "signal"
              | "telegram"
              | "discord"
              | "website"
              | "other";
            label?: string;
            value: string;
          }[]
        | null;
      /** Format: date-time */
      profileUpdatedAt: string | null;
      version: number;
    };
    Notification: {
      id: string;
      /** @enum {string} */
      type:
        | "rsvpChange"
        | "hostChange"
        | "cohostAdd"
        | "proposalJoin"
        | "proposalComment"
        | "sessionComment"
        | "profileComment"
        | "commentThread"
        | "meetingRequest"
        | "meetingResponse"
        | "sessionHeadsUp"
        | "attendeeCountReminder";
      text: string;
      /** @description Site-relative path to what happened */
      url: string;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      readAt: string | null;
    };
    Snapshot: {
      /** @description Resume the feed after this */
      seq: number;
      event: components["schemas"]["Event"];
      days: {
        /** Format: date-time */
        start: string;
        /** Format: date-time */
        end: string;
        /**
         * Format: date-time
         * @description When sessions may start
         */
        startBookings: string;
        /**
         * Format: date-time
         * @description When sessions must end
         */
        endBookings: string;
        id: string;
        eventId: string;
        version: number;
      }[];
      locations: components["schemas"]["SnapshotLocation"][];
      unavailability: components["schemas"]["Unavailability"][];
      /** @description Members and session hosts */
      guests: components["schemas"]["SnapshotGuest"][];
      sessions: components["schemas"]["SnapshotSession"][];
      /** @description RSVPs by session */
      counts: {
        [key: string]: number;
      };
      meetingPoints: {
        id: string;
        eventId: string;
        name: string;
        description: string;
        sortIndex: number;
        version: number;
      }[];
      me: {
        guestId: string;
        rsvps: components["schemas"]["Rsvp"][];
        meetings: {
          id: string;
          eventId: string;
          requesterId: string;
          recipientId: string;
          /** Format: date-time */
          slotStart: string;
          /** Format: date-time */
          slotEnd: string;
          meetingPoint: string;
          message: string;
          cancelNote: string;
          /** @enum {string} */
          status: "pending" | "accepted" | "declined" | "canceled";
          /** Format: date-time */
          createdAt: string;
          /** Format: date-time */
          respondedAt: string | null;
        }[];
        /** @description The other party of each own meeting */
        meetingGuests: components["schemas"]["EventGuest"][];
        availability: string[];
      } | null;
    };
    SnapshotLocation: {
      id: string;
      name: string;
      description: string;
      areaDescription: string | null;
      capacity: number;
      color: string;
      /** @description false hides it from attendees' booking */
      bookable: boolean;
      imageUrl: string;
      sortIndex: number;
      /** @description Goes up with every change, its events and place included */
      version: number;
    };
    Unavailability: {
      id: string;
      eventId: string;
      locationId: string;
      /** Format: date-time */
      start: string;
      /** Format: date-time */
      end: string;
    };
    SnapshotGuest: {
      id: string;
      name: string;
      avatarUrl: string | null;
      aboutMe: string | null;
      authProtected: boolean;
      profileVersion: number;
      /** @description false for a host who is not one */
      member: boolean;
    };
    SnapshotSession: {
      id: string;
      eventId: string;
      title: string;
      description: string;
      /** Format: date-time */
      startTime: string | null;
      /** Format: date-time */
      endTime: string | null;
      capacity: number;
      adminManaged: boolean;
      blocker: boolean;
      closed: boolean;
      proposalId: string | null;
      version: number;
      hostIds: string[];
      locationIds: string[];
    };
    EventGuest: {
      id: string;
      name: string;
      avatarUrl: string | null;
      aboutMe: string | null;
      authProtected: boolean;
      profileVersion: number;
    };
    FeedMessage:
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "event.changed";
          event: components["schemas"]["Event"];
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "event.deleted";
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "day.created";
          day: {
            /** Format: date-time */
            start: string;
            /** Format: date-time */
            end: string;
            /**
             * Format: date-time
             * @description When sessions may start
             */
            startBookings: string;
            /**
             * Format: date-time
             * @description When sessions must end
             */
            endBookings: string;
            id: string;
            eventId: string;
            version: number;
          };
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "day.changed";
          day: {
            /** Format: date-time */
            start: string;
            /** Format: date-time */
            end: string;
            /**
             * Format: date-time
             * @description When sessions may start
             */
            startBookings: string;
            /**
             * Format: date-time
             * @description When sessions must end
             */
            endBookings: string;
            id: string;
            eventId: string;
            version: number;
          };
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "day.deleted";
          dayId: string;
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "location.changed";
          location: components["schemas"]["SnapshotLocation"];
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "location.removed";
          locationId: string;
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "unavailability.added";
          period: components["schemas"]["Unavailability"];
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "unavailability.removed";
          periodId: string;
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "guest.changed";
          guest: components["schemas"]["SnapshotGuest"];
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "guest.removed";
          guestId: string;
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "meetingPoint.changed";
          meetingPoint: {
            id: string;
            eventId: string;
            name: string;
            description: string;
            sortIndex: number;
            version: number;
          };
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "meetingPoint.removed";
          meetingPointId: string;
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "meeting.changed";
          meeting: {
            id: string;
            eventId: string;
            requesterId: string;
            recipientId: string;
            /** Format: date-time */
            slotStart: string;
            /** Format: date-time */
            slotEnd: string;
            meetingPoint: string;
            message: string;
            cancelNote: string;
            /** @enum {string} */
            status: "pending" | "accepted" | "declined" | "canceled";
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            respondedAt: string | null;
          };
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "meeting.deleted";
          meetingId: string;
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "availability.changed";
          slotStarts: string[];
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "session.created";
          session: components["schemas"]["SnapshotSession"];
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "session.changed";
          session: components["schemas"]["SnapshotSession"];
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "session.deleted";
          sessionId: string;
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "session.attendanceChanged";
          sessionId: string;
          numRsvps: number;
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "rsvp.added";
          rsvp: components["schemas"]["Rsvp"];
        }
      | {
          seq: number;
          /** @description The Idempotency-Key of your own request that made it */
          commandKey: string | null;
          /** @enum {string} */
          type: "rsvp.removed";
          sessionId: string;
          guestId: string;
        };
    Location: {
      id: string;
      name: string;
      description: string;
      areaDescription: string | null;
      capacity: number;
      color: string;
      /** @description false hides it from attendees' booking */
      bookable: boolean;
      imageUrl: string;
      sortIndex: number;
      eventIds: string[];
      /** @description Goes up with every change, its events and place included */
      version: number;
    };
    AdminGuest: {
      id: string;
      name: string;
      email: string;
      authProtected: boolean;
      eventIds: string[];
      version: number;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
