# Mandatory Deployment Rule

CRITICAL INSTRUCTION: With EACH and EVERY edit in this project, you MUST ALWAYS complete the deployment to Vercel production for `th3ory.online`.

## Required Workflow with Every Edit
1. Verify the project builds successfully (`cmd.exe /c npm run build`).
2. Stage and commit the changes to Git with a clear, descriptive commit message (`git commit -m "..."`).
3. Push the commit to the remote repository (`git push origin main`).
4. Execute the Vercel production deployment (`cmd.exe /c npx vercel deploy --yes --prod`).
5. Confirm the deployment succeeded on `https://th3ory.online`.

## Deployment Confirmation Report
Whenever a deployment is completed, provide the following details to the user:
1. **Git Commit SHA**: Full SHA and short SHA
2. **Deployment State**: (`success`)
3. **Vercel Direct Deployment URL**: (e.g. `https://th-3-ory-xxxxxx.vercel.app`)
4. **Live Domain URL**: `https://th3ory.online`
5. **Direct Route URLs Verified**: (e.g. `https://th3ory.online/#/admin`, `https://th3ory.online/#/student`)
