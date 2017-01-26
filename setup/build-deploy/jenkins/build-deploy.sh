#!/bin/bash

# hereweare
# build-deploy script for hereweare
# run as:
# bash -x build-deploy.sh buildcomplete
#

installDeps()
{
  echo -n $"installing hereweare dependencies via npm ..."
  npm install
}

build()
{
  echo -n $"building hereweare ..."
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
  echo -n $"full building hereweare ..."
  installDeps
  gulp buildcomplete
  RETVAL=$?
  echo [ $RETVAL -eq 0 ]
}

clean()
{
  echo -n $"cleaning hereweare build folder ..."
  gulp clean
  RETVAL=$?
  echo [ $RETVAL -eq 0 ]
}

deploy()
{
  echo -n $"deploying hereweare to ehour machine ..."
  gulp deploy
  RETVAL=$?
  echo [ $RETVAL -eq 0 ]
}

delivery-pipeline()
{
  echo -n $"hereweare delivery pipeline ..."
  gulp delivery-pipeline
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
  status)
    status $node
    RETVAL=$?
    ;;
  *)
    echo "Usage: $0 {build|buildcomplete|clean|deploy|delivery-pipeline|status}"
    RETVAL=1
esac
exit $RETVAL
