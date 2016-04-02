$(document).ready(function(){
	// init variables
	initx = false; //used for drawing squares
	myresize = null; // contains the resizable element
	lastDraggable = null; // contains the last selected Draggable
	startdragx = 0; // initial positions of startdrag
	startdragy = 0;
	minWidthForLabel = 60; //pixel width necesarry to start showing label
	startdragObjects = {}; // initial positions of all select objects; used to add delta x,y values to during drag

	disableKeyListeners = false; //global variable which affects hot key listening
	shiftPressed = false; // if true, then shift key is being pressed down
	shiftAmount = 1; //1 or 10 pixels depending of shiftPressed
	ctrlPressed = false; // if true, then ctrl key is being pressed down
	cPressed = false; // if true, then c key is being pressed down
	
	savedDate = new Date(); //used by actClick to determine double clicks

	inputValues = {}; //used by clearField to set initial values inside of input fields

	offsetToWorkspaceX = $("#fWorkspace").offset().left;
	offsetToWorkspaceY = $("#fWorkspace").offset().top;

	// init functions
	fWorkspace.setDimensions(); // set window dimensions the first time
	
	//set minmum and maximum widths of panelpages after they have been loaded
	fPanelPages.cssPanelWidthCon = parseInt($("#fPanelPages").css("width"));
	fPanelPages.cssPanelWidthExp = parseInt($("#fPanelPages").css("width")) + 80;
	
	//load data from session or standard file, and pickup project related variables
	fSaveLoad.checkSession(true); //with load data flag true
	
	$("#fWorkspace").fShowMenu({ opacity:0.8,	query: "#fRightClickMenu"},function() {});

	// make document unselectable
	if (typeof(document.onselectstart) != "undefined") {
		document.onselectstart = fUnselectable.enable;
	} else {
		document.onmousedown = fUnselectable.enable;
		document.onmouseup = fUnselectable.disable;
	}

	//init listeners
	$(window).bind("resize",resized); // window resizing listener
	
	//enable hotkey listening
	hotkeysEnable(); 
	$("#setwidth").bind("keyup",updateWidth);
	$("#setheight").bind("keyup",updateHeight);
	$("#xpos").bind("keyup",updateXpos);
	$("#ypos").bind("keyup",updateYpos);
	
	//$(".fNoHotKey").bind("focus",hotkeysDisable);
	$(".fNoHotKey").live("focus",function(){hotkeysDisable(); });
	$("#fEditing").live("mouseover",function(){$(this).focus()}); //fix for enabling cursor to focus on fEditableText
	
	$(window).bind("focus",hotkeysEnable);
	
	$(document).bind("mousemove",fGM.capture); //global mouse with page coordinates

	//first tool
	toolSelect();
	
	//editables
	$("#fProjName").bind("dblclick", function() {$(this).fEditable();});
	$("#fObjName").bind("dblclick", function() {$(this).fEditable();});
	
	
	//hovers for fS footer states controler
	$("div.fSCheck,div.fSTitle").live("mouseover",
      function () {
	  	 $(this).parent().addClass('bg-over');
      });
	$("div.fSCheck,div.fSTitle").live("mouseout",
      function () {
	  	$(this).parent().removeClass('bg-over');
      });
	
	//hovers for instances
	$("#fFInstItems a").live("mouseover",
      function () {
	  	$("#fFInstTitle").html("Select: " + $(this).attr("title"));
      });
	$("#fFInstItems a").live("mouseout",
      function () {
	  	$("#fFInstTitle").html("All Instances:");
      });
	  
	 //focus window on click
	 $("#container").bind("click",fFocusWindow);
	 
	 //upload button
	 new AjaxUpload('upload_button', {action: '/app/upload_fld', onComplete: function(file, response) { location.reload(true); }});
});




// -------- General Resizing Functions -----
function fFocusWindow(e){
	//only loose focus if not clicking on an already active Element
	if ((e.target != document.activeElement) && (e.target.tagName != "INPUT")) {
		$("input").blur();
		$("textarea").blur();
		$(window).focus();
	}
}



// -------- HotKey Functions -----
function hotkeysEnable() {
	$.hotkeys.add('Down', function() {fWorkspace.keyShift('down');});
	$.hotkeys.add('Up', function() {fWorkspace.keyShift('up');});
	$.hotkeys.add('Left', function() {fWorkspace.keyShift('left');});
	$.hotkeys.add('Right', function() {fWorkspace.keyShift('right');});
	$.hotkeys.add('Shift+Down', function() {fWorkspace.keyShift('down');});
	$.hotkeys.add('Shift+Up', function() {fWorkspace.keyShift('up');});
	$.hotkeys.add('Shift+Left', function() {fWorkspace.keyShift('left');});
	$.hotkeys.add('Shift+Right', function() {fWorkspace.keyShift('right');});
	$.hotkeys.add('Ctrl+C', keyCtrlC);
	$.hotkeys.add('Ctrl+X', keyCtrlX);
	$.hotkeys.add('Ctrl+V', keyCtrlV);
	$(document).unbind("keydown",keypressed);
	$(document).unbind("keyup",keyreleased);
	$(document).bind("keydown",keypressed); // detect which keys are pressed for tools, and delete and such
	$(document).bind("keyup",keyreleased); // detect if some keys are let go (ex. shift)
}

function hotkeysDisable() {
	$.hotkeys.remove('Down');
	$.hotkeys.remove('Up');
	$.hotkeys.remove('Left');
	$.hotkeys.remove('Right');
	$.hotkeys.remove('Shift+Down');
	$.hotkeys.remove('Shift+Up');
	$.hotkeys.remove('Shift+Left');
	$.hotkeys.remove('Shift+Right');
	$.hotkeys.remove('Ctrl+C', keyCtrlC);
	$.hotkeys.remove('Ctrl+X', keyCtrlX);
	$.hotkeys.remove('Ctrl+V', keyCtrlV);
	$(document).unbind("keydown",keypressed);
	$(document).unbind("keyup",keyreleased);
}

function keyreleased(event) {
	//whichkey is set to the keycode number
	if (event.keyCode != 0) { whichkey = event.keyCode;}
	if (event.which != 0) { whichkey = event.which;}
	
	//shift released
	if (whichkey == "16") {
		shiftPressed = false;
		shiftAmount = 1;
	}
	//ctrl released
	if (whichkey == "17") {
		ctrlPressed = false; 
	}
	
	//z released
	if (whichkey == "90") { fStateManager.hideManager(); }
	
	//x released
	if (whichkey == "88") { fIdeaManager.hideManager(); }
	
	//f released
	if (whichkey == "70") { fFormManager.hideManager(); fFormManager.opened = false;}
	
	// c key
	//if (whichkey == "67") { cPressed = false; if(fCBManager.mouseover == false) {fCBManager.hideManager();} }
	if (whichkey == "67") { fCBManager.hideManager(); }
}

function keypressed(event) {
	//whichkey is set to the keycode number
	if (event.keyCode != 0) { whichkey = event.keyCode;}
	if (event.which != 0) { whichkey = event.which;}
	
	//handle autotext if lastText is defined 
	if(fSel.lastText != null) {
		//if exists on page and does not have any text
		if (($("#" + fSel.lastText).length > 0) && (!$("#" + fSel.lastText).hasClass("fTextHasTxt"))) { //test if exists on workspace
		
			//if is a proper key. keypressed is not: shift,ctrl,esc,alt,tab,pgup,pgdn,home,end,insr,delete,fkeys
			var allowEdit = true;
			shiftPressed = false; //unlock shift just in case (buggy when starting to auto edit while holding SHIFT)
			var forbiddenKeys = new Array(16,17,27,18,9,33,34,35,36,45,46,112,113,114,115,116,117,118,119,120,121,122,123);
			for (i=0; i < forbiddenKeys.length; i++) {
				if (forbiddenKeys[i] == whichkey) { allowEdit = false;}
			}

			if(allowEdit) {
				//make editable
				$("#" + fSel.lastText).fEditableText();
				
				//select
				fSel.selectObject(fSel.lastText);
				
				//exit the function to not interfere with the rest of keypresses
				return(true);
			}
		}
	}
	
	
	//alert(whichkey);
	// 46 is the delete key
	if (whichkey == "46") {
		if (fSel.sI.length > 0) {
			//delete items
			jO.deleteItems(fSel.sI);
			
			//empty the whole array
			fSel.sI.splice(0);
			fSel.selectObject($("#fWorkspace"));
		}
		
		fWorkspace.redraw(); 
	}

	// ctrl key
	if (whichkey == "17") {
		ctrlPressed = true; // sets as true or false. used to restrict keypresses to single keys (ex. "T" for text tool, and not "ctrl t")	
	}
	
	// shiftkey
	//shift released
	if (whichkey == "16") {
		shiftAmount = 10;
	}
	shiftPressed = event.shiftKey; // sets as true or false. used by fDebugJson and multiple object selection
	
	//V
	if (whichkey == "86") {
		$("#buttonfMIToggle").trigger("click");
		fCBManager.redrawPasteManager();
	}
	
	//E
	//if (whichkey == "69") {
	//	toolExperience();
	//}
	
	//toolbars (only run if shift / ctrl are NOT pressed)
	if ((whichkey == "83") && (shiftPressed == false) && (ctrlPressed == false)) { toolSelect(); }
	if ((whichkey == "79") && (shiftPressed == false) && (ctrlPressed == false)) { toolObject(); }
	if ((whichkey == "84") && (shiftPressed == false) && (ctrlPressed == false)) { toolText(); }
	//if ((whichkey == "70") && (shiftPressed == false) && (ctrlPressed == false)) { toolForm(); }

	
	//run code to open fDebugJson on press of shift
	if (event.shiftKey) {
		fDebugJson.trigger();
	}
	// and close it when an ESC is pressed
	if (whichkey == "27") { fDebugJson.hideManager(); }
	
	// z key 
	if (whichkey == "90") { fStateManager.displayManager(); }
	
	// f key
	if ((whichkey == "70") && ($("#fFormManager").css("display") == "none")) { fFormManager.displayManager(); }
	
	// x key
	if (whichkey == "88") { fIdeaManager.displayManager(); }
	
	// c key
	if (whichkey == "67") { cPressed = true; fCBManager.displayManager(); }
	
	// 1 key
	if (whichkey == "49") { setTone(1); }
	
	// 2 key
	if (whichkey == "50") { setTone(2); }
	
	// 3 key
	if (whichkey == "51") { setTone(3); }
	
	// 4 key
	if (whichkey == "52") { setTone(4); }
}


function setTone(what){
	var changed = false;
	
	for (var i = 0; i < fSel.sI.length; i++) {
		if (fSel.sI[0].match("ins")) {
			//remove all classes
			$("#" + fSel.nInst).removeClass("p1 p2 p3 p4 p5");
			
			//add
			$("#" + fSel.nInst).addClass("p" + what);
		
			//save
			if(fSession[jO.tr(fSel.sI[i])].editAs == 0) {	jO.update(jO.tr(fSel.sI[i]), {type: "object",t: what});	}
			//force inheritance and set
			else if(fSession[jO.tr(fSel.sI[i])].editAs == 1) { jO.update(jO.tr(fSel.sI[i]), {type: "instance",iTone: 0, t:what}); }
			
			changed = true;
		}
	}
	
	if(changed == true) {
		fWorkspace.redraw(); 
		fFooter.redrawFooter();
	}
}


function keyCtrlC(event) {
	fCBManager.copy();
}
function keyCtrlV(event) {
	//launch paste box if not opened
	if(fCBManager.openedPaste == false) {
		fCBManager.displayPasteManager();	
	}
	//paste if ctrlV pressed a second time
	else {
		fCBManager.paste();	
	}
}
function keyCtrlX(event) {
	fCBManager.cut();
}


function updateWidth(event) {
	if(fSel.sI[0] != "fWorkspace") {
		//make sure it's an integer
		var val = parseInt($("#setwidth").val());
		$("#" + fSel.sI[0]).width($("#setwidth").val());
		jO.update(fSel.sI[0],{w : parseInt($("#setwidth").val())});
		if (fSel.editAs == 1) {jO.update(fSel.nInst, {type: "instance",iSize: 0});} //force inheritance
		if (fSel.editAs == 0) {jO.update(fSel.nInst, {type: "instance",iSize: 1});} //force inheritance
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		fFooter.redrawFooter();
	}
}

function updateHeight(event) {
	if(fSel.sI[0] != "fWorkspace") {
		//make sure it's an integer
		var val = parseInt($("#setheight").val());
		$("#" + fSel.sI[0]).height($("#setheight").val());
		jO.update(fSel.sI[0],{h : parseInt($("#setheight").val())});
		if (fSel.editAs == 1) {jO.update(fSel.nInst, {type: "instance",iSize: 0});} //force inheritance
		if (fSel.editAs == 0) {jO.update(fSel.nInst, {type: "instance",iSize: 1});} //force inheritance
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		fFooter.redrawFooter();
	}
}

function updateXpos(event) {
	if(fSel.sI[0] != "fWorkspace") {
		//make sure it's an integer
		var val = parseInt($("#xpos").val());
		$("#xpos").val(val);
		$("#" + fSel.sI[0]).css("left", $("#xpos").val() + "px");
		jO.update(fSel.sI[0],{x : parseInt($("#xpos").val())});
		if (fSel.editAs == 1) {jO.update(fSel.nInst, {type: "instance",iPos: 0});} //force inheritance
		if (fSel.editAs == 0) {jO.update(fSel.nInst, {type: "instance",iSize: 1});} //force inheritance
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		fFooter.redrawFooter();
	}
}

function updateYpos(event) {
	if(fSel.sI[0] != "fWorkspace") {
		//make sure it's an integer
		var val = parseInt($("#ypos").val());
		$("#ypos").val(val);
		$("#" + fSel.sI[0]).css("top", $("#ypos").val() + "px");
		jO.update(fSel.sI[0],{y : parseInt($("#ypos").val())});
		if (fSel.editAs == 1) {jO.update(fSel.nInst, {type: "instance",iPos: 0});} //force inheritance
		if (fSel.editAs == 0) {jO.update(fSel.nInst, {type: "instance",iSize: 1});} //force inheritance
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		fFooter.redrawFooter();
	}
}




function updateInfoXYPos() {
	$("#xpos").val(parseInt($("#" + fSel.sI[0]).css("left")));
	$("#ypos").val(parseInt($("#" + fSel.sI[0]).css("top")));

	if(fSel.sI[0] == "fWorkspace") {
		$("#xpos").val(0);
		$("#ypos").val(0);
	}
}

function updateInfoWH() {
	$("#setwidth").val($("#" + fSel.sI[0]).width());
	$("#setheight").val($("#" + fSel.sI[0]).height());

	if(fSel.sI[0] == "fWorkspace") {
		$("#setwidth").val(0);
		$("#setheight").val(0);
	}
}



function Draw(event){
	//Draw function is rerun continously onmousemove when a text or object tool is selected
	var element=$(event.target);
	posx = event.pageX;
	posy = event.pageY;
	
	//This is ran once after a mousepress
	this.onmousedown=function(){
		// set drawWhere
		if (fSel.sI[0] != null) {
			drawWhere = $("#" + fSel.sI[0]);
		}
		
		//check if the selected item is on the selected page
		if(!$("#" + fSel.sI[0]).length > 0) {
			//if not, then select the workspace :)
			fSel.selectObject($("#fWorkspace"));
			drawWhere = $("#fWorkspace");
		}
		
		// do not allow to draw by default
		fWorkspace.allowDraw = false;
		
		// only draw if the clicked div is the workspace div
		if (element.attr("id") == "fWorkspace") {
			fWorkspace.allowDraw = true;
		}

		// or if the ancestors contain the workspace div, however check only if the allowDraw has not been enabled already, to conserve cpu
		if (fWorkspace.allowDraw == false) {
			ancestorarray = element.parents();
			for ( var i=0, len=ancestorarray.length; i<len; ++i ){
				if ($(ancestorarray[i]).attr("id") == "fWorkspace") {
					fWorkspace.allowDraw = true;
					break;
				}
			}
		}
		
		//do not allow to draw if drawing tools are not chosen
		if ((fTools.selected != "toolObject") && (fTools.selected != "toolText")) {
			fWorkspace.allowDraw = false;
		}

		// draw rectangle
		if (fWorkspace.allowDraw == true) {
			//select the parent if workspace or instance is not selected
			if (!(fSel.sI[0].match("fWorkspace")||fSel.sI[0].match("ins"))) {
				fSel.selectObject($("#" + fSel.sI[0]).parent());
				drawWhere = $("#" + fSel.sI[0]);
			}
				
			
			//disable select
			fUnselectable.enable;
			
			// not on the clicked element, but on the selected
			offsetx = drawWhere.offset().left;
			offsety = drawWhere.offset().top;
			
			// - parent's position?
			initx=posx - offsetx;
			inity=posy - offsety;

			if (fTools.selected == "toolText") {
				whatelement = "div";
				whatclass = "fText";
				whatid = jO.getAvailableId('txt');
			}
			if (fTools.selected == "toolObject") {
				whatelement = "div";
				whatclass = "fObject";
				whatid = jO.getAvailableId('inst');
			}

			d = document.createElement(whatelement);
			d.className=whatclass;
			d.style.left=initx+'px';
			d.style.top=inity+'px';
			d.id=whatid;
			drawWhere.append(d);
		}
	}
	
	//This is ran once after a mouseup
	this.onmouseup=function(){
		initx=false;
		inity=false;
		if (fWorkspace.allowDraw == true) {
			//disable the other defined mousedown function
			this.onmousedown = null;
			this.onmouseup = null;
			
			position = $(d).position();
			width = $(d).width();
			height = $(d).height();
			
			//correct width and height for click erros
			if (width < 10) { width = 20};
			if (height < 10) { height = 20};
			
			//create the object in JSON
			//INSTANCE
			if (fTools.selected == "toolObject") {
				name = "new object";
				ID = jO.createObj(name, position.left, position.top, width, height);
			}
			//TXT
			if (fTools.selected == "toolText") {
				txt = "";
				ID = jO.createTxt(txt, position.left, position.top, width, height);
			}


			//force inheritance
			if (fSel.sI[0].match("ins")) {
				if (fSession[fSel.sI[0]].editAs == 1) {
					jO.update(fSel.sI[0], {
						iContents: 0
					});
				}
				else {
					jO.update(fSel.sI[0], {
						iContents: 1
					});
				}
			}

			//instatiate it
			if (fSel.sI[0] != "fWorkspace") {
				newInstanceName = jO.instantiate(ID, fSel.sI[0], fSession[fSel.nInst].state);
			}
			else {
				newInstanceName = jO.instantiate(ID, fSel.sI[0]);
			}
		
			
			
			
			
			
			
			//update footer
			fFooter.redrawFooter();
			
			//update Workspace
			//INSTANCE
			if (fTools.selected == "toolObject") {
				fWorkspace.redraw();
			}
			//TXT
			if (fTools.selected == "toolText") {
				//refresh page for all TXT items
				fWorkspace.redraw();
				fSel.lastText = newInstanceName;
			}
			
			
			//INSTANCE Label make editable
			if ((fTools.selected == "toolObject") && (width > minWidthForLabel)) {
				$(d).fEditableLabel();
			}
			
			
			//enable cursor select tool
			toolSelect();
			
			//enable select
			fUnselectable.disable;
			
			// do not allow to draw - finished drawing
			fWorkspace.allowDraw = false;
			
			
			
		}
	}

	//This is ran continously after a mousepress and before a mouseup - it redraws the object
	if(initx){
		if (fWorkspace.allowDraw == true) {
			var setwidth = Math.abs(posx - initx - offsetx);
			var setheight = Math.abs(posy - inity - offsety);
			
			d.style.width = setwidth + 'px';
			d.style.height = setheight + 'px';
			d.style.left = posx - initx - offsetx < 0 ? posx - offsetx + 'px' : initx + 'px';
			d.style.top = posy - inity - offsety < 0 ? posy - offsety + 'px' : inity + 'px';
			
			//update setwidth & setheight boxes
			document.getElementById("setwidth").value = setwidth;
			document.getElementById("setheight").value = setheight;
		}
	}
}


