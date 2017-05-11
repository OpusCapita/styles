// Add the predetermined variables: path to release script and mail recipient list.
def releaseScriptPath = '/opt/work/jenkins/jobs/release-tools-update/workspace/releaseDVCSApp.groovy'
// Sending mail notifications
def mailRecepientList = 'jcatalog-build@list.scand, jcatalog-build-proc@list.scand'

def BUILD_SUCCESS = hudson.model.Result.SUCCESS
def BUILD_FAILURE = hudson.model.Result.FAILURE

// Defined on stage 'Checkout sources'
def scmRevision
def scmChanges
def scmChangesAuthor

// Add the predetermined functions
def sendEmail(mailRecepientList, buildStatus, scmChanges, scmChangesAuthor) {
  mail body: """${env.BUILD_URL}console
$scmChanges $scmChangesAuthor \n
${currentBuild.rawBuild.getLog(15).join('\n')}
""",
    from: 'jenkins-proc@jcloud.scand',
    subject: """Build $buildStatus: ${env.JOB_NAME} #${env.BUILD_NUMBER}""",
    to: '' + mailRecepientList + ''
}
// Executing release script using external parameters like ticket, plugin Release version, next CS version.
def releaseGrailsPlugin(releaseScript, ticket, pluginReleaseVersion, nextCsVersion) {
  sh "groovy $releaseScript -t $ticket -r $pluginReleaseVersion -s $nextCsVersion-SNAPSHOT"
}

// Updating dependencies.
def yarn() {
  sh "yarn"
}

def npmLint() {
  sh "npm run lint"
}

// Run client tests for NodeJS app
def npmTestClient() {
  sh "npm run test-client"
}

// Run server tests for NodeJS app
def npmTestServer() {
  sh "npm run test-server"
}

// Build app
def npmBuild() {
  sh "npm run npm-build"
}

// Documentation deploy
def npmRamldoc() {
  sh "npm run ramldoc"
}

// Generate Git documentation
def npmGitbook() {
  sh "npm run gitbook"
}

// Generate Git documentation
def npmGitDemo() {
  sh "sh gh-pages-update.sh"
}

// Clean repo before deploy to maven
def npmPrune() {
  sh "npm prune --production"
}

// Deploying to Maven.
def mavenDeploy() {
  sh "mvn deploy --batch-mode"
}

// Rollback changes if release failed.
def releaseRollbackChanges(ticket, scmRevision) {
  sh 'git reset ' + scmRevision + ' '
  sh 'git commit -am "(' + ticket + ') Release rollback changes to ' + scmRevision + ' revision"'
  sh 'git push'
}


node {
  // Add build tools class for using variables for committing as user who started job and variables for release.
  wrap([$class: 'BuildUser']) {
    // Add timestamps for every output.
    timestamps {
      // Get external job values
      def user = env.BUILD_USER
      def user_id = env.BUILD_USER_ID
      def ticket = env.TICKET_NUMBER
      def pluginReleaseVersion = env.PLUGIN_RELEASE_VERSION
      def nextCsVersion = env.NEXT_CS_VERSION
      // Set git user info
      sh 'git config user.email "jenkins-core@scand.com"'
      sh 'git config user.name "jenkins-core"'
      // Set working enviroment.
      def groovyHome = tool name: 'Groovy-2.1.0'
      def nodeHome = tool name: 'NodeJS 6.9.4'
      def yarnHome = tool name: 'yarn-v0.21.3', type: 'com.cloudbees.jenkins.plugins.customtools.CustomTool'
      def mvnHome = tool name: 'maven3', type: 'maven'
      //def CheckSecuredResources
      env.JAVA_HOME = tool name: 'jdk1.8.0_31', type: 'jdk'
      env.M2_HOME = mvnHome
      env.PATH = "${groovyHome}/bin:${nodeHome}/bin:${yarnHome}:${env.JAVA_HOME}/bin:${mvnHome}/bin:${env.PATH}"
      // Checkout and update resources.
      stage('Checkout sources') {
        checkout scm
        sh(returnStdout: true, script: 'git reset --hard').trim()
        sh(returnStdout: true, script: 'git clean -fdx').trim()
        scmRevision = sh(returnStdout: true, script: 'git rev-parse refs/remotes/origin/master^{commit}').trim()
        scmChanges = sh(returnStdout: true, script: 'git log --pretty=format:"%cN %s" -n1 --branches=master').trim()
        scmChangesAuthor = sh(returnStdout: true, script: 'git log --pretty=format:"%cN" -n1 --branches=master').trim()
      }
      stage('Validate release enviroment tools') {
        // Validate release_script_path
        File releaseFile = new File(releaseScriptPath)
        if (!releaseFile.exists()) {
          println "[$BUILD_FAILURE] Release script '$releaseScriptPath' does not exist!"
          sendEmail(mailRecepientList, BUILD_FAILURE.toString(), scmChanges, scmChangesAuthor)
          sh 'exit 1'
        }
      }

      // Commit with user who started job
      withEnv(['HGUSER=' + user + ' <' + user_id + '@scand.com>']) {
        try {
          // STAGE 1: Run Release script if necessary to do release
          if (ticket && pluginReleaseVersion && nextCsVersion) {
            stage('Before release grails plugin (grails)') {
              releaseGrailsPlugin(releaseScriptPath, ticket, pluginReleaseVersion, nextCsVersion)
            }
          } else {
            println "[INFO] SKIP RELEASE..."
          }

          stage('Yarn install and update dependencies (yarn)') {
            yarn()
          }

          // STAGE 2: Run Build
          stage('Run updated git demo (npm)') {
            npmGitDemo()
          }

          // STAGE 3: Run Build
          stage('Run build (npm)') {
            npmBuild()
          }

          // STAGE 4: Clean dependencies before deploy
          stage('Prune dependencies (npm)') {
            npmPrune()
          }

          // STAGE 5: Clean dependencies before deploy
          stage('Deploy artifact (maven)') {
            mavenDeploy()
          }

          // STAGE 11: Run Release script if necessary to Advance version
          if (ticket && pluginReleaseVersion && nextCsVersion) {
            stage('After release grails plugin (grails)') {
              releaseGrailsPlugin(releaseScriptPath, ticket, pluginReleaseVersion, nextCsVersion)
            }
          } else {
            println "[INFO] SKIP AFTER RELEASE..."
          }
        } catch (error) {
          // Send mail, if some stage failed
          sendEmail(mailRecepientList, BUILD_FAILURE.toString(), scmChanges, scmChangesAuthor)
          //  If was released and It failed - rollback changes.
          if (ticket && pluginReleaseVersion && nextCsVersion) {
            releaseRollbackChanges(ticket, scmRevision)
          }
          throw error
        } finally {
          // Send message in Jira
          step([$class       : 'hudson.plugins.jira.JiraIssueUpdater',
                issueSelector: [$class: 'hudson.plugins.jira.selector.DefaultIssueSelector'],
                scm          : scm])
          // Send mail, if some stage fixed
          if ((currentBuild.rawBuild.previousBuild?.result == BUILD_FAILURE) &&
            (currentBuild.result == BUILD_SUCCESS.toString())) {
            sendEmail(mailRecepientList, 'FIXED', scmChanges, scmChangesAuthor)
          }
        }
      }
    }
  }
}
