def NAMESPACE_KUBERNETES
def VALUES_CHART
def ENVIRONMENT_INFRA

pipeline {
    agent any
    
    stages {

        stage('Config Variables') {
            steps {
                script {
                    switch(STAGE) {
                        case 'development':
                           NAMESPACE_KUBERNETES = sh(returnStdout: true, script: 'echo pgn-development').trim()
                           VALUES_CHART = sh(returnStdout: true, script: 'echo ./chart/data/values-development.yaml').trim()
                           ENVIRONMENT_INFRA = sh(returnStdout: true, script: 'echo development').trim()
                           KUBE_CONFIG = sh(returnStdout: true, script: 'echo kube-config').trim()
                        break
                        case 'staging-qa':
                           NAMESPACE_KUBERNETES = sh(returnStdout: true, script: 'echo pgnmobile-staging').trim()
                           VALUES_CHART = sh(returnStdout: true, script: 'echo ./chart/data/values-staging.yaml').trim()
                           ENVIRONMENT_INFRA = sh(returnStdout: true, script: 'echo staging').trim()
                           KUBE_CONFIG = sh(returnStdout: true, script: 'echo kube-config-staging').trim()
                        break
                        case 'main':
                           NAMESPACE_KUBERNETES = sh(returnStdout: true, script: 'echo pgnmobile-production').trim()
                           VALUES_CHART = sh(returnStdout: true, script: 'echo ./chart/data/values-production.yaml').trim()
                           ENVIRONMENT_INFRA = sh(returnStdout: true, script: 'echo production').trim()
                           KUBE_CONFIG = sh(returnStdout: true, script: 'echo kube-config-prod').trim()
                        break
                        case '1-devsecops-setup-cicd-use-jenkins':
                           NAMESPACE_KUBERNETES = sh(returnStdout: true, script: 'echo pgn-development').trim()
                           VALUES_CHART = sh(returnStdout: true, script: 'echo ./chart/data/values-development.yaml').trim()
                           ENVIRONMENT_INFRA = sh(returnStdout: true, script: 'echo development').trim()
                        break
                        default:
                            println("Branch not defined for value ${STAGE}")
                            currentBuild.getRawBuild().getExecutor().interrupt(Result.FAILURE)
                    }
                }
            }
        }

        stage('Deploy Apps') {
            agent {
                docker {
                    image 'dtzar/helm-kubectl'
                    args '--entrypoint='
                    args '--dns 10.129.1.3'
                    label 'LinuxSlave01'
                }
            }

            steps {
                withKubeConfig([credentialsId: "${KUBE_CONFIG}" ]) {
                    sh "echo Deploying ${PROJECT_NAME} to ${ENVIRONMENT_INFRA} using image.tag=${APP_VERSION} && \
                    ./deploy.sh ${APP_VERSION} ${VALUES_CHART} ${NAMESPACE_KUBERNETES}"
                }
            }            
        }
    }
}