define(['underscore','backbone'], function(){
  var initialize = function() {
      require(['Router/Router', 'View/Tabs'], function(Router, Tabs) {
        Tabs.initialize();
        Backbone.history.start();
      });
  };

  return {
    initialize: initialize
  };
});