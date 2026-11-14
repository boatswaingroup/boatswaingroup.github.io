#!/usr/bin/env bash
set -Eeuo pipefail

# Import the authorized reference repository into this project as a nested
# foundation snapshot. It does not rewrite this repository's history or
# overwrite its existing website. Run from the root of a local clone of the
# Boatswain destination repository.
SOURCE_URL="${SOURCE_URL:-https://github.com/demtaiwo1-eng/Winning-game-.git}"
DEST_DIR="${DEST_DIR:-foundation/Winning-game}"
BRANCH="${BRANCH:-foundation/import-winning-game}"
TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

if [[ ! -d .git ]]; then
  echo "ERROR: Run this script from the root of a local clone of boatswaingroup/boatswaingroup.github.io." >&2
  exit 1
fi
if [[ -e "$DEST_DIR" ]]; then
  echo "ERROR: $DEST_DIR already exists. Move/review it before importing; refusing to overwrite." >&2
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: Git is required." >&2
  exit 1
fi

echo "Cloning authorized foundation: $SOURCE_URL"
git clone --depth 1 --single-branch "$SOURCE_URL" "$TMP_DIR/source"

mkdir -p "$(dirname "$DEST_DIR")"
mkdir -p "$DEST_DIR"
# Preserve repository contents, including dotfiles, but do not nest the source
# .git directory, caches, installed dependencies, or generated build outputs.
tar -C "$TMP_DIR/source" \
  --exclude='./.git' \
  --exclude='./node_modules' \
  --exclude='./**/node_modules' \
  --exclude='./.next' \
  --exclude='./dist' \
  --exclude='./build' \
  --exclude='./coverage' \
  -cf - . | tar -C "$DEST_DIR" -xf -

cat > "$DEST_DIR/BOATSWAIN-FOUNDATION-NOTE.md" <<'NOTE'
# Imported reference foundation

This is a snapshot of the authorized demtaiwo1-eng/Winning-game- repository,
imported as a reference foundation for Boatswain Group. The original upstream
repository is not modified. Review dependencies, secrets, licences/notices,
security posture, workflows and deployment assumptions before executing or
deploying any imported component. Do not copy upstream secrets or production
data into this project.
NOTE

git switch -c "$BRANCH"
git add "$DEST_DIR"
git commit -m "chore: import authorized Winning-game foundation snapshot"
git push -u origin "$BRANCH"

echo
echo "Foundation snapshot committed and pushed on branch: $BRANCH"
echo "Open a pull request into main after reviewing the imported tree."
