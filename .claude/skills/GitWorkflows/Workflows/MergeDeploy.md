# MergeDeploy Workflow

Merge approved dev branch to master, rebuild, and deploy to production.

**Prerequisite:** Human has approved UAT via RequestUAT workflow. Do NOT run this without explicit approval.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Merging to master and deploying to production"}' \
  > /dev/null 2>&1 &
```

Running the **MergeDeploy** workflow in the **GitWorkflows** skill to deploy to production...

---

## Step 1: Merge to Master

```bash
# Ensure dev branch is fully committed
git status
# Should show clean working tree on dev branch

# Switch to master and merge
git checkout master
git pull origin master
git merge dev/<branch-name>
```

If merge conflicts occur:
1. Resolve them carefully
2. Prioritize the dev branch changes (since they were just UAT-approved)
3. Commit the merge resolution
4. If conflicts are complex, ask the user before resolving

## Step 2: Rebuild

Navigate to the correct app directory and build:

```bash
# Example for Aaron app:
cd projects/P2_tiffany-pai-project/mini-app/react/aaron
bun run build
```

**Verify the build:**
```bash
ls -la dist/index.html
# Timestamp MUST be today's date
```

If build fails:
1. DO NOT deploy the broken build
2. Read the error output
3. Fix on a new dev branch (not on master)
4. Re-run the full pipeline

## Step 3: Restart Docker Container

```bash
docker restart miniapp-2030destiny
```

Wait 5 seconds for container to fully restart.

## Step 4: Verify Production

Use Browser skill to screenshot the deployed application:

```bash
# Take screenshot of the relevant page
bun run ~/.claude/skills/Browser/Tools/Browse.ts "<app-url>"
```

Verify:
- [ ] Page loads without errors
- [ ] The fix/feature is visible and functional
- [ ] No regressions on other parts of the page

**If verification fails:**
→ Invoke **Rollback** workflow immediately
→ Do NOT leave a broken production deploy

## Step 5: Cleanup

```bash
# Delete the merged dev branch (it's in master now)
git branch -d dev/<branch-name>

# Verify we're clean
git branch
# Should show only: * master
```

## Step 6: Notify

Send voice notification:
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Successfully deployed to production. All verified."}' \
  > /dev/null 2>&1 &
```

Inform the user:
```
Deployed to production:
- Branch `dev/<name>` merged to master
- Build completed (dist/ updated)
- Docker container restarted
- Production verified via screenshot
- Dev branch cleaned up
```

---

## Checklist

- [ ] Human UAT approval received (REQUIRED)
- [ ] Merged dev branch to master (no conflicts, or conflicts resolved)
- [ ] Build succeeded (dist/index.html has today's timestamp)
- [ ] Docker container restarted
- [ ] Production verified via Browser skill screenshot
- [ ] Dev branch deleted
- [ ] User notified
