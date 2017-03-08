#!/bin/bash

# hereweare frontend
# build-deploy script for hereweare frontend
# run as:
# bash -x build-deploy.sh buildcomplete
#

PACKAGE_NAME="hereweare-frontend"

installDeps()
{
   echo -n $"installing $PACKAGE_NAME dependencies via npm ..."
   npm install
}

build()
{
   echo -n $"building $PACKAGE_NAME ..."
   #npm list gulp
   #GULP_CHECK=$?
   #if [ ! $GULP_CHECK -eq 0 ]; then
   #  npm install --save gulp
   #fi
   #gulp --cwd ./../../../ build
   installDeps
   gulp build
   RETVAL=$?
   echo [ $RETVAL -eq 0 ]
}

buildcomplete()
{
   echo -n $"full building $PACKAGE_NAME ..."
   installDeps
   gulp buildcomplete
   RETVAL=$?
   echo [ $RETVAL -eq 0 ]
}

clean()
{
   echo -n $"cleaning $PACKAGE_NAME build folder ..."
   gulp clean
   RETVAL=$?
   echo [ $RETVAL -eq 0 ]
}

deploy()
{
   echo -n $"deploying $PACKAGE_NAME to ehour machine ..."
   gulp deploy
   RETVAL=$?
   echo [ $RETVAL -eq 0 ]
}

delivery-pipeline()
{
   echo -n $"$PACKAGE_NAME delivery pipeline ..."
   installDeps
   gulp delivery-pipeline
   RETVAL=$?
   echo [ $RETVAL -eq 0 ]
}

sonar-pipeline()
{
   echo -n $"$PACKAGE_NAME sonar pipeline ..."
   installDeps
   gulp sonar-pipeline:test
   RETVAL=$?
   echo [ $RETVAL -eq 0 ]
}

RETVAL=0
case "$1" in
   build)
      build
      ;;
   buildcomplete)
      buildcomplete
      ;;
   clean)
      clean
      ;;
   deploy)
      deploy
      ;;
   delivery-pipeline)
      delivery-pipeline
      ;;
   sonar-pipeline)
      sonar-pipeline
      ;;
   status)
      status $node
      RETVAL=$?
      ;;
   *)
      echo "Usage: $0 {build|buildcomplete|clean|deploy|delivery-pipeline|sonar-pipeline|status}"
      RETVAL=1
esac
exit $RETVAL