function dragRegister(mydrag) {
	//$("#fWorkspace").append(mydrag);
	startdragx = parseInt($("#"+mydrag).css("left"));
	startdragy = parseInt($("#"+mydrag).css("top"));
	for (var i = 0; i < fSel.sI.length; i++) {
		startdragObjects[fSel.sI[i]] = {};
		startdragObjects[fSel.sI[i]].x = parseInt($("#" + fSel.sI[i]).css("left"));
		startdragObjects[fSel.sI[i]].y = parseInt($("#" + fSel.sI[i]).css("top"));
	}
}


function dragItems(mydrag) {
	//drag all remaining items which are also selected
	// calculate how much movement there is during the drag
	movex = parseInt($("#"+mydrag).css("left")) - startdragx;
	movey = parseInt($("#"+mydrag).css("top")) - startdragy;

	// loop through all remaining selected items except fWorkspace and
	for (var i = 0; i < fSel.sI.length; i++) {
		//update position on workspace
		$("#" + fSel.sI[i]).css("left", startdragObjects[fSel.sI[i]].x + movex + "px");
		$("#" + fSel.sI[i]).css("top", startdragObjects[fSel.sI[i]].y + movey + "px");
	}
	//update footer
	updateInfoXYPos();
}


function dragStop(mydrag) {
	//update the workspace one more time in case there is pixel lag during drag
	dragItems(mydrag);
	movex = parseInt($("#"+mydrag).css("left")) - startdragx;
	movey = parseInt($("#"+mydrag).css("top")) - startdragy;
	
	//update JSON position of items
	for (var i = 0; i < fSel.sI.length; i++) {
		var itemRef = "";
		// OBJECTS / INSTANCES
		if (fSel.sI[i].match("ins") != null) {
			if (fSel.editAs == 0) { //if 0 editing as Object
				//update JSON + Force inheritance of iPos = 1
				jO.update(fSel.sI[i], {
					type: "object",
					x: $("#" + fSel.sI[i]).position().left,
					y: $("#" + fSel.sI[i]).position().top,
				});
				//update JSON + Force inheritance
				jO.update(fSel.sI[i], {
					type: "instance",
					iPos: 1
				});
			}
			else { //else editing as Instance
				//update JSON + Force inheritance of iPos
				jO.update(fSel.sI[i], {
					type: "instance",
					x: $("#" + fSel.sI[i]).position().left,
					y: $("#" + fSel.sI[i]).position().top,
					iPos: 0
				});
			}
		}
		// Text & Form Elements
		if ((fSel.sI[i].match("t") != null) || (fSel.sI[i].match("f") != null)) {
			jO.updateElements(jO.tr(fSel.sI[i]), {
				x: $("#" + fSel.sI[i]).position().left,
				y: $("#" + fSel.sI[i]).position().top,
			});
		}
	}

	//update Workspace
	fWorkspace.redraw();
	fFooter.redrawFooter();
}

function resizeStop() {
	updateInfoWH();
	
	//update JSON position of items
	for (var i = 0; i < fSel.sI.length; i++) {
		var itemRef = "";
		
		// OBJECTS / INSTANCES
		if (fSel.sI[i].match("ins") != null) {
			var jInst = jO.jData.instances[jO.tr(fSel.sI[i])];
			
			//calculate necessary relative position change
			//if editing as object master
			if (fSession[fSel.sI[i]].editAs == 0) {
				initx = fSel.jObj.states[fSession[fSel.sI[i]].state].x;
				inity = fSel.jObj.states[fSession[fSel.sI[i]].state].y;
			}
			//else instance
			else {
				//if not inheriting from object
				if (jInst.states[fSession[fSel.sI[i]].state].iPos == 0) {
					initx = jInst.states[fSession[fSel.sI[i]].state].x;
					inity = jInst.states[fSession[fSel.sI[i]].state].y;
				}
				//if inheriting from object
				else {
					initx = fSel.jObj.states[fSession[fSel.sI[i]].state].x;
					inity = fSel.jObj.states[fSession[fSel.sI[i]].state].y;
				}
			}
			//calculate difference in positional change
			changeX = $("#" + fSel.sI[i]).position().left - initx;
			changeY = $("#" + fSel.sI[i]).position().top - inity;
			
			//if 0 editing as Object
			if (fSel.editAs == 0) {
				itemRef = fSel.jObj;
				
				//update all instances' position if they are inheriting size to compensate for top, left position changes during resize	
				var Instances = jO.getInstancesOfObj(jInst.of, {
					type: "workspace"
				});
				for (var j = 0; Instances.length > j; j++) {
					instRef = jO.jData.instances[Instances[j]];
					
					//if they inherit size but not position
					if ((instRef.states[fSession[fSel.sI[i]].state].iSize == 1) && (instRef.states[fSession[fSel.sI[i]].state].iPos == 0) && (Instances[j] != fSel.sI[i])) {
						//alert(Instances[j] + ":"+ fSel.sI[i]);
						//update the instance's position relatively + force inheritance of size
						jO.update(Instances[j], {
							type: "instance",
							xs: changeX,
							ys: changeY,
							w: $("#" + fSel.sI[i]).width(),
							h: $("#" + fSel.sI[i]).height()
						});
					}
				}
				
				//also update the object of course
				//alert(changeX + ":" + changeY)
				jO.update(fSel.sI[i], {
					type: "object",
					xs: changeX,
					ys: changeY,
					w: $("#" + fSel.sI[i]).width(),
					h: $("#" + fSel.sI[i]).height(),
				});
				
				//force inheritance
				jO.update(fSel.sI[i], {
					type: "instance",
					xs: changeX,
					ys: changeY,
					iSize: 1
				});
			}
			//else editing as Instance
			else {
				itemRef = jInst;
				//update the instance's position relatively + force inheritance of size
				jO.update(fSel.sI[i], {
					type: "instance",
					xs: changeX,
					ys: changeY,
					w: $("#" + fSel.sI[i]).width(),
					h: $("#" + fSel.sI[i]).height(),
					iSize: 0
				});
			}
			
			//update footer (if not editing Text)
			if (fWorkspace.editingText == false) {
				fFooter.redrawFooter();
				
				//update Workspace
				if (fSel.editAs == 0) {
					//update all instances with which use this object, by passing object name (extracted from instance/of)
					fWorkspace.redraw({
						type: 'object',
						item: jInst.of
					});
				}
			}
			
		}	
		// TEXT & FORM
		if ((fSel.sI[i].match("t") != null) || fSel.sI[i].match("f") != null) {
			//calculate difference in positional change
			changeX = $("#" + fSel.sI[i]).position().left - jO.jData.elements[jO.tr(fSel.sI[i])].x;
			changeY = $("#" + fSel.sI[i]).position().top - jO.jData.elements[jO.tr(fSel.sI[i])].y;
			
			jO.updateElements(jO.tr(fSel.sI[i]), {
				xs: changeX,
				ys: changeY,
				w: $("#" + fSel.sI[i]).width(),
				h: $("#" + fSel.sI[i]).height(),
			});
			
			fWorkspace.redraw();
		}
		
		
	}
}


function resized(event) {
	fWorkspace.setDimensions(); // fix wrapper/workspace height
}


function killDrag(event) {
	for (var i = 0; i < fSel.sI.length; i++) {
		$("#"+fSel.sI[i]).draggable("destroy");
	}
}

function killResizable(event) {
	for (var i = 0; i < fSel.sI.length; i++) {
		$("#"+fSel.sI[i]).resizable("destroy"); 
	}
}





// -------- fluidia Functions -----
$.fn.fEditable = function() {
	clickedElement = this;

	//overlay an input box on top of the double clicked div
	clickedElement.after('<input class="fEditable" id="fEditing" type="box" value="' + clickedElement.html() + '"></input>');

	//inherit the previous elements width and height, margin and padding
	$("#fEditing").css("height",clickedElement.css("height") + 2);
	$("#fEditing").css("font-size",clickedElement.css("font-size"));
	
	//get the newly created element
	inputElement = this.next();
	
	//ID specific
	if(clickedElement.attr("class").match("panelItem")) {
		$("#fEditing").css("width","100%");
	}
	else if(clickedElement.attr("id").match("fObjName")) {
		$("#fEditing").css("width","150px");
	}
	
	//hide the clicked element
	clickedElement.hide();

	//focus the newly created editable input box
	inputElement.focus();
	hotkeysDisable(); //because people will be typing

	//attach on change
	inputElement.bind("blur",closeEditing);
	inputElement.bind("keyup",function(event) {if(event.which == "13") { closeEditing(); } });
}

function closeEditing(){ // if I have "blur change" together AIR crashes
	// update the DOM
	clickedElement.html(inputElement.attr("value"));
	
	//ID specific updates
	if(clickedElement.attr("class").match("panelItem")) {
		jO.jData.pages[clickedElement.attr("id")].pageName = inputElement.attr("value");	
	}
	else if(clickedElement.attr("id").match("fProjName")) {
		jO.jData.project.projectName = inputElement.attr("value");	
	}
	else if(clickedElement.attr("id").match("fObjName")) {
		jO.jData.objects[fSel.nObj].name = inputElement.attr("value");
		fWorkspace.redraw();
	}
	
	clickedElement.show();
	inputElement.unbind();
	inputElement.remove();
	
	hotkeysEnable();
	
	//savesession
	fSaveLoad.saveSessionDelay();
}

$.fn.fEditableLabel = function() {
	fWorkspace.allowSaveLabel = true; //a safety fix to stop from saveLavel running twice from multiple event triggers
	clickedElement = this;
	//sometimes an fLabel element is passed, and sometimes the fObject or instance element is passed
	//if it's an fLabel, go up two levels 
	if($(clickedElement).attr("id") == "") {
		clickedElement = $(clickedElement).parent().parent();
	}

	objref = jO.jData.objects[jO.jData.instances[$(clickedElement).attr("id")].of];
	clickedElement = $("#" + clickedElement.attr("id"));
	
	//save clickedElement for future reference
	fWorkspace.editingLabelInstance = clickedElement.attr("id");
	
	//overlay an input box on top of the double clicked div
	if ((objref.name == "") || (objref.name == "new object")) {
		clickedElement.find(".fLabel").html('<span class="fLBracket">[</span> <input class="fEditable fEditableLabel" id="fEditing" type="box" value=""></input>  <span class="fLBracket">]</span>');
	}
	else {
		clickedElement.find(".fLabel").html('<span class="fLBracket">[</span> <input class="fEditable fEditableLabel" id="fEditing" type="box" value="' + objref.name + '"></input>  <span class="fLBracket">]</span>');
	}

	//focus the newly created editable input box
	clickedElement.find(".fEditableLabel").focus();
	hotkeysDisable(); //because people will be typing
	killDrag(); //because people might want to highlight text

	//attach on change
	clickedElement.find(".fEditableLabel").bind("change blur",fWorkspace.saveLabel);
	
	//savesession
	fSaveLoad.saveSessionDelay();
}


$.fn.fEditableText = function() {
	fWorkspace.editingText = true;
	clickedElement = this;

	txtref = jO.jData.elements[jO.tr($(clickedElement).attr("id"))];
	
	clickedElement = $("#" + clickedElement.attr("id"));
	
	//save clickedElement for future reference
	fWorkspace.editingTextInstance = clickedElement.attr("id");
	
	//overlay an input box on top of the double clicked div
	if ((txtref.txt == "") || (txtref.txt == "New Text")) {
		clickedElement.html('<textarea class="fEditableText" id="fEditing" name="a"></textarea>');
	}
	else {
		clickedElement.html('<textarea class="fEditableText" id="fEditing" name="a">' + txtref.txt + '</textarea>');
	}
	
	hotkeysDisable(); //because people will be typing
	killDrag(); //because people might want to highlight text

	//attach on change
	clickedElement.find(".fEditableText").bind("change blur",fWorkspace.saveText);
	
	//focus the newly created editable input box
	$("#fEditing").focus();
	
	//savesession
	fSaveLoad.saveSessionDelay();
}



// -------- Tool Functions -----
// The left most tool functions
function toolObject() {
	//selectedTool
	fTools.selected = "toolObject";

	//clear all tools
	fWorkspace.saveLabel(); //make sure an active label is saved before hand
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise
	fTools.crosshairOn();
	killDrag(); // remove all dragging behaviours
	killResizable(); // remove all resizable
	fExp.hideOverview(); //hide threadbar if active

	$("#iconObject").addClass("active");

	$("#fWorkspace").bind("mousemove",Draw);
	
	fSel.highlight();
}


function toolForm() {
	fTools.selected = "toolForm";

	//clear all tools
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise
	fTools.crosshairOff();
	killDrag(); // remove all dragging behaviours
	killResizable(); // remove all resizable
	fExp.hideOverview(); //hide threadbar if active

	$("#iconForm").addClass("active");

	fSel.highlight();
	
	$(window).unbind("mouseup",fFormManager.hideWrap);
	
	fFormManager.displayManager();
	
	$(window).bind("mouseup",fFormManager.hideWrap);
}


function toolText() {
	fTools.selected = "toolText";

	//clear all tools
	fWorkspace.saveLabel(); //make sure an active label is saved before hand
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise
	fTools.crosshairOn();
	killDrag(); // remove all dragging behaviours
	killResizable(); // remove all resizable
	fExp.hideOverview(); //hide threadbar if active
	
	$("#iconText").addClass("active");

	$("#fWorkspace").bind("mousemove",Draw);
	
	fSel.highlight();
}


function toolSelect() {
	fTools.selected = "toolSelect";

	//clear all tools
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise
	fTools.crosshairOff();
	$("#iconSelect").addClass("active");
	fExp.hideOverview(); //hide threadbar if active

	$("#fWorkspace").bind("click",fSel.selectBinding);
	
	//enable last drag
	if (fSel.sI[0] != null) {
	//	fSel.selectObject(fSel.sI[0]);
	}
}


function toolExperience() {
	fTools.selected = "toolExperience";

	//clear all tools
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise

	$("#iconET").addClass("active");
	
	fExp.showThreadBar();
}


function rollOver(what) {
	currentstate = $(what).children().attr("src");
	newstate = currentstate.replace("_off","_over");
	$(what).children().attr("src",newstate);
}

function rollOut(what) {
	currentstate = $(what).children().attr("src");
	newstate = currentstate.replace("_over","_off");
	$(what).children().attr("src",newstate);
}



// ----- Modified jContextMenu for Right clicking ------
$.fn.fShowMenu = function(options) {
	var opts = $.extend({}, $.fn.fShowMenu.defaults, options);
	$(this).bind("contextmenu",function(e){
		//chech how many and which objects are underneath the click
		clickedX = e.pageX;
		clickedY = e.pageY;

		//create DIVS holders
		$("#container").append('<div id="fRightClickMenu"></div>');

		var countItems = 0;
		// foreach div.fObject compare clickedX to elementX + width (+do the same for Y)
		$("div.fObject").each(function() {

			whatelement = $(this);
			elementX = $(this).offset().left;
			elementY = $(this).offset().top;
			elementW = $(this).width();
			elementH = $(this).height();

			//see if the object was clicked on and attach object links
			if ((elementX < clickedX) && (clickedX < elementX + elementW) && (elementY < clickedY) && (clickedY < elementY + elementH)) {
				$("#fRightClickMenu").prepend('<div onclick="fSel.selectObject(' + $("div").index(this) + ')"><a href="#">Element Name</a></div>');
				$("#fRightClickMenu div:first-child a").html(whatelement.attr("id"));
				
				// attach parent,child,selected indicators if available
				if (whatelement.attr("id") == fSel.sI[0]) { $("#fRightClickMenu div:first-child").addClass("selected"); }
				if (whatelement.attr("id") == $("#" + fSel.sI[0]).parent().attr("id")) { $("#fRightClickMenu div:first-child").addClass("parent"); }
				// TODO children??
				// TODO reflect multiple selects?
				countItems++;
			}
		});
		//show menu only if countItems exist and not recording clicks with 
		if ((countItems > 0) && ($("#fExpAct").is(':hidden'))) {
			$(opts.query).show().css({
				top:e.pageY+"px",
				left:e.pageX+"px",
				position:"absolute",
				opacity: opts.opacity,
				zIndex: opts.zindex
			});
		}
		else {
			$(opts.query).remove();
		}
		return false;
	});
	$(document).bind("click",function(e){
		$(opts.query).remove();
	});
};

$.fn.fShowMenu.defaults = {
	query: document,
	opacity: 1.0
};



// Global Mouse, used to capture global dimensions (used by statemanager for example)
var fGM = {
	x : 0,
	y : 0,
	reachedBottom : false,
	distanceToBottom : 0,
	capture : function(e) {
		fGM.x = e.pageX;
		fGM.y = e.pageY;
		fGM.distanceToBottom = $(window).height() - e.pageY;
		
		//hide footer
		fFooter.contract();
	}
}


var fUnselectable = {
	enable : function(e) {
		var e = e ? e : window.event;

		if (e.button != 1) {
			if (e.target) {
				var targer = e.target;
			} else if (e.srcElement) {
				var targer = e.srcElement;
			}

			var targetTag = targer.tagName.toLowerCase();
			if ((targetTag != "input") && (targetTag != "textarea")) {
				return false;
			}
		}
	},

	disable : function () {
		return true;
	}
}


// -------- Session Object -----
var fSession = {
	//contains instance names which contain 
	// .editAs - whether the instance is being editted as Obj 0 or Inst 1 // this is populate with fFooter
	// .state - the remembered state of the instance //this is first prepopulated with jO.load 
	// .editStatesAs - 0 is one, 1 is all // this is first prepopulated with jO.load 
	// .changed = 0 or 1 
	// .sThread - contains last editable thread
}


