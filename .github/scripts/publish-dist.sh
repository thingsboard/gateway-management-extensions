#!/usr/bin/env bash
#
# Publishes a source build to the dist repository through a single open automation PR
# (DIST_BRANCH -> DIST_BASE). Called from .github/workflows/publish-dist.yml.
#
# Required environment:
#   SOURCE_REPO, SOURCE_SHA, SOURCE_DIR   source repo slug, the commit being published, its checkout
#   ARTIFACT                              built file to publish
#   DIST_REPO, DIST_BASE, DIST_BRANCH     dist repo slug, its base branch, the automation branch
#   DIST_FILE, DIST_DIR                   artifact path inside the dist repo, the dist checkout
#   SOURCE_GH_TOKEN                       token for reading the source repo API
#   DIST_GH_TOKEN                         token for the dist repo (contents + pull requests: write)
# Optional:
#   SOURCE_BRANCH (master), PR_TITLE, MAX_ATTEMPTS (3), PR_LOOKUP_LIMIT (200), GITHUB_SERVER_URL
#
set -euo pipefail
shopt -s inherit_errexit

log() { echo "$*" >&2; }
die() { echo "::error::$*" >&2; exit 1; }

for var in SOURCE_REPO SOURCE_SHA SOURCE_DIR ARTIFACT DIST_REPO DIST_BASE DIST_BRANCH DIST_FILE DIST_DIR \
           SOURCE_GH_TOKEN DIST_GH_TOKEN; do
  [ -n "${!var:-}" ] || die "Environment variable $var is required"
done
SOURCE_BRANCH="${SOURCE_BRANCH:-master}"
PR_TITLE="${PR_TITLE:-Updated build}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
PR_LOOKUP_LIMIT="${PR_LOOKUP_LIMIT:-200}"
SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"
SOURCE_URL="$SERVER_URL/$SOURCE_REPO"
BOT_NAME="github-actions[bot]"
BOT_EMAIL="41898282+github-actions[bot]@users.noreply.github.com"
MARKER_RE='<!-- source-sha: [0-9a-f]{40} -->'

src_gh() { GH_TOKEN="$SOURCE_GH_TOKEN" gh "$@"; }
dist_gh() { GH_TOKEN="$DIST_GH_TOKEN" gh "$@"; }
src_git() { git -C "$SOURCE_DIR" "$@"; }
dist_git() { git -C "$DIST_DIR" "$@"; }

# Prints the SHA from the last source-sha marker on stdin, or nothing when there is no valid marker.
marker_sha() {
  local markers
  markers=$(grep -oE "$MARKER_RE" || true)
  [ -n "$markers" ] || return 0
  printf '%s\n' "$markers" | tail -n 1 | grep -oE '[0-9a-f]{40}'
}

# Prints the blob id of DIST_FILE in the given commit, or nothing when the file is absent.
blob_at() {
  dist_git rev-parse --verify --quiet "$1:$DIST_FILE" || true
}

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT
mkdir -p "$WORK_DIR/prs"

[[ "$SOURCE_SHA" =~ ^[0-9a-f]{40}$ ]] || die "SOURCE_SHA '$SOURCE_SHA' is not a full commit SHA"
[ "$(src_git rev-parse HEAD)" = "$SOURCE_SHA" ] \
  || die "Source checkout is at $(src_git rev-parse HEAD), expected $SOURCE_SHA"
[ -s "$ARTIFACT" ] || die "Build artifact $ARTIFACT is missing or empty"
ARTIFACT="$(cd "$(dirname "$ARTIFACT")" && pwd)/$(basename "$ARTIFACT")"
build_blob=$(dist_git hash-object -- "$ARTIFACT")

