define([
  , 'underscore'
  , 'backbone'], 

  function () {

  'use strict';

  var router;

  var Router = Backbone.Router.extend({
    routes: {
      '': 'list',
      'sites': 'list',
      'help': 'help',
      'sites/:cam': 'camera'
    },
    help: function() {
      require(['View/Info'], 
        function(Info) {

          Info.render();
      });
    },
    list: function() { 
      var _this = this;

      require(['View/List'], 

        function(List) {        
          List.render();
        
          _this.listenTo(List, 'cameraSelected', function(id) {
            this.navigate('sites/' + id, {trigger: true});
          });
      });
    },
    camera: function(id) {
      var _this = this;

      require(['Controller/Controller'], 

        function(Controller) {

          _this.list();

          Controller.openFeed(id);
      });
    }
  });

  return {
    initialize: function() {
       router = new Router();

       this.navigate = router.navigate
    }
  };

});
