pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "issue-tracker-backend:latest"
        FRONTEND_IMAGE = "issue-tracker-frontend:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/ParthSinghTomar2374/Project-Management-MERN-App'
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

        stage('Deploy Containers') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker compose down || true'
                        sh 'docker compose up -d'
                    } else {
                        bat 'docker-compose down || verify >nul'
                        bat 'docker-compose up -d'
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully! Frontend running at http://localhost:5173, Backend at http://localhost:5000"
        }
        failure {
            echo "Pipeline failed. Check stage logs for details."
        }
    }
}
