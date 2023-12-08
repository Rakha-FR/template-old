#!/bin/bash

APP_VERSION=$1
VALUES_CHART=$2
NAMESPACE_KUBERNETES=$3
TYPE_APP=$4

if [ -z $APP_VERSION ]; then echo "APP_VERSION is required"; exit 1; fi
if [ -z $VALUES_CHART ]; then echo "VALUES_CHART is required"; exit 1; fi
if [ -z $NAMESPACE_KUBERNETES ]; then echo "NAMESPACE_KUBERNETES is required"; exit 1; fi

sed -i "s/^appVersion:.*$/appVersion: $APP_VERSION/" "./chart/data/Chart.yaml"

kubectl config set-context --current --namespace="${NAMESPACE_KUBERNETES}"

helm upgrade data-services ./chart/data/ --values $VALUES_CHART --namespace=$NAMESPACE_KUBERNETES \
--install \
--set image.version=$APP_VERSION \
--set name.space=$NAMESPACE_KUBERNETES