// -------- JSON Object -----
// this section contains the JSON data objects and instances
var jO = {
	saveSessionTimeout : null, //contains timeout ID to kill 
	changed : false, //used to determin if to call saveSession
	jData : null,
	load : function (whatToLoad, type) {
		//type = can be either 'file' or 'json'
		ref = this;
		
		//clear jData
		delete	jO.jData;
		jO.jData = new Object;
		
		//file loading
		if(type == 'file') {
			$.ajax({
			  url: whatToLoad,
			  dataType: 'json',
			  success: function(data){
				jO.jData = data;
				fSaveLoad.currentProjectName = jO.jData.project.projectName;
				fWorkspace.init();
				}
			});
		}
		else if(type == 'json') {
			jQuery.extend(true, jO.jData, $.evalJSON(whatToLoad));
			fWorkspace.init();
		}
		else if(type == 'jsonSession') {
			jO.jData = whatToLoad;
			fWorkspace.init();
		}
	},
	tr : function(item) { //removes _ref string from element references
		item = item.replace(/_.*/, '');
		return (item);
	},
	deleteItems : function(itemsToDelete) {
		for (var i = 0; i < itemsToDelete.length; i++) {
				//find parent in JSON
				//parentName = $("#" + itemsToDelete[i]).parent().attr("id");
				var parentName = null;
				var parentState = null;
				
				//find on workspace
				for (pages in jO.jData.pages) {
					if(jO.jData.pages[pages].contains[itemsToDelete[i]] != undefined) {
						parentName = pages;
						break;
					}
				}
				
				//find in instances
				if (parentName == null) {
					for (items in jO.jData.instances) {
						for (states in jO.jData.instances[items].states) {
							if (jO.jData.instances[items].states[states].contains[itemsToDelete[i]] != undefined) {
								parentName = items;
								parentState = states;
								break;
							}
						}
						
						if (parentName != null) {
							break;
						}
					}
				}
				
				//find in objects
				if (parentName == null) {
					for (items in jO.jData.objects) {
						for (states in jO.jData.objects[items].states) {
							if (jO.jData.objects[items].states[states].contains[itemsToDelete[i]] != undefined) {
								parentName = items;
								parentState = states;
								break;
							}
						}
						
						if (parentName != null) {
							break;
						}
					}
				}
				
				
				//remove from "contains" of parent instance in jData
				if (parentName.match("page")) {
					delete jO.jData.pages[parentName].contains[jO.tr(itemsToDelete[i])];
				}
				else if (parentName.match("ins")) {
					delete jO.jData.instances[parentName].states[parentState].contains[jO.tr(itemsToDelete[i])];
				}
				else if (parentName.match("obj")) {
					delete jO.jData.objects[parentName].states[parentState].contains[jO.tr(itemsToDelete[i])];
				}
				
				//remove item
				if (itemsToDelete[i].match("ins")) {
					var objName = jO.jData.instances[itemsToDelete[i]].of;
					
					//remove instance
					delete jO.jData.instances[itemsToDelete[i]];
					
					//remove from allInstances
					delete jO.jData.objects[objName].allInstances[jO.tr(itemsToDelete[i])];
					
					//todo clear actual objects in jO if (last instance cleared)
				}
				else if (itemsToDelete[i].match("t")) {
					//remove real text element
					delete jO.jData.elements[jO.tr(itemsToDelete[i])];
				}
				
				//remove DOM objects from the workspace
				if(itemsToDelete[i] != "fWorkspace") {
					$("#" + itemsToDelete[i]).remove();
				}
				
			}
			
		//savesession
		fSaveLoad.saveSessionDelay();
	},
	getAvailableId : function(type,objName) {
		var lookWhere = null;
		var idName = null;
		
		if(type == 'idea') { lookWhere = jO.jData.ideas[objName]; idName = "";}
		else if(type == 'inst') { lookWhere = jO.jData.instances; idName = "ins";}
		else if(type == 'txt') { lookWhere = jO.jData.elements; idName = "t";}
		else if(type == 'form') { lookWhere = jO.jData.elements; idName = "f";}
		else if(type == 'obj') { lookWhere = jO.jData.objects; idName = "obj";}
		else if(type == 'page') { lookWhere = jO.jData.pages; idName = "page";}
		else if(type == 'thread') { lookWhere = jO.jData.threads; idName = "t";}
		
		var availableId = 0;
		//alert (lookWhere + ":" + type + ":" + idName);
		for (i=1;i < 100000;i++) {
			if (lookWhere[idName + i] != undefined) {}
			else { availableId = idName + i; break;	}
		}
		return(availableId);
	},
	getAvailableStateId : function(inst) {
		var availableId = 0;
		for (i=1;i < 100000;i++) {
			if (inst == "fWorkspace") { availableId = "s1"; break; }
			else if (jO.jData.instances[inst] == undefined) { availableId = "s1"; break; }
			else if ("s" + i in jO.jData.objects[jO.jData.instances[inst].of].states) {}
			else { availableId = "s" + i; break;	}
		}
		return(availableId);
	},
	getInstancesOfObj : function(objId, options) {
		//gets and returns ALL or WORKSPACE instances belonging to an object 
		// options can be "all" or "workspace"
		var returnItems = new Array();
		if (options.type == "all") {
			for (items in jO.jData.objects[objId].allInstances) {
				returnItems.push(items);
			}
		}
		else if (options.type == "workspace") {
			for (items in jO.jData.objects[objId].allInstances) {
				if ( $("#" + items).length > 0 ) { //test if exists on workspace
					returnItems.push(items);
				}
			}
		}
		return(returnItems);
	},
	getLastPageId : function() {
		lastPageId = 0;
		for (items in jO.jData.pages) {	lastPageId = items; }
		return(lastPageId);
	},
	countObjProperties : function() {
		i = 0; for (items in jO.jData.pages) {	i++; } return i;
	},
	jsonToText : function() {
			//var myJSONText = JSON.stringify(this.jData);
			var myJSONText = $.toJSON(this.jData);
			
			//format
			myJSONText = myJSONText.replace(/{/g, '{\n')
			myJSONText = myJSONText.replace(/}/g, '}\n')
			myJSONText = myJSONText.replace(/,/g, ',\n')
			var lines;
			var newlines;
			var frontSpacer = 0;
			lines=myJSONText.split("\n");
			myJSONText = "";
			for(var i=0; i<lines.length; i++) {
				//with fronspacer generate newline & append
				var tabs = "";
				for(var j=0; j<frontSpacer; j++) { tabs += "\t"; }
				newlines = tabs + lines[i] + "\n";
				newlines = newlines.replace(/\t}/, '}');
				myJSONText += newlines;
				
				//foreach open brackets ++
				if (lines[i].indexOf("{") != "-1") { frontSpacer++; } 
				//foreach closed bracket --
				if (lines[i].indexOf("}") != "-1") { frontSpacer--; } 
			}
			
			return(myJSONText);
	},
	update : function(instance, options) {
		//updates either object or instance
		// instance is a string name of an instance to be updated
		// options is an object whose properties can be
		// options.type "instance", "object" or undefined (to use the fSession editAs property)
		// options.x,y,w,h and whose values are numbers 
		// options.xs, .ys are x,y coordinates but are summed to existing values
		// options.t contains tone values 
		// options can also be contents or events TODO
		
		var instRef = jO.jData.instances[jO.tr(instance)];
		var objRef = jO.jData.objects[jO.jData.instances[jO.tr(instance)].of];
		statesToEdit = new Array(); // this will hold all states to be edited
		
		//determine which statesToEdit
		//all states
		if (fSession[fSel.nInst].editStatesAs == 1) { 
			for (eachState in instRef.states) {
				if(options.type == "instance")    { statesToEdit.push(instRef.states[eachState]); }
				else if(options.type == "object") { statesToEdit.push(objRef.states[eachState]); }
				else { 
					//determine instance or object from fSession
					if (fSession[instance].editAs == 0) { statesToEdit.push(objRef.states[eachState]); }
					else {statesToEdit.push(instRef.states[eachState]); }
				}
			}
		}
		//one
		else {
			if(options.type == "instance")    { statesToEdit.push(instRef.states[fSession[jO.tr(instance)].state]); }
			else if(options.type == "object") { statesToEdit.push(objRef.states[fSession[jO.tr(instance)].state]); }
			else {
				//determine instance or object from fSession
				if (fSession[jO.tr(instance)].editAs == 0) { statesToEdit.push(objRef.states[fSession[jO.tr(instance)].state]); }
				else {
					statesToEdit.push(instRef.states[fSession[jO.tr(instance)].state]); 
					//force inheritance
				}
			}
		}
		
		//loop through all statesToEdit and make the different type of edits
		for (i=0;statesToEdit.length > i;i++ ) {
			//alert("x:" + options.y + " y:" + options.x + " h:" +options.h + " w:" + options.w)
			if (options.x != undefined) { statesToEdit[i].x = options.x }
			if (options.y != undefined) { statesToEdit[i].y = options.y }
			if (options.xs != undefined) { statesToEdit[i].x += options.xs }				
			if (options.ys != undefined) { statesToEdit[i].y += options.ys }				
			if (options.w != undefined) { statesToEdit[i].w = options.w; }
			if (options.h != undefined) { statesToEdit[i].h = options.h; }
			if (options.t != undefined) { statesToEdit[i].t = options.t; }
			if (options.iPos != undefined) { statesToEdit[i].iPos = options.iPos; }
			if (options.iSize != undefined) { statesToEdit[i].iSize = options.iSize; }
			if (options.iContents != undefined) { statesToEdit[i].iContents = options.iContents; }
			if (options.iEvents != undefined) {	statesToEdit[i].iEvents = options.iEvents; }
			if (options.iTone != undefined) { statesToEdit[i].iTone = options.iTone;}
		}
		
		//set fSession.changed to 1 (need instance name)
		if(options.type == "instance")    {  
			fSession[jO.tr(instance)].changed = 1;
		}
		else if(options.type == "object") { 
		for (items in objRef.allInstances)
			fSession[items].changed = 1;
			fFooter.instRedraw();
		}
		
		//savesession
		fSaveLoad.saveSessionDelay();
	},
	updateElements : function(element, options) {
		//updates either object or instance
		// instance is a string name of an instance to be updated
		// options is an object whose properties can be
		// options.type "instance", "object" or undefined (to use the fSession editAs property)
		// options.x,y,w,h and whose values are numbers 
		// options.xs, .ys are x,y coordinates but are summed to existing values
		// options can also be contents or events TODO
		var elementRef = jO.jData.elements[element];
		var insName = $("#"+element).parent().attr("id");
		var insRef = jO.jData.instances[insName];

		//alert("x:" + options.x + " y:" + options.x + " h:" +options.h + " w:" + options.w)
		if (options.x != undefined) { elementRef.x = options.x }
		if (options.y != undefined) { elementRef.y = options.y }
		if (options.xs != undefined) { elementRef.x += options.xs }				
		if (options.ys != undefined) { elementRef.y += options.ys }				
		if (options.w != undefined) { elementRef.w = options.w; }
		if (options.h != undefined) { elementRef.h = options.h; }
		if (options.txt != undefined) {	elementRef.txt = options.txt; }
		
		//savesession
		fSaveLoad.saveSessionDelay();
	},
	createObj : function(name,x,y,width,height) {
		//alert('name:' + name + ', x:' + x + ', y:' + y + ', width:' + width + ', height:' + height);
		//determine which Id to give the object
		var newObjId = jO.getAvailableId('obj');
		//create it
		jO.jData.objects[newObjId] = new Object();
		jO.jData.objects[newObjId].name = name;
		jO.jData.objects[newObjId].i = "1";
		jO.jData.objects[newObjId].defState = "s1";
		jO.jData.objects[newObjId].defIdea = "1";
		jO.jData.objects[newObjId].allInstances = new Object;
		jO.jData.objects[newObjId].states = new Object;

		//create state
		jO.jData.objects[newObjId].states.s1 = new Object;
		jO.jData.objects[newObjId].states.s1.contains = new Object;
		jO.jData.objects[newObjId].states.s1.sName = "state";
		jO.jData.objects[newObjId].states.s1.x = x;
		jO.jData.objects[newObjId].states.s1.y = y;
		jO.jData.objects[newObjId].states.s1.w = width;
		jO.jData.objects[newObjId].states.s1.h = height;
		jO.jData.objects[newObjId].states.s1['z-index'] = 1;
		
		return (newObjId);
	},
	createTxt : function(txt,x,y,width,height) {
		var newTxtId = jO.getAvailableId('txt');
		
		//create it
		jO.jData.elements[newTxtId] = new Object();
		jO.jData.elements[newTxtId].txt = txt;
		jO.jData.elements[newTxtId].x = x;
		jO.jData.elements[newTxtId].y = y;
		jO.jData.elements[newTxtId].w = width;
		jO.jData.elements[newTxtId].h = height;
		
		return (newTxtId);
	},
	createForm : function(formtype,x,y,width,height) {
		var newFormId = jO.getAvailableId('form');
		if(width == undefined) { width = "auto";}
		if(height == undefined) { height = "auto";}
		
		if(x == undefined) { x = 10;}
		if(y == undefined) { y = 10;}
		
		//create it
		jO.jData.elements[newFormId] = new Object();
		jO.jData.elements[newFormId].type = formtype;
		jO.jData.elements[newFormId].x = x;
		jO.jData.elements[newFormId].y = y;
		jO.jData.elements[newFormId].w = width;
		jO.jData.elements[newFormId].h = height;
		
		return (newFormId);
	},
	createThread : function(title,story) {
		var newThreadId = jO.getAvailableId('thread');
		
		//create it
		jO.jData.threads[newThreadId] = new Object();
		jO.jData.threads[newThreadId].title = title;
		jO.jData.threads[newThreadId].story = story;
		jO.jData.threads[newThreadId].points = new Array;
		jO.jData.threads[newThreadId].x = Math.floor(Math.random()*(130-10)+10); //random number between 50 and 160
		jO.jData.threads[newThreadId].y = Math.floor(Math.random()*(600-50)+50); //random number between 200 and 600
		
		return (newThreadId);
	},
	createThreadPoint : function(threadID,type,position,option,mouseType,x,y,key) {
		var tArray = jO.jData.threads[threadID].points;
		var tArrayIndex = null;
		
		if(option == "end") {
			tArray.push(new Object());
			tArrayIndex = tArray.length-1;
		}
		else if(typeof option == "string") {
			if(option.match('after')){
				tArray.splice(position+1,0,new Object());
				tArrayIndex = position + 1;
			}
		}
		//replace
		else {
			tArray.splice(position,1,new Object());
			tArrayIndex = position;
		}
		
		//snapshots
		if(type == "snap") {
			tArray[tArrayIndex].type = "snap";			
			tArray[tArrayIndex].page = fPanelPages.selectedPageId;
			tArray[tArrayIndex].states = new Object;
			
			// foreach div.fObject save states
			$("div.fObject").each(function() {
				var instName = $(this).attr("id");
				//if(fSession[instName].state != "s1") {
					tArray[tArrayIndex].states[instName] = fSession[instName].state;
				//};
			});
		}
		//actions
		else if (type == "act") {
			tArray[tArrayIndex].type = "act";	
			tArray[tArrayIndex].mouse = mouseType;
			tArray[tArrayIndex].x = x;
			tArray[tArrayIndex].y = y;
			tArray[tArrayIndex].key = key;
		}
		
	},
	instantiate : function (ID,instanceId,state,parentType) {
		//alert(ID + ":" + instanceId);
		//what object (or text), instatiate in which instances, in what state, and update parent object 0 or instance 1
		//move the instanceID to its parent if workspace or instance is not selected
		if (!(instanceId.match("fWorkspace")||instanceId.match("ins"))) {
			instanceId = $("#" + instanceId).parent().attr("id");
		}
		//alert(ID + ":" + instanceId + ":" + state);
		if(parentType == undefined) {
			if (fSel.editAs == 0) {parentType = 0;}
			else {parentType = 1;}
		}
		
		// FOR INSTANCES
		if (ID.match("obj") != null) {
		
			//grab available ID
			newInstId = jO.getAvailableId('inst');
			
			//unsure there are no undefined values in ps
			if (state == undefined) {state = ""};
			
			//create instance
			var addWhereRef = jO.jData.instances;
			addWhereRef[newInstId] = new Object;
			addWhereRef[newInstId].of = ID;
			addWhereRef[newInstId].states = new Object;
			addWhereRef[newInstId].p = instanceId; if(instanceId == "fWorkspace") {addWhereRef[newInstId].p = fPanelPages.selectedPageId;}
			addWhereRef[newInstId].ps = state;
			
			//recreate states in instace as they are in the object
			for (states in jO.jData.objects[ID].states) {
				jO.jData.instances[newInstId].states[states] = new Object;

				//copy properites from object					
				iPos = 1
				iSize = 1;
				iContents = 1;
				iEvents = 1;
				iTone = 1;
				x = jO.jData.objects[ID].states[states].x;
				y = jO.jData.objects[ID].states[states].y;
				w = jO.jData.objects[ID].states[states].w;
				h = jO.jData.objects[ID].states[states].h;

				jO.jData.instances[newInstId].states[states].iPos = iPos;
				jO.jData.instances[newInstId].states[states].iSize = iSize;
				jO.jData.instances[newInstId].states[states].iContents = iContents;
				jO.jData.instances[newInstId].states[states].iEvents = iEvents;
				jO.jData.instances[newInstId].states[states].iTone = iTone;
				jO.jData.instances[newInstId].states[states].contains = new Object;
				jO.jData.instances[newInstId].states[states].x = x;
				jO.jData.instances[newInstId].states[states].y = y;
				jO.jData.instances[newInstId].states[states].w = w;
				jO.jData.instances[newInstId].states[states].h = h;
			}
			
			//create fSession instance state
			fSession[newInstId] = new Object;
			fSession[newInstId].state = "s1";
			fSession[newInstId].editAs = 1;
			fSession[newInstId].editStatesAs = 0; //default edit OneState
			
			//update allInstances reference inside Object
			jO.jData.objects[ID].allInstances[newInstId] = 1;
		}
		
		// FOR TXT
		if (ID.match("t") != null) {
			newInstId = ID;
		}
		
		// FOR FORMS
		if (ID.match("f") != null) {
			newInstId = ID;
		}
		
		
		//if fWorkspace update pages
		if (instanceId == "fWorkspace") {
			jO.jData.pages[fPanelPages.selectedPageId].contains[newInstId] = "";
		}
		// update parent instances or object
		else {
			//parentName = $("#" + fSel.sI[0]).parent().attr("id");
			//alert(newInstId + ":" + parentName);
			if (parentType == 0) {
				jO.jData.objects[fSel.nObj].states[state].contains[newInstId] = "";
			}
			else {
				//alert(instanceId + ":" + state + ":" + jO.tr(instanceId));
				jO.jData.instances[instanceId].states[state].contains[newInstId] = "";
			}
		}
		
		//savesession
		fSaveLoad.saveSessionDelay();
		
		return(newInstId);
	},
	copyInstance : function(whatInst,options) {
		//create initial instance list to go through and reinstantiate 
		var instantiateWhat = new Array();
		instantiateWhat.push(whatInst);

		var instantiateIntoWhere = new Array();
		instantiateIntoWhere.push(fSel.sI[0]); //default 

		var instantiateIntoState = new Array();
		if (fSession[fSel.nInst] != undefined) {
			instantiateIntoState.push(fSession[fSel.nInst].state); //default 
		}
		else {
			instantiateIntoState.push(null); //default 
		}
		
		var firstNewInst = null;
		
		for(var i=0; i < instantiateWhat.length; i++) {
			//new object copy
			if (options == 'object') {
				//determine which Id to give the object and create it
				newObjId = jO.getAvailableId('obj');
				jO.jData.objects[newObjId] = new Object;
				
				//copy 
				jQuery.extend(true, jO.jData.objects[newObjId], jO.jData.objects[jO.jData.instances[instantiateWhat[i]].of]);
				
				var jRef = jO.jData.objects[newObjId];
				for (items in jRef.allInstances) {
					delete jRef.allInstances[items];
				};
				
				for (states in jRef.states) {
					for (contains in jRef.states[states].contains) {
						delete jRef.states[states].contains[contains];
					}
				};
				
				newInst = jO.instantiate(newObjId, instantiateIntoWhere[i], instantiateIntoState[i]);
			}
			//standard copy - instantiate
			else {
				newInst = jO.instantiate(jO.jData.instances[instantiateWhat[i]].of, instantiateIntoWhere[i], instantiateIntoState[i]);
			}
			//save the first new Instance name
			if(firstNewInst == null) {firstNewInst = newInst;}
			
			//go through all states			
			for (states in jO.jData.instances[instantiateWhat[i]].states) {
				cFrom = jO.jData.instances[instantiateWhat[i]].states;
				cTo = jO.jData.instances[newInst].states;
				
				//copy instance state properties
				jQuery.extend(true, cTo[states], cFrom[states]);
				
				//delete contains
				delete cTo[states].contains;
				cTo[states].contains = new Object;
				
				//copy contains items
				for (containsItem in cFrom[states].contains) {
					//form elements
					if (containsItem.match("f")) {
						newFormId = jO.createForm();
						jQuery.extend(true, jO.jData.elements[newFormId], jO.jData.elements[containsItem]);
						newID = jO.instantiate(newFormId, newInst, states);
					}
					//text elements
					else if (containsItem.match("t")) {
						newTextId = jO.createTxt();
						jQuery.extend(true, jO.jData.elements[newTextId], jO.jData.elements[containsItem]);
						newID = jO.instantiate(newTextId, newInst, states);
					}
					else if (containsItem.match("ins")) {
						//add to loop
						instantiateWhat.push(containsItem);
						instantiateIntoWhere.push(newInst);
						instantiateIntoState.push(states);
					}
				}
			}
		}
		
		return (firstNewInst);
	},
	createState : function(instance) {
		// instance, is used to figure out where to add the new state
		if (instance == undefined) {
			instance = fSel.nInst; //use selected instance
		}
		
		//grab a new possible state name
		var newState = this.getAvailableStateId(instance);
		var instRef = jO.jData.instances[instance];
		var objRef = jO.jData.objects[jO.jData.instances[instance].of];
		
		//create object state if does not already exist
		if (objRef.states[newState] == undefined) {
			objRef.states[newState] = new Object;
			objRef.states[newState].contains = new Object;
			objRef.states[newState].sName = "state " + newState.replace("s","");
			
			// and copy properties from currently selected object if not creating the state for the first time (s1)
			if (newState != "s1") {
				objRef.states[newState].x = fSel.jObj.states[fSession[fSel.nInst].state].x;
				objRef.states[newState].y = fSel.jObj.states[fSession[fSel.nInst].state].y;
				objRef.states[newState].w = fSel.jObj.states[fSession[fSel.nInst].state].w;
				objRef.states[newState].h = fSel.jObj.states[fSession[fSel.nInst].state].h;
				objRef.states[newState]['z-index'] = fSel.jObj.states[fSession[fSel.nInst].state]['z-index'];
				//populate contents as well from objects only
				for (items in fSel.jObj.states[fSession[fSel.nInst].state].contains) {
					//objects
					if(items.match("ins")) {
						newInstanceName = jO.instantiate(jO.jData.instances[items].of, fSel.nInst, newState, 0);
						//todo this has to happen recursively
					}
					//txt
					else if (items.match("t")) {
						//newTxtId = jO.instantiate(jO.jData.elements[items]);
						tref = jO.jData.elements[items];
						newTxtId = jO.createTxt(tref.txt,tref.x,tref.y,tref.w,tref.h);
						//update state contains
						objRef.states[newState].contains[newTxtId] = "";
					}
				}
			}
		}
		
		//create state in all instances belonging to this object (need to keep them in sync)
		//generate a list of instances which need updating
		instancesToUpdate = new Array();
		instancesToUpdate = this.getInstancesOfObj(instRef.of,{type: "all"});

		// if no instances belong to the object this means it's the first time, so add the instance as a valid one to update
		if (instancesToUpdate.length == 0) {
			instancesToUpdate.push(instance);
		}
		
		//create blank states from the instancesToUpdate array, with inheritance, size and position from previous state
		for (i=0;i<instancesToUpdate.length;i++) {
			//check if newState (determined from objects) does not already exist in instaces. As sometimes obj / inst states get out of syn during idea creation, and it's important not to overwrite existing states
			if (!jO.jData.instances[instancesToUpdate[i]].states.hasOwnProperty(newState)) {
				jO.jData.instances[instancesToUpdate[i]].states[newState] = new Object;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iPos = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].iPos;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iSize = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].iSize;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iContents = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].iContents;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iEvents = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].iEvents;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iTone = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].iTone;
				jO.jData.instances[instancesToUpdate[i]].states[newState].contains = new Object;
				jO.jData.instances[instancesToUpdate[i]].states[newState].x = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].x;
				jO.jData.instances[instancesToUpdate[i]].states[newState].y = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].y;
				jO.jData.instances[instancesToUpdate[i]].states[newState].w = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].w;
				jO.jData.instances[instancesToUpdate[i]].states[newState].h = jO.jData.instances[instancesToUpdate[i]].states[fSession[fSel.nInst].state].h;
			}
		}
		
		//savesession
		fSaveLoad.saveSessionDelay();
		
		return(newState);
	},
	createIdea: function(instance){
		//CREATING FOR FIRST TIME
		objName = jO.jData.instances[instance].of;
		if(!jO.jData.ideas.hasOwnProperty(objName)) {
			//create obj
			jO.jData.ideas[objName] = new Object;
			
			//create idea
			newIdeaId = jO.getAvailableId('idea',objName);
			jO.jData.ideas[objName][newIdeaId] = new Object;
			
			//copy 
			jQuery.extend(true, jO.jData.ideas[objName][newIdeaId], jO.jData.objects[objName]);
		}
		
		//create idea
		newIdeaId = jO.getAvailableId('idea',objName);
		jO.jData.ideas[objName][newIdeaId] = new Object;
		
		//copy 
		jQuery.extend(true, jO.jData.ideas[objName][newIdeaId], jO.jData.objects[objName]);
		
		//FOREACH STATE
		for (state in jO.jData.ideas[objName][newIdeaId].states) {
			//clear contains
			delete jO.jData.ideas[objName][newIdeaId].states[state].contains;
			jO.jData.ideas[objName][newIdeaId].states[state].contains = new Object;
		}
		
		//savesession
		fSaveLoad.saveSessionDelay();
		
		return(newIdeaId);
	}
};


