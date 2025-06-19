
pipeline {
    agent any
        parameters {
            string(name: 'HEADER')
            string(name: 'NAMESPACE_KUBERNETES')
            string(name: 'KUBE_CONFIG')
            string(name: 'APP_VERSION')
            string(name: 'URL')
            string(name: 'ENVIRONMENT_INFRA') 
        }

    stages {

        stage('Deploy Apps') {
            agent {
                docker {
                    image 'dtzar/helm-kubectl'
                    args '--entrypoint='
                    args '--dns 10.129.1.3'
                }
            }

            steps {
                script{
                    def VALUES_CHART = 'chart'
                    if (HEADER.contains('relyon')) {
                        echo "chart for ${HEADER}"
                        VALUES_CHART='relyon'
                    } 
                    echo "${params.APP_VERSION} --./${VALUES_CHART}/data/values-${params.ENVIRONMENT_INFRA}.yaml -- ${params.NAMESPACE_KUBERNETES} -- ${header.split('-')[0]} --${params.URL} "
                    withKubeConfig([credentialsId: "${params.KUBE_CONFIG}" ]) {
                        sh """
                            ./deploy.sh \
                            "${params.APP_VERSION}" \
                            "./${VALUES_CHART}/data/values-${params.ENVIRONMENT_INFRA}.yaml" \
                            "${params.NAMESPACE_KUBERNETES}" \
                            "${header.split('-')[0]}" \
                            "${params.URL}"
                        """
                    }
                }
            }            
        }
    }
}
