define([
	  'Model/Robot'
	, 'backbone'
	, 'domReady'],

	function($) {
	var CameraControlView, cameraControls;

	CameraControlView = Backbone.View.extend({
		tagName: 'div',
		attributes: function() {
			return {
				'id':'controls'
			};
		},
		parent: "#tps-viewer-menu",
		initialize: function() {
			var action,
				aButton;
			this.$el.html('<h4>Camera Controls</h4>');
			this.cameraActions = [];
			// Creates Camera Button instances for each robotic action.
			this.cameraActions['zoomIn'] = new CameraButtonView({'title': 'Zoom In', 'action': 'zoom', 'value': 'in'});
			this.cameraActions['zoomOut'] = new CameraButtonView({'title': 'Zoom Out', 'action': 'zoom', 'value': 'out'});
			this.cameraActions['irisOpen'] = new CameraButtonView({'title': 'Iris Open', 'action': 'iris', 'value': 'open'});
			this.cameraActions['irisClose'] = new CameraButtonView({'title': 'Iris Close', 'action': 'iris', 'value': 'close'});
			this.cameraActions['irisAuto'] = new CameraButtonView({'title': 'Iris Auto', 'action': 'iris', 'value': 'auto'});
			this.cameraActions['panLeft'] = new CameraButtonView({'title': 'Pan Left', 'action': 'pan', 'value': 'left'});
			this.cameraActions['panRight'] = new CameraButtonView({'title': 'Pan Right', 'action': 'pan', 'value': 'right'});
			this.cameraActions['tiltUp'] = new CameraButtonView({'title': 'Tilt Up', 'action': 'tilt', 'value': 'up'});
			this.cameraActions['tiltDown'] = new CameraButtonView({'title': 'Tilt Down', 'action': 'tilt', 'value': 'down'});
			this.cameraActions['screenshot'] = new CameraButtonView({'title': 'Screenshot', 'action': 'screenshot'});
			this.cameraActions['focusNear'] = new CameraButtonView({'title': 'Focus Near', 'action': 'focus', 'value': 'near'});
			this.cameraActions['focusFar'] = new CameraButtonView({'title': 'Focus Far', 'action': 'focus', 'value': 'far'});
			this.cameraActions['focusAuto'] = new CameraButtonView({'title': 'Autofocus', 'action': 'focus', 'value': 'auto'});
			this.cameraActions['refresh'] = new CameraButtonView({'title': 'Refresh','action':'refresh'});
			this.cameraActions['home'] = new CameraButtonView({'title': 'Home', 'action': 'home'});
			for(action in this.cameraActions) {
				// Appends elements to Control View.
				aButton = this.cameraActions[action].$el;
				this.$el.append(aButton);
			}
			$(this.parent).append(this.$el.hide());
			this.cAngle = new AngleControlView();
			this.$el.append("<h5>Camera Angle</h5>");
			this.$el.append(this.cAngle.$el);
		},
		enable: function() {
			this.$el.fadeIn();
		},
		disable: function() {
			this.$el.fadeOut('slow');
		},
		events: {
			'click .camera-action': 'doCameraAction'
		},
		doCameraAction: function(e) {
			var action = e.currentTarget.dataset.action,
				value = e.currentTarget.dataset.value;
			// Tells the Robot to perform camera action.
			app.Model.Robot.robotCommand(action,value);
		}
	});

	cameraControls = new CameraControlView();


	return {
		enable: function() {
			cameraControls.$el.fadIn();
		},
		disable: function() {
			cameraControls.$el.fadeOut('slow');
		}
	};

}(jQuery));
