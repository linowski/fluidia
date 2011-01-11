// jQuery Right Mouse Plugin
//
// Version 1.00
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 13 May 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=68 for more information
//
// Usage:
//
//		// Capture right click
//		$("#selector").rightClick( function(el) {
//			// Do something
//		});
//		
//		// Capture right mouse down
//		$("#selector").rightMouseDown( function(el) {
//			// Do something
//		});
//		
//		// Capture right mouseup
//		$("#selector").rightMouseUp( function(el) {
//			// Do something
//		});
//		
//		// Disable context menu on an element
//		$("#selector").noContext();
// 
// History:
//
//		1.00 - released (13 May 2008)
//
// TERMS OF USE
// 
// This software is licensed under a Creative Commons License and is copyrighted (C)2008 by Cory S.N. LaViska.
// For details, visit http://creativecommons.org/licenses/by/3.0/us/
//
if(jQuery) (function(){
	
	$.extend($.fn, {
		
		rightClick: function(handler) {
			$(this).each( function() {
				$(this).mousedown( function(e) {
					var evt = e;
					$(this).mouseup( function() {
						$(this).unbind('mouseup');
						if( evt.button == 2 ) {
							handler( $(this) );
							return false;
						} else {
							return true;
						}
					});
				});
				$(this)[0].oncontextmenu = function() {
					return false;
				}
			});
			return $(this);
		},
		
		rightMouseDown: function(handler) {
			$(this).each( function() {
				$(this).mousedown( function(e) {
					if( e.button == 2 ) {
						handler( $(this) );
						return false;
					} else {
						return true;
					}
				});
				$(this)[0].oncontextmenu = function() {
					return false;
				}
			});
			return $(this);
		},
		
		rightMouseUp: function(handler) {
			$(this).each( function() {
				$(this).mouseup( function(e) {
					if( e.button == 2 ) {
						handler( $(this) );
						return false;
					} else {
						return true;
					}
				});
				$(this)[0].oncontextmenu = function() {
					return false;
				}
			});
			return $(this);
		},
		
		noContext: function() {
			$(this).each( function() {
				$(this)[0].oncontextmenu = function() {
					return false;
				}
			});
			return $(this);
		}
		
	});
	
})(jQuery);	