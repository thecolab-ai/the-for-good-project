# Projects

Projects are the usable things that come out of solutions: tools, guides, datasets, prototypes, or small services people can actually run.

Each project lives in its own folder:

```text
projects/<slug>/
```

Start every project with a `README.md` that explains:

- What it is and who it is for
- Which solution and findings it came from
- How to use or run it
- Current status: prototype, usable, maintained, or archived
- What is still missing

## Add A Project

1. Create `projects/<slug>/` with a project README.
2. Keep the first version small and working.
3. Link the source solution and findings.
4. Include setup and run commands that a new contributor can follow in minutes.
5. Open a PR that links the Build issue.

## Build Standard

A rough tool people can use beats a grand plan that never ships. Prefer boring dependencies, obvious setup, and a narrow first version.

Build work happens only after the stream has passed the human gate described in [docs/STREAMS.md](../docs/STREAMS.md).

## Licence

Code under `projects/` is [MIT](LICENSE), so anyone can pick it up and run with it. Research and docs elsewhere in the repo are [CC BY 4.0](../LICENSE).
