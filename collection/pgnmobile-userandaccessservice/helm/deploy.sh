APP_VERSION="$1"
ENV_SERVER="$2"
NAMESPACE_KUBERNETES="$3"
PROJECT_NAME="$4"

if [ -z $APP_VERSION ]; then echo "APP_VERSION is required"; exit 1; fi
if [ -z $ENV_SERVER ]; then echo "ENV_SERVER is required"; exit 1; fi
if [ -z $NAMESPACE_KUBERNETES ]; then echo "NAMESPACE_KUBERNETES is required"; exit 1; fi
if [ -z $PROJECT_NAME ]; then echo "PROJECT_NAME is required"; exit 1; fi

kubectl config set-context --current --namespace="${NAMESPACE_KUBERNETES}"
if [[ "$PROJECT_NAME" != *"development-pdp"* && "$PROJECT_NAME" != *"relyon"* ]]; then
    echo "mobile"
elif [[ "$PROJECT_NAME" == *"relyon"* ]]; then
    echo "relyon ===="
    # helm upgrade proxy-services ./relyon/proxy/ \
    #     --values ./relyon/proxy/values-$ENV_SERVER.yaml \
    #     --namespace "$NAMESPACE_KUBERNETES" \
    #     --install \
    #     --set image.version="$APP_VERSION" \
    #     --set name.space="$NAMESPACE_KUBERNETES" \
    #     --wait
elif [[ "$PROJECT_NAME" == *"development-pdp"* ]]; then
    echo "pdp"
    # sed -i "s/^appVersion:.*$/appVersion: $APP_VERSION/" "./pdp/proxy/Chart.yaml"
    # helm upgrade proxy-services-pdp ./pdp/proxy/ --values ./pdp/proxy/values-development.yaml --namespace=$NAMESPACE_KUBERNETES \
    # --install \
    # --set image.version=$APP_VERSION \
    # --set name.space=$NAMESPACE_KUBERNETES \
    # --wait
fi