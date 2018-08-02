var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 4999);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type:  'textinput',
			id:    'host',
			label: 'Device IP',
			width: 12,
			regex: self.REGEX_IP
		},
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};


instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'inputOne':   { label: 'Input 1' },
		'inputTwo':   { label: 'Input 2' },
		'inputThree': { label: 'Input 3' },
		'inputFour':  { label: 'Input 4' },
		'vgaOne':     { label: 'VGA 1' },
		'vgaTwo':     { label: 'VGA 2' },
		'hdmiOne':    { label: 'HDMI 1' },
		'hdmiTwo':    { label: 'HDMI 2' },
		'blankOn':    { label: 'Blank Screen On' },
		'blankOff':   { label: 'Blank Screen Off' },
		'freezeOn':   { label: 'Freeze Screen On' },
		'freezeOff':  { label: 'Freeze Screen Off' },
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd  = 'Y 0 ';
	var opt  = action.options;

	switch (action.action) {

		case 'inputOne':
			cmd += '0 0';
			break;

		case 'inputTwo':
			cmd += '0 1';
			break;

		case 'inputThree':
			cmd += '0 2';
			break;

		case 'inputFour':
			cmd += '0 3';
			break;

		case 'vgaOne':
			cmd += '0 4';
			break;

		case 'vgaTwo':
			cmd += '0 5';
			break;

		case 'hdmiOne':
			cmd += '0 6';
			break;

		case 'hdmiTwo':
			cmd += '0 7';
			break;

		case 'blankOn':
			cmd += '90 1';
			break;

		case 'blankOff':
			cmd += '90 0';
			break;

		case 'freezeOn':
			cmd += '89 9';
			break;

		case 'freezeOff':
			cmd += '89 0';
			break;
	}

	if (cmd !== undefined) {

		debug('sending tcp', cmd, "to", self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\r\n");
		} else {
			debug('Socket not connected :(');
		}

	}

	debug('action():', action);


};

instance.module_info = {
	label:   'Global Cache - iTach IP2SL - Kramer VP-728',
	id:      'gc-itac-sl-vp-728',
	version: '0.0.1'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
