# Diagrams

The C4 model of the target architecture as [LikeC4](https://likec4.dev) sources.

| File       | Holds                                                                              |
| ---------- | ---------------------------------------------------------------------------------- |
| `spec.c4`  | Element and relationship kinds (person, system, container, module …)               |
| `model.c4` | The elements and their relationships — one model, every view is a projection of it |
| `views.c4` | L1 context, L2 containers, L3 server / modules / web app, and four dynamic flows   |

`likec4` is a dev dependency, so these need no global install:

```bash
make arch-diagrams          # interactive, with navigation between levels
make arch-diagrams-check    # validates the sources; part of `make arch`, so CI runs it
```

Nothing is rendered ahead of time. The published developer docs build the whole
explorer at [`/diagrams/`](https://developers.schellingboard.org/diagrams/) and embed
individual views in the chapters as `<likec4-view view-id="…">`, both from these
sources on every build — so a view cannot go stale, and changing the model is the whole
job. The cost is that the chapters show no diagram when read on GitHub, only a link to
the view.

Views, in reading order:

1. `index` — who uses the system and what it talks to
2. `containers` — web app, server, database, file store
3. `server` — HTTP, feed, jobs, kernel and the nine modules
4. `modules` — which module may call which; dashed edges are reactions
5. `web` — shell, replica, commands, features, PWA runtime
6. `flowRsvp`, `flowSessionMoved`, `flowJoin`, `flowReconnect` — the four flows the rest of the design keeps referring to

Keep the model honest: when a document here changes a boundary, change `model.c4` in
the same commit.
