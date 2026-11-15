# Automatic sharing to X and Facebook

`scripts/post-social.mjs` runs daily (`.github/workflows/social-posting.yml`). It reads the live
feed at https://tradeninety.com/rss.xml and shares items that have not been shared before:
weekly digests, verified central-bank decisions and new guides.

- **First run:** records every item already in the feed without posting, so there is no backlog flood.
- **After that:** up to 2 new items per channel per day, oldest first.
- **State:** `scripts/state/social-posted.json`, committed by the workflow. Delete an item's entry to share it again.
- **A channel is off until all of its secrets exist.** With no secrets the job only keeps the state file current.
- **Test without posting:** Actions → *TRADE90 social posting* → Run workflow → tick *dry_run*.

## Secrets (GitHub → repository → Settings → Secrets and variables → Actions)

### Facebook Page
| Secret | Value |
|---|---|
| `FB_PAGE_ID` | The numeric ID of the TRADE90 page |
| `FB_PAGE_TOKEN` | A long-lived **Page** access token with `pages_manage_posts` and `pages_read_engagement` |

Create the token from a Meta developer app that you administer, exchanging a long-lived user token
for the page token so that it does not expire after an hour.

### X
| Secret | Value |
|---|---|
| `X_API_KEY`, `X_API_SECRET` | The app's consumer key and secret (X developer console) |
| `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` | Access token and secret generated for the TRADE90 account, with **Read and write** permission |

The X API is pay-per-use: posting needs prepaid credits, and a post containing a link costs more than
one without. Check the current rate card in the X developer console before enabling this channel.
If the access token was generated while the app was read-only, regenerate it after switching to read and write.

## Failure behaviour
A rejected post is not recorded, so it is retried on the next run, and the workflow run is marked failed.
Secrets are never written to logs or to the state file.
