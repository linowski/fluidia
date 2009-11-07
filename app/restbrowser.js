RESTBrowser = function () {
	
	var show = function (element, url) {
		element.append(
			'<h4>REST Browser</h4>' +
			'<div class="field"><span>URL:</span> <input id="restBrowserUrl" type="text" value="' + url + '"></div>' +
			'<div class="field"><span>Method:</span> <select id="restBrowserMethod">' +
			'<option value="GET">GET</option>' +
			'<option value="POST">POST</option>' +
			'<option value="PUT">PUT</option>' +
			'<option value="DELETE">DELETE</option>' +
			'</div>' +
			'<textarea id="restBrowserRequestBody"></textarea>' +
			'<div id="restBrowserResponse" class="tall"></div>' +
			'<input type="button" id="restBrowserSubmit" value="Submit">' +
			'<span id="restBrowserWidthToggle">&larr; More width</span>'
		);
		$("#restBrowserMethod").change(function () {
			switch ($(this).val()) {
			case "PUT":
			case "POST":
				$("#restBrowserRequestBody").show();
				$("#restBrowserResponse").removeClass("tall");
				break;
			case "GET":
			case "DELETE":
				$("#restBrowserRequestBody").val("").hide();
				$("#restBrowserResponse").addClass("tall");
				break;
			}
		});
		$("#restBrowserRequestBody").hide();
		$("#restBrowserSubmit").click(function () {
			$.ajax({
				complete: function (XMLHttpRequest) {
					if (XMLHttpRequest.status) {
						$("#restBrowserResponse").html(
							"HTTP/1.x " + XMLHttpRequest.status + " " + XMLHttpRequest.statusText + "<br>" +
							XMLHttpRequest.getAllResponseHeaders().replace(/\n/g, "<br>") +
							"<br>" +
							XMLHttpRequest.responseText
								.replace(/&/g, "&amp;")
								.replace(/</g, "&lt;")
								.replace(/>/g, "&gt;")
								.replace(/\n/g, "<br>")
								.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
								.replace(/href="(.+?)"/g, 'href="<a href="$1">$1</a>"')
						);
						$("#restBrowserResponse a").click(updateUrl);
					} else {
						$("#restBrowserResponse").html("Could not get HTTP response from browser!");
					}
					$("#restBrowserSubmit").attr("disabled", false).val("Submit");
				},
				data: $("#restBrowserRequestBody").val(),
				dataType: "text",
				type: $("#restBrowserMethod").val(),
				url: $("#restBrowserUrl").val()
			});
			$("#restBrowserSubmit").attr("disabled", true).val("Loading...");
		});
		$("#restBrowserWidthToggle").toggle(function () {
			element.addClass("fullWidth");
			$("#restBrowserWidthToggle").html("Less width &rarr;");
		}, function () {
			element.removeClass("fullWidth");
			$("#restBrowserWidthToggle").html("&larr; More width");
		});
	}
	
	var updateUrl = function () {
		$("#restBrowserUrl").val($(this).attr("href"));
		return false;
	}
	
	return {
		show: show,
		updateUrl: updateUrl
	};
}();
