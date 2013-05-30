var ControlAPI = function(obj){
	var Controls = new Object(),
		_this = this;

	_.each(obj, function(val, key) {
		_this[key] = val;
	});
}

ControlAPI.prototype.initialize = function() {
	var Controls = eval(this.readwrite);

	_.each(this.inputs, function(input) {
		var instanceName = input.charAt(0).toLowerCase() + input.slice(1);

		console.log(eval(instanceName));

		Controls[instanceName] = new eval(instanceName);
	});

	console.log(this);
}

ControlAPI.prototype.enable = function(controller) {
	var AppController = this,
		Controls = eval(this.readwrite);

	_.each(Controls, function(control) {
		control.enable();
		AppController.listenTo(control, 'valueChange', AppController[controller]);
	});
}

ControlAPI.prototype.disable = function(controller) {
	var AppController = this,
		Controls = eval(this.readwrite);

	_.each(Controls, function(control) {
		control.disable();
		AppController.stopListening(control, 'valueChange', AppController[controller]);
	});
}

ControlAPI.prototype.set = function(ctrl, value) {
	var Controls = eval(this.readwrite);

	Controls[ctrl].value(val);
}