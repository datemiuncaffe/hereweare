module.exports = function (shipit) {
	require('shipit-deploy')(shipit);
	
  shipit.initConfig({
  default: {
      workspace: '/home/federico/Documents/ehour/projects/hereweare-frontend',
      deployTo: '/opt/hereweare-frontend',
      repositoryUrl: 'https://github.com/datemiuncaffe/hereweare-frontend.git',
//      ignores: ['.git', 'node_modules'],
//      keepReleases: 2,
//      deleteOnRollback: false,
      key: '/home/federico/.ssh/id_rsa_sensei'
//      shallowClone: true
    },
    staging: {
      servers: 'centos@192.168.88.158'
    }
  });

  shipit.task('pwd', function () {
    return shipit.remote('pwd');
  });
};