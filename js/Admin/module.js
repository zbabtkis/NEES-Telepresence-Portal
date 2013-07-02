function module(require, func) {
	var exports = exports || [];	
  	for(var i = 0; i < require.length; i++) {
		require[i] = window[require[i]];
	}
 
	exports[func].apply(this, require);
}