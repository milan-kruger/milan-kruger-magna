#!/bin/bash
set -e

# Usage: ./build-and-deploy-artefact.sh [DIST_NAME] [DEPLOY]
DIST_NAME=${1:-Transgressions-FE}
DEPLOY=${2:-false}  # Optional second parameter to control deployment
DIST_DIR="dist"
OUTPUT_DIR="build"
VERSION=$(jq -r '.version' package.json)   # requires jq

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: $DIST_DIR directory does not exist!"
  echo "   Please build the project first (e.g., npm run build or yarn build)"
  exit 1
fi

# Check if dist directory is not empty
if [ ! "$(ls -A $DIST_DIR)" ]; then
  echo "❌ Error: $DIST_DIR directory is empty!"
  echo "   Please build the project first to generate distribution files"
  exit 1
fi

echo "✅ Found $DIST_DIR directory with content"

# Clear and recreate output directory
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Optional: include a VERSION.txt file inside dist
echo "Version: $VERSION" > "$DIST_DIR/VERSION.txt"

# Create the zip file with version (contents only, no dist folder)
ZIP_NAME="$DIST_NAME-$VERSION.zip"
(
  cd "$DIST_DIR"
  zip -r "../$OUTPUT_DIR/$ZIP_NAME" .
)

echo "✅ Created $OUTPUT_DIR/$ZIP_NAME"

# Deploy to Maven repository if requested
if [ "$DEPLOY" = "true" ] || [ "$DEPLOY" = "1" ]; then
  echo "🚀 Deploying to Maven repository..."

  mvn deploy:deploy-file \
    -Dfile="$OUTPUT_DIR/$ZIP_NAME" \
    -DrepositoryId=github-packages-magnabc \
    -Durl=https://maven.pkg.github.com/MagnaBC/Trafman-Transgressions-FE \
    -DgroupId=za.co.magnabc.transgressions \
    -DartifactId=transgressions-fe \
    -Dversion="$VERSION" \
    -Dpackaging=zip \
    -Dclassifier="dist" \
    -DgeneratePom=false

  echo "✅ Successfully deployed $ZIP_NAME to Maven repository"
else
  echo "ℹ️  To deploy to Maven repository, run: ./build-and-deploy-artefact.sh $DIST_NAME true"
fi
