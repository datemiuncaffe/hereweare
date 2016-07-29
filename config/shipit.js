var config = {
	default: {
	  workspace: '/home/federico/Documents/ehour/projects/hereweare',
	  dirToCopy: '/home/federico/Documents/ehour/projects/hereweare/build/test',
	  deployTo: '/opt/hereweare',
	  repositoryUrl: 'https://github.com/datemiuncaffe/hereweare.git',
	// ignores: ['.git', 'node_modules'],
	// keepReleases: 2,
	// deleteOnRollback: false,
	  key: '/home/federico/.ssh/id_rsa_sensei',
		branch: 'nuovolayout'
	// shallowClone: true
	},
	staging: {
		servers: 'centos@192.168.88.158'
	}
};
module.exports.config = config;
module.exports.init = function(shipit) {
	require('shipit-shared')(shipit);
	require('shipit-deploy')(shipit);

	shipit.initConfig(config);

	shipit.task('pwd', function () {
		return shipit.remote('pwd');
	});
};
