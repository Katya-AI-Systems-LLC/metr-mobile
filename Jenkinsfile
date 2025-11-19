// Jenkinsfile for METR
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        ANDROID_HOME = '/opt/android-sdk'
        GRADLE_OPTS = '-Dorg.gradle.daemon=false'
    }
    
    options {
        timeout(time: 60, unit: 'MINUTES')
        retry(2)
        timestamps()
        ansiColor('xterm')
    }
    
    tools {
        nodejs 'NodeJS-18'
        jdk 'JDK-17'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
                sh 'npm run type-check'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test -- --coverage'
            }
            post {
                always {
                    publishCoverage adapters: [
                        istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')
                    ]
                }
            }
        }
        
        stage('Build Android Debug') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    tag pattern: 'v.*', comparator: 'REGEXP'
                }
            }
            steps {
                dir('android') {
                    sh './gradlew clean assembleDebug'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'android/app/build/outputs/apk/debug/app-debug.apk', fingerprint: true
                }
            }
        }
        
        stage('Build Android Release') {
            when {
                tag pattern: 'v.*', comparator: 'REGEXP'
            }
            steps {
                withCredentials([file(credentialsId: 'android-keystore', variable: 'KEYSTORE_FILE')]) {
                    dir('android') {
                        sh './gradlew assembleRelease'
                    }
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'android/app/build/outputs/apk/release/app-release.apk', fingerprint: true
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed!'
            emailext(
                subject: "METR Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build failed. Check console output: ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL ?: 'devops@metr.app'}"
            )
        }
        unstable {
            echo 'Build unstable!'
        }
    }
}


