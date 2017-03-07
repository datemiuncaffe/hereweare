var config = {
	default: {
	  	workspace: '.',
	  	dirToCopy: 'build/test',
	  	deployTo: '/opt/hereweare-frontend',
	 	ignores: ['.git', 'client/vendor', 'node_modules'],
	 	keepReleases: 5,
	  	key: '/home/federico/.ssh/id_rsa_sensei',
		branch: 'nuovolayout'
	},
	staging: {
		servers: 'centos@192.168.88.158'
	}
};
module.exports.config = config;
module.exports.init = function(shipit) {
	require('shipit-deploy')(shipit);
	require('shipit-npm')(shipit);
	require('shipit-bower')(shipit);

	shipit.initConfig(config);

	shipit.task('pwd', function () {
		return shipit.remote('pwd');
	});
};
