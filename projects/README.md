# Projects

Implementations — the real things that come out of solutions. Tools, guides, datasets, prototypes, anything people can actually use.

Each project lives in its own folder, `projects/<slug>/`, and starts with a `README.md` that says:

- **What it is** and who it's for
- **Which solution and findings** it came from (link them)
- **How to use / run it**
- **Status** — prototype, usable, maintained
- **What's left** — known gaps and next steps

## Adding a project

1. Create `projects/<slug>/` with a `README.md`.
2. Keep the first version small and working. A rough tool people can use beats a grand plan that never ships.
3. Link the solution (`solutions/<slug>.md`) and findings it builds on.
4. Open a PR that links the Build issue.

## Licence

Code under `projects/` is [MIT](LICENSE) — permissive, so anyone can pick it up and run with it. (The rest of the repo — research and content — is CC BY 4.0.)

Keep dependencies light and setup obvious. The next person should be able to run it in minutes.
