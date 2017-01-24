#!/bin/bash

# hereweare-frontend -
# build-deploy script for hereweare frontend
# run as:
# bash -x build-deploy.sh buildcomplete
#

build()
{
  echo -n $"building hereweare-frontend ..."
  gulp --cwd ./../../../ build
  RETVAL=$?
  echo [ $RETVAL -eq 0 ]
}

buildcomplete()
{
  echo -n $"full building hereweare-frontend ..."
  gulp --cwd ./../../../ buildcomplete
  RETVAL=$?
  echo [ $RETVAL -eq 0 ]
}

clean()
{
  echo -n $"cleaning hereweare-frontend build folder ..."
  gulp --cwd ./../../../ clean
  RETVAL=$?
  echo [ $RETVAL -eq 0 ]
}

deploy()
{
  echo -n $"deploying hereweare-frontend to ehour machine ..."
  gulp --cwd ./../../../ deploy
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
  status)
    status $node
    RETVAL=$?
    ;;
  *)
    echo "Usage: $0 {build|buildcomplete|clean|deploy|status}"
    RETVAL=1
esac
exit $RETVAL
