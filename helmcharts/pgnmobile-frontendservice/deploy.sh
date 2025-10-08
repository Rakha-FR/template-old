#!/bin/bash

APP_VERSION="$1"
ENV_SERVER="$2"
NAMESPACE_KUBERNETES="$3"
PROJECT_NAME="$4"

if [ -z $APP_VERSION ]; then echo "APP_VERSION is required"; exit 1; fi
if [ -z $ENV_SERVER ]; then echo "ENV_SERVER is required"; exit 1; fi
if [ -z $NAMESPACE_KUBERNETES ]; then echo "NAMESPACE_KUBERNETES is required"; exit 1; fi
if [ -z $PROJECT_NAME ]; then echo "PROJECT_NAME is required"; exit 1; fi

kubectl config set-context --current --namespace="${NAMESPACE_KUBERNETES}"

if [[ "$PROJECT_NAME" == *mobile* ]]; then
  echo "$PROJECT_NAME mobile"
  sed -i "s/^appVersion:.*$/appVersion: $APP_VERSION/" "./mobile/frontend/Chart.yaml"  
  helm upgrade frontend-services ./mobile/frontend/ \
    --values ./mobile/frontend/values-$ENV_SERVER.yaml \
    --namespace "$NAMESPACE_KUBERNETES" \
    --install \
    --set image.version="$APP_VERSION" \
    --set name.space="$NAMESPACE_KUBERNETES" \
    --wait
elif [[ "$PROJECT_NAME" == *pdp* ]]; then
  echo "$PROJECT_NAME pdp"
  sed -i "s/^appVersion:.*$/appVersion: $APP_VERSION/" "./pdp/frontend/Chart.yaml"  
  helm upgrade frontend-services-pdp ./pdp/frontend/ \
    --values ./pdp/frontend/values-$ENV_SERVER.yaml \
    --namespace "$NAMESPACE_KUBERNETES" \
    --install \
    --set image.version="$APP_VERSION" \
    --set name.space="$NAMESPACE_KUBERNETES" \
    --wait
else
  echo "$PROJECT_NAME relyon"
  sed -i "s/^appVersion:.*$/appVersion: $APP_VERSION/" "./relyon/frontend/Chart.yaml"  
  helm upgrade frontend-services ./relyon/frontend/ \
    --values ./relyon/frontend/values-$ENV_SERVER.yaml \
    --namespace "$NAMESPACE_KUBERNETES" \
    --install \
    --set image.version="$APP_VERSION" \
    --set name.space="$NAMESPACE_KUBERNETES" \
    --wait
fi