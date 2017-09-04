var config = {
	default: {
	  	workspace: '.',
	  	dirToCopy: 'build/test',
	  	deployTo: '/opt/hereweare-frontend',
		ignores: ['.git', 'client/vendor', 'client/node_modules', 'node_modules'],
		keepReleases: 5,
	  	key: '/home/tomcat7/.ssh/id_rsa_sensei',
		branch: 'remotes/origin/nuovolayout'
	},
	staging: {
		servers: 'centos@192.168.88.184'
	}
};
module.exports.config = config;
module.exports.init = function(shipit) {
	require('shipit-deploy')(shipit);
	require('shipit-npm')(shipit);
	require('shipit-bower')(shipit);

	shipit.initConfig(config);

	shipit.task('clientInstall', function () {
		shipit.log('dir: ' + shipit.releasePath);
		shipit.log('dir: ' + shipit.currentPath);

		var npm_install_dir = shipit.config.deployTo + '/current/client';
		if (shipit.releasePath) {
			npm_install_dir = shipit.releasePath + '/client';
		}
		if (shipit.currentPath) {
			npm_install_dir = shipit.currentPath + '/client';
		}

		var cmd = 'cd ' + npm_install_dir + ' && npm install';

		return shipit.remote(cmd)
				.then(function (res) {
        			shipit.emit('clientInstall');
					shipit.log('finished to install client dependencies');
      		});

	});

	shipit.task('pwd', function () {
		return shipit.remote('pwd')
				.then(function () {
					shipit.emit('pwd');
				});
	});
	
	shipit.task('list', function () {
		return shipit.remote('ls -la');
	});
};