// -------- ClibBoard Manager Popup Object -----
// this section contains the clibboard objects
var fCBManager = {
	opened : false,
	pasteAs: "", //master or instance
	openedPaste : false,
	mouseover : false, //checked by keyReleased function to see if the mouse is still not over, before hiding it
	mode : "empty", //wholepage, multiple instances, multiple objects, instance, objects
	states : "", //one state or all 
	instances : [], //array with instance names to copy
	copiedPage : null, //name of a copied page
	cutting : false, //flag wether items are just being copied or cut
	title : "", // display title
	displayManager : function() {
		if (this.opened == false) {
			var setx = 0;
			var sety = 0;
//			[setx,sety] = fWorkspace.positionManager('fCBManager');
			var _temp = fWorkspace.positionManager('fCBManager');
			setx = _temp[0];
			sety = _temp[1];
				
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fCBManager").css({left: setx});
			$("#fCBManager").css({top: sety});
			
			//set title
			$("#fCBTitle").html(this.title);
			
			//set mouseover 
			this.mouseover = true;
			
			//assign hiding ... if not holding down C, hide on mouseleave
			//$("#fCBManager").bind("mouseleave", function(e){ if(cPressed == false) {fCBManager.hideManager(); this.mouseover=false;}}); 
			//$("#fCBManager").bind("mouseenter", function(e){ this.mouseover=true;}); 
			
			//reset all
			$(".fCBContents").hide();
			
			//display types
			//CB Empty
			if(this.mode == "empty") {
				$("#CBEmpty").show();
			}
			else if(this.mode == "instance") {
				$("#CBInstance").show();
			}
			else if(this.mode == "text") {
				$("#CBText").show();
			}
			else if(this.mode == "form") {
				$("#CBForm").show();
			}
			else if(this.mode == "page") {
				$("#CBPage").show();
				$("#CBPage > div").html("Page: " + jO.jData.pages[this.copiedPage].pageName);
			}
			

			
			//update opened state
			this.opened = true;
		}
	},
	displayPasteManager : function() {
		if (this.openedPaste == false) {
			var setx = 0;
			var sety = 0;

//			[setx,sety] = fWorkspace.positionManager('fPManager');
			var _temp = fWorkspace.positionManager('fPManager');
			setx = _temp[0];
			sety = _temp[1];
				
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fPManager").css({left: setx});
			$("#fPManager").css({top: sety});
			
			//set mouseover 
			this.mouseover = true;
			
			//assign hiding ... if not holding down C, hide on mouseleave
			$("#fPManager").bind("mouseleave", function(e){ fCBManager.hidePasteManager(); this.mouseover=false;}); 
			$("#fPManager").bind("mouseenter", function(e){ this.mouseover=true;}); 
			
			//update opened state
			this.openedPaste = true;
			
			//display the Paste Manager's content properly
			this.redrawPasteManager();
			
			//highlight pasting into
			fSel.highlight();
		}
	},
	cut : function() {
		//copy
		this.copy();
		
		//set cutting flag
		this.cutting = true;
		
		//reselect the workspace
		fSel.sI[0] = "fWorkspace";
		
		//redraw page
		fWorkspace.redraw();
	},
	copy : function() {
		if ((this.opened == false) && (fSel.sI.length != 0)) {
			//clear cutting just in case
			fCBManager.cutting = false;
			
			//set copy type
			if(fSel.editAs == 0) { this.type = "object";}
			else { this.type = "instance"; }
			
			//clear instances
			this.instances = null;
				
			//copy instance names
			this.instances = fSel.sI.slice();

			//set mode
			//check for instances
			var hasInstances = false;
			for(i = 0; i < this.instances.length; i++) {
				if (this.instances[i].match("ins")) {
					hasInstances = true;
					break;
				}
			}
			if(hasInstances == true) {
				this.mode = "instance";
				//update selected object
				this.title = "Object: " + jO.jData.objects[fSel.nObj].name;
			}
			else if(this.instances[0].match("fWorkspace")) {
				this.mode = "page";
				this.copiedPage = fPanelPages.rememberPageSelectedId;
			}
			else if(this.instances[0].match("t")) {
				this.mode = "text";
			}
			else if(this.instances[0].match("f")) {
				this.mode = "form";
			}
			
			//highlight cbMini
			$("#cbMini").animate({opacity: "0"}, 100).animate({opacity: "1"}, 500);			
			
			//restyle
			fWorkspace.redraw();
		}
	},
	paste : function() {
		//instantiate
		
		//check if the selected item is on the selected page
		if(!$("#" + fSel.sI[0]).length > 0) {
			//if not, then select the workspace :)
			fSel.selectObject($("#fWorkspace"));
		}
		
		//select the parent if workspace or instance is not selected
		if (!(fSel.sI[0].match("fWorkspace")||fSel.sI[0].match("ins"))) {
			fSel.selectObject($("#" + fSel.sI[0]).parent());
			drawWhere = $("#" + fSel.sI[0]);
		}
		
		//Copy Full page
		if(this.mode == "page") {
			var i = 0;
			
			//clear instances
			delete this.instances;
			this.instances = new Array()
			
			//update all instances to copy from page
			for (items in jO.jData.pages[this.copiedPage].contains) {
				this.instances[i] = items;
				i++;
			}
		}

		//Paste Individual Items
		for (var i = 0; i < this.instances.length; i++) {
			if (fSel.sI[0].match("ins") || fSel.sI[0].match("fWorkspace")) {
				//instances
				if (this.instances[i].match("ins")) {
					if ((fSel.nObj == jO.jData.instances[this.instances[i]].of) && fSel.sI[0].match("ins") && (this.pasteAs == "instance")) {
						//todo display error message - cannot paste intstance into itself
						fWorkspace.notify("cannot paste object into itself :(");
					}
					else {
						if (this.pasteAs == "instance") {
							//copy instance
							ID = jO.copyInstance(this.instances[i]);
						}
						else if (this.pasteAs == "master") {
							//newID = jO.copyObject(jO.jData.instances[this.instances[i]].of);
							//ID = jO.instantiate(newID, fSel.sI[0], fSession[fSel.nInst].state);
							ID = jO.copyInstance(this.instances[i],'object');
						}
					}
				}
				//text
				else if (this.instances[i].match("t")) {
					//create new text from existing one
					tref = jO.jData.elements[this.instances[i]];
					newTxtId = jO.createTxt(tref.txt,tref.x,tref.y,tref.w,tref.h);
					
					if (fSession[fSel.nInst] != undefined) {
						ID = jO.instantiate(newTxtId, fSel.sI[0], fSession[fSel.nInst].state);
					}
					else {
						ID = jO.instantiate(newTxtId, fSel.sI[0]);
					}
				}
				//form
				else if (this.instances[i].match("f")) {
					//create new text from existing one
					tref = jO.jData.elements[this.instances[i]];
					newTxtId = jO.createForm(tref.type,tref.x,tref.y,tref.w,tref.h);
	
					if (fSession[fSel.nInst] != undefined) {
						ID = jO.instantiate(newTxtId, fSel.sI[0], fSession[fSel.nInst].state);
					}
					else {
						ID = jO.instantiate(newTxtId, fSel.sI[0]);
					}
				}
				
				//redraw Objects
				fWorkspace.redraw();
				
				//reposition if overlapping
				this.indentPosition(ID);
				
				//give visual feedback that paste has occured
				this.pasteFeedback(ID);
				
				//select the newly pasted object
				//fSel.selectObject(ID);
			}
		}
		
		//remove items if it is a cut
		if((fCBManager.cutting == true) && (fCBManager.instances.length >= 1)) {
			jO.deleteItems(fCBManager.instances);
			fCBManager.cutting = false;
			
			//clear clipboard
			fCBManager.mode = "empty";
		}
	},
	pasteAsMaster : function() {
		//clear button Instance
		$("#buttonNewInstance").removeClass("active");
		
		//set Master
		$("#buttonNewMaster").addClass("active");
		
		//update "as" field
		$("#fPasteMode").html("master");
		
		this.pasteAs = "master";
	},
	pasteAsInstance : function() {
		//clear button Master
		$("#buttonNewMaster").removeClass("active");
		
		//set Instance
		$("#buttonNewInstance").addClass("active");
		
		//update "as" field
		$("#fPasteMode").html("instance");
		
		this.pasteAs = "instance";
	},
	pasteFeedback : function(what) {
		$("#" + what).prepend('<div class="pasteFillInst" id="pasteFill"></div>');
		$("#pasteFill").animate({
			"opacity": "0"
		}, {
			duration: "fast",
			complete: function(){
				$("#pasteFill").remove();
			}
		});
	},
	indentPosition : function(what) {
		var reposition = false;
		howmuch = 0;
		$("#" +what).siblings().each(function(i){
			//detect if to reposition the newly pasted object
			// check if the ID has a position the same as any of the siblings
			//alert($("#" +what).css("left") + ":" + $(this).css("left"));
			if((parseInt($("#" +what).css("left")) + (howmuch * 10) ) == parseInt($(this).css("left"))) {
				reposition = true;
				howmuch++;
				
				//turn off positional inheritance of all items on a page
				//jO.update($(this).attr("id"), {type: "instance",iPos: 0});
			}
		});

	
		if(reposition == true) {
			//update item on workspace
			$("#" + what).css({left: parseInt($("#" + what).css("left")) + (10 * howmuch)});
			$("#" + what).css({top: parseInt($("#" + what).css("top")) + (10 * howmuch)});
			
			//updata jData
			if (what.match("ins")) {
				jO.update(what, {
					type: "instance",
					x: $("#" + what).position().left,
					y: $("#" + what).position().top,
					iPos: 0
				});
			}
			
			else if (what.match("f")) {
				jO.updateElements(what, {
					x: $("#" + what).position().left,
					y: $("#" + what).position().top,
				});
			}
		}
	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fCBManager").stop().fadeOut(100);
			this.opened = false;
		}
	},
	hidePasteManager : function() {
		if (this.openedPaste == true) {
			$("#fPManager").fadeOut(100);
			this.openedPaste = false;
		}
	},
	redrawPasteManager : function() {
		if(this.openedPaste == true) {
			//SHOW HIDE buttons
			if(this.mode == "instance" || "page") {
				$("#buttonNewMaster").show();
				$("#buttonNewInstance").show();
				//set default paste as
				this.pasteAsInstance();	
			}
			else if (this.mode == "text") {
				$("#buttonNewMaster").hide();
				$("#buttonNewInstance").hide();
				//update "as" field
				$("#fPasteMode").html("text");
			}
			else if (this.mode == "form") {
				$("#buttonNewMaster").hide();
				$("#buttonNewInstance").hide();
				//update "as" field
				$("#fPasteMode").html("form");
			}
			
			
			
			//PASTE INTO
			//workspace
			if (fSel.sI[0].match("fWorkspace")) {
				$("#fCBInto1").html("Workspace");
				$("#fCBInto2").html("");
			}
			//instances
			else {
				//update first part of paste into
				if (fSel.editStatesAs == 0) {
					$("#fCBInto1").html("One State of");
				}
				else {
					$("#fCBInto1").html("All States of");
				}
				
				//update second part of paste into
				if (fSel.editAs == 0) { //for edit as object
					$("#fCBInto2").html(jO.jData.objects[fSel.nObj].name);
					$("#fCBInto2").removeClass("fTOrange");
					$("#fCBInto2").addClass("fTBlue");
				}
				else {
					$("#fCBInto2").html(jO.jData.objects[fSel.nObj].name);
					$("#fCBInto2").removeClass("fTBlue");
					$("#fCBInto2").addClass("fTOrange");
				}
			}
		}
	}
}






// -------- IdeaManager Popup Object -----
// this section contains the state manager
var fIdeaManager = {
	opened : false,
	selIdea : "1",
	displayManager : function() {
		if ((this.opened == false) && (fSel.sI[0].match("ins"))) {
			//make sure only one items is selected
			fSel.forceSelectOne();
			
			var setx = 0;
			var sety = 0;
			var rememberedState = fSel.jObj.states[fSession[fSel.nInst].state].sName;
			
			//[setx,sety] = fWorkspace.positionManager('fIdeaManager');
			var _temp = fWorkspace.positionManager('fIdeaManager');
			setx = _temp[0];
			sety = _temp[1];
				
			//reposition so that cursor is closer to the state selection area
			setx -= 40;
			sety -= 60;
			
			$("#fIdeaManager").css({left: setx});
			$("#fIdeaManager").css({top: sety});
			
			//update 
			this.redraw();
		
			//update opened state
			this.opened = true;
		}
	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fIdeaManager").stop().fadeOut(100);
			this.opened = false;
		}
	},
	addIdea: function(){
		var newIdea = jO.createIdea(fSel.nInst);
		this.redraw();
		this.chooseIdea(newIdea);
		
		//fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		fWorkspace.redraw(); 
	},
	redraw : function() {
		//clear all ideas
		$(".fIMIdeas").children().remove();
		
		//preload number of ideas
		// if no ideas
		if (!jO.jData.ideas.hasOwnProperty(fSel.nObj)) {
			$(".fIMIdeas").append('<div class="fIMIdea" id="i1"><a href="#" class="btt btt-states">States</a><input type="radio" name="fStartingIdea"></div>');
		}
		else {
			var i = 1;
			for (items in jO.jData.ideas[fSel.nObj]) {
				$(".fIMIdeas").append('<div class="fIMIdea" id="i' + i + '"><a href="#" onclick="fIdeaManager.chooseIdea(\'' + i + '\')" class="btt btt-states">States</a><input type="radio" name="fStartingIdea" onclick="fIdeaManager.chooseDefaultIdea(\'' + i + '\');"></div>');
				i++;
			}
			
		}
		//get current idea number
		this.selIdea = jO.jData.objects[fSel.nObj].i;
		
		//select the currently selected idea
		$("#i" + this.selIdea + " a").addClass("active");
		
		//update State Text
		$("#fIdeaNumber").text(this.selIdea);
		
		//set default idea (grab from object)
		var defIdea = fSel.jObj.defIdea;
		$("#i" + defIdea + " input").attr("checked", true);
	},
	chooseIdea : function(which) {
		//copy current object to temporary one 
		tempObject = new Object;
		jQuery.extend(true, tempObject, jO.jData.objects[fSel.nObj]);
		
		//copy from chosen ideas to current object
		delete jO.jData.objects[fSel.nObj];
		jO.jData.objects[fSel.nObj] = new Object;
		oRef = jO.jData.objects[fSel.nObj];
		jQuery.extend(true, oRef, jO.jData.ideas[fSel.nObj][which]);
		
		//copy temporary to ideas
		delete oRef[tempObject.i];
		oRef[tempObject.i] = new Object;
		jQuery.extend(true, jO.jData.ideas[fSel.nObj][tempObject.i], tempObject);
		
		//keep some object properties up to date
		delete oRef.allInstances;
		oRef.allInstances = new Object;
		jQuery.extend(true, oRef.allInstances, tempObject.allInstances); 

		//update a number of important properties
		oRef.name = tempObject.name;
		oRef.defState = tempObject.defState;
		oRef.defIdea = tempObject.defIdea;
		
		//delete temporary
		delete tempObject;
		
		//update object selects
		jO.jData.objects[fSel.nObj].i = which;
		
		//downshift a state possibly, if it doesn't exist
		if(!jO.jData.objects[fSel.nObj].states.hasOwnProperty(fSession[fSel.nInst].state)) {
			fSession[fSel.nInst].state = "s1";
		}
		
		//redraw
		this.redraw();
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		
		//reselect (as objects were deleted and references lost)
		fSel.selectObject(fSel.nInst);
	},
	chooseDefaultIdea : function(whichIdea) {
		//update selected object's defaultState
		fSel.jObj.defIdea = whichIdea;
	},
}



