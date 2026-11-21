# PadManiacs - project rules

## [OQS] rule (MUST survive compaction)

1. Whenever the user's message contains the literal token `[OQS]`, you MUST use
   OpenCode's Questions tool (`question`) to gather more information about the
   specific topic before doing work on that topic.
2. This rule set MUST survive compaction. If the conversation has been
   compacted, re-read this file before responding.
3. You may type `[OQS]` yourself when you need more information. Doing so
   triggers the same requirement: use the Questions tool before proceeding.
4. When `[OQS]` is used (by the user or by you), ask focused, topic-specific
   questions, not generic confirmation questions.

## Testing rule (MUST survive compaction)

- The user performs all testing. Do not run test suites, integration tests,
  simulations, servers, or clients.
- Only run minimal syntax/parse checks (for example `node --check`). Do not
  run `npm test` unless the user asks.
- Write code that should work, then tell the user exactly what to test.

## Editing rule (MUST survive compaction)

- Always use OpenCode's Read and Edit tools for file reading and editing. Do not use shell commands (cat, sed, python scripts, etc.) to read or modify files.

## Commit rule (MUST survive compaction)

- Do not commit changes unless user asks.
- Commits made entirely with help of AI are marked with an asterisk. For example: "Minor fixes *"
