# Rollback Workflow

Emergency revert of a broken production deploy. Get back to working state fast.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Emergency rollback. Reverting production to last known good state."}' \
  > /dev/null 2>&1 &
```

Running the **Rollback** workflow in the **GitWorkflows** skill to revert production...

---

## Step 1: Identify What Broke

```bash
git log --oneline -5
```

Identify the merge commit that caused the issue.

## Step 2: Revert on Master

```bash
git checkout master
git revert HEAD --no-edit
```

This creates a NEW commit that undoes the last merge. History is preserved — nothing is lost.

If the last commit was a merge commit:
```bash
git revert -m 1 HEAD --no-edit
```

## Step 3: Rebuild and Redeploy

```bash
cd projects/P2_tiffany-pai-project/mini-app/react/aaron
bun run build

# Verify dist is updated
ls -la dist/index.html

# Restart container
docker restart miniapp-2030destiny
```

## Step 4: Verify Production Restored

Use Browser skill to screenshot and confirm the app is back to working state.

## Step 5: Notify

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Rollback complete. Production is restored to previous working state."}' \
  > /dev/null 2>&1 &
```

Inform the user:
```
Production rolled back:
- Reverted commit: [hash] [message]
- Rebuilt and redeployed
- App verified working via screenshot
- The dev branch still exists if you want to reattempt the fix
```

## Step 6: Preserve the Failed Work

The reverted changes still exist in git history. If the feature needs another attempt:
1. Create a new dev branch from master
2. Cherry-pick or re-implement the changes
3. Fix whatever caused the failure
4. Go through the full pipeline again (FeatureBranch → RequestUAT → MergeDeploy)

---

## Checklist

- [ ] Identified the breaking commit
- [ ] Reverted on master (new commit, history preserved)
- [ ] Rebuilt dist/
- [ ] Docker container restarted
- [ ] Production verified working via screenshot
- [ ] User notified
- [ ] Failed work preserved for reattempt if needed
