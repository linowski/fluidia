$(document).ready(function(){
	// init variables
	initx = false; //used for drawing squares
	mydrag = null; // contains the dragable element
	myresize = null; // contains the resizable element
	lastDraggable = null; // contains the last selected Draggable
	startdragx = 0; // initial positions of startdrag
	startdragy = 0;
	startdragObjects = {}; // initial positions of all select objects; used to add delta x,y values to during drag

	// TODO: some elements will contain the objects, and some DOM elements... need to make a distinction
	selectedTool = null;

	disableKeyListeners = false; //global variable which affects hot key listening
	shiftPressed = false; // if true, then shift key is being pressed down
	ctrlPressed = false; // if true, then ctrl key is being pressed down
	cPressed = false; // if true, then c key is being pressed down

	offsetToWorkspaceX = $("#fWorkspace").offset().left;
	offsetToWorkspaceY = $("#fWorkspace").offset().top;

	// init functions
	setWorkspaceDimensions(); // set window dimensions the first time
	jO.load('projects/project01.json','','fSel.selectObject($("#fWorkspace"))'); //load JSON data + select workspace
	
	$("#fWorkspace").showMenu({ opacity:0.8,	query: "#fRightClickMenu"},function() {alert('tf');});

	// make document unselectable
	if (typeof(document.onselectstart) != "undefined") {
		document.onselectstart = Unselectable.enable;
	} else {
		document.onmousedown = Unselectable.enable;
		document.onmouseup = Unselectable.disable;
	}

	//init listeners
	$(window).bind("resize",resized); // window resizing listener
	hotkeysEnable(); //enable hotkey listening
	$("#setwidth").bind("change blur",updateWidth);
	$("#setheight").bind("change blur",updateHeight);
	$("#xpos").bind("change blur",updateXpos);
	$("#ypos").bind("change blur",updateYpos);
	$(document).bind("mousemove",fGM.capture); //global mouse with page coordinates

	//first tool
	toolSelect();
	
	$("div.fObject").live("dblclick", makeResizable); //unique
	$("div.fText").live("dblclick", makeResizable); //unique
	
	$("#fEditing").live("mouseover",function(){$(this).focus()}); //fix for enabling cursor to focus on fEditableText
	$(window).focus();
});




// -------- General Resizing Functions -----

function setWorkspaceDimensions() {
	// get window height
	windowheight = $(window).height();
	windowwidth = $(window).width();

	// adjust for toolbars
	windowheight = windowheight - 94;
	windowwidth = windowwidth - 182;

	document.getElementById("fWorkspace").style.height = windowheight;
	document.getElementById("fWorkspace").style.width = windowwidth;
	document.getElementById("toolbox").style.height = windowheight + 3;
	document.getElementById("rightpanel").style.height = windowheight;
	
	$(".fPanelItemsList").css("height",$("#panelPages").height() - 48);
}





// -------- HotKey Functions -----

function hotkeysEnable() {
	$(document).bind("keydown",keypressed); // detect which keys are pressed for tools, and delete and such
	$(document).bind("keyup",keyreleased); // detect if some keys are let go (ex. shift)
	$.hotkeys.add('Shift+down', keyShiftDown);
	$.hotkeys.add('Shift+up', keyShiftUp);
	$.hotkeys.add('Shift+left', keyShiftLeft);
	$.hotkeys.add('Shift+right', keyShiftRight);
	$.hotkeys.add('Down', keyShiftDownS);
	$.hotkeys.add('Up', keyShiftUpS);
	$.hotkeys.add('Left', keyShiftLeftS);
	$.hotkeys.add('Right', keyShiftRightS);
	$.hotkeys.add('Ctrl+C', keyCtrlC);
	$.hotkeys.add('Ctrl+V', keyCtrlV);
}

function hotkeysDisable() {
	$.hotkeys.remove('Shift+down', keyShiftDown);
	$.hotkeys.remove('Shift+up', keyShiftUp);
	$.hotkeys.remove('Shift+left', keyShiftLeft);
	$.hotkeys.remove('Shift+right', keyShiftRight);
	$.hotkeys.remove('Down', keyShiftDownS);
	$.hotkeys.remove('Up', keyShiftUpS);
	$.hotkeys.remove('Left', keyShiftLeftS);
	$.hotkeys.remove('Right', keyShiftRightS);
	$.hotkeys.remove('Ctrl+C', keyCtrlC);
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
		fEventManager.triggerPressedRecently = true;
	}
	//ctrl released
	if (whichkey == "17") {
		ctrlPressed = false; 
	}
	
	//z released
	if (whichkey == "90") { fStateManager.hideManager(); }
	
	//x released
	if (whichkey == "88") { fAltManager.hideManager(); }
	
	// c key
	if (whichkey == "67") { cPressed = false; if(fCBManager.mouseover == false) {fCBManager.hideManager();} }
}

function keypressed(event) {
	//whichkey is set to the keycode number
	if (event.keyCode != 0) { whichkey = event.keyCode;}
	if (event.which != 0) { whichkey = event.which;}
	
	//alert(whichkey);
	// 46 is the delete key
	if (whichkey == "46") {
		if (fSel.sInstances.length > 0) {
			for (var i = 0; i < fSel.sInstances.length; i++) {
				//remove from "contains" of parent instance in jData
				parentInsName = $("#" + fSel.sInstances[i]).parent().attr("id");
				parentObjName = jO.jData.instances[parentInsName].of;
				if (parentInsName == "fWorkspace") {
					delete jO.jData.pages[panelPages.selectedPageId].contains[fSel.sInstances[i]];
				}
				else if (parentInsName.match("ins")) {
					//alert(parentInsName + ":" + fSession[parentInsName].state);
					delete jO.jData.instances[parentInsName].states[fSession[parentInsName].state].contains[fSel.sInstances[i]];
					delete jO.jData.objects[parentObjName].states[fSession[parentInsName].state].contains[fSel.sInstances[i]];
				}
				
				//todo clear not just contains but also actual elements
				
				//remove DOM objects from the workspace
				if(fSel.sInstances[i] != "fWorkspace") {
					$("#" + fSel.sInstances[i]).remove();
				}
				
			}
			//empty the whole array
			fSel.sInstances.splice(0);
			fSel.selectObject($("#fWorkspace"));
		}
	}

	// ctrl key
	if (whichkey == "17") {
		ctrlPressed = true; // sets as true or false. used to restrict keypresses to single keys (ex. "T" for text tool, and not "ctrl t")	
	}
	
	// shiftkey
	shiftPressed = event.shiftKey; // sets as true or false. used by fEventManager and multiple object selection
	
	//toolbars (only run if shift / ctrl are NOT pressed)
	if ((whichkey == "83") && (shiftPressed == false) && (ctrlPressed == false)) { toolSelect(); }
	if ((whichkey == "79") && (shiftPressed == false) && (ctrlPressed == false)) { toolObject(); }
	if ((whichkey == "84") && (shiftPressed == false) && (ctrlPressed == false)) { toolText(); }
	if ((whichkey == "69") && (shiftPressed == false) && (ctrlPressed == false)) { toolElement(); }
	if ((whichkey == "72") && (shiftPressed == false) && (ctrlPressed == false)) { toolHotspot(); }
	
	//run code to open fEventManager on press of shift
	if (event.shiftKey) {
		fEventManager.trigger();
	}
	// and close it when an ESC is pressed
	if (whichkey == "27") { fEventManager.hideManager(); }
	
	// z key
	if (whichkey == "90") { fStateManager.displayManager(); }
	
	// x key
	if (whichkey == "88") { fAltManager.displayManager(); }
	
	// c key
	if (whichkey == "67") { cPressed = true; fCBManager.displayManager(); }
	
	// 1 key
	if (whichkey == "49") { setPriority(1); }
	
	// 2 key
	if (whichkey == "50") { setPriority(2); }
	
	// 3 key
	if (whichkey == "51") { setPriority(3); }
	
	// 4 key
	if (whichkey == "52") { setPriority(4); }
	
	// 5 key
	if (whichkey == "53") { setPriority(5); }
}



function setPriority(what){
	if (fSel.nInst != "") {
		//remove all classes
		$("#" + fSel.nInst).removeClass("p1 p2 p3 p4 p5");
		
		//add
		$("#" + fSel.nInst).addClass("p" + what);
	}
}


