# Impeccable project installation

Source: https://github.com/pbakaus/impeccable
Commit: bbcb29d9dee6c94915d760bcfc36818ad5be66ad
Skill version: 4.5.0. Engine release pin: 0.1.11.
The official npm binary identifies itself as `impeccable-engine 0.1.5` in its handshake.

Installed from the upstream repository's generated `.agents/skills/impeccable`
Codex distribution. The CLI bundle endpoint was unavailable in this cloud
environment, so the documented project-local copy workflow was used.
The Apache 2.0 license is included as `LICENSE`.

The Linux engine was obtained from the integrity-checked npm package
`@impeccable/cli-linux-x64@0.1.11` and cached in the ignored
`scripts/bin/linux-x64/` directory. On other machines, the shipped launcher
downloads the pinned platform binary with SHA-256 verification.

No automatic edit hooks were installed. This skill can be invoked explicitly
with `$impeccable`, including its `typeset` and `clarify` commands.
