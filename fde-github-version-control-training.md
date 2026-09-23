# FDE GitHub version-control exercise

This repository includes the `fde-dev-testing` branch as a small exercise for demonstrating a normal GitHub workflow.

## Workflow

1. Create or switch to a feature branch:

   ```sh
   git switch -c fde-dev-testing
   ```

2. Review and commit a focused change:

   ```sh
   git status
   git diff
   git add <files>
   git commit -m "docs: add FDE version-control exercise"
   ```

3. Push the branch:

   ```sh
   git push -u origin fde-dev-testing
   ```

4. Open a pull request from `fde-dev-testing` into `main`, review the commit and file diff, and merge it.

5. Synchronize the local default branch after the merge:

   ```sh
   git switch main
   git pull --ff-only
   ```

The pull request records the discussion, review, checks, and merge. The commit records the exact repository change.