// -------- StateManager Popup Object -----
// this section contains the state manager
var fStateManager = {
	opened : false,
	displayManager : function() {
		if ((this.opened == false) && (fSel.sI[0].match("ins"))) {
			//make sure only one items is selected
			fSel.forceSelectOne();
			
			var setx = 0;
			var sety = 0;
			var rememberedState = fSel.jObj.states[fSession[fSel.nInst].state].sName;
			
		//	[setx,sety] = fWorkspace.positionManager('fStateManager');
			var _temp = fWorkspace.positionManager('fStateManager');
			setx = _temp[0];
			sety = _temp[1];
			
			//reposition so that cursor is closer to the state selection area
			setx -= 110;
			sety -= 80;
			
			$("#fStateManager").css({left: setx});
			$("#fStateManager").css({top: sety});
			
			//update fStateManager
			this.redraw();
		
			//update opened state
			this.opened = true;
		}
	},
	hoverOn : function(state) {
		if (state == "all") {
			$("#fSMStateName").text("All States");
		}	
		else {
			$("#fSMStateName").text(fSel.jObj.states[state].sName);
		}	
	},
	hoverOff : function() {
		if (fSession[fSel.nInst].editStatesAs == 1) {
			$("#fSMStateName").text("All States");
		}
		else {
			$("#fSMStateName").text(fSel.jObj.states[fSession[fSel.nInst].state].sName);
		}
	},
	redraw : function() {
		//clear all states
		$(".fSMStates").children().remove();
		
		//clear editAll
		$("#editAll").attr("class","btt btt-edit-all");
			
		//preload number of states
		var i = 0;
		for (items in jO.jData.objects[fSel.nObj].states) {
			$(".fSMStates").append('<div class="fSMState" id="' + items + '"><a href="#" onclick="fStateManager.chooseState(\'' + items + '\')" class="btt btt-states">States</a><input type="radio" name="fStartingState" onclick="fStateManager.chooseDefaultState(\'' + items + '\');"></div>');
		}
		
		
		// if editAll true
		if (fSession[fSel.nInst].editStatesAs == 1) {
			//set editAll
			$("#editAll").attr("class","btt btt-edit-all active");
			
			//update State Text
			$("#fSMStateName").text("All States");
		}
		else {
			$("#" + fSession[jO.tr(fSel.sI[0])].state + " a").addClass("active");
			
			//update State Text
			$("#fSMStateName").text(fSel.jObj.states[fSession[jO.tr(fSel.nInst)].state].sName);
		}
		
		//set default state (grab from object)
		var defState = fSel.jObj.defState;
		$("#" + defState + " input").attr("checked", true)

	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fStateManager").fadeOut(100);
			this.opened = false;
		}
	},
	addState : function() {
		var newState = jO.createState(fSel.nInst);
		this.redraw();
		this.chooseState(newState);
	},
	removeState : function() {
		var stateToDelete = fSession[fSel.nInst].state;
		
		//check if not first one
		if (stateToDelete != 's1') {
			//remove from instances
			delete jO.jData.instances[fSel.nInst].states[stateToDelete];
			
			//remove from objects
			delete jO.jData.objects[fSel.nObj].states[stateToDelete];
			
			//select first state
			this.chooseState('s1');
			
			//savesession
			fSaveLoad.saveSessionDelay();
		}
	},
	chooseState : function(whichState) {
		//update selected state in fSession
		fSession[fSel.nInst].state = whichState;
		
		//redraw Objects
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		
		// no longer edit all
		this.editOneState();
		
		//update footer
		fFooter.redrawFooter();
		
	},
	chooseDefaultState : function(whichState) {
		//update selected object's defaultState
		fSel.jObj.defState = whichState;
	},
	editOneState : function() {
		//update fSession
		fSession[fSel.nInst].editStatesAs = 0;
		this.redraw();
	},
	editAllStates : function() {
		//update fSession
		fSession[fSel.nInst].editStatesAs = 1;
		this.redraw();
	}
}





// -------- Form Manager Popup Object -----
// this section contains the state manager
var fFormManager = {
	opened : false,
	displayManager : function() {
		if (this.opened == false) {
			var setx = 0;
			var sety = 0;
			
			//[setx,sety] = fWorkspace.positionManager('fFormManager');
			var _temp = fWorkspace.positionManager('fFormManager');
			setx = _temp[0];
			sety = _temp[1];
			
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fFormManager").css({left: setx});
			$("#fFormManager").css({top: sety});
			
			fTools.clearIcons(); // Visually
			fTools.clearEvents(); // Eventwise
			killDrag(); // remove all dragging behaviours
			killResizable(); // remove all resizable
		
			document.getElementById("iconForm").src = "engine/images/b_form_on.png";
		
			fSel.highlight();
			
			//update opened state
			this.opened = true;
		}
	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fFormManager").fadeOut(100);
			
			toolSelect();
			
			//this.opened = false;
		}
	},
	hideWrap : function() {
		//this function only exists because of binding problems in hideManager
		fFormManager.hideManager();
		fFormManager.opened = false;
		$(window).unbind("mouseup",fFormManager.hideWrap);
	},
	addFormElement : function(formtype) {
		//create the element
		newFormId = jO.createForm(formtype);
		
		//instantiate it
		if (fSel.sI[0].match("ins")) {
			newInstanceName = jO.instantiate(newFormId, fSel.sI[0], fSession[fSel.nInst].state);
			
			//force inheritance
			if (fSession[fSel.sI[0]].editAs == 1) {
				jO.update(fSel.sI[0], {
					iContents: 0
				});
			}
			else {
				jO.update(fSel.sI[0], {
					iContents: 1
				});
			}

		}
		else {
			newInstanceName = jO.instantiate(newFormId, fSel.sI[0]);
		}
		
		//hide
		this.hideManager();
		
		//redraw
		fWorkspace.redraw();
		
		//indent
		fCBManager.indentPosition(newInstanceName);
	}
}




// -------- JSON Debugger Popup Object -----
var fDebugJson = {
	opened : false,
	triggerPressedRecently : false,
	trigger : function() {
		setTimeout("ref.triggerPressedRecently = false",200);
		ref = this;
		//detect if trigger was pressed twice in less than a second
		if ((ref.triggerPressedRecently == true) && (ctrlPressed == true)) {
			ref.displayManager();
		}
		fDebugJson.triggerPressedRecently = true;
	} ,
	displayManager : function () {
		// create the menu
		if (this.opened == false) {
			this.opened = true;
			
			//make JSON visible
			$("#container").append('<div id="fTempJData"><textarea>' + jO.jsonToText() + '</textarea></div>');
		}		
	},
	hideManager : function () {
		if (this.opened == true) {
			this.opened = false;
			this.triggerPressedRecently = false;
			
			//grab the modified JSON contents and reload everything base on it
			var jsonText = $("#fTempJData textarea").val();
			jO.load(jsonText,'json');
			
			// temp stuff hide JSON
			$("#fTempJData").remove();
		}
	}
	
};


// -------- fTools Object -----
var fTools = {
	selected : null,
	selectTool : function(which) {
		
	},
	clearIcons : function() {
		$("#toolbox > a").each(function() {
			$(this).removeClass("active");
		});
	},
	clearEvents : function() {
		$("#fWorkspace").unbind("click",fSel.selectBinding);
		$("#fWorkspace").unbind("mousemove",Draw);
	},
	crosshairOn : function() {
		for (var i = 0; i < fSel.sI.length; i++) {
			$("#" + fSel.sI[i]).removeClass("cursorMove");
		}
		$("#fWorkspace").addClass("cursorCrosshair");
	},
	crosshairOff : function() {
		for (var i = 0; i < fSel.sI.length; i++) {
			if (fSel.sI[i] != "fWorkspace") { $("#" + fSel.sI[i]).addClass("cursorMove");}
		}
		$("#fWorkspace").removeClass("cursorCrosshair");
	}
}




// -------- fWorkspace Object -----
var fWorkspace = {
	view : 'design', //design or present views
	editingText : false, //if set to true, a resize does not cause a redraw
	allowSaveLabel : false,
	editingLabelInstance : null,
	allowDraw : false, //used by Draw function
	clear : function() {
		//alert('clear');
		$("#fWorkspace").children().remove();
		//clear editMasterOverlay
		$("#fEditMasterOverlay").hide();		
	},
	clearStyles : function() {
		//unselect old one(s)
		$("#fEditMasterOverlay").hide(); 
		//reset z-index TODO (reset to proper value in the future)
		$("#" + fSel.sI[0]).css("z-index","");
		
		$("#fWorkspace").removeClass("selectedWorkspace parent toBeCut");
		
		//alert('clearing Styles');
		for (var i = 0; i < fSel.sI.length; i++) {
			$("#" + fSel.sI[i]).removeClass("selectedWorkspace");
			$("#" + fSel.sI[i]).removeClass("selected");
			$("#" + fSel.sI[i]).parent().removeClass("parent");
			$("#" + fSel.sI[i]).removeClass("cursorMove");
			$("#" + fSel.sI[i]).removeClass("selectedInst");
			$("#" + fSel.sI[i]).removeClass("selectedTxt");
		}
	},
	init : function() {
		//clear fSession & recreate for all instances
		delete fSession;
		fSession = new Object; 
		for (items in jO.jData.instances) {
			fSession[items] = new Object;
			fSession[items].state = "s1";
			fSession[items].editAs = 1;
			fSession[items].editStatesAs = 0; //default edit OneState
		}
		
		//select first page
		fPanelPages.selectedPageId = "page1";
		
		//Draw Panel Pages
		fPanelPages.draw();
		
		//populate all fSession instance with default states &
		for (items in jO.jData.instances) {
			if (fSession[items] == undefined) {
				fSession[items] = new Object;
				fSession[items].state = jO.jData.objects[jO.jData.instances[items].of].defState;
				fSession[items].editStatesAs = 0; //by default edit OneState
			}
		}
		
		//select workspace
	 	fSel.sI[0] = "fWorkspace";
		fPanelPages.setSelectedPage(fPanelPages.selectedPageId);
		
		//init SaveLoad bindings
		fSaveLoad.init();
		
		//redraw page
		fWorkspace.redraw();
		
		//update project name
		$("#fProjName").html(fSaveLoad.currentProjectName);
		
		//checkloggedin state
		fSaveLoad.displayLoggedIn();
		
	},
	redraw : function(options){
		// takes two properties: type and item
		// item is a string of instanceName or objectName
		// when a page is redrawn, it uses the currentpage
		//alert(options.type);

		attachWhereArray = new Array(); //contains parent instance references to which instances are attached to
		attachWhatArray = new Array(); //each elements contains an object with a set of instance references from within "contains"
		attachInsideArray = new Array(); //contains either 0, 1 or 2 for whether the item is coming from the master, instance or nothing

		attachWhereArray.splice(0,attachWhereArray.length); //clear each time this function is called
		attachWhatArray.splice(0,attachWhatArray.length);
		attachInsideArray.splice(0,attachInsideArray.length);
		
		////// redraw whole page
		// CLEARS & draws all instances on fWorkspace :)
		attachWhereArray.push("fWorkspace");
		attachWhatArray.push(jO.jData.pages[fPanelPages.selectedPageId].contains);			
		attachInsideArray.push(2);			
		fWorkspace.clear(); 
		
		//for each instances passed draw (for 'page')
		var i;
		for (i = 0; i < attachWhatArray.length; i += 1) {
			for (item in attachWhatArray[i]) {
				//FOR INSTANCES
				if (item.match("ins") != null) {
					//determine insideClass
					//alert(attachInsideArray[i]);
					if(attachInsideArray[i] == 0) {
						insideClass = " fInsideMaster";
					}
					else if (attachInsideArray[i] == 1) {
						insideClass = " fInsideInstance";
					}
					else {
						insideClass = "";
					}
				
					//alert(i + 'drawing: ' + item + " instlength" + $("#" + item).length + ' where:' + attachWhereArray[i]);
					objRef = jO.jData.objects[jO.jData.instances[item].of];
					//use default state
					state = jO.jData.objects[jO.jData.instances[item].of].defState;
					//use session state if exists
					if (fSession[item] != undefined) {
						state = fSession[item].state
					};
					objRefState = objRef.states[state];
					instRef = jO.jData.instances[item];
					instRefState = instRef.states[state];
					
					// grab properties from object
					var x = objRefState.x;
					var y = objRefState.y;
					var width = objRefState.w;
					var height = objRefState.h;
					var t = objRefState.t;
					
					// use instance/inheritance settings if editing instance
					if(fSession[jO.tr(item)].editAs == 1){
						if ((instRefState.iPos == 0) && instRefState.hasOwnProperty("x" && "y")) {
							x = instRefState.x;
							y = instRefState.y;
						}
						if ((instRefState.iSize == 0) && instRefState.hasOwnProperty("w" && "h")) {
							width = instRefState.w;
							height = instRefState.h;
						}
						if (instRefState.iTone == 0) {
							t = instRefState.t;
						}
					}
					
					// create _reference for duplicate instances
					inc = 0;
					itemOriginal = item;
					while($("#" + item).length != 0) {
						inc++;
						item = itemOriginal + "_" + inc;
					}

					$("#" + attachWhereArray[i]).append("<div id=\"" + item + "\" class=\"fObject" +insideClass + "\"></div>"); 
					
					// adjust properties
					$("#" + item).css({
						left: x,
						top: y,
						width: width,
						height: height
					});
					
					//adjust tone
					if (t != undefined) {
						$("#" + item).addClass("p" + t);
					}
					
					
					//display state number if more than 1
					if (parseInt(state.replace("s","")) > 1) {
						$("#" + item).append('<div class="fStateLabel">' + state +'</div>');
					}
					
					
					// CONTAINS 
					// if editing as object just load master object's
					var contains = false; // does the current instance have anything inside? used to determine label display 
					if((instRefState.iContents == 1) || (fSession[jO.tr(item)].editAs == 0)){
						if (objRefState.hasOwnProperty("contains")) {
							//load contents from object
							count = 0;
							for (k in objRefState.contains) 
								if (objRefState.contains.hasOwnProperty(k)) 
									count++;
							//if they have anything inside and inheritance is active 
							if (count > 0) {
								attachWhatArray.push(objRefState.contains);
								//and remember in the parent instances, in order to attach to later
								attachWhereArray.push(item);
								contains = true;
								attachInsideArray.push(0);
							}
						}
					}
					//for edit as instance, show only instance items 
					else {
						if (instRefState.hasOwnProperty("contains")) {
							//load contents from instance 
							var count = 0;
							for (k in instRefState.contains) 
								if (instRefState.contains.hasOwnProperty(k)) 
									count++;
							//if they have anything inside
							if (count > 0) {
								//add references to instances to the array if instances are found
								attachWhatArray.push(instRefState.contains);
								//and remember in the parent instances, in order to attach to later
								attachWhereArray.push(item);
								contains = true;
								attachInsideArray.push(1);
							}
						}
					}
					
					// SHOW LABEL
					// if instance does not contain anything (and is wider than 60 pixels), display a label
					if((contains == false) && (width > minWidthForLabel)) {
						$("#" + item).append('<div class="fLabelHolder"><div class="fLabel"><span class="fLBracket">[</span> ' + objRef.name + ' <span class="fLBracket">]</span></div></div>');
						$("#" + item).find(".fLabel").bind("dblclick",function() {$(this).fEditableLabel();});
					}
					
				}
				//FOR TEXT 
				if (item.match("t") != null) {
					//determine insideClass
					if(attachInsideArray[i] == 0) {
						insideClass = " fInsideMasterText";
					}
					else if (attachInsideArray[i] == 1) {
						insideClass = " fInsideInstanceText";
					}
					else {
						insideClass = "";
					}
					
					txtRef = jO.jData.elements[item];
					
					// grab properties from object
					var x = txtRef.x;
					var y = txtRef.y;
					var width = txtRef.w;
					var height = txtRef.h;
					var txt = txtRef.txt;
					
					// create the instance & bind events if creating for the first time (ex: PAGE CHANGES)
					inc = 0;
					itemOriginal = item;
					while($("#" + item).length != 0) {
						inc++;
						item = itemOriginal + "_" + inc;
					}
					
					
					$("#" + attachWhereArray[i]).append("<div id=\"" + item + "\" class=\"fText" +insideClass + "\">" + txt + "</div>"); //unique

					//if has real txt add a different class
					if(txt != "") {
						$("#" + item).addClass("fTextHasTxt");
					}
					
					//make it editable
					$("#" + item).bind("dblclick",function() {$(this).fEditableText();});
					
					// adjust properties
					$("#" + item).css({
						left: x,
						top: y,
						width: width,
						height: height
					});
				}
				
				//FOR FORMS 
				if (item.match("f") != null) {
					//determine insideClass
					if(attachInsideArray[i] == 0) {
						insideClass = " fInsideMaster";
					}
					else if (attachInsideArray[i] == 1) {
						insideClass = " fInsideInstance";
					}
					else {
						insideClass = "";
					}
					
					txtRef = jO.jData.elements[item];
					
					// grab properties from object
					var x = txtRef.x;
					var y = txtRef.y;
					var width = txtRef.w;
					var height = txtRef.h;
					var type = txtRef.type;
					
					// create the instance & bind events if creating for the first time (ex: PAGE CHANGES)
					inc = 0;
					itemOriginal = item;
					while($("#" + item).length != 0) {
						inc++;
						item = itemOriginal + "_" + inc;
					}
					
					//different types
					if(type == "if") {
						$("#" + attachWhereArray[i]).append("<input id=\"" + item + "\" class=\"fForm" + insideClass + "\" type=\"text\" readonly>"); 
					}
					if(type == "cb") {
						$("#" + attachWhereArray[i]).append("<input id=\"" + item + "\" class=\"fForm" + insideClass + "\" type=\"checkbox\">"); 
					}
					if(type == "rb") {
						$("#" + attachWhereArray[i]).append("<input id=\"" + item + "\" class=\"fForm" + insideClass + "\" type=\"radio\" readonly>"); 
					}
					if(type == "ta") {
						$("#" + attachWhereArray[i]).append("<textarea id=\"" + item + "\" class=\"fForm" + insideClass + "\" readonly/></textarea>"); 
					}
					if(type == "pm") {
						$("#" + attachWhereArray[i]).append("<select id=\"" + item + "\" class=\"fForm" + insideClass + "\" readonly></select>"); 
					}
					if(type == "bu") {
						$("#" + attachWhereArray[i]).append("<input id=\"" + item + "\" class=\"fForm" + insideClass + "\" type=\"button\" readonly>");
					}
					
					// adjust properties
					$("#" + item).css({
						left: x,
						top: y,
						width: width,
						height: height
					});
				}
			}
		}
		
		//make draggable / resizable selected items
		if((fSel.sI[0] != "fWorkspace") && $("#" + fSel.sI[0]).length) {
			fSel.makeResizable();
			fSel.makeDraggable();
		}

		//visualize selected items
		fWorkspace.restyle();
		
		//reset window focus just in case
		$(window).focus();
		
		//highlight selected
		fSel.highlight();
		
	},
	restyle : function() {
		//clear styles
		fWorkspace.clearStyles();
		
		//restyles all selected elements on the workspace
		if (fSel.sI[0] == "fWorkspace") {
			$("#" + fSel.sI[0]).addClass("selectedWorkspace");
		}
		else {
			//style the new selection ones
			for (var i = 0; i < fSel.sI.length; i++) {
				//instances
				if (fSel.sI[i].match("ins")) {
					$("#" + fSel.sI[i]).addClass("selected");
					$("#" + fSel.sI[i]).addClass("cursorMove");
					
					//change look of selected class
					if(fSession[jO.tr(fSel.sI[i])].editAs == 1) {
						$("#" + fSel.sI[i]).addClass("selectedInst");	
					}
				}
				else if (fSel.sI[i].match("t")) {
					$("#" + fSel.sI[i]).addClass("selectedTxt");
					$("#" + fSel.sI[i]).addClass("cursorMove");
				}
				else if (fSel.sI[i].match("f")) {
					$("#" + fSel.sI[i]).addClass("selected");
					$("#" + fSel.sI[i]).addClass("cursorMove");
				}
			}
			//style the parent
			$("#" + fSel.sI[0]).parent().addClass("parent");
			
			//EditMasterOverlay
			if (fSel.sI[0].match("ins")) {
				if ((fSession[fSel.nInst].editAs == 0) && $("#" + fSel.sI[0]).length > 0) {
					$("#fWorkspace").prepend('<div id="fEditMasterOverlay"></div>');
					$("#" + fSel.sI[0]).css("z-index","10003");
					$("#fEditMasterOverlay").bind("mouseup",function(event){ 
						event.stopImmediatePropagation();
						$("#fEditMasterOverlay").remove();
						//reset z-index TODO (reset to proper value in the future)
						$("#" + fSel.sI[0]).css("z-index","");
						//simulate click trigger 
						fFooter.editInstance();
						//$("#fWorkspace").trigger("click");
						fWorkspace.redraw();
					});
				}
			}
		}
		
		//restyle items to be cut
		if((fCBManager.cutting == true) && (fCBManager.instances.length >= 1)) {
			for (var i = 0; i < fCBManager.instances.length; i++) {
				$("#" + fCBManager.instances[i]).addClass("toBeCut");
			}
		}
	},
	positionManager : function(what) {
		var setx = 0;

		$('#' + what).fadeIn(100);
		//check if x is not exceeding maximum x allowed
		if(fGM.x + $("#" + what).width() > $(window).width() - 40) {	setx = $(window).width() - 40 - $("#" + what).width();	}
		else { setx = fGM.x; }
		//check if y is not exceeding maximum y allowed
		if(fGM.y + $("#" + what).height() > $(window).height() - 60) {	sety = $(window).height() - 60 - $("#" + what).height();	}
		else { sety = fGM.y; }
		//check if x is not exceeding minimum x allowed
		if (fGM.x < 180) { setx = 180; }
		//check if y is not exceeding minimum y allowed
		if (fGM.y < 90) { sety = 90; }
		
		return[setx,sety];
	},
	setDimensions : function () {
		// adjust for toolbars
		if (fWorkspace.view == "design") {
			windowheight = $(window).height() - 79;
			windowwidth = $(window).width() - 182;
		}
		else if (fWorkspace.view == "present") {
			windowheight = $(window).height() - 41;
			windowwidth = $(window).width() - 144;
		}
	
		document.getElementById("fWorkspace").style.height = windowheight;
		document.getElementById("fWorkspace").style.width = windowwidth;
		document.getElementById("toolbox").style.height = windowheight + 3;
		document.getElementById("rightpanel").style.height = windowheight;
		
		$(".fPanelItemsList").css("height",$("#fPanelPages").height() - 48);
		$("#fExpThreadBar").width($("#fWorkspace").width());
		
		$("#fExpOverview").width($("#fWorkspace").width());
		$("#fExpOverview").height($("#fWorkspace").height());
	},
	saveLabel : function(event) {
		if (fWorkspace.allowSaveLabel == true) {
			//stop saveLabel from running twice (since multiple events are bound which call this function)
			fWorkspace.allowSaveLabel = false;
			
			//update jData
			//alert(fWorkspace.editingLabelInstance);
			saveAs = $("#" + fWorkspace.editingLabelInstance).find("input").attr("value");
			if ((saveAs == "") || saveAs == undefined) {
				saveAs = "new object";
			}
			jO.jData.objects[jO.jData.instances[fWorkspace.editingLabelInstance].of].name = saveAs;
			
			hotkeysEnable();
			
			$("#" + fWorkspace.editingLabelInstance).unbind("change blur", fWorkspace.saveLabel);
			
			//redraw
			fWorkspace.redraw({
				type: 'object',
				item: jO.jData.instances[fWorkspace.editingLabelInstance].of
			});
			
			//update footer
			fFooter.redrawFooter();
			
			//savesession
			fSaveLoad.saveSessionDelay();
		}
	},
	saveText : function(event) {
			//update jData
			saveAs = $("#fEditing").val();
			jO.jData.elements[jO.tr(fWorkspace.editingTextInstance)].txt = saveAs;
			
			hotkeysEnable();
			
			$("#" + fWorkspace.fEditableText).unbind("change blur", fWorkspace.saveText);
			
			parentInstance = $("#" + fWorkspace.editingTextInstance).parent().attr("id");
			fWorkspace.redraw();
			
			fWorkspace.editingText = false;
			
			//enable last drag
			fSel.makeDraggable();
			
			//update footer
			fFooter.redrawFooter();
			
			//bring back focus to window
			$(window).focus();
			
			//savesession
			fSaveLoad.saveSessionDelay();
		
	},
	notify : function(text) {
		this.notifyHide();
		$("#fNotifyText").html(text);
		$("#fNotify").show().animate({opacity: "1"}, 200).animate({opacity: "1"}, 2000).animate({opacity: "0"}, 500, function(){$("#fNotify").hide()});;
		
		//bind hover hide
		$("#fNotify").bind("mouseenter",fWorkspace.notifyHide);
		
	},
	notifyHide : function() {
		$("#fNotify").hide().css("opacity","0");
		$("#fNotify").stop(true);
	},
	keyShift : function(shiftType) {
		//shiftType = up,down,left,right
		// move selected object 1 or 10 pixels down
		if ((fSel.sI.length > 0) && (fSel.sI[0] != "fWorkspace")) {
			for (var i = 0; i < fSel.sI.length; i++) {
				newxpos = parseInt($("#" + fSel.sI[i]).css("left"));
				newypos = parseInt($("#" + fSel.sI[i]).css("top"));
				
				if(shiftType == "down") {
					newypos = newypos + shiftAmount;
				}
				else if(shiftType == "up") {
					newypos = newypos - shiftAmount;
				}
				else if(shiftType == "left") {
					newxpos = newxpos - shiftAmount;
				}
				else if(shiftType == "right") {
					newxpos = newxpos + shiftAmount;
				}
				
				//adjust visually
				$("#" + fSel.sI[i]).css({top: newypos});
				$("#" + fSel.sI[i]).css({left: newxpos});
				
				//save to JSON
				if (fSel.sI[i].match("ins")) {
					//force inheritance
					if(fSession[jO.tr(fSel.sI[i])].editAs == 0) {	jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 1});	}
					else if(fSession[jO.tr(fSel.sI[i])].editAs == 1) { jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 0}); }
					//update
					jO.update(fSel.sI[i], {x: newxpos, y: newypos});
				}
				else if (fSel.sI[i].match("t|f")) {
					jO.updateElements(jO.tr(fSel.sI[i]), {x: newxpos, y: newypos});
				}
			}
			fWorkspace.redraw(); 
			fFooter.redrawFooter();
		}
	},
	changeView : function(view) {
		if (view == 'design') {
			this.view = view;
			$("#toolbox").show();
			$("#footer").show();
			$("#hSave").show();
			$(".panelIcons").children().show();
			
			//buttons
			$("#bDesign").addClass("active");
			$("#bPresent").removeClass("active");
			
			//select page
			fPanelPages.setSelectedPage(fPanelPages.selectedPageId);
			
			//contract workspace
			$("#fWorkspace").removeClass("fWorkspaceExpanded");
			$("#fExpOverview").removeClass("fWorkspaceExpanded");
			$("#fExpThreadBar").removeClass("fWorkspaceExpanded");
			
			//readjust
			this.setDimensions();
			
			//hide threadbar
			fExp.hideThreadBar();
		}
		else if (view == 'present') {
			this.view = view;
			$("#toolbox").hide();
			$("#footer").hide();
			$("#hSave").hide();
			$(".panelIcons").children().hide();
			
			//buttons
			$("#bDesign").removeClass("active");
			$("#bPresent").addClass("active");
			
			//expand workspace
			$("#fWorkspace").addClass("fWorkspaceExpanded");
			$("#fExpOverview").addClass("fWorkspaceExpanded");
			$("#fExpThreadBar").addClass("fWorkspaceExpanded");
			
			//readjust
			this.setDimensions();
			
			//select overview if there are threads
			var tLength = 0;
			for(items in jO.jData.threads) {
				tLength++;	
				break;			
			}
			if (tLength > 0) {
				fExp.showOverview();
			}
		}
	}
}