# Reads the current dist state into globals:
#   base_sha, branch_sha (empty when the branch is absent),
#   baseline_number/prev_sha (last merged automation PR and its source SHA; empty for first publication),
#   open_number/open_body/open_url (the open automation PR; empty when none).
# Sets state_changed=1 when the state changed while reading it, so the caller can retry.
# Not called in a condition, so that errexit stays active inside.
load_state() {
  state_changed=""
  dist_git fetch --no-tags --quiet origin "+refs/heads/$DIST_BASE:refs/remotes/origin/$DIST_BASE" \
    || die "Cannot fetch $DIST_REPO $DIST_BASE"
  base_sha=$(dist_git rev-parse --verify "refs/remotes/origin/$DIST_BASE^{commit}")

  local rc=0
  dist_git ls-remote --exit-code origin "refs/heads/$DIST_BRANCH" >/dev/null || rc=$?
  case "$rc" in
    0)
      if ! dist_git fetch --no-tags --quiet origin "+refs/heads/$DIST_BRANCH:refs/remotes/origin/$DIST_BRANCH"; then
        log "Branch $DIST_BRANCH changed while fetching it"
        state_changed=1
        return 0
      fi
      branch_sha=$(dist_git rev-parse --verify "refs/remotes/origin/$DIST_BRANCH^{commit}")
      ;;
    2)
      branch_sha=""
      if dist_git show-ref --verify --quiet "refs/remotes/origin/$DIST_BRANCH"; then
        dist_git update-ref -d "refs/remotes/origin/$DIST_BRANCH"
      fi
      ;;
    *) die "Cannot list refs of $DIST_REPO (git ls-remote exit code $rc)" ;;
  esac

  # Only one automation PR is open at a time, so merged ones are created in merge order and the
  # latest merged PR is within the most recent 100. It is still selected by mergedAt explicitly.
  # shellcheck disable=SC2016 # $head and $base are jq variables
  local pr_filter='[.[] | select(.headRefName == $head and .baseRefName == $base and (.isCrossRepository | not))]'
  local merged baseline
  merged=$(dist_gh pr list -R "$DIST_REPO" --state merged --head "$DIST_BRANCH" --base "$DIST_BASE" --limit 100 \
    --json number,body,mergedAt,headRefName,baseRefName,isCrossRepository) \
    || die "Cannot list merged PRs of $DIST_REPO"
  baseline=$(jq -c --arg head "$DIST_BRANCH" --arg base "$DIST_BASE" \
    "$pr_filter | map(select(.mergedAt != null)) | sort_by(.mergedAt) | last // empty" <<<"$merged")

  baseline_number=""
  prev_sha=""
  if [ -n "$baseline" ]; then
    baseline_number=$(jq -r '.number' <<<"$baseline")
    prev_sha=$(jq -r '.body // ""' <<<"$baseline" | marker_sha)
    [ -n "$prev_sha" ] \
      || die "Last merged dist PR #$baseline_number has no valid '<!-- source-sha: SHA -->' marker; cannot determine the change range"
    src_git cat-file -e "$prev_sha^{commit}" 2>/dev/null \
      || die "Source commit $prev_sha from dist PR #$baseline_number does not exist in $SOURCE_REPO"
    src_git merge-base --is-ancestor "$prev_sha" "$SOURCE_SHA" \
      || die "Source commit $prev_sha from dist PR #$baseline_number is not an ancestor of $SOURCE_SHA"
  fi

  local open open_count
  open=$(dist_gh pr list -R "$DIST_REPO" --state open --head "$DIST_BRANCH" --base "$DIST_BASE" --limit 100 \
    --json number,body,url,headRefName,baseRefName,isCrossRepository) \
    || die "Cannot list open PRs of $DIST_REPO"
  open=$(jq -c --arg head "$DIST_BRANCH" --arg base "$DIST_BASE" "$pr_filter" <<<"$open")
  open_count=$(jq 'length' <<<"$open")
  [ "$open_count" -le 1 ] \
    || die "Found $open_count open $DIST_BRANCH -> $DIST_BASE PRs ($(jq -r 'map("#\(.number)") | join(", ")' <<<"$open")); close the extra ones manually"
  open_number=$(jq -r '.[0].number // empty' <<<"$open")
  open_body=$(jq -r '.[0].body // empty' <<<"$open")
  open_url=$(jq -r '.[0].url // empty' <<<"$open")
}

