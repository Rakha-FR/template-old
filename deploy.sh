#!/bin/bash

APP_VERSION="$1"
VALUES_CHART="$2"
NAMESPACE_KUBERNETES="$3"
PROJECT_NAME="$4"
URL="$5"

if [ -z $APP_VERSION ]; then echo "APP_VERSION is required"; exit 1; fi
if [ -z $VALUES_CHART ]; then echo "VALUES_CHART is required"; exit 1; fi
if [ -z $NAMESPACE_KUBERNETES ]; then echo "NAMESPACE_KUBERNETES is required"; exit 1; fi

sed -i "s/^appVersion:.*$/appVersion: $APP_VERSION/" "./chart/frontend/Chart.yaml"

kubectl config set-context --current --namespace="${NAMESPACE_KUBERNETES}"


if [ "$PROJECT_NAME" == "mobile" ]; then
   helm upgrade data-services ./chart/data/ --values $VALUES_CHART --namespace=$NAMESPACE_KUBERNETES \
    --install \
    --set image.version=$APP_VERSION \
    --set name.space=$NAMESPACE_KUBERNETES \
    --wait
else 
    helm upgrade data-services ./chart/data/ --values $VALUES_CHART --namespace=$NAMESPACE_KUBERNETES \
    --install \
    --set image.version=$APP_VERSION \
    --set name.space=$NAMESPACE_KUBERNETES \
    --set "ingress.hosts[0].host=$URL" \
        --set "ingress.tls[0].hosts[0]=$URL" \
        --set serviceAccount.name=relyon-vault \
        --set vault.annotations."vault\.hashicorp\.com/role"="relyon-development" \
    --wait
fi