// -------- fExp Object -----
// Experience Thread function
var fExp = {
	rememberOver : null,
	positionOver : null, //contains a numeral or string (1after or end) to indicate where to insert a thread point
	keyPressed : null, //saves the key that was pressed
	showOverview : function() {
		//clear workspace & panelpages
		fWorkspace.clear();
		fWorkspace.clearStyles();
		//revert old
		$("#" + fPanelPages.rememberPageSelectedId).removeClass("panelItemSelected");
		
		//show overview
		$("#fExpOverview").children().remove();
		$("#fExpOverview").show();
		
		//showthread bar
		fExp.showThreadBar();
		
		//hide mosue and action
		fExp.actClearMouse();
		fExp.actClearKey();
		
		//display threads
		for(items in jO.jData.threads) {
			tArray = jO.jData.threads[items];
			$("#fExpOverview").append('<a href="#" onclick="fExp.selectThread(\'' + items + '\');" onmouseover="rollOver(this); fExp.threadOver(\'' + items + '\',\'' + tArray.title +'\')" onmouseout="rollOut(this); fExp.threadOut(\'' + items + '\')" id="' + items + '" class="fThreadOverviewItem"><img src="engine/images/b_threadO_off.png" border="0" title="thread"></a>');
			$("#" + items).css("left",tArray.x);
			$("#" + items).css("top",tArray.y);
			$("#" + items).draggable({start: null, stop: fExp.updateOverviewPos});
			
			//bind click
			$("#" + items).bind("mouseup",function() {fExp.selectThread(items)});
		}
	},
	threadOver : function(which,text) {
		$("#" + which).append('<div class="fT11 fTDim fExpHoverText">' + text + '</div>');
	},
	threadOut : function(which) {
		$("#" + which + " > div").remove();
	},
	hideOverview : function() {
		if ($("#fExpOverview").is(':visible')) {
			//unbind all events
			$(".fThreadOverviewItem").unbind();
			
			//reselect current page which will also clear everything
			fPanelPages.setSelectedPage(fPanelPages.selectedPageId);
		}
	},
	updateOverviewPos : function() {
		var which = $(this).attr("id");
		jO.jData.threads[which].x = parseInt($("#" +which).css("left"));
		jO.jData.threads[which].y = parseInt($("#" +which).css("top"));
	},
	showThreadBar : function() {
		//show overview & set its dimensions
		$("#fExpThreadBar").show();
		fWorkspace.setDimensions();
		
		//bind events
		$("#fExpTBOver, #fExpThreadBar").hover(function() {}, function() {$("#fExpTBOver").hide(); if(fExp.rememberOver != null) { rollOut(fExp.rememberOver);} fWorkspace.notifyHide();});
		
		//populate it, otherwise display blank
		this.redrawThreadBar();
	},
	redrawThreadBar : function() {
		//clear threadbar
		$("#fExpTBThread").children().remove();
		
		if(fSession.sThread != null) {
			//update top header
			$("#fThreadName").html("&nbsp;:: " + jO.jData.threads[fSession.sThread].title);
			
			//foreach item draw box and line
			var tArray = jO.jData.threads[fSession.sThread].points;
			for(i=0;i < tArray.length; i++) {
				var threadType = null;
				if(tArray[i].type == "snap") { 
					$("#fExpTBThread").append('<a href="#" onclick="fPanelPages.setSelectedPage(\'' + tArray[i].page + '\'); fExp.loadStates(\''+ i +'\');" onmouseover="fExp.TBover(this,'+i+');"><img src="engine/images/b_ETSnap_off.png" border="0" title="thread point"></a>');
				}
				if(tArray[i].type == "act") { 
				fPanelPages.selectedPageId
					tIndex = i;
					if (i >0)  {tIndex--;}
					$("#fExpTBThread").append('<a href="#" onclick="fExp.showAction(' + i + ');" onmouseover="fExp.TBover(this,'+i+');"><img src="engine/images/b_ETAct_off.png" border="0" title="thread point"></a>');
				}
				$("#fExpTBThread").append('<a href="#" onmouseover="fExp.TBover(this,\''+i+'after\');"><img src="engine/images/b_threadDiv_off.png" border="0" title="inbetween"></a>');
			}
			
			// draw final add box
			$("#fExpTBThread").append('<a href="#" onmouseover="fExp.TBover(this,\'end\');" id="fBEnd"><img src="engine/images/b_threadAdd_off.png" border="0" title="inbetween"></a>');
		}
		else {
			$("#fThreadName").html("");
		}
		
		//lower opacity of see all
		var i = 0;
		for (items in jO.jData.threads) { i++;}
		if(i == 0) { $("#fBSeeAll").fadeTo(0, 0.33); $("#fBDelT").hide();}
		else { $("#fBSeeAll").fadeTo(0, 1); $("#fBDelT").show();}
	},
	showAction : function(what) {
		var tArray = jO.jData.threads[fSession.sThread].points; 
		
		//select the closest snapshot and load it
		closestSnap = null;
		for(i=0; i < tArray.length; i++) {
			if (tArray[i].type == "snap") {
				closestSnap = i;
			}
			//if reaching the point where the action is; stop searching
			if (i == what) {
				break;
			}
		}
		
		fPanelPages.setSelectedPage(tArray[closestSnap].page);
		fExp.loadStates(closestSnap);

		//show mouse
		if (tArray[what].x != "none") {
			$("#fActMouseClear").show();
			//position mouse
			fExp.actMousePosition(tArray[what].x,tArray[what].y);	
		}
		
		//show key
		if (tArray[what].key != null) {
			$("#fActMouseClear").show();
			
			//position mouse
			fExp.actKeyPosition(fExp.toChar(tArray[what].key));
		}
		
	},
	showAct : function () {
		$("#fExpAct").show();
		
		//make draggable
		$("#fExpAct").draggable();
		
		//turn cursor arrow on top of workspace
		$("#fWorkspace").addClass("fActCursor");
		
		//disable listening to keys
		hotkeysDisable();
		
		//clear & reset the menu
		fExp.actClearMouse(); 
		fExp.actClearKey();
				
		//listen to clicks and keypresses
		$("#wrapper").bind("mousedown",fExp.actClick);
		$(document).bind("keydown",fExp.actKey);
	},
	hideAct : function () {
		$("#fExpAct").hide();
		
		//remove cursor
		$("#fWorkspace").removeClass("fActCursor");
		
		//listen to keys
		hotkeysEnable();
		
		//hide arrow & key
		$("#fExpArrow").hide();
		$("#fExpKey").hide();
		
		//unbind
		$("#wrapper").unbind("mousedown",fExp.actClick);
		$(document).unbind("keydown",fExp.actKey);
	},
	actClearMouse : function() {
		$("#fActMouse").val("none");
		$("#fActMouse").trigger("change");
	},
	actClearKey : function() {
		fExp.keyPressed = null;
		$("#fActKey").val("");
		$(".fExpActKey").addClass("fActNone");
		$("#fActKeyClear").hide();
		$("#fExpKey").hide();
	},
	actClick : function(event) {
		//check date for double click comparison
		var currentDate = new Date()
		
		//select proper mouse action
		//left click
		if(event.button == 0) {
			$("#fActMouse").val("L");
			//double click if clicked again in less than 0.4 seconds
			if ((currentDate.valueOf() - savedDate.valueOf()) < 400) {
				$("#fActMouse").val("DL");
			}
			//save date
			savedDate = new Date();
		}
		//right click
		else if (event.button == 2) {
			$("#fActMouse").val("R");
			//stop contextmenu
			
			//additional repeated code before the return false (which stops the menu from opening)
			$("#fActMouse").trigger("change"); //calls actMouse
			return false;
		}
		
		$("#fActMouse").trigger("change"); //calls actMouse
		
		//position mouse
		fExp.actMousePosition(event.pageX,event.pageY);
	},
	actKey : function(event) {
		fExp.keyPressed = event.which; //save the keypressed for later
		$("#fActKey").val(fExp.toChar(event.which));
		$(".fExpActKey").removeClass("fActNone");
		$("#fActKeyClear").show();
		fExp.actKeyPosition(fExp.toChar(event.which));
	},
	actMouse : function() {
		//disable
		if ($("#fActMouse").val() == "none") {
			$(".fExpActMouse").addClass("fActNone");
			$("#fActMouseClear").hide();
			$("#fExpArrow").hide();
		}
		//else enable 
		else {
			$(".fExpActMouse").removeClass("fActNone");
			$("#fActMouseClear").show();
			
			//position mouse
			fExp.actMousePosition();
			$("#fExpArrow").draggable();	
			$("#fExpArrow").bind("click",fExp.actClick); //attach a click to the arrow as well to test for double clicks
		}
		
	},
	actKeyPosition : function(key) {
		//first time around, display anywhere
		$("#fExpKey").show();
		$("#fExpKey").html(key);
	},
	actMousePosition : function(x,y) {
		//reposition if x, y passed
		if (x,y) {
			$("#fExpArrow").css("left",x);
			$("#fExpArrow").css("top",y);
		}
		else {
			//display anywhere
			if ($("#fExpArrow").css("display") == 'none') {
				$("#fExpArrow").css("left","200");
				$("#fExpArrow").css("top","200");
			}	
		}
		$("#fExpArrow").show();
		
		
		//clear types
		$("#fExpArrow").removeClass();
		
		//set types
		if ($("#fActMouse").val() == "L") {
			$("#fExpArrow").addClass("fArrowL");
		}
		else if ($("#fActMouse").val() == "R") {
			$("#fExpArrow").addClass("fArrowR");
		}
		else if ($("#fActMouse").val() == "DL") {
			$("#fExpArrow").addClass("fArrowDL");
		}
		
	},
	TBover : function(overWhat,position) {
		//show overview & set its dimensions
		$("#fExpTBOver").show();
		
		//adjust fExpOver
		var pos = $(overWhat).offset();
		var width = $(overWhat).width();
		$("#fExpTBOver").css("left",pos.left + width/2 - 29 - 39);
		
		//hide remembered overstate
		if(this.rememberOver != null) { rollOut(this.rememberOver);}

		//remember and show overstate
		rollOver(overWhat);
		this.rememberOver = overWhat;
		this.positionOver = position;
		
		//hide or show action button for first item (or and end item with on its own)
		if((position == 0) || (position == "end" && $("#fExpTBThread").children().length == 1)) { $("#fBAction").hide(); }
		else { $("#fBAction").show(); }
		
		//hide delete if inbetween or at end
		if(typeof position == "string") { if (position.match("after||end")) {	$("#fBDel").hide();	}}
		else { $("#fBDel").show(); }
	},
	delThreadP : function() {
		//delete thread point
		jO.jData.threads[fSession.sThread].points.splice(fExp.positionOver,1);
		//redraw ThreadBar
		this.redrawThreadBar();
		//hide notify
		fWorkspace.notifyHide();
	},
	delThread : function() {
		//delete thread 
		delete jO.jData.threads[fSession.sThread];
		
		//find another one to select if exists
		var toSelect = null;
		for (items in jO.jData.threads) { 
			if (items != null) {
				toSelect = items; break;
			}
		}
		//hide notify
		fWorkspace.notifyHide();
		
		//reselect previous if exist
		fExp.selectThread(toSelect);
	},
	hideThreadBar : function() {
		if ($("#fExpThreadBar").is(':visible')) {
			$("#fExpThreadBar").hide();
			//update top header
			$("#fThreadName").html("");
			
			//reselect current page which will also clear everything
			fPanelPages.setSelectedPage(fPanelPages.selectedPageId);
		}
	},
	selectThread : function(id) {
		//store last Thread
		fSession.sThread = id;
		
		//redraw ThreadBar
		this.redrawThreadBar();
	},
	showThreadAdd : function() {
		//show 
		$("#fExpAdd").show();
		
		//clear title
		$("#fInputTTitle").val("");
		
		//focus input
		setTimeout(function(){$("#fInputTTitle").focus()},50);
		
		//assign click anywhere to hide
		$("#wrapper").bind("mousedown",fExp.hideThreadAdd)
		
		//assign press enter to submit on title
		$("#fInputTTitle").bind("keydown",function(event) {if(event.which == "13") { fExp.addThread();} });
	},
	hideThreadAdd : function() {
		//listening to keys
		hotkeysEnable();
		
		//show
		$("#fExpAdd").hide();

		//unbind
		$("#wrapper").unbind("mousedown",fExp.hideThreadAdd);
		$("#fInputTTitle").unbind("keydown");
		
	},
	addThread : function() {
		if($("#fInputTTitle").val() == "") {
			fWorkspace.notify("Please specify a thread title");
		}
		else {
			//hide
			fExp.hideThreadAdd();
			
			//save in JSON
			var newThreadId = jO.createThread($("#fInputTTitle").val(),$("#fInputStory").val());
			
			//clear fields
			$("#fInputTTitle").val("")
			$("#fInputStory").val("");
			
			//select thread
			fExp.selectThread(newThreadId);
			
			//draw attention to it
			$("#fBEnd").animate({opacity: "0.3"}, 300).animate({opacity: "1"}, 300).animate({opacity: "0.3"}, 300).animate({opacity: "1"}, 300).animate({opacity: "0.3"}, 300).animate({opacity: "1"}, 300);
			
			//if fOverview is open, call it again to update
			if ($("#fExpOverview").is(':visible')) {
				fExp.showOverview();
			}
		}
	},
	insert : function(type) {
		//SNAP
		if(type == "snap") {
			if(typeof fExp.positionOver == "string") {
				//ad to end
				if(fExp.positionOver.match("end")) {
					jO.createThreadPoint(fSession.sThread,type,fExp.positionOver,'end');
				}
				//ad in between
				else if(fExp.positionOver.match("after")) {
					jO.createThreadPoint(fSession.sThread,type,parseInt(fExp.positionOver),'after');
				}
			}
			// or replace
			else {
				jO.createThreadPoint(fSession.sThread,type,parseInt(fExp.positionOver));
			}
			$("#fExpTBOver").hide();
		}
		
		//ACT
		if(type == "act") {
			var mouseType = $("#fActMouse").val();
			var x = parseInt($("#fExpArrow").css("left"));
			var y = parseInt($("#fExpArrow").css("top"));
			var key = fExp.keyPressed;
			
			
			if((mouseType == "none") && (key == null)) {
				//notify
				fWorkspace.notify("Please specify an action first");
			}
			else {
				if(typeof fExp.positionOver == "string") {
					//ad to end
					if(fExp.positionOver.match("end")) {
						jO.createThreadPoint(fSession.sThread,type,fExp.positionOver,'end',mouseType,x,y,key);
					}
					//ad in between
					else if(fExp.positionOver.match("after")) {
						//alert(parseInt(fExp.positionOver));
						jO.createThreadPoint(fSession.sThread,type,parseInt(fExp.positionOver),'after',mouseType,x,y,key);
					}
				}
				// or replace
				else {
					//alert(parseInt(fExp.positionOver));
					jO.createThreadPoint(fSession.sThread,type,parseInt(fExp.positionOver),null,mouseType,x,y,key);
				}
				//hide
				fExp.hideAct();
			}
		}
		
		//redraw ThreadBar
		this.redrawThreadBar();

		//hide notify & over
		//$("#fExpTBOver").hide(); if(fExp.rememberOver != null) { rollOut(fExp.rememberOver);} fWorkspace.notifyHide();
	},
	toChar : function(code) {
		var c = String.fromCharCode(code);
		
		//force transform others
		if(code == "17") {c = "CTRL";}
		else if(code == "8") {c = "BACKSPACE";}
		else if(code == "16") {c = "SHIFT";}
		else if(code == "18") {c = "ALT";}
		else if(code == "13") {c = "ENTER";}
		else if(code == "9") {c = "TAB";}
		else if(code == "27") {c = "ESC";}
		else if(code == "32") {c = "SPACE";}
		else if(code == "222") {c = ",";}
		else if(code == "219") {c = "[";}
		else if(code == "220") {c = "\\";}
		else if(code == "221") {c = "]";}
		else if(code == "109") {c = "-";}
		else if(code == "107") {c = "+";}
		else if(code == "191") {c = "/";}
		else if(code == "192") {c = "`";}
		else if(code == "188") {c = ",";}
		else if(code == "190") {c = ".";}
		else if(code == "45") {c = "INS";}
		else if(code == "46") {c = "DEL";}
		else if(code == "33") {c = "PGUP";}
		else if(code == "34") {c = "PGDN";}
		else if(code == "36") {c = "HOME";}
		else if(code == "35") {c = "END";}
		else if(code == "37") {c = "ARROW LEFT";}
		else if(code == "38") {c = "ARROW UP";}
		else if(code == "39") {c = "ARROW RIGHT";}
		else if(code == "40") {c = "ARROW DOWN";}
		//return (code + ":" + c);
		return (c);
	},
	loadStates : function(whichPoint) {
		var tArray = jO.jData.threads[fSession.sThread].points;
		
		//change states
		for(instance in tArray[whichPoint].states) {
			fSession[instance].state = tArray[whichPoint].states[instance];
		}
		
		//redraw
		fWorkspace.redraw();
	}
}