# Prints "number<TAB>url<TAB>title" for merged source PRs into SOURCE_BRANCH associated with the given commit.
# Results are cached per commit so retries do not repeat API calls.
prs_for_commit() {
  local sha="$1" cache="$WORK_DIR/prs/$1"
  if [ ! -f "$cache" ]; then
    src_gh api --paginate "repos/$SOURCE_REPO/commits/$sha/pulls?per_page=100" > "$cache.json" \
      || die "Cannot list PRs associated with $SOURCE_REPO commit $sha"
    jq -r --arg repo "$SOURCE_REPO" --arg branch "$SOURCE_BRANCH" '
      .[] | select(.merged_at != null and .base.ref == $branch and .base.repo.full_name == $repo)
      | "\(.number)\t\(.html_url)\t\(.title | gsub("[\t\r\n]"; " "))"' "$cache.json" > "$cache"
  fi
  cat "$cache"
}

md_escape() {
  sed -e 's/[][\\`*_<>|]/\\&/g'
}

render_body() {
  local range commits commit_count
  if [ -n "$prev_sha" ]; then
    range="$prev_sha..$SOURCE_SHA"
  else
    range="$SOURCE_SHA"
  fi
  # First-parent commits of the source branch: merge, squash and rebase merges all map to their PR from there.
  commits=$(src_git rev-list --first-parent "$range")
  commit_count=$(printf '%s' "$commits" | grep -c . || true)

  echo "Automated build of [\`$SOURCE_REPO@${SOURCE_SHA:0:7}\`]($SOURCE_URL/commit/$SOURCE_SHA)."
  echo
  if [ -n "$prev_sha" ]; then
    echo "Changes since the last merged build (#$baseline_number): [\`${prev_sha:0:7}...${SOURCE_SHA:0:7}\`]($SOURCE_URL/compare/$prev_sha...$SOURCE_SHA)"
  else
    echo "**Initial publication:** no merged \`$DIST_BRANCH\` → \`$DIST_BASE\` PR was found, so this build covers the whole source history up to [\`${SOURCE_SHA:0:7}\`]($SOURCE_URL/commits/$SOURCE_SHA)."
  fi
  echo
  echo "### Merged pull requests in this range"
  echo
  if [ "$commit_count" -eq 0 ]; then
    echo "_No new source commits._"
  elif [ "$commit_count" -gt "$PR_LOOKUP_LIMIT" ]; then
    echo "_The range has $commit_count commits (more than $PR_LOOKUP_LIMIT), so the PR list was not collected. Use the link above to review the changes._"
  else
    local sha prs
    prs=$(for sha in $commits; do prs_for_commit "$sha"; done | sort -t $'\t' -k1,1n -u)
    if [ -z "$prs" ]; then
      echo "_No merged pull requests found._"
    else
      local number url title
      while IFS=$'\t' read -r number url title; do
        echo "- [#$number $(printf '%s' "$title" | md_escape)]($url)"
      done <<<"$prs"
    fi
  fi
  echo
  echo "> Only merged PRs into \`$SOURCE_BRANCH\` associated with commits in the range are listed. Direct commits are not, so see the link above for the complete set of changes."
  echo
  echo "<!-- source-sha: $SOURCE_SHA -->"
}

# Creates a commit on top of the current dist base that only sets DIST_FILE to the build, and prints its SHA.
make_commit() {
  local index="$WORK_DIR/index" blob tree
  blob=$(dist_git hash-object -w -- "$ARTIFACT")
  rm -f "$index"
  GIT_INDEX_FILE="$index" dist_git read-tree "$base_sha"
  GIT_INDEX_FILE="$index" dist_git update-index --add --cacheinfo "100644,$blob,$DIST_FILE"
  tree=$(GIT_INDEX_FILE="$index" dist_git write-tree)
  dist_git -c user.name="$BOT_NAME" -c user.email="$BOT_EMAIL" \
    commit-tree "$tree" -p "$base_sha" -m "$PR_TITLE" -m "Source: $SOURCE_REPO@$SOURCE_SHA"
}

