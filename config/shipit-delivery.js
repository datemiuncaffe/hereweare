var config = {
	default: {
	  workspace: '.',
	  dirToCopy: 'build/test',
	  deployTo: '/opt/hereweare',
	// repositoryUrl: 'https://fmanganiello@bitbucket.org/senseiinternal/hereweare-backend.git',
		ignores: ['.git', 'node_modules'],
		keepReleases: 5,
	// deleteOnRollback: false,
	  key: '/home/tomcat7/.ssh/id_rsa_sensei',
		branch: 'remotes/origin/nuovolayout'
	// shallowClone: true
	},
	staging: {
		servers: 'centos@192.168.88.158'
	}
};
module.exports.config = config;
module.exports.init = function(shipit) {
	require('shipit-deploy')(shipit);
	require('shipit-npm')(shipit);

	shipit.initConfig(config);

	shipit.task('pwd', function () {
		return shipit.remote('pwd');
	});
	shipit.task('list', function () {
		return shipit.remote('ls -la');
	});
};