// -------- fSel Object -----
// all selected items (objects, instances), states. DOM references
var fSel = {
	//editing as
	editAs : 0, //editing selected item as 0 Object, or 1 Instance
	editStatesAs : 0, //editing selected item states as 0 individual state, or 1 as All states 
	
	sI : new Array(), //selected instances (strings)
	jObj : "", //reference to first selected JSON object (without state)
	jInst : "", //reference to first selected JSON instance (without state)
	nObj : "", //string name of selected object
	nInst : "", //string name of selected instance
	lastText : null, //string name of last drawn or selected text
	selectBinding : function(event) {
		var element=$(event.target);
		//clear resizable
		killResizable();
		killDrag();

		//if clicked on label, grab the parent element
		if(element.attr("class").match("fLabel")) {element = element.parent().parent();}
		
		//if clicked on fHighlight, grab the parent element
		else if(element.attr("class").match("fHighlight")) {element = element.parent();}
		
		//make the new element draggable (if its not the workspace and it is not already selected (the same object))
		if ((element.attr("id") != "fWorkspace") && (lastDraggable != element)) {
			//only continue if not a right click (which is reserved for a different handler)
			if(event.button != 2) {
				//only allow to select fObjects or fText or fForm
				if((element.attr("class").match("fObject")) || (element.attr("class").match("fText")) || (element.attr("class").match("fForm"))) {
					fSel.selectObject(element); //change its class and update selectedObject
				}
			};
		}
		if (element.attr("id") == "fWorkspace") {
			// select the fWorkspace
			fSel.selectObject(element);
		}
	},
	forceSelectOne : function(what) {
		if (fSel.sI.length > 1) {
			fSel.selectObject(fSel.sI[0]);
		}
	},
	selectObject : function(what) {
		// can access an index number to a DOM element, a DOM reference or an instance name
		// what is converted to a jQuery object
		//alert(what + ":" + $(what).attr("id"));
		if (typeof what == "number") {
			what = $("div").get(what);
			what = $(what);
		}
		else if (typeof what == "string") {
			instLoop = what;
			//check if the instance is on the page, otherwise get the proper page and switch to it
			if ( $("#" + what).length == 0 ) {
				
				var foundPage = null;
				while (foundPage == null)
				{
					// do the check to find the page number
					if(jO.jData.instances[instLoop].p.match("page")) {
						foundPage = jO.jData.instances[instLoop].p;
					}
					else {
						//set proper states of the parent
						fSession[jO.jData.instances[instLoop].p].state = jO.jData.instances[instLoop].ps;
						
						//loop through the next instance (parent)
						instLoop = jO.jData.instances[instLoop].p;
					}
				}
				//switchtopage
				fPanelPages.setSelectedPage(foundPage);
			}

			//convert to jQuery
			what = $("#" + what);	
		}
		
		
		//destroy last draggable
		killDrag();
		killResizable();
		
		//destroy last text
		this.lastText = null;
	
		//clear styles
		fWorkspace.clearStyles();
	
		// IF NO SHIFT IS HELD DOWN empty the whole array
		if (shiftPressed == false) {
			if (fSel.sI.length > 0) {	fSel.sI.splice(0,fSel.sI.length); }
		}
	
		//CONTINUE ADDING TO THE ARRAY
		// if the item is already selected, unselect it, otherwise add it
		itemExists = false;
		for (var i = 0; i < fSel.sI.length; i++) {
			if ((fSel.sI[i] == what.attr("id")) && (fSel.sI.length > 1)) {
				fSel.sI.splice(i,1); //remove the item from the selected list
				i--; // update loop index since an array item was removed
				itemExists = true;
				break;
			}
		}
		// Add the newly selected item
		if (itemExists == false) {
			fSel.sI.push(what.attr("id"));
		}
	
		// Begin Removal Part 1: remove: children of selected objects, and duplicates
		uniqueIds = {};
		childIds = {};
		for (var i = 0; i < fSel.sI.length; i++) {
			// children Ids collection
			// make a full list of children Ids to be deleted in case of a match
			childrenrarray = $("#" + fSel.sI[i]).children(); // matches any children of a selected element except using the workspace
			for (var j=0, len=childrenrarray.length; j<len; j++ ){
				childIds[$(childrenrarray[j]).attr("id")] = true;
			}
	
			// unique Ids collection + store how many instances there are of each duplicates
			if (uniqueIds[fSel.sI[i]] == undefined) {
				uniqueIds[fSel.sI[i]] = 1;
			}
			else {
				uniqueIds[fSel.sI[i]]++;
			}
		}
	
	
		// go over the list again and actually remove the children and duplicates
		for (var i = 0; i < fSel.sI.length; i++) {
			//remove the fSel.sI that are kids of fSel.sI
			if (childIds[fSel.sI[i]] == true) {
				fSel.sI.splice(i,1); //remove workspace
				i--; // update loop index since an array item was removed
				continue;
			}
			//remove the duplicates if more than 1
			if (uniqueIds[fSel.sI[i]] > 1) {
				uniqueIds[fSel.sI[i]]--;
				fSel.sI.splice(i,1); //remove workspace
				i--; // update loop index since an array item was removed
				continue;
			}
		}
	
		
		//WORKSPACE selected
		if (fSel.sI[0] == "fWorkspace") {
			//enable Footer
			$(".fFMode").hide();
			$("#fFooterWorkspace").show();
		}
		//TEXT elements
		else if (fSel.sI[0].match("t")) {
			//enable Footer
			$(".fFMode").hide();
			$("#fFooterText").show();
			//record lastText
			this.lastText = fSel.sI[0];
		}
		//FORM elements
		else if (fSel.sI[0].match("f")) {
			//enable Footer
			$(".fFMode").hide();
			$("#fFooterForm").show();
		}
		//REAL OBJECTS / INSTANCES selected
		else 
			if (fSel.sI[0].match("ins")) {
				//update selected variables used by other functions
				fSel.jObj = jO.jData.objects[jO.jData.instances[jO.tr(fSel.sI[0])].of];
				fSel.jInst = jO.jData.instances[jO.tr(fSel.sI[0])];
				fSel.nObj = jO.jData.instances[jO.tr(fSel.sI[0])].of
				fSel.nInst = jO.tr(fSel.sI[0]);
				
				//enable footer
				$(".fFMode").hide();
				$("#fFooterOI").show();
				
				//update instance
				$("#fInstName").html("Instance 1 of 2"); //todo make this display "Instance 1 of 8".
				//update object
				$("#fObjName").html(fSel.jObj.name);
				
				//set editAs MODE
				//if instance  already has editAs chosen, do not change the mode, so that a double click is possible
				if (fSession[fSel.nInst].editAs != null) {
					if (fSession[fSel.nInst].editAs == 0) {
						fFooter.editObject();
					}
					else {
						fFooter.editInstance();
					}
				}
				// if instance is not inheriting any of the pos / size properties, edit as instance
				else 
					if ((fSel.jInst.states[fSession[fSel.nInst].state].iPos == 0) || (fSel.jInst.states[fSession[fSel.nInst].state].iSize == 0)) {
						//update fSession
						fSession[fSel.nInst].editAs = 1;
						//set toggle
						fFooter.editInstance();
					}
					else {
						//update fSession
						fSession[fSel.nInst].editAs = 0;
						//set toggle
						fFooter.editObject();
					}
				
				//set editStatesAs MODE
				if (fSession[fSel.nInst].editStatesAs == 0) {
					fStateManager.editOneState();
				}
				else {
					fStateManager.editAllStates();
				}
				
				//set AllInstances 
				fFooter.instRedraw();
				fFooter.redrawFooter();
				
		}
		//restyle workspace items
		fWorkspace.restyle();
		
		//make draggable and resizable
		if (fSel.sI[0] != "fWorkspace") {
			this.makeResizable();
			this.makeDraggable();
		}
		
		//highlight
		fSel.highlight();
		
	},
	makeDraggable : function() {
		// create new draggable
		for (var i = 0; i < fSel.sI.length; i++) {
			var mydrag = fSel.sI[i];
			(function(mydrag) {
				$("#" + mydrag).draggable({
					cancel: [''],
					distance: 5,
					containment: "#fWorkspace",
					handle: mydrag,
					start: function() { dragRegister(mydrag); },
					drag: function() { dragItems(mydrag); },
					stop: function() { dragStop(mydrag); }
				});
			})(mydrag);
		}
	},
	makeResizable : function(event){
		// create new resizable
		for (var i = 0; i < fSel.sI.length; i++) {
			if (fSel.sI[i].match("ins") || fSel.sI[i].match("t") || fSel.sI[i].match("f")) {
			var myresize = fSel.sI[i];
			(function(myresize) {
				$("#" + myresize).resizable({
					transparent: true,
					minHeight: 1,
					minWidth: 1,
					resize: updateInfoWH,
					stop: resizeStop
				});
			})(myresize);
			}
		}
	},
	highlight : function() {
		if ((fSel.sI[0] != null)) {
			if ((fSel.sI[0].match("ins")) || (fSel.sI[0].match("fWorkspace"))) {
				highLightWhat = fSel.sI[0];
			}
			else {
				//grab parent
				highLightWhat = $("#" + fSel.sI[0]).parent().attr("id");
			}
			//killnotify if exists
			fWorkspace.notifyHide();
			//alert(highLightWhat);
			//kill previous highlight
			$(".fHighlight").remove();

			//animate border to indicate where you are drawing (for instances)
			$("#" + highLightWhat).prepend('<div class="fHighlight"></div>');
			$(".fHighlight").stop(true).animate({opacity: "0"}, 500).animate({opacity: "1"}, 500);	
		}
	}
}


