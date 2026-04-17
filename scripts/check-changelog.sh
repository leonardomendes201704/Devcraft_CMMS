#!/usr/bin/env bash
set -euo pipefail

mode="${1:-}"
repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

collect_files() {
  if [[ "$mode" == "--staged" ]]; then
    git diff --cached --name-only --diff-filter=ACMR
    return
  fi

  if [[ -n "${mode}" ]]; then
    git diff --name-only --diff-filter=ACMR "${mode}"
    return
  fi

  if [[ "${GITHUB_EVENT_NAME:-}" == "pull_request" ]]; then
    local base_ref="${GITHUB_BASE_REF:-main}"
    git fetch --no-tags --depth=1 origin "${base_ref}"
    git diff --name-only --diff-filter=ACMR "origin/${base_ref}...HEAD"
    return
  fi

  if [[ -n "${GITHUB_EVENT_BEFORE:-}" && "${GITHUB_EVENT_BEFORE}" != "0000000000000000000000000000000000000000" ]]; then
    git diff --name-only --diff-filter=ACMR "${GITHUB_EVENT_BEFORE}...${GITHUB_SHA:-HEAD}"
    return
  fi

  git diff --name-only --diff-filter=ACMR "HEAD~1...HEAD"
}

is_impact_file() {
  local file="$1"

  [[ "$file" == src/* ]] && return 0
  [[ "$file" == tests/* ]] && return 0
  [[ "$file" == tools/* ]] && return 0
  [[ "$file" == .github/workflows/* ]] && return 0
  [[ "$file" == docker-compose.yml || "$file" == docker-compose.prod.yml ]] && return 0
  [[ "$file" == Devcraft_CMMS.slnx ]] && return 0
  [[ "$file" == *.csproj || "$file" == *.props || "$file" == *.targets ]] && return 0
  [[ "$file" == */package.json || "$file" == */package-lock.json ]] && return 0

  return 1
}

mapfile -t changed_files < <(collect_files)
if [[ "${#changed_files[@]}" -eq 0 ]]; then
  exit 0
fi

changelog_changed=0
impactful_files=()

for file in "${changed_files[@]}"; do
  [[ "$file" == "CHANGELOG.md" ]] && changelog_changed=1
  if is_impact_file "$file"; then
    impactful_files+=("$file")
  fi
done

if [[ "${#impactful_files[@]}" -gt 0 && "$changelog_changed" -eq 0 ]]; then
  echo "ERROR: CHANGELOG.md must be updated whenever impactful files change."
  echo "Impactful files detected:"
  for file in "${impactful_files[@]}"; do
    echo " - $file"
  done
  echo "Add a changelog entry and try again."
  exit 1
fi

exit 0
