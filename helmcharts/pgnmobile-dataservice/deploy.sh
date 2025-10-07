#!/bin/bash

APP_VERSION="$1"
VALUES_CHART="$2"
NAMESPACE_KUBERNETES="$3"
PROJECT_NAME="$4"


if [ -z $APP_VERSION ]; then echo "APP_VERSION is required"; exit 1; fi
if [ -z $VALUES_CHART ]; then echo "VALUES_CHART is required"; exit 1; fi
if [ -z $NAMESPACE_KUBERNETES ]; then echo "NAMESPACE_KUBERNETES is required"; exit 1; fi

if [[ "$PROJECT_NAME" == "mobile" ]]; then
  echo "==== $PROJECT_NAME  mobix  ===="
  kubectl config set-context --current --namespace="${NAMESPACE_KUBERNETES}"

  sed -i "s/^appVersion:.*$/appVersion: $APP_VERSION/" "./mobile/data/Chart.yaml"

  helm upgrade data-services ./mobile/data/ \
    --values "$VALUES_CHART" \
    --namespace "$NAMESPACE_KUBERNETES" \
    --install \
    --set image.version="$APP_VERSION" \
    --set name.space="$NAMESPACE_KUBERNETES" \
    --wait

else
  echo "==== $PROJECT_NAME   relyonnnn ===="
  sed -i "s/^appVersion:.*$/appVersion: $APP_VERSION/" "./relyon/data/Chart.yaml"

  helm upgrade data-services ./relyon/data/ \
    --values "$VALUES_CHART" \
    --namespace "$NAMESPACE_KUBERNETES" \
    --install \
    --set image.version="$APP_VERSION" \
    --set name.space="$NAMESPACE_KUBERNETES" \
    --wait
fi
