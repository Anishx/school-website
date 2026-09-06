# Vercel Hobby deployment

The failed deployment `dpl_2NKeGtNUbzqxPHRgVy6Vx9g3vYND` completed its Next.js build but was rejected with `exceeded_serverless_functions_per_deployment` (Hobby permits 12 functions).

## Packaging changes

- `vercel.json` selects `node scripts/build-vercel.mjs` as the Vercel build command. The script clears the injected `NEXT_ADAPTER_PATH` for the Next.js subprocess. Vercel's established builder then packages the output and groups compatible routes. The newer adapter used by the failed deployment emits individual route functions. This is an internal compatibility workaround: recheck packaging after Next.js or Vercel builder upgrades.
- Media verification reads local disk files only outside production. Production already requires Vercel Blob. This keeps a configurable local directory from being traced into every CMS function, inflating bundles and interfering with grouping.
- Routes, authentication, permissions, server actions, CMS publication hooks, and page revalidation intervals are retained.

An initial attempt using only `build.env.NEXT_ENABLE_ADAPTER=0` did not override a platform-enabled adapter in the local CLI check. The explicit build wrapper handles that case. The regular `npm run build` command continues to run Next.js normally.

## Verification and deployment

Validated on Linux with Next.js 16.2.7 and Vercel CLI 59.1.3, including `NEXT_ENABLE_ADAPTER=1` in the parent environment: **4 shared function bundles**, compared with **23** before the tracing correction under the established builder. The route aliases and ISR outputs point to these bundles. The build completed without the broad NFT trace or 250 MB function-size warnings. This was a packaging check with SMTP disabled and a fixture Blob token, not an end-to-end production service test. All 14 focused media tests, TypeScript, and focused ESLint checks passed.

Use Linux for the Vercel packaging check; the Windows CLI build encountered `Unable to find lambda for route: /news-events/best-school-mandal-2025`.

```sh
vercel pull --environment=production --scope apollo-vidyalayam --yes
vercel build --prod --scope apollo-vidyalayam
```

Inspect the generated `.vercel/output/functions` bundles, including shared/symlinked functions. A Next.js route count is not the deployed function count.

On Linux, count the physical bundle configurations without following route symlinks:

```sh
find .vercel/output/functions -name .vc-config.json | wc -l
```

Before deploying, ensure actual SMTP and Blob credentials are configured. A local check using fixture credentials validates packaging only; never deploy that output with `--prebuilt`.

Commit the packaging changes and create a fresh deployment from the updated source. Retrying the old commit does not include these changes. Verify the deployment reaches Ready, then check public pages, admin login, media uploads, admissions, and publication/cache refresh.

To read a deployment error that is absent from the build log:

```sh
vercel api /v13/deployments/DEPLOYMENT_ID --scope apollo-vidyalayam --raw
```

Check `errorCode` and `errorMessage`. Do not share the full response if it contains private configuration.

References: [Vercel function bundling](https://vercel.com/docs/functions/runtimes), [Vercel build command configuration](https://vercel.com/docs/project-configuration/vercel-json#buildcommand), [upstream adapter fallback report](https://github.com/vercel/next.js/issues/96657).
