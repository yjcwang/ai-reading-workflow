# AGENTS.md

## Working style

- Before making changes, first propose a short task list and implementation plan.
- For important architecture or workflow decisions, compare 2–3 options first and explain trade-offs. Do not implement before the decision is made.
- Make the smallest reasonable change for each task.
- Keep code simple, readable, maintainable, and extensible.
- Avoid large rewrites unless explicitly requested.

## Code quality

- New functions and large code blocks should include concise comments explaining intent.
- Do not add overly dense or obvious comments.
- Prefer clear names and simple control flow over clever abstractions.
- Preserve existing API behavior unless explicitly asked to change it.
- Do not introduce new dependencies without explaining why.

## After changes

- Summarize the diff: changed files, what changed, why it changed.
- State whether API behavior, data schemas, environment variables, or workflows changed.
- Point out files or logic that need careful human review.
- Run relevant tests/build checks when possible and report the result.