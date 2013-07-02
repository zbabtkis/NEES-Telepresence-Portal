define(['jquery', 'kendo', 'domReady'], function($, kendo) {

    var dataSource = new kendo.data.DataSource({
      transport: {
        read: {
          url: Telepresence.nodeServer + 'screenshots?socketID=' + Telepresence.socket.socket.sessionid,
          dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
          data: { q: "html5" } // search for tweets that contain "html5"
        }
      },
      schema: {
        data: function(response) {
          return response.results;
        }
      }
    });

    Telepresence.socket.on('alertAttachment', function() {
        dataSource.read();
    });

    return dataSource;
});