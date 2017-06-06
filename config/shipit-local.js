var config = {
	default: {
		workspace: '.',
		dirToCopy: 'build/test',
		deployTo: '/opt/hereweare',
		ignores: ['.git', 'node_modules'],
		keepReleases: 5,
		key: '/home/federico/.ssh/id_rsa_sensei',
		branch: 'nuovolayout'
	},
	staging: {
		servers: 'centos@192.168.88.184'
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
};
