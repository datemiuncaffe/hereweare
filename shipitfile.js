module.exports = function (shipit) {
	require('shipit-deploy')(shipit);

  shipit.initConfig({
  default: {
      workspace: '/home/federico/Documents/ehour/projects/hereweare',
      deployTo: '/opt/hereweare',
      repositoryUrl: 'https://github.com/datemiuncaffe/hereweare.git',
//      ignores: ['.git', 'node_modules'],
//      keepReleases: 2,
//      deleteOnRollback: false,
      key: '/home/federico/.ssh/id_rsa_sensei',
			branch: 'speed'
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