// -------- fSaveLoad Object -----
// Saving and Loading of data controller
var fSaveLoad = {
	latestSession : null,
	checkTimer : null,
	checkTimerLast : null,
	currentUserId : null,
	currentProjectId : null,
	currentProjectName : null,
	init : function() {
		//unbind all
		$("#fInLogin, #fInPassword, #fSave, #fLoad, #fLogin, #fSaveLoad, #fSaveAsUrlName, #fBLogin, #fBLoginSubmit, #fBLogout, #fBCreateProject, #fBCreateProjectSubmit").unbind();
		
		//attach onleave fade effects
		$("#fSave, #fLoad, #fLogin").bind("click",fSaveLoad.show);
		$("#fSaveLoad").bind("mouseenter",function() {$("#fSaveLoad").stop(true).fadeTo("",1);});
		$("#fSaveAsUrlName").bind("keyup",function(){ fSaveLoad.checkTimer = setTimeout("fSaveLoad.checkProject()",500); clearTimeout(fSaveLoad.checkTimerLast); fSaveLoad.checkTimerLast = fSaveLoad.checkTimer;});
		
		//bind clears
		$("#fInLogin, #fInPassword").bind("focus",fSaveLoad.clearField);
		
		//bind buttons
		$("#fBLogin").bind("click",fSaveLoad.login);
		$("#fBLoginSubmit").bind("click",fSaveLoad.login);
		$("#fBLogout").bind("click",fSaveLoad.logout);
		$("#fBCreateProject").bind("click",function(){fSaveLoad.saveSession('create')});
		$("#fBCreateProjectSubmit").bind("click",function(){fSaveLoad.saveSession('create')});
	},
	show : function(event) {
		$(window).bind("focus",fSaveLoad.hide);
		var clickedOn = $(event.target).attr("id");
		$("#fSaveLoad").show();
		$("#fSave").bind("mouseenter",fSaveLoad.displaySave);
		$("#fLoad").bind("mouseenter",fSaveLoad.displayLoad);

		//display load or save
		if(clickedOn == "fSave") {
			fSaveLoad.displaySave();
		}
		else if(clickedOn == "fLoad") {
			fSaveLoad.displayLoad();
		}
		else if(clickedOn == "fLogin") {
			fSaveLoad.displayLogin();		
		}
	},
	displaySave : function() {
		$(".fSLCore").hide();
		$("#fSLSave").show();
	},
	displayLoad : function() {
		$(".fSLCore").hide();
		$("#fSLLoad").show();
	},
	displayLogin : function() {
		$(".fSLCore").hide();
		$("#fSLLogin").show();
		$("#fSaveLoad").unbind("mouseleave",fSaveLoad.hide);
		$("#fInLogin").bind("keyup",function(){ fSaveLoad.checkTimer = setTimeout("fSaveLoad.checkEmail()",500); clearTimeout(fSaveLoad.checkTimerLast); fSaveLoad.checkTimerLast = fSaveLoad.checkTimer;});
	},
	displayLoggedIn : function() {
		//set username
		var url = '/app/logged_in.json';
		
		//check if user is logged in
		$.ajax({
			url : url,
		    method : 'GET',
			dataType : 'json',
			success: function(data, status){
     			if (data.result == "false") {
					//error	
					$("#hLoggedOut").show();
					$("#hLoggedIn").hide();
					$(".fSaveServer").hide();
				}
				else if (data.result == "true") {
					//update top header
					$("#hLoggedOut").hide();
					$("#hLoggedIn").show();
					fSaveLoad.hide();
					
					//populate projects in load bar
					var url = '/app/get_user_projects.json';
					
					//change login to register
					$.ajax({
						url : url,
					    method : 'GET',
						dataType : 'json',
						success: function(data, status){
			     			//clear old list
							$("#fProjectList").children().remove();
							
							for (var i = 0; i < data.projects.length; i++) {
								$("#fProjectList").append("<li><a href='#'>fluidia.org/" + data.projects[i].name + '</a></li>');
								pid = data.projects[i].project_id;
								
								(function(pid) {
									$("#fProjectList").children(':last').bind("mousedown",function(){
										fSaveLoad.loadProject(pid)
									});
								})(pid);
							}
						}
			   		});
					
					//update header
					$(".fSaveServer").show();
					$(".fUsername").html(data.SESSION.user.userid);
					fSaveLoad.currentUserId = data.SESSION.user.userid;
				}
			},
			error: function(data,status) {
				//error
			}
   		});
	},
	clearField : function(event) {
		var clickedOn = $(event.target).attr("id");
		
		//save to inputValues if doesn't exist to store initial values
		if (!inputValues.hasOwnProperty(clickedOn)) {
			inputValues[clickedOn] = $("#" + clickedOn).val();
		}

		//clear if default
		if (inputValues[clickedOn] == $("#" + clickedOn).val()) {
			$("#" + clickedOn).val("");
		}
		
		//restore if blank on blur
		$("#" + clickedOn).bind("blur",function(){
			if ($(this).val() == "") {
			$("#" + clickedOn).val(inputValues[clickedOn]);
		}
		});
	},
	hide : function () {
		$("#fSaveLoad").fadeOut(100);
		$("input").blur();
		$("#fSave").unbind("mouseenter,mouseleave");
		$("#fLoad").unbind("mouseenter,mouseleave");
		//$(window).unbind("focus",fSaveLoad.hide);
	},
	taken : function () {
		//display taken text
		$("#fTaken").hide().stop(true).show();
	},
	checkSession : function (loadFlag) {
		var url = '/app/check_session.json';
		$.ajax({
			url : '/app/check_session.json',
		    method : 'GET',
			dataType : 'json',
			success: function(data, status){
				fSaveLoad.latestSession = data.session_count; 
				fSaveLoad.currentProjectId = data.project_id;
				fSaveLoad.currentProjectName = data.project;
				
				if (loadFlag == true) {
					//load data from standard file
					if ((fSaveLoad.latestSession == 0) || (fSaveLoad.latestSession == null)) {
						jO.load('projects/project01.json', 'file');
					}
					//load data from checksession
					else if (fSaveLoad.currentProjectId != null) {
						jO.load(data.fluidia_object, 'json');
					}
					//load data from session
					else {
						fSaveLoad.loadSession();
					}
				}
			},
			error: function() {
				if (loadFlag == true) {
					//load data from standard file
					if ((fSaveLoad.latestSession == 0) || (fSaveLoad.latestSession == null)) {
						jO.load('projects/project01.json', 'file');
					}
				}
			}
	 	});
	},
	checkProject : function () {
		var url = '/app/project_exists.json';
		var project = $("#fSaveAsUrlName").val();
		
		//see if project is taken or not
		$.ajax({
			url : url,
			data: "project=" + project,
		    method : 'GET',
			dataType : 'json',
			success: function(data, status){
     			if (data.result == "false") {
					$("#fTaken").hide();
				}
				else if (data.result == "true") {
					$("#fTaken").hide().stop(true).show();
				}
			}
   		});
	},
	checkEmail : function() {
		var url = '/app/email_exists.json';
		var username = $("#fInLogin").val();
		
		//change login to register
		$.ajax({
			url : url,
			data: "email=" + username,
		    method : 'GET',
			dataType : 'json',
			success: function(data, status){
     			if (data.result == "false") {
					$("#fLoginHeader").html("register");
				}
				else if (data.result == "true") {
					$("#fLoginHeader").html("login");
				}
			}
   		});
	},
	login : function () {
		var username = $("#fInLogin").val();
		var password = $("#fInPassword").val();
		var auth = "Basic " + Base64.encode(username + ':' + password);
		
		//check if password is 6 characters
		if($("#fInPassword").val().length < 6) {
			//$("#fLoginHeader").html("password must be 6 chars");
			fWorkspace.notify("password must be at least 6 characters long");
		}
		
		//check if email is fine
		else if(!checkMail($("#fInLogin").val())) {
			//$("#fLoginHeader").html("email needs to be appropriate");
			fWorkspace.notify("email should be formatted appropriately");
		}
		
		// Attempt Register - check if email exists
		else {
			$.ajax({
				url : '/app/email_exists.json',
				data: "email=" + username,
			    method : 'GET',
				dataType : 'json',
				success: function(data, status){
					//register
	     			if (data.result == "false") {
						$.post('/app/register.json', {
							email: username,
							passwd: password
						}, function(data){
							fSaveLoad.hide();
							fWorkspace.notify("User has been registered. Check your email for approval.");
						});
					}
					// Attempt login
					else {
						$.ajax({
							url: '/app/login.json',
							method: 'GET',
							beforeSend: function(req){
								req.setRequestHeader('Authorization', auth);
							},
							dataType: 'json',
							success: function(data, status){
								//check login result
								// inactive user
								if (data.statuscode == 403) {
									//$("#fLoginHeader").html("user is inactive");
									fWorkspace.notify("User is still inactive");
								}
								else 
									// wrong password
									if (data.statuscode == 401) {
										//$("#fLoginHeader").html("incorrect login");
										fWorkspace.notify("incorrect login");
									}
									else 
										//logged in
										if (data.result == "logged_in") {
											fSaveLoad.displayLoggedIn();
											fSaveLoad.checkSession(true); //grabs project related variables	
									}
							},
							error: function(data, status){
								alert("Ops. Data Error.");
							}
						});
					}
					
				}
	   		});
		}
	},
	saveLocal : function() {
		fSaveLoad.saveSession('saveLocal');		
	},
	loadLocal : function() {
		//upload
	},
	loadSession : function () {
		$.ajax({
			url: '/app/load_session.json',
			data: "key=" + fSaveLoad.latestSession,
			method: 'GET',
			dataType: 'json',
			success: function(data, status){
				jO.load(data,'jsonSession');
			}
		});
	},
	loadProject : function(project_id) {
		$.ajax({
			url: '/app/load_from_project.json',
			data: "project_id=" + project_id,
			method: 'GET',
			dataType: 'json',
			success: function(data, status){
				fSaveLoad.currentProjectName = data.project;
				fSaveLoad.currentProjectId = data.project_id;
				jO.load(data.fluidia_object,'json');
			}
		});
	},
	logout : function () {
		var url = '/app/logout.json';
		
		$.ajax({
			url : url,
		    method : 'GET',
			dataType : 'json',
			success: function(data, status){
				//fSaveLoad.displayLoggedIn();
				window.location.reload(true);
			}
   		});
	},
	saveSessionDelay: function(){
		//saveSession set timeout
		if (jO.saveSessionTimeout != null) {
			clearTimeout(jO.saveSessionTimeout);
		}
		jO.saveSessionTimeout = setTimeout(function(){
			fSaveLoad.saveSession();
		}, 4000);
	},
	saveSession: function(saveType){
		var saveType = saveType;
		var data = jO.jsonToText();
		var projectId = fSaveLoad.currentProjectId;
		var projectname = fSaveLoad.currentProjectName;
		if (saveType == 'create') { 
			var projectId = null;
			var projectname = $("#fSaveAsUrlName").val(); 
		}

		if (fSaveLoad.currentUserId != null) {
			var url = '/app/save_to_project.json';
			$.ajax({
				url: url,
				data: "fluidia_object=" + data + "&project_id=" + projectId + "&project=" +projectname,
				type: 'POST',
				dataType: 'json',
				success: function(data){
					if (saveType == 'create') {
						fSaveLoad.currentProjectName = data.project;
						fSaveLoad.currentProjectId = data.project_id;
						fWorkspace.init();
					}
				}
			});
		}
		else {
			var url = '/app/save_session.json';
			$.ajax({
				url: url,
				data: "fluidia_object=" + data,
				type: 'POST',
				dataType: 'json',
				success: (function(){
					if (saveType == 'saveLocal') {
						var url = '/app/download_session.json';
						//$.get(url);
						//window.open(url);
						setTimeout(function(){
							$.download(url, 'data=data')
						}, 1000);
						
						//close window
						fSaveLoad.hide();
					}
				})(saveType)
			});
		}
	}
}


// -------- States -----
// this object manages everything related to states
var fStates = {
	loadFooterStates : function() {
		//load states for first selectedObject
	},
	fSCheckToggle : function(what) {
		//only if editing as instance
		if(fSel.editAs == 1) {
			//change look
			$("#"+what).toggleClass("fSOff");
			
			var state = fSel.jInst.states[fSession[fSel.nInst].state];	
			//update jO's instance properties by toggling them
			if(what == "fSPos") { state.iPos ^= 1 }
			if(what == "fSSize") { state.iSize ^= 1 }
			if(what == "fSContents") { state.iContents ^= 1 }
			if(what == "fSEvents") { state.iEvents ^= 1 }
			if(what == "fSTone") { state.iTone ^= 1 }
			
			//redraw	
			fWorkspace.redraw({type : 'instance', item : fSel.nInst});
			
			//redraw footer
			fFooter.redrawFooter();
		}
	},
	fSCheckSetDisplay: function(what, checkedState){
		//check if a checkedState direction is being sent
		if(checkedState == 1) {
			$("#"+what).removeClass("fSOff");
		}
		else if(checkedState == 0) {
			$("#"+what).addClass("fSOff");
		}
	}
}



// -------- ToggleEdit Object -----
// this object controls how an instance is being edited
var fFooter = {
	contract : function() {
		var opacity = (fGM.distanceToBottom - 100) / 100;
		var distance = (fGM.distanceToBottom - 140);
		
		if((fGM.distanceToBottom <= 40) && (fWorkspace.allowDraw == false)) {
			fGM.reachedBottom = true;
			$('#footerAll').animate({bottom: "0"}, 200);
		}
		else if (fGM.reachedBottom == false) {
			if(fGM.distanceToBottom < 140) {
				$('#footerAll').stop(true);
				$('#footerAll').css("bottom", distance);
				//$('#footerAll').animate({bottom: distance}, 100);
			}
		}
		
		if(fGM.distanceToBottom > 140) {
			fGM.reachedBottom = false;
			$('#footerAll').animate({bottom: "0"}, 200);
		}
	},
	editObject : function () {
		if(fSel.sI[0].match("ins") && fSel.editAs != 0) {
			fSel.editAs = 0;
			fSession[fSel.nInst].editAs = 0;
			this.redrawFooter();
		}
	},	
	editInstance : function () {
		if(fSel.sI[0].match("ins") && fSel.editAs != 1) {
			fSel.editAs = 1;
			fSession[fSel.nInst].editAs = 1;
			this.redrawFooter();	
		}
	},
	redrawFooter : function () {
		if (fSel.sI[0].match("ins")) {
			//update object name
			$("#fObjName").html(fSel.jObj.name);
			
			//update statename
			$("#fStateName").text(fSel.jObj.states[fSession[fSel.nInst].state].sName);
			
			//update inheritance properties
			if (fSel.jInst.states[fSession[fSel.nInst].state].iSize == 0) {
				fStates.fSCheckSetDisplay('fSSize', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSSize', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iPos == 0) {
				fStates.fSCheckSetDisplay('fSPos', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSPos', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iContents == 0) {
				fStates.fSCheckSetDisplay('fSContents', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSContents', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iEvents == 0) {
				fStates.fSCheckSetDisplay('fSEvents', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSEvents', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iTone == 0) {
				fStates.fSCheckSetDisplay('fSTone', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSTone', true);
			}
			
			//update setwidth & setheight boxes
			updateInfoWH();
			updateInfoXYPos();
			
			//editing as object
			if(fSession[fSel.nInst].editAs == 0) {
				$(".fSCheck").hide();
				$(".fSTitle").css("cursor","default");
				
				//update "as" field
				$("#fEditMode").html("master");
				$("#fEditMode").removeClass("fTOrange");
				$("#fEditMode").addClass("fTBlue");
				
				//change look of selected class
				//$("#" + fSel.sI[0]).removeClass("selectedInst");
				
				//clear button Instance
				$("#buttonfMIToggle").removeClass("btt-edit-master");
				$("#buttonfMIToggle").addClass("btt-edit-instance");
				
				//unbind and rebind 
				$("#buttonfMIToggle").unbind();
				$("#buttonfMIToggle").click(function(){
					fFooter.editInstance();
					fWorkspace.redraw();
					fFooter.redrawFooter();
				});
				
				$("#fMIToggleText").html("");
				
				$("#fWHXYHolder").removeClass("fEditingInst");
				$("#fWHXYHolder").addClass("fEditingObj");
				
			}
			//editings as instance
			else if	(fSession[fSel.nInst].editAs == 1) {
				//show Checkboxes & allow for pointing cursor
				$(".fSCheck").show();
				$(".fSTitle").css("cursor","pointer");
				
				//update "as" field
				$("#fEditMode").html("instance");
				$("#fEditMode").removeClass("fTBlue");
				$("#fEditMode").addClass("fTOrange");
				
				
				//change look of selected class
				//$("#" + fSel.sI[0]).addClass("selectedInst");
				
				$("#buttonfMIToggle").removeClass("btt-edit-instance");
				$("#buttonfMIToggle").addClass("btt-edit-master");
				
				//unbind and rebind 
				$("#buttonfMIToggle").unbind();
				$("#buttonfMIToggle").click(function(){
					fFooter.editObject();
					fWorkspace.redraw();
					fFooter.redrawFooter();
				});
				
				$("#fMIToggleText").html("Inheriting:");
				
				$("#fWHXYHolder").removeClass("fEditingObj");
				$("#fWHXYHolder").addClass("fEditingInst");
			}
		}
		else if (fSel.sI[0].match("t")) {
		}
	},
	instRedraw : function () {
		//clear
		$("#fFInstItems").children().remove();
		
		//populate
		for (items in fSel.jObj.allInstances) {
			$("#fFInstItems").append('<a href="#" onclick="fSession.' + items + '.changed = 0; fSel.selectObject(\'' + items +  '\');" title="' + items + '"><img src="engine/images/buttonInst_off.png" id="fFInst_' + items + '"></a>');
			
			//set changed view
			if(fSession[items].changed == 1) {
				$("#fFInst_" + items).css("opacity","1");
			}
		}
		
		//set selected
		imgsrc = $("#fFInst_" + fSel.nInst).attr("src");
		newimgsrc = imgsrc.replace("_off","_on");
		$("#fFInst_" + fSel.nInst).attr("src",newimgsrc);
		$("#fFInst_" + fSel.nInst).css("opacity","1");
		fSession[fSel.nInst].changed = 0;
	}
}




var fPanelPages = {
	itemCount : 0,
	rememberPageSelectedId : null,
	panelId : "fPanelPages",
	attachTo : "#fPanelPages",
	draw : function () {
		var thisref = this; //I need this private reference for the bindings events
		
		//remove existing page divs
		$(this.attachTo + " *.panelItem").each(function() {$(this).remove();});
		
		//create content divs
		$.each(jO.jData.pages, function(i,item){
			// page div
			$(thisref.attachTo + " div.fPanelItemsList").append('<div class="panelItem" id="' + i + '">' + item.pageName + '</div>');
			//attach double click for rename
			$(thisref.attachTo + " div.fPanelItemsList").children(':last').bind("dblclick", function() {$(this).fEditable();});
		
			////PANELPAGES CODE - custom
			if (thisref.panelId == "fPanelPages") {
				//attach single click for select 
				$(thisref.attachTo + " div.fPanelItemsList").children(':last').bind("click", function() {thisref.setSelectedPage(i); });
				//loadnew items TODO
			}	
		});
		
		//attach bg icon in title
		//grab the existing blank - workaround for not being able to set the background-image property relatively
		blankBg = $(this.attachTo + " div.panelTitle").css("background-image");
		//replace blank.gif with real image
		imgpath = blankBg.replace("blank.gif","bg_icon_" + this.panelId + ".gif");
		//attach bg with good path
		$(this.attachTo + " div.panelTitle").css("background-image",imgpath);
		$(this.attachTo + " div.panelTitle").css("background-repeat","no-repeat");
		$(this.attachTo + " div.panelTitle").css("background-position","0px 1px");
		
		//increase pagecount
		this.itemCount = jO.countObjProperties();
		
		//draw the up down controllers
		//show
		$(this.attachTo + " *.panelArrowDown," + this.attachTo + " *.panelArrowUp").css("display","block");
		//attach hovers
		$(this.attachTo + " *.panelArrowDown").hover(function() {$(this).addClass("panelArrowDownHover")}, function() {$(this).removeClass("panelArrowDownHover")});
		$(this.attachTo + " *.panelArrowUp").hover(function() {$(this).addClass("panelArrowUpHover")}, function() {$(this).removeClass("panelArrowUpHover")});
		//collapse inner div to make space
		$(this.attachTo + " *.fPanelItemsList").addClass("fPanelItemsListCollapse");
		//mouse wheel scrolling
		$(this.attachTo).mousewheel(function(event, delta) {
		if (delta > 0) {
			$(thisref.attachTo + " *.fPanelItemsList").stop().scrollTo('-=40px');
		}
		else if (delta < 0)
			$(thisref.attachTo + " *.fPanelItemsList").stop().scrollTo('+=40px');
			return false; // prevent default
		}
		);
		//click scrolling
		$(this.attachTo + " *.panelArrowDown").click(function() {$(thisref.attachTo + " *.fPanelItemsList").stop().scrollTo('+=40px')});
		$(this.attachTo + " *.panelArrowUp").click(function() {$(thisref.attachTo + " *.fPanelItemsList").stop().scrollTo('-=40px')});
		
	},

	arrows : function (what) {

	},

	add : function () {
		var thisref = this;
		var pageId = jO.getAvailableId('page');
		var intPageId = pageId.replace(/\D*(\d*)/,"$1"); 
		jO.jData.pages[pageId] = new Object();
		jO.jData.pages[pageId].pageName = "Page " + intPageId;
		jO.jData.pages[pageId].contains = new Object;
		
		//trigger a click just in case elements are being edited. in order to run click bound save functions 
		$("#fWorkspace").click();
		
		//select the last page in line
		this.selectedPageId = pageId;
		this.draw();
		
		if (thisref.panelId == "fPanelPages") {
		//clear previous workspace
			fWorkspace.clear();	
			this.setSelectedPage(this.selectedPageId);
		}
		
		// scroll to the last item
		$(this.attachTo + " *.fPanelItemsList").scrollTo($(this.attachTo + " *.fPanelItemsList").children(":last-child"));
		
		//savesession
		fSaveLoad.saveSessionDelay();
	},

	remove : function () {
		//trigger a click just in case elements are being edited. in order to run click bound save functions 
		$("#fPanelPages").click();
		
		//if more than 1 page 
		//count
		var i = 0;
		for (pages in jO.jData.pages){ i++; }
		if (i > 1) {
			//replace with splice
			delete jO.jData.pages[this.selectedPageId];
			
			//select the last page in line
			this.selectedPageId = jO.getLastPageId();
			
			//replace draw with just dom updates? :) quicker
			this.draw();
			this.setSelectedPage(this.selectedPageId);
			
			// scroll to the last item
			$(this.attachTo + " *.fPanelItemsList").scrollTo($(this.attachTo + " *.fPanelItemsList").children(":last-child"));
			
			//savesession
			fSaveLoad.saveSessionDelay();
		}
	},

	setSelectedPage : function (selectWhat) {
		//alert(this.rememberPageSelectedId + ":" + selectWhat);
		//kill resizable
		killDrag();
		killResizable();
		
		//get rid of Exp Arrows and Keys
		$("#fExpArrow").hide();
		$("#fExpKey").hide();
		
		//get rid of Experience overlays
		$("#fExpOverview").hide();
		if(fTools.selected == "toolExperience") {toolSelect();}
		
		//revert old
		$("#" + this.rememberPageSelectedId).removeClass("panelItemSelected");

		//change new
		$("#" + selectWhat).addClass("panelItemSelected");
		
		this.selectedPageId = selectWhat;

		this.rememberPageSelectedId = selectWhat;

		//redraw workspace
		fWorkspace.redraw();
	}
};

function checkMail(email){
	var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (filter.test(email)) {
		return true;
	}
	return false;
}

jQuery.download = function(url, data, method){
	//url and data options required
	if( url && data ){ 
		//data can be string of parameters or array/object
		data = typeof data == 'string' ? data : jQuery.param(data);
		//split params into form inputs
		var inputs = '';
		jQuery.each(data.split('&'), function(){ 
			var pair = this.split('=');
			inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />'; 
		});
		//send request
		jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
		.appendTo('body').submit().remove();
	};
};