# True when the remote automation branch already holds this build on top of the current base, and nothing else.
branch_has_build() {
  [ -n "$branch_sha" ] \
    && [ "$(blob_at "$branch_sha")" = "$build_blob" ] \
    && dist_git merge-base --is-ancestor "$base_sha" "$branch_sha" \
    && dist_git diff --quiet "$base_sha" "$branch_sha" -- ":(exclude)$DIST_FILE"
}

normalize() { tr -d '\r'; }

for ((attempt = 1; attempt <= MAX_ATTEMPTS; attempt++)); do
  log "Attempt $attempt of $MAX_ATTEMPTS"
  load_state
  [ -z "$state_changed" ] || continue

  # Re-running an older run must not replace a newer build that is already proposed.
  if [ -n "$open_number" ]; then
    open_sha=$(printf '%s' "$open_body" | marker_sha)
    if [ -n "$open_sha" ] && [ "$open_sha" != "$SOURCE_SHA" ] \
      && src_git cat-file -e "$open_sha^{commit}" 2>/dev/null \
      && src_git merge-base --is-ancestor "$SOURCE_SHA" "$open_sha"; then
      log "Open dist PR #$open_number already contains newer source commit $open_sha; nothing to do"
      exit 0
    fi
  fi

  if [ "$build_blob" = "$(blob_at "$base_sha")" ]; then
    if [ -z "$open_number" ]; then
      log "Build is identical to $DIST_REPO $DIST_BASE and no automation PR is open; nothing to do"
      exit 0
    fi
    action=close
  else
    action=upsert
  fi

  seen="$base_sha|$baseline_number|$open_number|$branch_sha"
  body_file="$WORK_DIR/body.md"
  if [ "$action" = upsert ]; then
    render_body > "$body_file"
    if branch_has_build; then
      log "Branch $DIST_BRANCH already contains this build at $branch_sha"
    else
      new_sha=$(make_commit)
      if ! dist_git push --quiet --force-with-lease="refs/heads/$DIST_BRANCH:$branch_sha" \
        origin "$new_sha:refs/heads/$DIST_BRANCH"; then
        log "Push to $DIST_BRANCH was rejected; the branch changed since it was read"
        continue
      fi
      log "Pushed $new_sha to $DIST_BRANCH"
      seen="$base_sha|$baseline_number|$open_number|$new_sha"
    fi
  fi

  # A dist PR may have been merged or changed while building the body or pushing.
  load_state
  if [ -n "$state_changed" ] || [ "$base_sha|$baseline_number|$open_number|$branch_sha" != "$seen" ]; then
    log "Dist state changed during publication; recalculating"
    continue
  fi

  if [ "$action" = close ]; then
    dist_gh pr close "$open_number" -R "$DIST_REPO" --comment \
      "Closing as stale: the build of $SOURCE_REPO@$SOURCE_SHA is identical to \`$DIST_BASE\`, so this automation PR is no longer needed." \
      || die "Cannot close stale dist PR #$open_number"
    log "Closed stale dist PR #$open_number"
  elif [ -n "$open_number" ]; then
    if [ "$(printf '%s' "$open_body" | normalize)" = "$(normalize < "$body_file")" ]; then
      log "Dist PR $open_url is up to date"
    else
      dist_gh pr edit "$open_number" -R "$DIST_REPO" --body-file "$body_file" \
        || die "Cannot update dist PR #$open_number"
      log "Updated dist PR $open_url"
    fi
  else
    dist_gh pr create -R "$DIST_REPO" --base "$DIST_BASE" --head "$DIST_BRANCH" \
      --title "$PR_TITLE" --body-file "$body_file" \
      || die "Cannot create dist PR"
  fi
  exit 0
done

die "Dist state kept changing for $MAX_ATTEMPTS attempts; re-run the workflow"
