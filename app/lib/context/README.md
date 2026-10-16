# Client state providers

`TaskProvider` creates a vanilla Zustand store per provider instance. The task board and task list share modal, focus, loading, and confirmation state within that UI subtree. `useTaskData()` is a compatibility hook for the stable task actions, so action-only consumers do not rerender when modal state changes. Keep task data out of a module-global store so project views and server requests cannot share state accidentally.

`ProjectProvider` uses React Context for the short-lived project creation wizard draft. Its state changes infrequently and remains scoped to the wizard, so a separate store would add indirection without helping its consumers. `RoleProvider` also uses Context for one project-scoped role value; it loads against the current NextAuth user only after the Firebase auth bridge is ready and ignores results from an old project or user.

The application-level `AuthProviders` is the only `SessionProvider`. Feature providers should consume the session context rather than nesting another provider.
