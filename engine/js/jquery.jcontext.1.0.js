/* Copyright (c) 2008 Kean Loong Tan http://www.gimiti.com/kltan
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * Name: jContext
 * Version: 1.0 (April 28, 2008)
 * Requires: jQuery 1.2+
 */
(function($) {
	$.fn.showMenu = function(options) {
		var opts = $.extend({}, $.fn.showMenu.defaults, options);
		$(this).bind("contextmenu",function(e){
			$(opts.query).show().css({
				top:e.pageY+"px",
				left:e.pageX+"px",
				position:"absolute",
				opacity: opts.opacity,
				zIndex: opts.zindex
			});
			return false;
		});
		$(document).bind("click",function(e){
			$(opts.query).hide();
			alert(e.pageY);
		});
	};
	
	$.fn.showMenu.defaults = {
		zindex: 2000,
		query: document,
		opacity: 1.0
	};
})(jQuery);