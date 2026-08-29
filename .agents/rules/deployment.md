# Deployment Verification Rule

Whenever a deployment to production or staging is triggered, you MUST ALWAYS provide the following details to the user for manual confirmation:

1. **GitHub Deployment ID**: (e.g. `6156189138`)
2. **Git Commit SHA**: Full SHA and 7-character short SHA (e.g. `7a25cd2`)
3. **Deployment State**: (e.g. `success` / `failure` / `in_progress`)
4. **Vercel Direct Deployment URL**: (e.g. `https://th-3-ory-xxxxxx.vercel.app`)
5. **Live Domain URL**: `https://th3ory.online`
6. **Direct Route URLs Tested**: (e.g. `/#/privacy`, `/#/admin`, `/#/student`)