function keyShiftDown(event) {
	// move selected object 10 pixels down
	if ((fSel.sInstances.length > 0) && (fSel.sInstances[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sInstances.length; i++) {
			newxpos = parseInt($("#" + fSel.sInstances[i]).css("top"));
			newxpos = newxpos + 10;
			$("#" + fSel.sInstances[i]).css({top: newxpos});
			jO.update(fSel.sInstances[i],{y : $("#" + fSel.sInstances[i]).css("top")});
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
	}
	updateInfoXYPos();
}

function keyShiftUp(event) {
	// move selected object 10 pixels up
	if ((fSel.sInstances.length > 0) && (fSel.sInstances[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sInstances.length; i++) {
			newxpos = parseInt($("#" + fSel.sInstances[i]).css("top"));
			newxpos = newxpos - 10;
			$("#" + fSel.sInstances[i]).css({top: newxpos});
			jO.update(fSel.sInstances[i],{y : $("#" + fSel.sInstances[i]).css("top")});
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
	}
	updateInfoXYPos();
}

function keyShiftRight(event) {
	// move selected object 10 pixels right
	if ((fSel.sInstances.length > 0) && (fSel.sInstances[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sInstances.length; i++) {
			newxpos = parseInt($("#" + fSel.sInstances[i]).css("left"));
			newxpos = newxpos + 10;
			$("#" + fSel.sInstances[i]).css({left: newxpos});
			jO.update(fSel.sInstances[i],{x : $("#" + fSel.sInstances[i]).css("left")});
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
	}
	updateInfoXYPos();
}

function keyShiftLeft(event) {
	// move selected object 10 pixels left
	if ((fSel.sInstances.length > 0) && (fSel.sInstances[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sInstances.length; i++) {
			newxpos = parseInt($("#" + fSel.sInstances[i]).css("left"));
			newxpos = newxpos - 10;
			$("#" + fSel.sInstances[i]).css({left: newxpos});
			jO.update(fSel.sInstances[i],{x : $("#" + fSel.sInstances[i]).css("left")});
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
	}
	updateInfoXYPos();
}

function keyShiftDownS(event) {
	// move selected object 1 pixels down
	if ((fSel.sInstances.length > 0) && (fSel.sInstances[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sInstances.length; i++) {
			newxpos = parseInt($("#" + fSel.sInstances[i]).css("top"));
			newxpos = newxpos + 1;
			$("#" + fSel.sInstances[i]).css({top: newxpos});
			jO.update(fSel.sInstances[i],{y : $("#" + fSel.sInstances[i]).css("top")});
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
	}
	updateInfoXYPos();
}

function keyShiftUpS(event) {
	// move selected object 1 pixels up
	if ((fSel.sInstances.length > 0) && (fSel.sInstances[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sInstances.length; i++) {
			newxpos = parseInt($("#" + fSel.sInstances[i]).css("top"));
			newxpos = newxpos - 1;
			$("#" + fSel.sInstances[i]).css({top: newxpos});
			jO.update(fSel.sInstances[i],{y : $("#" + fSel.sInstances[i]).css("top")});
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
	}
	updateInfoXYPos();
}

function keyShiftRightS(event) {
	// move selected object 1 pixels right
	if ((fSel.sInstances.length > 0) && (fSel.sInstances[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sInstances.length; i++) {
			newxpos = parseInt($("#" + fSel.sInstances[i]).css("left"));
			newxpos = newxpos + 1;
			$("#" + fSel.sInstances[i]).css({left: newxpos});
			jO.update(fSel.sInstances[i],{x : $("#" + fSel.sInstances[i]).css("left")});
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
	}
	updateInfoXYPos();
}

function keyShiftLeftS(event) {
	// move selected object 1 pixels left
	if ((fSel.sInstances.length > 0) && (fSel.sInstances[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sInstances.length; i++) {
			newxpos = parseInt($("#" + fSel.sInstances[i]).css("left"));
			newxpos = newxpos - 1;
			$("#" + fSel.sInstances[i]).css({left: newxpos});
			jO.update(fSel.sInstances[i],{x : $("#" + fSel.sInstances[i]).css("left")});
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
	}
	updateInfoXYPos();
}
function keyCtrlC(event) {
	fCBManager.copy();
}
function keyCtrlV(event) {
	fCBManager.paste();
}



function updateWidth(event) {
	if(fSel.sInstances[0] != "fWorkspace") {
		$("#" + fSel.sInstances[0]).width($("#setwidth").val());
		jO.update(fSel.sInstances[0],{w : parseInt($("#setwidth").val())});
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
	}
}

function updateHeight(event) {
	if(fSel.sInstances[0] != "fWorkspace") {
		$("#" + fSel.sInstances[0]).height($("#setheight").val());
		jO.update(fSel.sInstances[0],{h : parseInt($("#setheight").val())});
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
	}
}

function updateXpos(event) {
	if(fSel.sInstances[0] != "fWorkspace") {
		$("#" + fSel.sInstances[0]).css("left", $("#xpos").val() + "px");
		jO.update(fSel.sInstances[0],{x : parseInt($("#xpos").val())});
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
	}
}

function updateYpos(event) {
	if(fSel.sInstances[0] != "fWorkspace") {
		$("#" + fSel.sInstances[0]).css("top", $("#ypos").val() + "px");
		jO.update(fSel.sInstances[0],{y : parseInt($("#ypos").val())});
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
	}
}




function updateInfoXYPos() {
	$("#xpos").val(parseInt($("#" + fSel.sInstances[0]).css("left")));
	$("#ypos").val(parseInt($("#" + fSel.sInstances[0]).css("top")));

	if(fSel.sInstances[0] == "fWorkspace") {
		$("#xpos").val(0);
		$("#ypos").val(0);
	}
}

function updateInfoWH() {
	$("#setwidth").val($("#" + fSel.sInstances[0]).width());
	$("#setheight").val($("#" + fSel.sInstances[0]).height());

	if(fSel.sInstances[0] == "fWorkspace") {
		$("#setwidth").val(0);
		$("#setheight").val(0);
	}
}



function makeResizable(event){
	//can take an event or an instance name
	if(typeof event == "object") {
		var element=$(event.target).attr("id");
		event.stopPropagation();
		
		//only resize fObject (as a result of nested events, items within fObject also call the resize function)
		if(($(event.target).hasClass("fObject") == false) && ($(event.target).hasClass("fText") == false)) {return false;}
	}
	else {
		var element=event;
	}

	// add new style
	$("#"+element).addClass("resizable");

	//disable dragging if enabled
	killDrag();

	//make resizable
	myresize = element;
	$("#" + myresize).resizable({ transparent: true, handles: 'all', minHeight: 1, minWidth: 1, resize: updateInfoWH, stop: resizeStop });
}





function Draw(event){
	var element=$(event.target);
	//disable dragging during drawing
	killDrag(); lastDraggable = null;

	posx = event.pageX;
	posy = event.pageY;

	


	this.onmousedown=function(){
		// set drawWhere
		//alert(fSel.sInstances[0]);
		
		if (fSel.sInstances[0] != null) {
			drawWhere = $("#" + fSel.sInstances[0]);
			
		}
		
		//check if the selected item is on the selected page
		if(!$("#" + fSel.sInstances[0]).length > 0) {
			//if not, then select the workspace :)
			fSel.selectObject($("#fWorkspace"));
			drawWhere = $("#fWorkspace");
		}
		
		// do not allow to draw by default
		allowDraw = false;

		// only draw if the clicked div is the workspace div
		if (element.attr("id") == "fWorkspace") {
			allowDraw = true;
		}

		// or if the ancestors contain the workspace div, however check only if the allowDraw has not been enabled already, to conserve cpu
		if (allowDraw == false) {
			ancestorarray = element.parents();
			for ( var i=0, len=ancestorarray.length; i<len; ++i ){
				if ($(ancestorarray[i]).attr("id") == "fWorkspace") {
					allowDraw = true;
					break;
				}
			}
		}
		
		//do not allow to draw if drawing tools are not chosen
		if ((selectedTool != "toolObject") && (selectedTool != "toolText")) {
			allowDraw = false;
		}

		// draw rectangle
		if (allowDraw == true) {
			//disable select
			Unselectable.enable;
			
			// not on the clicked element, but on the selected
			offsetx = drawWhere.offset().left;
			offsety = drawWhere.offset().top;
			
			// - parent's position?
			initx=posx - offsetx;
			inity=posy - offsety;

			if (selectedTool == "toolText") {
				whatelement = "div";
				whatclass = "fText";
				whatid = jO.getAvailableTxtId();
				//alert(whatid);
			}
			if (selectedTool == "toolObject") {
				whatelement = "div";
				whatclass = "fObject";
				whatid = jO.getAvailableInstId();
			}

			d = document.createElement(whatelement);
			d.className=whatclass;
			d.style.left=initx+'px';
			d.style.top=inity+'px';
			d.id=whatid;
			drawWhere.append(d);

			//TODO OO this perhaps?
			//TODO add events to textarea focus / blur to disableHotkeys
			
			//select the newly drawn object
			//fSel.selectObject($(d));
		}
	}
	

	this.onmouseup=function(){initx=false;inity=false;
		if (allowDraw == true) {
			//disable the other defined mousedown function
			this.onmousedown = null;
			this.onmouseup = null;
			
			// listen for double click to resize it
			//$(d).bind("dblclick",makeResizable);
			
			//create the object in JSON
			//INSTANCE
			if (selectedTool == "toolObject") {
				name = "New Object";
			}
			//TXT
			if (selectedTool == "toolText") {
				txt = "";
			}
			position = $(d).position();
			width = $(d).width();
			height = $(d).height();

			//INSTANCE
			if (selectedTool == "toolObject") {
				ID = jO.createObj(name, position.left, position.top, width, height);
			}
			//TXT
			if (selectedTool == "toolText") {
				ID = jO.createTxt(txt, position.left, position.top, width, height);
			}	
				
			
				
			//instatiate it
			if (fSel.sInstances[0] != "fWorkspace") {
				newInstanceName = jO.instantiate(ID, fSel.sInstances[0], fSession[fSel.nInst].state);
				
				//force inheritance
				//if 0 editing as Object
				if (fSel.editAs == 0) {
					jO.update(fSel.nInst, {
						type: "instance",
						iContents: 1
					});
				}
			}
			else {
				newInstanceName = jO.instantiate(ID, "fWorkspace");
			}
		
		
			//update footer
			fFooter.redrawFooter();
			
			//update 
			if (fSel.sInstances[0] != "fWorkspace") {
				//update Workspace
				//alert(fSel.jInst.of);
				fWorkspace.redraw({type: 'object',item: fSel.jInst.of});
			}
			else {
				//update Workspace
				//alert($(d).attr("id"));
				fWorkspace.redraw({type: 'instance',item: $(d).attr("id")});
			}
			
			
			//INSTANCE
			if (selectedTool == "toolObject") {
				//edit Label Mode
				$(d).fEditableLabel();
			}
			
			
			//enable cursor select tool
			toolSelect();
			
			//enable select
			Unselectable.disable;
	
			
		}
	}

	// redraw properties during onmousedown & drag
	if(initx){
		var setwidth = Math.abs(posx-initx-offsetx);
		var setheight = Math.abs(posy-inity-offsety);
	
		d.style.width=setwidth+'px';
		d.style.height=setheight+'px';
		d.style.left=posx-initx-offsetx<0?posx-offsetx+'px':initx+'px';
		d.style.top=posy-inity-offsety<0?posy-offsety+'px':inity+'px';

		//update setwidth & setheight boxes
		document.getElementById("setwidth").value = setwidth;
		document.getElementById("setheight").value = setheight;
	}
}


function toolSelectDo(event) {
	var element=$(event.target);
	var whatClicked = event.which;

	//clear resizable?
	killResizable();
	
	//if clicked on label, grab the parent element
	if(element.attr("class") == "fLabel") {element = element.parent().parent();}

	//make the new element draggable (if its not the workspace and it is not already selected (the same object))
	if ((element.attr("id") != "fWorkspace") && (lastDraggable != element)) {

		//only continue if not a right click (which is reserved for a different handler)
		if(event.button != 2) {
			//only allow to select fObjects or fText
			if((element.attr("class").match("fObject")) || (element.attr("class").match("fText"))) {
				fSel.selectObject(element); //change its class and update selectedObject
			}
		};
	}
	if (element.attr("id") == "fWorkspace") {
		// select the fWorkspace
		fSel.selectObject(element);
		//if (fSel.sInstances.length > 0) {	fSel.sInstances.splice(0); }
		
		// kill draggables
		killDrag();
	}
}


function dragRegister() {
	startdragx = parseInt($("#"+mydrag).css("left"));
	startdragy = parseInt($("#"+mydrag).css("top"));
	for (var i = 0; i < fSel.sInstances.length; i++) {
		startdragObjects[fSel.sInstances[i]] = {};
		startdragObjects[fSel.sInstances[i]].x = parseInt($("#" + fSel.sInstances[i]).css("left"));
		startdragObjects[fSel.sInstances[i]].y = parseInt($("#" + fSel.sInstances[i]).css("top"));
	}
}


function dragItems() {
	//drag all remaining items which are also selected
	// calculate how much movement there is during the drag
	movex = parseInt($("#"+mydrag).css("left")) - startdragx;
	movey = parseInt($("#"+mydrag).css("top")) - startdragy;

	// loop through all remaining selected items except fWorkspace and
	for (var i = 0; i < fSel.sInstances.length; i++) {
		//update position on workspace
		$("#" + fSel.sInstances[i]).css("left", startdragObjects[fSel.sInstances[i]].x + movex + "px");
		$("#" + fSel.sInstances[i]).css("top", startdragObjects[fSel.sInstances[i]].y + movey + "px");
	}
	//update footer
	updateInfoXYPos();
}


function dragStop() {
	//update the workspace one more time in case there is pixel lag during drag
	dragItems();
	movex = parseInt($("#"+mydrag).css("left")) - startdragx;
	movey = parseInt($("#"+mydrag).css("top")) - startdragy;
	
	//update JSON position of items
	for (var i = 0; i < fSel.sInstances.length; i++) {
		var itemRef = "";
		// OBJECTS / INSTANCES
		if (fSel.sInstances[i].match("ins") != null) {
			if (fSel.editAs == 0) { //if 0 editing as Object
				//update JSON + Force inheritance of iPos = 1
				jO.update(fSel.sInstances[i], {
					type: "object",
					x: $("#" + fSel.sInstances[i]).position().left,
					y: $("#" + fSel.sInstances[i]).position().top,
					iPos: 1
				});
			}
			else { //else editing as Instance
				//update JSON + Force inheritance of iPos = 0
				jO.update(fSel.sInstances[i], {
					type: "instance",
					x: $("#" + fSel.sInstances[i]).position().left,
					y: $("#" + fSel.sInstances[i]).position().top,
					iPos: 0
				});
			}
			
			//update Workspace
			if(fSel.editAs ==0)  {
				//update all instances with which use this object, by passing object name (extracted from instance/of)
				fWorkspace.redraw({type: 'object',item : fSel.jInst.of}); 
			}
		}
		// Text
		if (fSel.sInstances[i].match("t") != null) {
			jO.updateElements(fSel.sInstances[i], {
				x: $("#" + fSel.sInstances[i]).position().left,
				y: $("#" + fSel.sInstances[i]).position().top,
			});
		}

		fFooter.redrawFooter();
				
		
	}
}

function resizeStop() {
	updateInfoWH();
	
	//update JSON position of items
	
	for (var i = 0; i < fSel.sInstances.length; i++) {
		var itemRef = "";
		
		
		// OBJECTS / INSTANCES
		if (fSel.sInstances[i].match("ins") != null) {
			//calculate necessary relative position change
			//if editing as object master
			
			if (fSession[fSel.nInst].editAs == 0) {
				initx = fSel.jObj.states[fSession[fSel.nInst].state].x;
				inity = fSel.jObj.states[fSession[fSel.nInst].state].y;
			}
			//else instance
			else {
				//if not inheriting from object
				if (fSel.jInst.states[fSession[fSel.nInst].state].iPos == 0) {
					initx = fSel.jInst.states[fSession[fSel.nInst].state].x;
					inity = fSel.jInst.states[fSession[fSel.nInst].state].y;
				}
				//if inheriting from object
				else {
					initx = fSel.jObj.states[fSession[fSel.nInst].state].x;
					inity = fSel.jObj.states[fSession[fSel.nInst].state].y;
				}
			}
			//calculate difference in positional change
			changeX = $("#" + fSel.sInstances[i]).position().left - initx;
			changeY = $("#" + fSel.sInstances[i]).position().top - inity;
			
			//if 0 editing as Object
			if (fSel.editAs == 0) {
				itemRef = fSel.jObj;
				
				//update all instances' position if they are inheriting size to compensate for top, left position changes during resize	
				var Instances = jO.getInstancesOfObj(fSel.jInst.of, {
					type: "workspace"
				});
				for (var j = 0; Instances.length > j; j++) {
					instRef = jO.jData.instances[Instances[j]];
					
					//if they inherit size but not position
					if ((instRef.states[fSession[fSel.nInst].state].iSize == 1) && (instRef.states[fSession[fSel.nInst].state].iPos == 0) && (Instances[j] != fSel.sInstances[i])) {
						//alert(Instances[j] + ":"+ fSel.sInstances[i]);
						//update the instance's position relatively + force inheritance of size
						jO.update(Instances[j], {
							type: "instance",
							xs: changeX,
							ys: changeY,
							w: $("#" + fSel.sInstances[i]).width(),
							h: $("#" + fSel.sInstances[i]).height(),
							iSize: 1
						});
					}
				}
				
				//also update the object of course
				//alert(changeX + ":" + changeY)
				jO.update(fSel.nInst, {
					type: "object",
					xs: changeX,
					ys: changeY,
					w: $("#" + fSel.sInstances[i]).width(),
					h: $("#" + fSel.sInstances[i]).height()
				});
			}
			//else editing as Instance
			else {
				itemRef = fSel.jInst;
				//update the instance's position relatively + force inheritance of size
				jO.update(fSel.nInst, {
					type: "instance",
					xs: changeX,
					ys: changeY,
					w: $("#" + fSel.sInstances[i]).width(),
					h: $("#" + fSel.sInstances[i]).height(),
					iSize: 0
				});
			}
		}	
		// TEXT
		if (fSel.sInstances[i].match("t") != null) {
			//calculate difference in positional change
			changeX = $("#" + fSel.sInstances[i]).position().left - jO.jData.elements[fSel.sInstances[i]].x;
			changeY = $("#" + fSel.sInstances[i]).position().top - jO.jData.elements[fSel.sInstances[i]].y;
			
			jO.updateElements(fSel.sInstances[i], {
				xs: changeX,
				ys: changeY,
				w: $("#" + fSel.sInstances[i]).width(),
				h: $("#" + fSel.sInstances[i]).height(),
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
					item: fSel.jInst.of
				});
			}
		}
	}
}


function resized(event) {
	setWorkspaceDimensions(); // fix wrapper/workspace height
}


function killDrag(event) {
	if(mydrag) { $("#"+mydrag).draggable("destroy"); mydrag = null; }
}

function killResizable(event) {
	if(myresize) {
		$("#"+myresize).removeClass("resizable");
		$("#"+myresize).resizable("destroy"); myresize = null;
	}
}



// -------- Object Functions ----

function objectSortUp() {
	//increase zindex of first selected item // todo multiple item?
	alert($("#" + fSel.sInstances[0]).css("z-index"));
	$("#" + fSel.sInstances[0]).css("z-index",100);
}








// -------- fluidia Functions -----
$.fn.fEditable = function() {
	clickedElement = this;

	//overlay an input box on top of the double clicked div
	clickedElement.after('<input class="fEditable" id="fEditing" type="box" value="' + clickedElement.html() + '"></input>');

	//get the newly created element
	inputElement = this.next();

	//hide the clicked element
	clickedElement.hide();

	//focus the newly created editable input box
	inputElement.focus();
	hotkeysDisable(); //because people will be typing

	//attach on change
	inputElement.bind("change blur",closeEditing);
	$(window).bind("click",closeEditing);
}

function closeEditing(){ // if I have "blur change" together AIR crashes
	// update the DOM
	clickedElement.html(inputElement.attr("value"));
	//update jData
	jO.jData.pages[clickedElement.attr("id")].pageName = inputElement.attr("value");
	
	clickedElement.show();
	hotkeysEnable();
	inputElement.remove();
	
	$(window).unbind("click",closeEditing);
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
	if ((objref.name == "") || (objref.name == "New Object")) {
		clickedElement.find(".fLabel").html('<span class="fLBracket">[</span> <input class="fEditable fEditableLabel" id="fEditing" type="box" value=""></input>  <span class="fLBracket">]</span>');
	}
	else {
		clickedElement.find(".fLabel").html('<span class="fLBracket">[</span> <input class="fEditable fEditableLabel" id="fEditing" type="box" value="' + objref.name + '"></input>  <span class="fLBracket">]</span>');
	}

	//focus the newly created editable input box
	clickedElement.find(".fEditableLabel").focus();
	hotkeysDisable(); //because people will be typing

	//attach on change
	clickedElement.find(".fEditableLabel").bind("change blur",fWorkspace.saveLabel);
	$(window).bind("click",fWorkspace.saveLabel);
}


$.fn.fEditableText = function() {
	fWorkspace.editingText = true;
	clickedElement = this;
	
	txtref = jO.jData.elements[$(clickedElement).attr("id")];
	//objref = jO.jData.objects[jO.jData.instances[$(clickedElement).attr("id")].of];
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

	//attach on change
	$(window).bind("click",fWorkspace.saveText);
	
	//focus the newly created editable input box
	$("#fEditing").focus();
}



// -------- Tool Functions -----
// The left most tool functions

function toolHotspot() {
	//selectedTool
	selectedTool = "toolHotspot";

	//clear all tools
	toolClearAllIcons(); // visually
	toolClearAllEvents(); // Eventwise
	toolCursorCrosshairOn();
	killDrag(); // remove all dragging behaviours

	document.getElementById("iconHotspot").src = "engine/images/button_hotspot_on.gif";

	$("#fWorkspace").bind("mousemove",Draw);
}

function toolElement() {
	//selectedTool
	selectedTool = "toolElement";

	//clear all tools
	toolClearAllIcons(); // Visually
	toolClearAllEvents(); // Eventwise
	toolCursorCrosshairOn();
	killDrag(); // remove all dragging behaviours

	document.getElementById("iconElement").src = "engine/images/button_element_on.gif";

	$("#fWorkspace").bind("mousemove",Draw);
}


function toolObject() {
	//selectedTool
	selectedTool = "toolObject";

	//clear all tools
	toolClearAllIcons(); // Visually
	toolClearAllEvents(); // Eventwise
	toolCursorCrosshairOn();
	killDrag(); // remove all dragging behaviours

	document.getElementById("iconObject").src = "engine/images/button_object_on.gif";

	$("#fWorkspace").bind("mousemove",Draw);
}



function toolText() {
	selectedTool = "toolText";

	//clear all tools
	toolClearAllIcons(); // Visually
	toolClearAllEvents(); // Eventwise
	toolCursorCrosshairOn();
	killDrag(); // remove all dragging behaviours

	document.getElementById("iconText").src = "engine/images/button_text_on.gif";

	$("#fWorkspace").bind("mousemove",Draw);
}


function toolSelect() {
	selectedTool = "toolSelect";

	//clear all tools
	toolClearAllIcons(); // Visually
	toolClearAllEvents(); // Eventwise
	toolCursorCrosshairOff();

	document.getElementById("iconSelect").src = "engine/images/button_arrow_on.gif";

	$("#fWorkspace").bind("click",toolSelectDo);
}




// ----- Tool supportive functions

function toolClearAllIcons() {
	document.getElementById("iconObject").src = "engine/images/button_object_off.gif";
	document.getElementById("iconSelect").src = "engine/images/button_arrow_off.gif";
	document.getElementById("iconText").src = "engine/images/button_text_off.gif";
	//document.getElementById("iconElement").src = "engine/images/button_element_off.gif";
	//document.getElementById("iconHotspot").src = "engine/images/button_hotspot_off.gif";
}



function toolClearAllEvents() {
	// stop listening
	$("#fWorkspace").unbind("click",toolSelectDo);
	$("#fWorkspace").unbind("mousemove",Draw);
}


function toolCursorCrosshairOn() {
	for (var i = 0; i < fSel.sInstances.length; i++) {
		$("#" + fSel.sInstances[i]).removeClass("cursorMove");
	}
	$("#fWorkspace").addClass("cursorCrosshair");
}

function toolCursorCrosshairOff() {
	for (var i = 0; i < fSel.sInstances.length; i++) {
		if (fSel.sInstances[i] != "fWorkspace") { $("#" + fSel.sInstances[i]).addClass("cursorMove");}
	}
	$("#fWorkspace").removeClass("cursorCrosshair");
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
$.fn.showMenu = function(options) {
	var opts = $.extend({}, $.fn.showMenu.defaults, options);
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
				if (whatelement.attr("id") == fSel.sInstances[0]) { $("#fRightClickMenu div:first-child").addClass("selected"); }
				if (whatelement.attr("id") == $("#" + fSel.sInstances[0]).parent().attr("id")) { $("#fRightClickMenu div:first-child").addClass("parent"); }
				// TODO children??
				// TODO reflect multiple selects?
				countItems++;
			}
		});
		//show menu only if countItems exist
		if (countItems > 0) {
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

$.fn.showMenu.defaults = {
	zindex: 2000,
	query: document,
	opacity: 1.0
};




// ----- Temporary Feedback Functions
function feedbackWrite(what) {
	$("#panelPages").append(what + " ");
}


// Global Mouse, used to capture global dimensions (used by statemanager for example)
var fGM = {
	x : 0,
	y : 0,
	capture : function(e) {
		fGM.x = e.pageX;
		fGM.y = e.pageY;
	}
}



var Unselectable = {
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
	// .state - the remembered state of the instace //this is first prepopulated with jO.load 
	// .editStatesAs - 0 is one, 1 is all // this is first prepopulated with jO.load 
}



// -------- JSON Object -----
// this section contains the JSON data objects and instances
var jO = {
	jData : null,
	load : function (whatfile) {
		ref = this;
		$.getJSON(whatfile, function(data){
			jO.jData = data;
			
			//select first page
			panelPages.selectedPageId = "page1";
			//set minmum and maximum widths of panelpages after they have been loaded
			panelPages.cssPanelWidthCon = parseInt($("#panelPages").css("width"));
			panelPages.cssPanelWidthExp = parseInt($("#panelPages").css("width")) + 80;
			//Draw Panel Pages
			panelPages.draw();
			
			//populate all fSession instance with default states & 
			for (items in jO.jData.instances) {
				fSession[items] = new Object;
				fSession[items].state = jO.jData.objects[jO.jData.instances[items].of].defState;
				fSession[items].editStatesAs = 0; //by default edit OneState
			}
			
			//draw instances
			fWorkspace.redraw({type: 'page'});
		});
	},
	getAvailableInstId : function() {
		var availableId = 0;
		for (i=1;i < 10000;i++) {
			if ("ins" + i in jO.jData.instances) {}
			else { availableId = "ins" + i; break;	}
		}
		return(availableId);
	},
	getAvailableTxtId : function() {
		var availableId = 0;
		for (i=1;i < 10000;i++) {
			if ("t" + i in jO.jData.elements) {}
			else { availableId = "t" + i; break;	}
		}
		return(availableId);
	},
	getAvailableObjId : function() {
		var availableId = 0;
		for (i=1;i < 10000;i++) {
			if ("obj" + i in jO.jData.objects) {}
			else { availableId = "obj" + i; break;	}
		}
		return(availableId);
	},
	getAvailablePageId : function() {
		var availableId = 0;
		for (i=1;i < 10000;i++) {
			if ("page" + i in jO.jData.pages) {}
			else { availableId = "page" + i; break;	}
		}
		return(availableId);
	},
	getAvailableStateId : function(inst) {
		var availableId = 0;
		for (i=1;i < 10000;i++) {
			if (inst == "fWorkspace") { availableId = "s1"; break; }
			else if (jO.jData.instances[inst] == undefined) { availableId = "s1"; break; }
			else if ("s" + i in jO.jData.instances[inst].states) {}
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
			
			//make visible
			$("#container").append('<div id="fTempJData"><textarea>' + myJSONText + '</textarea></div>');
	},
	update : function(instance, options) {
		//updates either object or instance
		// instance is a string name of an instance to be updated
		// options is an object whose properties can be
		// options.type "instance", "object" or undefined (to use the fSession editAs property)
		// options.x,y,w,h and whose values are numbers 
		// options.xs, .ys are x,y coordinates but are summed to existing values
		// options can also be contents or events TODO
	
		var instRef = jO.jData.instances[instance];
		var objRef = jO.jData.objects[jO.jData.instances[instance].of];
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
			if(options.type == "instance")    { statesToEdit.push(instRef.states[fSession[instance].state]); }
			else if(options.type == "object") { statesToEdit.push(objRef.states[fSession[instance].state]); }
			else {
				//determine instance or object from fSession
				if (fSession[instance].editAs == 0) { statesToEdit.push(objRef.states[fSession[instance].state]); }
				else {statesToEdit.push(instRef.states[fSession[instance].state]); }
			}
		}
		
		//loop through all statesToEdit and make the different type of edits
		for (i=0;statesToEdit.length > i;i++ ) {
			//alert("x:" + options.x + " y:" + options.x + " h:" +options.h + " w:" + options.w)
			if (options.x != undefined) { statesToEdit[i].x = options.x }
			if (options.y != undefined) { statesToEdit[i].y = options.y }
			if (options.xs != undefined) { statesToEdit[i].x += options.xs }				
			if (options.ys != undefined) { statesToEdit[i].y += options.ys }				
			if (options.w != undefined) {
				statesToEdit[i].w = options.w;
			}
			if (options.h != undefined) {
				statesToEdit[i].h = options.h;
			}
			if (options.iPos != undefined) {
				statesToEdit[i].iPos = options.iPos;
			}
			if (options.iSize != undefined) {
				statesToEdit[i].iSize = options.iSize;
			}
			if (options.iContents != undefined) {
				statesToEdit[i].iContents = options.iContents;
			}
			if (options.iEvents != undefined) {
				statesToEdit[i].iEvents = options.iEvents;
			}
		}
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
		if (options.w != undefined) {
			elementRef.w = options.w;
		}
		if (options.h != undefined) {
			elementRef.h = options.h;
		}
		if (options.txt != undefined) {
			elementRef.txt = options.txt;
		}
	},
	createObj : function(name,x,y,width,height) {
		//alert('name:' + name + ', x:' + x + ', y:' + y + ', width:' + width + ', height:' + height);
		//determine which Id to give the object
		newObjId = jO.getAvailableObjId();
		//create it
		jO.jData.objects[newObjId] = new Object();
		jO.jData.objects[newObjId].name = name;
		jO.jData.objects[newObjId].defState = "s1";
		jO.jData.objects[newObjId].allInstances = new Object;
		jO.jData.objects[newObjId].states = new Object;

		//create state
		jO.jData.objects[newObjId].states.s1 = new Object;
		jO.jData.objects[newObjId].states.s1.contains = new Object;
		jO.jData.objects[newObjId].states.s1.sName = "State Name";
		jO.jData.objects[newObjId].states.s1.x = x;
		jO.jData.objects[newObjId].states.s1.y = y;
		jO.jData.objects[newObjId].states.s1.w = width;
		jO.jData.objects[newObjId].states.s1.h = height;
		jO.jData.objects[newObjId].states.s1['z-index'] = 1;
		
		return (newObjId);
	},
	createTxt : function(txt,x,y,width,height) {
		newTxtId = jO.getAvailableTxtId();
		
		//create it
		jO.jData.elements[newTxtId] = new Object();
		jO.jData.elements[newTxtId].txt = txt;
		jO.jData.elements[newTxtId].x = x;
		jO.jData.elements[newTxtId].y = y;
		jO.jData.elements[newTxtId].w = width;
		jO.jData.elements[newTxtId].h = height;
		
		return (newTxtId);
	},
	instantiate : function (ID,instanceId,state) {
		//what object, instatiate in which instances, and in what state 
		
		// FOR INSTANCES
		if (ID.match("obj") != null) {
		
			//grab available ID
			newInstId = jO.getAvailableInstId();
			
			//create instance
			var addWhereRef = jO.jData.instances;
			addWhereRef[newInstId] = new Object;
			addWhereRef[newInstId].of = ID;
			addWhereRef[newInstId].states = new Object;
			
			//create states as they are in the object
			//this.createState(newInstId);
			
			for (states in jO.jData.objects[ID].states) {
				//copy properites of instances 
				jO.jData.instances[newInstId].states[states] = new Object;
				if (jO.jData.instances[instanceId] != undefined) {
					iPos = jO.jData.instances[instanceId].states.iPos;
					iSize = jO.jData.instances[instanceId].states.iSize;
					iContents = jO.jData.instances[instanceId].states.iContents;
					iEvents = jO.jData.instances[instanceId].states.iEvents;
					x = jO.jData.instances[instanceId].states.x;
					y = jO.jData.instances[instanceId].states.y;
					w = jO.jData.instances[instanceId].states.w;
					h = jO.jData.instances[instanceId].states.h;
				}
				else {
					iPos = 1
					iSize = 1;
					iContents = 1;
					iEvents = 1;
					x = null;
					y = null;
					w = null;
					h = null;
				};
				jO.jData.instances[newInstId].states[states].iPos = iPos;
				jO.jData.instances[newInstId].states[states].iSize = iSize;
				jO.jData.instances[newInstId].states[states].iContents = iContents;
				jO.jData.instances[newInstId].states[states].iEvents = iEvents;
				jO.jData.instances[newInstId].states[states].contains = new Object;
				jO.jData.instances[newInstId].states[states].x = x;
				jO.jData.instances[newInstId].states[states].y = y;
				jO.jData.instances[newInstId].states[states].w = w;
				jO.jData.instances[newInstId].states[states].h = h;
			}
			
			
			//create fSession instance state
			fSession[newInstId] = new Object;
			fSession[newInstId].state = "s1";
			fSession[newInstId].editStatesAs = 0; //default edit OneState
			//update allInstances reference inside Object
			jO.jData.objects[ID].allInstances[newInstId] = 1;
		}
		
		// FOR TXT
		if (ID.match("t") != null) {
			newInstId = ID;
		}
		
		
		//if fWorkspace update pages
		if (instanceId == "fWorkspace") {
			jO.jData.pages[panelPages.selectedPageId].contains[newInstId] = "";
		}
		// update parent instances or object
		else {
			if (fSel.editAs == 0) {
				jO.jData.objects[fSel.nObj].states[state].contains[newInstId] = "";
			}
			else {
				jO.jData.instances[instanceId].states[state].contains[newInstId] = "";
			}
		}
		
		return(newInstId);
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
			objRef.states[newState].sName = "State Name " + newState.replace("s","");
			
			// and copy properties from currently selected object if not creating the state for the first time (s1)
			if (newState != "s1") {
				objRef.states[newState].x = fSel.jObj.states[fSession[fSel.nInst].state].x;
				objRef.states[newState].y = fSel.jObj.states[fSession[fSel.nInst].state].y;
				objRef.states[newState].w = fSel.jObj.states[fSession[fSel.nInst].state].w;
				objRef.states[newState].h = fSel.jObj.states[fSession[fSel.nInst].state].h;
				objRef.states[newState]['z-index'] = fSel.jObj.states[fSession[fSel.nInst].state]['z-index'];
				//populate contents as well from objects only
				for (items in fSel.jObj.states[fSession[fSel.nInst].state].contains) {
					//create new instances and their children
					
					//determine if the contents or events should be assignmed to the instance (or unassignmed and inherited from the object)
					
					//objId = jO.jData.instances[items].of;
					//this.instantiate(objId,instanceId,state) {
					//what object, instatiate in which instances, and in what state 
					//objRef.states[newState].contains[items] = fSel.jObj.states[fSession[fSel.nInst].state].contains.items;
					
					//objects
					if(items.match("ins")) {
						newInstanceName = jO.instantiate(jO.jData.instances[items].of, fSel.nInst, newState);
						//todo this has to happen recursively
					}
					//txt
					else if (items.match("t")) {
						tref = jO.jData.elements[items];
						newTxtId = jO.createTxt(tref.txt,tref.x,tref.y,tref.w,tref.h);
						//update state contains
						objRef.states[newState].contains[newTxtId] = "";
					
					}
					
					//objRef.states[newState].contains[newInstanceName] = "";
					
					//todo update allinstances TODO
					//instatiate it
					
					
					
				}
				//TODO populate events
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
		
		//create blank states from the instancesToUpdate array, with inheritance from object
		for (i=0;i<instancesToUpdate.length;i++) {
			jO.jData.instances[instancesToUpdate[i]].states[newState] = new Object;
			jO.jData.instances[instancesToUpdate[i]].states[newState].iPos = 1;
			jO.jData.instances[instancesToUpdate[i]].states[newState].iSize = 1;
			jO.jData.instances[instancesToUpdate[i]].states[newState].iContents = 1;
			jO.jData.instances[instancesToUpdate[i]].states[newState].iEvents = 1;
			jO.jData.instances[instancesToUpdate[i]].states[newState].contains = new Object;
		}
		
		return(newState);
	},
	updateAddPage : function(what) {
		
	}
};


// -------- ClibBoard Manager Popup Object -----
// this section contains the clibboard objects
var fCBManager = {
	opened : false,
	mouseover : false, //checked by keyReleased function to see if the mouse is still not over, before hiding it
	mode : "", //wholepage, multiple instances, multiple objects, instance, objects
	states : "", //one state or all 
	instances : [], //array with instance names to copy
	title : "", // display title
	displayManager : function() {
		if (this.opened == false) {
			var setx = 0;
			var sety = 0;

			$('#fCBManager').fadeIn(100);
			//check if x is not exceeding maximum x allowed
			if(fGM.x + $("#fCBManager").width() > $().width() - 40) {	setx = $().width() - 40 - $("#fCBManager").width();	}
			else { setx = fGM.x; }
			//check if y is not exceeding maximum y allowed
			if(fGM.y + $("#fCBManager").height() > $().height() - 30) {	sety = $().height() - 30 - $("#fCBManager").height();	}
			else { sety = fGM.y; }
			//check if x is not exceeding minimum x allowed
			if (fGM.x < 180) { setx = 180; }
			//check if y is not exceeding minimum y allowed
			if (fGM.y < 90) { sety = 90; }
			
				
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fCBManager").css({left: setx});
			$("#fCBManager").css({top: sety});
			
			//set title
			$("#fCBTitle").html(this.title);
			
			//set mouseover 
			this.mouseover = true;
			
			//update 
			this.redraw();
		
			//assign hiding ... if not holding down C, hide on mouseleave
			$("#fCBManager").bind("mouseleave", function(e){ if(cPressed == false) {fCBManager.hideManager(); this.mouseover=false;}}); 
			$("#fCBManager").bind("mouseenter", function(e){ this.mouseover=true;}); 
			
			//update opened state
			this.opened = true;
		}
	},
	copy : function() {
		if ((this.opened == false) && (fSel.sInstances.length != 0)) {
			//set copy type
			if(fSel.editAs == 0) { this.type = "object";}
			else { this.type = "instance"; }
				
			//copy instance names
			this.instances = fSel.sInstances.slice();
			
			//set mode
			this.mode = "object";
			
			//update selected object
			this.title = "Object: " + fSel.nObj + " " + jO.jData.objects[fSel.nObj].name;
			
			//display
			this.displayManager();
		}
	},
	paste : function() {
		//instantiate
		//alert(this.instances[0] + ":" + jO.jData.instances[this.instances[0]].of +  ":" + fSel.sInstances[0] + ":" + fSession[fSel.nInst].state);
		
		//check if the selected item is on the selected page
		if(!$("#" + fSel.sInstances[0]).length > 0) {
			//if not, then select the workspace :)
			fSel.selectObject($("#fWorkspace"));
		}
		
		if (fSel.sInstances[0].match("ins")) {
			ID = jO.instantiate(jO.jData.instances[this.instances[0]].of, fSel.sInstances[0], fSession[fSel.nInst].state);
			//redraw Objects
			fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		}
		else if (fSel.sInstances[0].match("fWorkspace")) {
			ID = jO.instantiate(jO.jData.instances[this.instances[0]].of, "fWorkspace");
			//redraw Page
			fWorkspace.redraw({type: 'page'});
		}
		
		//give visual feedback that paste has occured
		$("#"+ID).prepend('<div class="pasteFillInst" id="pasteFill"></div>');
		$("#pasteFill").animate({"opacity": "0"}, { duration: "fast", complete: function(){
			$("#pasteFill").remove();
		}});


		
	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fCBManager").fadeOut(100);
			this.opened = false;
		}
	},
	redraw : function() {

	}
}



// -------- AltManager Popup Object -----
// this section contains the state manager
var fAltManager = {
	opened : false,
	displayManager : function() {
		if ((this.opened == false) && (fSel.sInstances[0] != "fWorkspace")) {
			var setx = 0;
			var sety = 0;
			var rememberedState = fSel.jObj.states[fSession[fSel.nInst].state].sName;
			$('#fAltManager').fadeIn(100);
			//check if x is not exceeding maximum x allowed
			if(fGM.x + $("#fAltManager").width() > $().width() - 40) {	setx = $().width() - 40 - $("#fAltManager").width();	}
			else { setx = fGM.x; }
			//check if y is not exceeding maximum y allowed
			if(fGM.y + $("#fAltManager").height() > $().height() - 30) {	sety = $().height() - 30 - $("#fAltManager").height();	}
			else { sety = fGM.y; }
			//check if x is not exceeding minimum x allowed
			if (fGM.x < 180) { setx = 180; }
			//check if y is not exceeding minimum y allowed
			if (fGM.y < 90) { sety = 90; }
			
				
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fAltManager").css({left: setx});
			$("#fAltManager").css({top: sety});
			
		
			//update opened state
			this.opened = true;
		}
	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fAltManager").fadeOut(100);
			this.opened = false;
		}
	}
}



// -------- StateManager Popup Object -----
// this section contains the state manager
var fStateManager = {
	opened : false,
	displayManager : function() {
		if ((this.opened == false) && (fSel.sInstances[0] != "fWorkspace")) {
			var setx = 0;
			var sety = 0;
			var rememberedState = fSel.jObj.states[fSession[fSel.nInst].state].sName;
			$('#fStateManager').fadeIn(100);
			//check if x is not exceeding maximum x allowed
			if(fGM.x + $("#fStateManager").width() > $().width() - 40) {	setx = $().width() - 40 - $("#fStateManager").width();	}
			else { setx = fGM.x; }
			//check if y is not exceeding maximum y allowed
			if(fGM.y + $("#fStateManager").height() > $().height() - 30) {	sety = $().height() - 30 - $("#fStateManager").height();	}
			else { sety = fGM.y; }
			//check if x is not exceeding minimum x allowed
			if (fGM.x < 180) { setx = 180; }
			//check if y is not exceeding minimum y allowed
			if (fGM.y < 90) { sety = 90; }
			
				
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fStateManager").css({left: setx});
			$("#fStateManager").css({top: sety});
			
			//update fStateManager
			this.redraw();
		
			//update opened state
			this.opened = true;
		}
	},
	hoverOn : function(state) {
		$("#fSMStateName").text(fSel.jObj.states[state].sName);
	},
	hoverOff : function() {
		$("#fSMStateName").text(fSel.jObj.states[fSession[fSel.nInst].state].sName);
	},
	redraw : function() {
		//clear all states
			$(".fSMStates").children().remove();
			
		//update State Text
		$("#fSMStateName").text(fSel.jObj.states[fSession[fSel.nInst].state].sName);
			
		//preload number of states
		var i = 0;
		for (items in jO.jData.instances[fSel.nInst].states) {
			$(".fSMStates").append('<div class="fSMState" id="' + items + '"><a href="#" onclick="fStateManager.chooseState(\'' + items + '\')" onmouseover="rollOver(this); fStateManager.hoverOn(\'' + items + '\')" onmouseout="rollOut(this); fStateManager.hoverOff();"><img src="engine/images/b_state_off.png" border="0" title="State"></a><input type="radio" name="fStartingState" onclick="fStateManager.chooseDefaultState(\'' + items + '\');"></div>');
		}
		
		//set default state (grab from object)
		var defState = fSel.jObj.defState;
		$("#" + defState + " input").attr("checked",true)
		
		var imgsrc = $("#" + fSession[fSel.sInstances[0]].state + " img").attr("src");
		imgsrc = imgsrc.replace("_off","_on");
		$("#" + fSession[fSel.sInstances[0]].state + " img").attr("src",imgsrc);
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
		
	},
	chooseState : function(whichState) {
		//update selected state in fSession
		fSession[fSel.nInst].state = whichState;
		
		//redraw Objects
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		
		//update fStateManager
		this.redraw();
		
		//update footer
		fFooter.redrawFooter();
		
	},
	chooseDefaultState : function(whichState) {
		//update selected object's defaultState
		fSel.jObj.defState = whichState;
	}
}

// -------- EventManager Popup Object -----
// this section contains the events manager 
var fEventManager = {
	opened : false,
	triggerPressedRecently : false,
	trigger : function() {
		ref = this;
		//detect if trigger was pressed twice in less than a second
		if (ref.triggerPressedRecently == true) {
			ref.displayManager();
		}
		setTimeout("ref.triggerPressedRecently = false",500);
	} ,
	displayManager : function () {
		// create the menu
		if (this.opened == false) {
			$("#container").append('<div id="fEventManager">Event Manager</div>');
			this.opened = true;
			
			// temp stuff show JSON
			jO.jsonToText();
		}		
	},
	hideManager : function () {
		if (this.opened == true) {
			$("#fEventManager").remove();
			this.opened = false;
			this.triggerPressedRecently = false;
			
			// temp stuff hide JSON
			$("#fTempJData").remove();
			
		}
	}
	
};



// -------- fWorkspace Object -----
var fWorkspace = {
	editingText : false, //if set to true, a resize does not cause a redraw
	allowSaveLabel : false,
	editingLabelInstance : null,
	clear : function() {
		//alert('clear');
		$("#fWorkspace").children().remove();
	},
	clearStyles : function() {
		//unselect old one(s)
		//alert('clearing Styles');
		for (var i = 0; i < fSel.sInstances.length; i++) {
			$("#" + fSel.sInstances[i]).removeClass("selected");
			$("#" + fSel.sInstances[i]).parent().removeClass("parent");
			$("#" + fSel.sInstances[i]).removeClass("cursorMove");
			$("#" + fSel.sInstances[i]).removeClass("selectedInst");
			$("#" + fSel.sInstances[i]).removeClass("selectedTxt");
		}
	},
	redraw : function(options){
		// takes two properties: type and item
		// type can be 'page', 'instance', 'object'
		// item is a string of instanceName or objectName
		// when a page is redrawn, it uses the currentpage

		attachWhereArray = new Array(); //contains parent instance references to which instances are attached to
		attachWhatArray = new Array(); //each elements contains an object with a set of instance references from within "contains"

		attachWhereArray.splice(0,attachWhereArray.length); //clear each time this function is called
		attachWhatArray.splice(0,attachWhatArray.length)
		
		////// redraw whole page
		if (options.type == 'page') {
			// CLEARS & draws all instances on fWorkspace :)
			attachWhereArray.push("fWorkspace");
			attachWhatArray.push(jO.jData.pages[panelPages.selectedPageId].contains);			
			fWorkspace.clear(); 
		}
		////// redraw one instance
		else if (options.type == 'instance') {
			attachWhereArray.push($("#"+options.item).parent().attr("id"));
			o = {};
			o[options.item] = "1";
			attachWhatArray.push(o);
		}
		////// redraw object (object's instances)
		else if (options.type == 'object') {
			//generate a list of instances matching the object name from the workspace 
			var Instances = jO.getInstancesOfObj(options.item,{type : "workspace"});
			for(i=0; Instances.length > i; i++) {
				o = {};
				o[Instances[i]] = "1";
				attachWhatArray.push(o);			
				attachWhereArray.push($("#"+Instances[i]).parent().attr("id"));
			}
		}
		
		
		//for each instances passed draw (for 'page') or adjust (for 'instance') it
		var i;
		for (i = 0; i < attachWhatArray.length; i += 1) {
			for (item in attachWhatArray[i]) {
				//FOR INSTANCES
				if (item.match("ins") != null) {
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
					
					//clear item's children 
					$("#" + item).children().remove();
					//bug fix: removal of children disables resizability. turn resizability if it is supposed to be on
					if (myresize == item) {
						killResizable();
						makeResizable(item);
					}
					
					// grab properties from object
					var x = objRefState.x;
					var y = objRefState.y;
					var width = objRefState.w;
					var height = objRefState.h;
					
					
					// only use instance/inheritance settings if not editing as object (set from Toggle). This means that by default instances will be used
					if (fSession[item].editAs != 0) {
						if ((instRefState.iPos == 0) && instRefState.hasOwnProperty("x" && "y")) {
							x = instRefState.x;
							y = instRefState.y;
						}
						if ((instRefState.iSize == 0) && instRefState.hasOwnProperty("w" && "h")) {
							width = instRefState.w;
							height = instRefState.h;
						}
					}
					
					// create the instance & bind events if creating for the first time (ex: PAGE CHANGES)
					if ($("#" + item).length == 0) {
						$("#" + attachWhereArray[i]).append("<div id=\"" + item + "\" class=\"fObject\"></div>"); //unique
						//$("div.fObject").bind("dblclick", makeResizable); //unique
					}
					
					// adjust properties
					$("#" + item).css({
						left: x,
						top: y,
						width: width,
						height: height
					});
					
					
					// CONTAINS 
					// if editing as object just load master object's
					var contains = false; // does the current instance have anything inside? used to determine label display 
					if (fSession[item].editAs == 0) {
						if (objRefState.hasOwnProperty("contains")) {
							//load contents from object
							count = 0;
							for (k in objRefState.contains) 
								if (objRefState.contains.hasOwnProperty(k)) 
									count++;
							//if they have anything inside
							if (count > 0) {
								attachWhatArray.push(objRefState.contains);
								//and remember in the parent instances, in order to attach to later
								attachWhereArray.push(item);
								contains = true;
							//alert('item: ' + item + ' o ');
							}
						}
					}
					// if editings as instance
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
							//alert('instance: ' + instance + ' i ');
							}
						}
						
						if (objRefState.hasOwnProperty("contains")) {
							//load contents from object
							count = 0;
							for (k in objRefState.contains) 
								if (objRefState.contains.hasOwnProperty(k)) 
									count++;
							//if they have anything inside and inheritance is active 
							if ((count > 0) && (instRefState.iContents == 1)) {
								attachWhatArray.push(objRefState.contains);
								//and remember in the parent instances, in order to attach to later
								attachWhereArray.push(item);
								contains = true;
							//alert('item: ' + item + ' o ');
							}
						}
					}
					
					// SHOW LABEL
					// if instance does not contain anything (and is wider than 60 pixels), display a label
					if((contains == false) && (width > 60)) {
						$("#" + item).append('<div class="fLabelHolder"><div class="fLabel"><span class="fLBracket">[</span> ' + objRef.name + ' <span class="fLBracket">]</span></div></div>');
						//attach a rename to it on double click
						//$("#" + item).find(".fLabel").bind("dblclick",fWorkspace.editLabel);
						//alert("attaching" + $("#" + item).attr("id"))
						$("#" + item).find(".fLabel").bind("dblclick",function() {$(this).fEditableLabel();});
					}
					
				}
				//FOR TEXT
				if (item.match("t") != null) {
					txtRef = jO.jData.elements[item];
					
					// grab properties from object
					var x = txtRef.x;
					var y = txtRef.y;
					var width = txtRef.w;
					var height = txtRef.h;
					var txt = txtRef.txt;
					
					// create the instance & bind events if creating for the first time (ex: PAGE CHANGES)
					if ($("#" + item).length == 0) {
						$("#" + attachWhereArray[i]).append("<div id=\"" + item + "\" class=\"fText\">" + txt + "</div>"); //unique
						//$("div.fObject").bind("dblclick", makeResizable); //unique
					}
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
			}
		}
		
		if (options.type == 'page') {
		//make draggable / resizable selected items
		//reselect first selected object
		if((fSel.sInstances[0] != "fWorkspace") && $("#" + fSel.sInstances[0]).length) {
			//if (myresize) {
			//	var backup = myresize;
			//	killResizable();
			//	makeResizable(backup);
			//}
			fSel.makeDraggable(fSel.sInstances[0]);
		}
		}
			
		//visualize selected items
		fWorkspace.restyle();
		
	},
	restyle : function() {
		//restyles all elements on the workspace
		if (fSel.sInstances[0] == "fWorkspace") {
			$("#" + fSel.sInstances[0]).addClass("selected");
		}
		else {
			//style the new selection ones
			//alert('restyling' + fSel.sInstances.length);
			for (var i = 0; i < fSel.sInstances.length; i++) {
				//instances
				if (fSel.sInstances[i].match("ins")) {
					$("#" + fSel.sInstances[i]).addClass("selected");
					$("#" + fSel.sInstances[i]).addClass("cursorMove");
				}
				else if (fSel.sInstances[i].match("t")) {
					$("#" + fSel.sInstances[i]).addClass("selectedTxt");
					$("#" + fSel.sInstances[i]).addClass("cursorMove");
				}
			}
			//style the parent
			$("#" + fSel.sInstances[0]).parent().addClass("parent");
		}
	},
	saveLabel : function() {
		if (fWorkspace.allowSaveLabel == true) {
			//stop saveLabel from tunning twice
			fWorkspace.allowSaveLabel = false;
			
			//update jData
			//alert(fWorkspace.editingLabelInstance);
			saveAs = $("#" + fWorkspace.editingLabelInstance).find("input").attr("value");
			if(saveAs == "") { saveAs = "New Object";}
			jO.jData.objects[jO.jData.instances[fWorkspace.editingLabelInstance].of].name = saveAs;
			
			hotkeysEnable();
			
			$("#" + fWorkspace.editingLabelInstance).unbind("change blur", fWorkspace.saveLabel);
			$(window).unbind("click", fWorkspace.saveLabel);
			
			//redraw
			fWorkspace.redraw({
				type: 'object',
				item: jO.jData.instances[fWorkspace.editingLabelInstance].of
			});
			
			//update footer
			fFooter.redrawFooter();
		}
	},
	saveText : function() {
		//update jData

		saveAs = $("#fEditing").val();
		jO.jData.elements[fWorkspace.editingTextInstance].txt = saveAs;

		hotkeysEnable();
		
		$(window).unbind("click", fWorkspace.saveText);
		
		parentInstance = $("#"+fWorkspace.editingTextInstance).parent().attr("id");

		//alert(fWorkspace.editingTextInstance + ":" + saveAs + ":" + parentInstance);
		//redraw
		if (parentInstance == "fWorkspace") {
			fWorkspace.redraw({
				type: 'page'
			});
		}
		else {
			fWorkspace.redraw({
				type: 'object',
				item: jO.jData.instances[parentInstance].of
			});
		}
		
		fWorkspace.editingText = false;
		
		//update footer
		fFooter.redrawFooter();
	}
}


// -------- fSel Object -----
// all selected items (objects, instances), states. DOM references
var fSel = {
	//editing as
	editAs : 0, //editing selected item as 0 Object, or 1 Instance
	editStatesAs : 0, //editing selected item states as 0 individual state, or 1 as All states 
	
	sInstances : new Array, //selected instances (strings)
	jObj : "", //reference to first selected JSON object (without state)
	jInst : "", //reference to first selected JSON instance (without state)
	nObj : "", //string name of selected object
	nInst : "", //string name of selected instance
	

	selectObject : function(what) {
		//feedbackWrite($(what).attr("id"));
		// can access an index number to a DOM element, a DOM reference or an instance name
		// what is converted to a jQuery object
		if (typeof what == "number") {
			what = $("div").get(what);
			what = $(what);
		}
		else if (typeof what == "string") {
			if(what.indexOf("#") != -1) {
				what = $("#" + what);	
			}
		}
		
		
		//destroy last draggable
		killDrag();

		this.makeDraggable($(what).attr("id"));
	
		//clear styles
		fWorkspace.clearStyles();
	
		// IF NO SHIFT IS HELD DOWN empty the whole array
		if (shiftPressed == false) {
			if (fSel.sInstances.length > 0) {	fSel.sInstances.splice(0,fSel.sInstances.length); }
		}
	
		//CONTINUE ADDING TO THE ARRAY
		// if the item is already selected, unselect it, otherwise add it
		itemExists = false;
		for (var i = 0; i < fSel.sInstances.length; i++) {
			if ((fSel.sInstances[i] == what.attr("id")) && (fSel.sInstances.length > 1)) {
				fSel.sInstances.splice(i,1); //remove the item from the selected list
				i--; // update loop index since an array item was removed
				itemExists = true;
				break;
			}
		}
		// Add the newly selected item
		if (itemExists == false) {
			fSel.sInstances.push(what.attr("id"));
		}
	
		// Begin Removal Part 1: remove: children of selected objects, and duplicates
		uniqueIds = {};
		childIds = {};
		for (var i = 0; i < fSel.sInstances.length; i++) {
			// children Ids collection
			// make a full list of children Ids to be deleted in case of a match
			childrenrarray = $("#" + fSel.sInstances[i]).find("div"); // matches any children of a selected element except using the workspace
			for (var j=0, len=childrenrarray.length; j<len; j++ ){
				childIds[$(childrenrarray[j]).attr("id")] = true;
			}
	
			// unique Ids collection + store how many instances there are of each duplicates
			if (uniqueIds[fSel.sInstances[i]] == undefined) {
				uniqueIds[fSel.sInstances[i]] = 1;
			}
			else {
				uniqueIds[fSel.sInstances[i]]++;
			}
		}
	
	
		// go over the list again and actually remove the children and duplicates
		for (var i = 0; i < fSel.sInstances.length; i++) {
			//remove the fSel.sInstances that are kids of fSel.sInstances
			if (childIds[fSel.sInstances[i]] == true) {
				fSel.sInstances.splice(i,1); //remove workspace
				i--; // update loop index since an array item was removed
				continue;
			}
			//remove the duplicates if more than 1
			if (uniqueIds[fSel.sInstances[i]] > 1) {
				uniqueIds[fSel.sInstances[i]]--;
				fSel.sInstances.splice(i,1); //remove workspace
				i--; // update loop index since an array item was removed
				continue;
			}
		}
	
		
		//WORKSPACE selected
		if (fSel.sInstances[0] == "fWorkspace") {
			//enable Footer
			$("#fObjInstHolder").hide();
			$("#fNoneSelectedHolder").show();
			$("#fFooterText").hide();
		}
		//TEXT elements
		else if (fSel.sInstances[0].match("t")) {
			//enable Footer
			$("#fObjInstHolder").hide();
			$("#fNoneSelectedHolder").hide();
			$("#fFooterText").show();
		}
		//REAL OBJECTS / INSTANCES selected
		else 
			if (fSel.sInstances[0].match("ins")) {
				//update selected variables used by other functions
				fSel.jObj = jO.jData.objects[jO.jData.instances[fSel.sInstances[0]].of];
				fSel.jInst = jO.jData.instances[fSel.sInstances[0]];
				fSel.nObj = jO.jData.instances[fSel.sInstances[0]].of
				fSel.nInst = fSel.sInstances[0];
				
				//enable footer
				$("#fNoneSelectedHolder").hide();
				$("#fObjInstHolder").show();
				$("#fFooterText").hide();
				
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
					fFooter.editOneState();
				}
				else {
					fFooter.editAllStates();
				}
			}
		
		//restyle workspace items
		fWorkspace.restyle();
	},
	makeDraggable : function(what) {
		// create new draggable & store it
		lastDraggable = what; //remember the new draggable object
		mydrag = what;
		//feedbackWrite(mydrag);
		$("#"+mydrag).draggable({cancel: [''], containment: "#fWorkspace", handle: what, start: dragRegister, drag: dragItems, stop: dragStop});
	}
}


// -------- States -----
// this object manages everything related to states
var fStates = {
	loadFooterStates : function() {
		//load states for first selectedObject
	},
	fSCheck : function(what,checkedState) {
		//check if a checkedState direction is being sent
		if(checkedState == 1) {
			$("#"+what).removeClass("fSOff");
		}
		else if(checkedState == 0) {
			$("#"+what).addClass("fSOff");
		}
		//else, just toggle the checkbox 
		else {
			//change look
			$("#"+what).toggleClass("fSOff");
			
			//update jO's instance properties by toggling them
			if(what == "fSPos") { fSel.jInst.states[fSession[fSel.nInst].state].iPos ^= 1 }
			if(what == "fSSize") { fSel.jInst.states[fSession[fSel.nInst].state].iSize ^= 1 }
			if(what == "fSContents") { fSel.jInst.states[fSession[fSel.nInst].state].iContents ^= 1 }
			if(what == "fSEvents") { fSel.jInst.states[fSession[fSel.nInst].state].iEvents ^= 1 }
			
			fWorkspace.redraw({type : 'instance', item : fSel.nInst});
		}
	}
}



// -------- ToggleEdit Object -----
// this object controls how an instance is being edited
var fFooter = {
	editObject : function () {
		$("#fObjInstHolder").removeClass("fEditingInst");
		$("#fObjInstHolder").addClass("fEditingObj");
		fSel.editAs = 0;
		fSession[fSel.nInst].editAs = 0;
		
		//change text
		$("#fSInherit").text('State\'s');
		
		//hide Checkboxes & kill pointer cursor
		$(".fSCheck").hide();
		$(".fSTitle").css("cursor","default");
		
		this.redrawFooter();
		
		//change look of selected class
		$("#" + fSel.sInstances[0]).removeClass("selectedInst");
	},	
	editInstance : function () {
		$("#fObjInstHolder").removeClass("fEditingObj");
		$("#fObjInstHolder").addClass("fEditingInst");
		fSel.editAs = 1;
		fSession[fSel.nInst].editAs = 1;
		
		//change text
		$("#fSInherit").text('State inherits');
		
		//show Checkboxes & allow for pointing cursor
		$(".fSCheck").show();
		$(".fSTitle").css("cursor","pointer");
			
		this.redrawFooter();	
		
		//change look of selected class
		$("#" + fSel.sInstances[0]).addClass("selectedInst");
	},
	redrawFooter : function () {
		if (fSel.sInstances[0].match("ins")) {
			//update object name
			//alert(fSel.jObj.name);
			$("#fObjName").html(fSel.jObj.name);
			
			//update statename
			$("#fStateName").text(fSel.jObj.states[fSession[fSel.nInst].state].sName);
			
			//update inheritance properties
			if (fSel.jInst.states[fSession[fSel.nInst].state].iSize == 0) {
				fStates.fSCheck('fSSize', false);
			}
			else {
				fStates.fSCheck('fSSize', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iPos == 0) {
				fStates.fSCheck('fSPos', false);
			}
			else {
				fStates.fSCheck('fSPos', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iContents == 0) {
				fStates.fSCheck('fSContents', false);
			}
			else {
				fStates.fSCheck('fSContents', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iEvents == 0) {
				fStates.fSCheck('fSEvents', false);
			}
			else {
				fStates.fSCheck('fSEvents', true);
			}
			
			//update setwidth & setheight boxes
			updateInfoWH();
			updateInfoXYPos();
		}
		else if (fSel.sInstances[0].match("t")) {
		}
	},
	editOneState : function() {
		//clear AllStates
		var imgsrc = $("#buttonAllStates").attr("src");
		imgsrc = imgsrc.replace("_on","_off");
		$("#buttonAllStates").attr("src",imgsrc);
		
		//set OneState
		imgsrc = $("#buttonOneState").attr("src");
		imgsrc = imgsrc.replace(/(_over|_off)/,"_on");
		$("#buttonOneState").attr("src",imgsrc);
		
		//update fSession
		fSession[fSel.nInst].editStatesAs = 0;
	},
	editAllStates : function() {
		//clear OneState
		var imgsrc = $("#buttonOneState").attr("src");
		imgsrc = imgsrc.replace("_on","_off");
		$("#buttonOneState").attr("src",imgsrc);
		
		//set AllStates
		imgsrc = $("#buttonAllStates").attr("src");
		imgsrc = imgsrc.replace(/(_over|_off)/,"_on");
		$("#buttonAllStates").attr("src",imgsrc);
		
		//update fSession
		fSession[fSel.nInst].editStatesAs = 1;
	}
}




var panelPages = {
	itemCount : 0,
	rememberPageSelectedId : null,
	panelId : "panelPages",
	attachTo : "#panelPages",
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
			if (thisref.panelId == "panelPages") {
				//attach single click for select 
				$(thisref.attachTo + " div.fPanelItemsList").children(':last').bind("click", function() {thisref.setSelectedPage(i); fWorkspace.redraw({type: 'page'});});
				//loadnew items TODO
			}	
		});
		
		//attach extend event
		$(this.attachTo).hover(function() {	 $("#panelPages").animate({"width" : thisref.cssPanelWidthExp}, {queue : false, duration: 150, easing: "swing"})}, function() {$(this).animate({"width" : thisref.cssPanelWidthCon}, {queue : false, duration: 150, easing: "swing"}); });
		
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
		//if (this.itemCount > 8) {
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
					$(thisref.attachTo + " *.fPanelItemsList").scrollTo('-=5px');
				}
				else if (delta < 0)
					$(thisref.attachTo + " *.fPanelItemsList").scrollTo('+=5px');
					return false; // prevent default
				}
				);
				//click scrolling
				$(this.attachTo + " *.panelArrowDown").click(function() {$(thisref.attachTo + " *.fPanelItemsList").scrollTo('+=14px')});
				$(this.attachTo + " *.panelArrowUp").click(function() {$(thisref.attachTo + " *.fPanelItemsList").scrollTo('-=14px')});
		//	}
		//else {
		//	$(this.attachTo + " *.panelArrowDown," + this.attachTo + " *.panelArrowUp").css("display","none");
		//	$(this.attachTo + " *.fPanelItemsList").removeClass("fPanelItemsListCollapse");
		//}
	
		this.setSelectedPage(this.selectedPageId);
	},

	arrows : function (what) {

	},

	add : function () {
		var thisref = this;
		pageId = jO.getAvailablePageId();
		jO.jData.pages[pageId] = new Object();
		jO.jData.pages[pageId].pageName = "New Page2";
		jO.jData.pages[pageId].contains = new Object;
		
		//select the last page in line
		this.selectedPageId = pageId;
		this.draw();
		
		////PANELPAGES CODE - custom
		if (thisref.panelId == "panelPages") {
		//clear previous workspace
		fWorkspace.clear();	
		}
		
		// scroll to the last item
		$(this.attachTo + " *.fPanelItemsList").scrollTo($(this.attachTo + " *.fPanelItemsList").children(":last-child"));
		
	},

	remove : function () {
		//replace with splice
		delete jO.jData.pages[this.selectedPageId];

		//select the last page in line
		this.selectedPageId = jO.getLastPageId();
		
		//replace draw with just dom updates? :) quicker
		this.draw();
		
		// scroll to the last item
		$(this.attachTo + " *.fPanelItemsList").scrollTo($(this.attachTo + " *.fPanelItemsList").children(":last-child"));
	},

	setSelectedPage : function (selectWhat) {
		//alert(this.rememberPageSelectedId + ":" + selectWhat);
		//kill resizable
		killDrag();
		killResizable();
		
		//revert old
		$("#" + this.rememberPageSelectedId).removeClass("panelItemSelected")

		//change new
		$("#" + selectWhat).addClass("panelItemSelected")
		
		this.selectedPageId = selectWhat;

		this.rememberPageSelectedId = selectWhat;
		// reposition?
		
		//select workspace
		//fSel.selectObject($("fWorkspace"));
		
		//redraw workspace
		fWorkspace.restyle();
	}
};

