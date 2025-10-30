#!/bin/bash
set +e

# Validasi input parameters
if [[ -z "$GITHUB_TOKEN" ]] || [[ -z "$REPO_OWNER" ]] || [[ -z "$PACKAGE_NAME" ]]; then
  echo "❌ Error: Required environment variables are missing"
  echo "Required: GITHUB_TOKEN, REPO_OWNER, PACKAGE_NAME"
  exit 1
fi

echo "🔍 Checking package version for ${PACKAGE_NAME}..."

# Fetch package versions dengan menangkap HTTP code
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/orgs/${REPO_OWNER}/packages/maven/${PACKAGE_NAME}/versions")

# Pisahkan body dan HTTP code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📡 HTTP Code: $HTTP_CODE"

# Debug: tampilkan response body jika dibutuhkan
if [[ "${DEBUG}" == "true" ]]; then
  echo "📄 Response Body: $BODY"
fi

# Cek apakah package tidak ditemukan
if [[ "$HTTP_CODE" == "404" ]] || echo "$BODY" | grep -q "Package not found"; then
  echo "⚠️  Package ${PACKAGE_NAME} not found in org ${REPO_OWNER}"
  echo "📦 Using default version 1.0.0"
  LATEST_VERSION="1.0.0"
else
  LATEST_VERSION=$(echo "$BODY" | grep -m1 '"name":' | sed -E 's/.*"name": *"([^"]+)".*/\1/')
  
  if [[ -z "$LATEST_VERSION" ]]; then
    echo "⚠️  No versions found for package ${PACKAGE_NAME}"
    echo "📦 Using default version 1.0.0"
    LATEST_VERSION="1.0.0"
  else
    echo "✅ Latest version found: $LATEST_VERSION"
  fi
fi

# Parse version components
BASE_VERSION=$(echo "$LATEST_VERSION" | cut -d'-' -f1)
MAJOR=$(echo "$BASE_VERSION" | cut -d'.' -f1)
MINOR=$(echo "$BASE_VERSION" | cut -d'.' -f2)
PATCH=$(echo "$BASE_VERSION" | cut -d'.' -f3)

# Validasi dan set default jika kosong
if [[ -z "$MAJOR" ]] || [[ "$MAJOR" == "null" ]] || [[ -z "$MINOR" ]] || [[ "$MINOR" == "null" ]]; then
  echo "⚠️  Invalid version format, resetting to 1.0.0"
  MAJOR=1
  MINOR=0
  PATCH=0
fi

if [[ -z "$PATCH" ]] || [[ "$PATCH" == "null" ]] || [[ "$PATCH" == "" ]]; then
  PATCH=0
fi

# Increment patch version
NEW_PATCH=$((PATCH + 1))
MVN_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"

echo "🆕 New version will be: $MVN_VERSION"

# Export ke GitHub Environment dan Output
echo "MVN_VERSION=$MVN_VERSION" >> $GITHUB_ENV
echo "MVN_VERSION=$MVN_VERSION" >> $GITHUB_OUTPUT

# Return version untuk testing lokal
echo "$MVN_VERSION"