pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "issue-tracker-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "issue-tracker-frontend:${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/ParthSinghTomar2374/Project-Management-MERN-App']],
                    extensions: [[$class: 'PathRestriction', excludedRegions: 'k8s/.*']]
                ])
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker build -t ${BACKEND_IMAGE} ./backend"
                    } else {
                        bat "docker build -t ${BACKEND_IMAGE} ./backend"
                    }
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh "docker build --build-arg VITE_API_URL=http://localhost:5000/api -t ${FRONTEND_IMAGE} ./frontend"
                    } else {
                        bat "docker build --build-arg VITE_API_URL=http://localhost:5000/api -t ${FRONTEND_IMAGE} ./frontend"
                    }
                }
            }
        }

        stage('Update Manifests') {
            steps {
                bat '''powershell -NoProfile -Command "(Get-Content k8s/backend.yaml) -replace 'image: issue-tracker-backend:.*', 'image: issue-tracker-backend:%BUILD_NUMBER%' | Set-Content -Encoding ascii k8s/backend.yaml"'''
                bat '''powershell -NoProfile -Command "(Get-Content k8s/frontend.yaml) -replace 'image: issue-tracker-frontend:.*', 'image: issue-tracker-frontend:%BUILD_NUMBER%' | Set-Content -Encoding ascii k8s/frontend.yaml"'''
            }
        }

        stage('Push Manifests to Git') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-creds', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    bat 'git config user.email "jenkins@local"'
                    bat 'git config user.name "Jenkins"'
                    bat 'git add k8s'
                    bat 'git commit -m "ci: deploy build %BUILD_NUMBER%"'
                    bat 'git push https://%GIT_USER%:%GIT_TOKEN%@github.com/ParthSinghTomar2374/Project-Management-MERN-App.git HEAD:main'
                }
            }
        }
    }

    post {
        success {
            echo "Build ${BUILD_NUMBER} pushed to Git. Argo CD will deploy it (https://localhost:8443)."
        }
        failure {
            echo "Pipeline failed. Check stage logs for details."
        }
    }
}