/* TODO LIST
- archiving tasks
- using the archive for task retrieval
- separate out "create new task row" as its own function
- add a sidebar, maybe with the text/emoji mode in, plus status information
- - figure out how to include this information for small screens
- responsive design for the page
- separate "update task" function
- maybe a separate "grab/process data from form" thing so I can reuse that for both adding and editing tasks
- developer mode with the ability to add test tasks in bulk
- add test tasks
- check github, get this on if it's not there
- explain what the types of spoon mean, especially executive function
- a "clear all tasks" button
- plus deleting/editing multiple tasks with checkboxes
- test cases from various disabled people with indications of how they use the spoon counter
- put the tables back, instead of making it look like a table with CSS
- - this is actually tabular data so a table makes sense
- simple mode
*/

$(document).ready(function() {
	const body = $("body");
	body.data("displayMode","text");
  buildSettings();
  buildTitle();
  buildOptions();
	buildTaskList();
	const table = $("#tasklist");
	table.data("spoonList", spoonListEmoji);
	$(".savenewtask").click(function() {
		saveNewTaskButtonHandler(this);
	});
	$("a.setting").click(function(){
		changeSettingHandler(this);
	});
  /*addTask($("#tasklist"),"text","high","test task",
          ["none","low","low","high","medium","low","none","low","none","none"],
          spoonTypeList,spoonListEmoji);*/
});

// -- SETUP --

function buildSettings() {
  const body = $("body");
  const para = $("<p></p>");
  const container = makeSpan();
  const textSetting = makeSpan();
  para.addClass("settings");
  para.attr("id","settings-para")
  container.addClass("setting");
  container.addClass("display-mode-container");
  textSetting.addClass("setting");
  textSetting.addClass("display-mode");
  textSetting.attr("id","text");
  textSetting.text("text");
  const emojiLink = $("<a></a>", {
	  href: "javascript:void(0)",
	  id: "emoji",
	  html: "emoji",
  });
  emojiLink.addClass("setting");
  emojiLink.addClass("display-mode");
  container.append(textSetting);
  container.append(" ", emojiLink);
  para.append(container);
  body.append(para);
  // need to finish appending the settings stuff to this function
};

function buildTitle() {
  const body = $("body");
  const title = $("<h1></h1>");
  title.text("Spoon Wizards");
  body.append(title);
}

function buildOptions() {
  const body = $("body");
  const para = $("<p></p>");
  const container = makeSpan();
  const importButton = makeButton("Import");
  const exportButton = makeButton("Export");
  exportButton.click(function() {
    exportTasksHandler(this);
  });
  importButton.click(function() {
    importTasksHandler(this);
  });
  para.addClass("options");
  para.attr("id","options-para");
  container.addClass("options");
  container.addClass("container");
  container.append(importButton);
  container.append(exportButton);
  // still need to make these buttons do anything at all, so I guess we'll start with the Export button
  para.append(container);
  body.append(para);
};

function buildTaskList() {
	const body = $("body");
	// create the task list
	const taskList = makeTable();
	taskList.attr("id","tasklist");
  body.append(taskList);
	// make the header row
	const headerRow = makeTableRow();
	headerRow.addClass("header");
	headerRow.attr("id","taskhead");
	// add the difficulty header
	const difficultyHead = makeTableHead();
	difficultyHead.addClass("difficultyhead");
	difficultyHead.html("difficulty");
	headerRow.append(difficultyHead);
	// add the done header
	const doneHead = makeTableHead();
	doneHead.addClass("donehead");
	doneHead.html("done?");
	headerRow.append(doneHead);
	// add the task name header
	const nameHead = makeTableHead();
	nameHead.addClass("namehead");
	nameHead.html("task");
	headerRow.append(nameHead);
	// add the spoon name headers
	let i;
	for (i = 0; i < spoonTypeList.length; i++) {
		let spoonHead = makeTableHead();
		spoonHead.addClass("spoonhead");
		spoonHead.addClass(spoonTypeList[i]);
		let spoonName;
		if (spoonTypeList[i] == "executive-function") {
			spoonName = "executive function";
		} else {
			spoonName = spoonTypeList[i];
		}
		spoonHead.html(spoonName);
		headerRow.append(spoonHead);
	}
	// append the header row to the table
	taskList.append(headerRow);
	// make the new task row
	const newTaskRow = makeTableRow();
	newTaskRow.addClass("newtask");
	// make the (empty) difficulty box
	const difficultyBox = makeTableCell();
	difficultyBox.addClass("difficulty");
	newTaskRow.append(difficultyBox);
	// make the (empty) done box
	const doneBox = makeTableCell();
	doneBox.addClass("done");
	newTaskRow.append(doneBox);
	// make the task box
	const taskNameBox = makeTableCell();
	taskNameBox.addClass("name");
	const screenReaderName = makeScreenReaderSpan("task name");
	taskNameBox.append(screenReaderName);
	const textInput = $("<input></input>", {
		type: "text"
	});
	taskNameBox.append(textInput);
	newTaskRow.append(taskNameBox);
	// make the spoon selectors
	let j;
	for (j = 0; j < spoonTypeList.length; j++) {
		let spoonBox = makeTableCell();
		spoonBox.addClass("spoon");
		spoonBox.addClass(spoonTypeList[j]);
		let spoonName;
		if (spoonTypeList[j] == "executive-function") {
			spoonName = "executive function";
		} else {
			spoonName = spoonTypeList[j];
		}
		const screenReaderSpoon = makeScreenReaderSpan(spoonName);
		spoonBox.append(screenReaderSpoon);
		let spoonSelector = selectorWithBlank(spoonList);
		spoonSelector.addClass(spoonTypeList[j]);
		spoonBox.append(spoonSelector);
		newTaskRow.append(spoonBox);
	}
	// add the Add button
	const changeTaskBox = makeTableCell();
	changeTaskBox.addClass("changetask");
	const addButton = $("<button></button>", {
		type: "button"
	});
	addButton.addClass("savenewtask");
	addButton.html("Add");
	changeTaskBox.append(addButton);
	newTaskRow.append(changeTaskBox);
	// append new task row to table
	taskList.append(newTaskRow);
	setSpoonWidths(taskList);
}

function setSpoonWidths(table) {
  const kids = $(table.children());
  const row = $(kids[0]);
  const cells = $(row.children());
  const spoons = cells.filter(".spoonhead");
  const width = spoons.outerWidth();
  spoons.outerWidth(width);
}

// -- ADDING TASKS --

// respond to a click on the "add task" button
function saveNewTaskButtonHandler(obj) {
	// grab the table, spoon list, and display mode for passing on to addTask
	const homeTable = $("#tasklist");
	const homeSpoonList = homeTable.data("spoonList");
	const displayMode = $("body").data("displayMode");
	// grab the table row containing the button that just got clicked
	const dad = $(obj).parent().parent();
	// list of the tds inside the tr
	const kids = dad.children();
	// add a new row to the table
	// set an overall difficulty for the task
	const spoon = kids.filter(".spoon");
	let spoonValList = [];
	let i;
	for (i = 0; i < spoon.length; i++) {
		let spoonForm = $(spoon[i]).children();
		let spoonVal = $(spoonForm[1]).val();
		spoonValList.push(parseSpoon(spoonVal));
	}
	const spoonTotal = sumList(spoonValList);
	const spoonCost = parseSpoonCost(spoonTotal,spoonValList);
	let spoonCostSpan;
	// add the task name
	const taskNameBox = $(kids[2]);
	const grandkids = taskNameBox.children();
	const taskNameInput = $(grandkids[1]);
	const taskName = taskNameInput.val();
	// spoon counts
	let j;
  let spoonCosts = [];
	for (j = 0; j < spoon.length; j++) {
		let newSpoonBox = makeTableCell();
		let spoonForm = $(spoon[j]).children();
		let spoonVal;
		if ($(spoonForm[1]).val() == "blank") {
			spoonVal = "none";
		} else {
			spoonVal = $(spoonForm[1]).val();
		}
    spoonCosts.push(spoonVal);
		let spoonDad = spoonForm.parent();
	}
  // clear the new task row
  clearNewTaskRow(dad);
	// put our newly generated row into the table
  // add our new task to the table
  addTask(homeTable,displayMode,spoonCost,taskName,spoonCosts,spoonTypeList,homeSpoonList);
};

// clear the new task row
function clearNewTaskRow(obj) {
  const kids = obj.children();
  const taskNameBox = $(kids[2]);
  const taskNameInput = $(taskNameBox.children()[1]);
  clearVal(taskNameInput);
  const spoon = kids.filter(".spoon");

  let i;
  for (i = 0; i < spoon.length; i++) {
    let spoonBox = $(spoon[i]);
    let spoonForm = $(spoonBox.children()[1]);
    setVal(spoonForm,"blank");
  }
}

// add a new task to the tasklist table
function addTask(table,displayMode,difficulty,name,spoonCosts,spoonTypes,spoonEmojis,complete=0) {
  // create a new row
  const newRow = makeTableRow("task");
  // overall task difficulty
  const difficultyBox = makeTableCell("difficultybox");
  const difficultyScreenReaderSpan = makeScreenReaderSpan("difficulty");
  let spoonCostSpan;
  if (displayMode == "text") {
    spoonCostSpan = makeSpan();
    setText(spoonCostSpan,difficulty);
    let difficultyBGColour = setSpoonColour(difficulty);
    difficultyBox.css("background-color", difficultyBGColour);
  } else if (displayMode == "emoji") {
    spoonCostSpan = trafficLightSpan(difficulty,spoonEmojis);
  }
  difficultyBox.append(difficultyScreenReaderSpan);
  difficultyBox.append(spoonCostSpan);
  newRow.append(difficultyBox);
  // add a checkbox so we can mark the task done
	const doneBox = makeTableCell("donebox");
	const doneScreenReaderSpan = makeScreenReaderSpan("done?");
	doneBox.append(doneScreenReaderSpan);
	const done = $("<input></input>", {
		type: "checkbox",
		on: {
			click: function() {
				doneHandler(this);
			}
		}
	});
	done.addClass("done");
  if (complete) {
    done.prop("checked", true);
  }
	doneBox.append(done);
	newRow.append(doneBox);
  // add the task name
  const nameBox = makeTableCell("tasknamebox");
  const taskNameScreenReaderSpan = makeScreenReaderSpan();
  setText(taskNameScreenReaderSpan,"task name");
  const taskNameSpan = makeSpan();
  taskNameSpan.addClass("taskname");
  setText(taskNameSpan,name);
  if (complete) {
    nameBox.addClass("completed");
  }
  nameBox.append(taskNameScreenReaderSpan);
  nameBox.append(taskNameSpan);
  newRow.append(nameBox);
  // spoon counts
  let i;
  for (i = 0; i < spoonCosts.length; i++) {
    let spoonBox = makeTableCell("spoon");
    let spoonType = spoonTypes[i];
    spoonBox.addClass(spoonType);
    let spoonScreenReaderSpan = makeScreenReaderSpan(spoonType);
    let spoonVal = spoonCosts[i];
    let spoonSpan;
    if (displayMode == "text") {
      spoonSpan = makeSpan();
      setText(spoonSpan,spoonVal)
      let spoonBGColour = setSpoonColour(spoonVal)
      spoonBox.css("background-color", spoonBGColour);
    } else if (displayMode == "emoji") {
      spoonSpan = trafficLightSpan(spoonVal,spoonEmojis);
    }
    spoonBox.append(spoonScreenReaderSpan);
    spoonBox.append(spoonSpan);
    newRow.append(spoonBox);
  }
  // add the edit button
  const editButtonBox = makeTableCell("changetask");
	const editButton = $("<input></input>", {
		type: "button",
		value: "Edit",
		on: {
			click: function() {
				editButtonHandler(this);
			}
		}
		});
	editButton.addClass("edittask");
	editButtonBox.html(editButton);
	newRow.append(editButtonBox);
  // add the delete button (or archive button for completed tasks)
  const deleteButtonBox = makeTableCell("removetask");
	const deleteButton = $("<input></input>", {
		type: "button",
		value: "Delete",
		on: {
			click: function() {
				deleteButtonHandler(this);
			}
		}
	});
  const archiveButton = $("<input></input>", {
		type: "button",
		value: "Archive",
		on: {
			click: function() {
				archiveButtonHandler(this);
			}
		}
	});
	deleteButton.addClass("deletetask");
  archiveButton.addClass("archivetask");
  if (complete) {
    deleteButtonBox.html(archiveButton);
  } else {
	  deleteButtonBox.html(deleteButton);
  }
	newRow.append(deleteButtonBox);
  // finally, stick the new row on the table
  table.append(newRow);
}

// -- EDITING TASKS --

// respond to a click on the "Edit" button
function editButtonHandler(obj) {
	const displayMode = $("body").data("displayMode");
	const dad = $(obj).parent().parent();
	const kids = dad.children();
	// change the task name field back to an input box
	const taskNameBox = $(kids[2]);
	const taskNameSpan = $(taskNameBox.children()[1]);
	const taskName = $(taskNameBox.children()[1]).html();
	const taskNameInput = $("<input></input>", {
		value: taskName
	});
	taskNameSpan.remove();
	taskNameBox.append(taskNameInput);
	// change the spoon fields back to dropdowns
	const spoon = kids.filter(".spoon");
	const blankOption = "<option value='blank'></option>"
	const noneOption = "<option value='none'>none</option>"
	const lowOption = "<option value='low'>low</option>";
	const lowOptionSelected = "<option value='low' selected='selected'>low</option>";
	const mediumOption = "<option value='medium'>medium</option>";
	const mediumOptionSelected = "<option value='medium' selected='selected'>medium</option>";
	const highOption = "<option value='high'>high</option>";
	const highOptionSelected = "<option value='high' selected='selected'>high</option>";
	const veryHighOption = "<option value='very high'>very high</option>";
	const veryHighOptionSelected = "<option value='very high' selected='selected'>very high</option>";
	let i;
	for (i = 0; i < spoon.length; i++) {
		let spoonSelector = $("<select></select>");
		let classes = spoon[i].classList;
		let spoonContent = $(spoon[i]);
		let spoonTitle;
		let spoonSpan = $(spoonContent.children()[1]);
		if (displayMode == "emoji") {
			spoonTitle = $(spoonContent.children()[1]).attr("title");
		} else if (displayMode == "text") {
			spoonTitle = $(spoonContent.children()[1]).html();
			$(spoon[i]).css("background-color","");
		}
		let j;
		spoonSelector.addClass(classes[1]);
		if (spoonTitle == "very high") {
			spoonSelector.append(blankOption, noneOption, lowOption, mediumOption, highOption, veryHighOptionSelected);
		} else if (spoonTitle == "high") {
			spoonSelector.append(blankOption, noneOption, lowOption, mediumOption, highOptionSelected, veryHighOption);
		} else if (spoonTitle == "medium") {
			spoonSelector.append(blankOption, noneOption, lowOption, mediumOptionSelected, highOption, veryHighOption);
		} else if (spoonTitle == "low") {
			spoonSelector.append(blankOption, noneOption, lowOptionSelected, mediumOption, highOption, veryHighOption);
		} else {
			spoonSelector.append(blankOption, noneOption, lowOption, mediumOption, highOption, veryHighOption);
		}
		spoonSpan.remove();
		$(spoon[i]).append(spoonSelector);
	}
	// change the edit button back to a save button with its own handler function
	const saveButton = $("<input></input>", {
		type: "button",
		value: "Save",
		on: {
			click: function() {
				saveEditedTaskButtonHandler(this);
			}
		}
	});
	saveButton.addClass("saveedited");
	const changeTask = $(kids.filter(".changetask")[0]);
	changeTask.html(saveButton);
};

// respond to the Save button
function saveEditedTaskButtonHandler(obj) {
	// code goes here
	// save the new name/spoon values in place
	// reinstate the edit button
	const displayMode = $("body").data("displayMode");
	const homeTable = $("#tasklist");
	const homeSpoonList = homeTable.data("spoonList");
	const dad = $(obj).parent().parent();
	const kids = dad.children();
	// recalculate the overall task difficulty
	const difficultyBox = $(kids.filter(".difficultybox")[0]);
  const difficultySpan = $(difficultyBox.children()[1]);
	const spoon = kids.filter(".spoon");
	let spoonValList = [];
	let i;
	for (i = 0; i < spoon.length; i++) {
		let spoonForm = $(spoon[i]).children();
		let spoonVal = $(spoonForm[1]).val();
		spoonValList.push(parseSpoon(spoonVal));
	}
	const spoonTotal = sumList(spoonValList);
	const spoonCost = parseSpoonCost(spoonTotal,spoonValList);
  let spoonCostSpan;
	if (displayMode == "emoji") {
		spoonCostSpan = trafficLightSpan(spoonCost,homeSpoonList);
	} else if (displayMode == "text") {
		const bgColour = setSpoonColour(spoonCost);
    spoonCostSpan = makeSpan();
    setText(spoonCostSpan,spoonCost)
		difficultyBox.css("background-color",bgColour);
	}
  difficultySpan.remove();
  difficultyBox.append(spoonCostSpan);
	// grab the task name and render in plain text
	const taskNameBox = $(kids.filter(".tasknamebox")[0]);
	const taskNameInput = $(taskNameBox.children()[1]);
	const taskName = taskNameInput.val();
	const taskNameSpan = makeSpan();
  setText(taskNameSpan,taskName)
	taskNameInput.remove();
	taskNameBox.append(taskNameSpan);
	// spoon counts
	let j;
	for (j = 0; j < spoon.length; j++) {
		let spoonBox = $(spoon[j]);
		let spoonForm = $(spoon[j]).children();
		let spoonVal;
		let spoonSpan = $(spoonForm[1]);
		if (spoonSpan.val() == "blank") {
			spoonVal = "none";
		} else {
			spoonVal = spoonSpan.val();
		}
		let spoonDad = spoonForm.parent();
		let newSpoonSpan;
		if (displayMode == "emoji") {
			newSpoonSpan = trafficLightSpan(spoonVal,homeSpoonList);
		} else if (displayMode == "text") {
			let spoonBGColour = setSpoonColour(spoonVal);
			newSpoonSpan = makeSpan();
      setText(newSpoonSpan,spoonVal);
			spoonBox.css("background-color",spoonBGColour);
		}
		spoonSpan.remove();
		spoonBox.append(newSpoonSpan);
	}
	// reinstate the edit button
	const editButtonBox = $(kids.filter(".changetask")[0]);
	const editButton = $("<input></input>", {
		type: "button",
		value: "Edit",
		on: {
			click: function() {
				editButtonHandler(this);
			}
		}
		});
	editButton.addClass("edittask");
	editButtonBox.html(editButton);
}

// -- REMOVING TASKS

// respond to the Delete button
function deleteButtonHandler(obj) {
	const dad = $(obj).parent().parent();
	const kids = dad.children();
	const taskNameBox = $(kids.filter(".tasknamebox")[0]);
	const taskName = $(taskNameBox.children()[1]).html();
	const confirmString = "Really delete " + taskName + "?";
	const r = confirm(confirmString);
	if (r == true) {
		dad.remove();
	}
}

// respond to the Archive button
function archiveButtonHandler(obj) {
	alert("to be done!");
}

// -- COMPLETING TASKS

// respond to a click on the checkbox for a task
function doneHandler(obj) {
	const thisBox = $(obj);
	const amIChecked = thisBox.prop("checked");
	const dad = thisBox.parent().parent();
	const kids = dad.children();
	const taskNameBox = $(kids.filter(".tasknamebox")[0]);
	const removeTaskBox = $(kids.filter(".removetask")[0]);
	if (amIChecked) { // checkbox is checked
    completeTask(dad);
	} else { // it's not
    uncompleteTask(dad);
  }
}

function completeTask(row) {
  // grab the specific parts of the row I need
  // could this be shortened and still be decently readable?
  const kids = row.children();
  const taskNameBox = $(kids.filter(".tasknamebox"));
  const removeTaskBox = $(kids.filter(".removetask"));
  // add "completed" class
  // this adds a strikethrough
  taskNameBox.addClass("completed");
  // change "delete to archive"
  const archiveButton = $("<input></input>", {
		type: "button",
		value: "Archive",
		on: {
			click: function() {
				archiveButtonHandler(this);
			}
		}
	});
	archiveButton.addClass("archivetask");
	removeTaskBox.html(archiveButton);
}

function uncompleteTask(row) {
  // grab the specific parts of the row I need
  // again - look into multiple assignment to see if I can shorten this code
  const kids = row.children();
  const taskNameBox = $(kids.filter(".tasknamebox"));
  const removeTaskBox = $(kids.filter(".removetask"));
  // remove "completed" class
  // removes the strikethrough
  taskNameBox.removeClass("completed");
  // change "archive" to "delete"
	const deleteButton = $("<input></input>", {
		type: "button",
		value: "Delete",
		on: {
			click: function() {
				deleteButtonHandler(this);
			}
		}
	});
	deleteButton.addClass("deletetask");
	removeTaskBox.html(deleteButton);
}

// -- USER SETTINGS

function changeSettingHandler(obj) {
	// grab hold of the new mode
	const newMode = $(obj).attr("id");
	// grab the setting container
	const container = $(obj).parent();
	// grab the taskhead
	const taskHead = $("#taskhead");
	// grab the ths in the taskhead
	const headers = taskHead.children();
	// grab the difficulty header
	const difficultyHeader = $(headers.filter(".difficultyhead")[0]);
	// grab the done? header
	const doneHeader = $(headers.filter(".donehead")[0]);
	// grab the spoon headers
	const spoonHeaders = headers.filter(".spoonhead");
	const tableRows = $("#tasklist").children();
	const taskRows = tableRows.filter(".task");
	if (newMode == "text") { // switch to text mode
		// change the difficulty header
		difficultyHeader.html("difficulty");
		// change the done? header
		doneHeader.html("done?");
		// loop over our spoon headers and change them
		let i;
		for (i = 0; i < spoonHeaders.length; i++) {
			let thisSpoon = spoonHeaders[i];
			let spoonType = thisSpoon.classList[2];
			if (spoonType == "executive-function") {
				spoonType = "executive function";
			}
			$(thisSpoon).html(spoonType);
		}
		// replace emojis in the task rows with text
		let j;
		for (j = 0; j < taskRows.length; j++) { // iterating over the tasks
			let row = $(taskRows[j]);
			let rowKids = row.children();
			// convert the overall difficulty to text
			let difficultyBox = $(rowKids.filter(".difficultybox")[0]);
			let difficultyScreenReaderSpan = $(difficultyBox.children()[0]);
			let difficultySpan = $(difficultyBox.children()[1]);
			let difficultyName = difficultySpan.attr("title");
			let newDifficultySpan = makeSpan();
      setText(newDifficultySpan,difficultyName);
			difficultyBox.html(difficultyScreenReaderSpan);
			difficultyBox.append(newDifficultySpan);
			let spoonColour = setSpoonColour(difficultyName);
			difficultyBox.css("background-color", spoonColour);
			// convert each invididual spoon to text
			let spoon = rowKids.filter(".spoon");
			let k;
			for (k = 0; k < spoon.length; k++) {
				let spoonBox = $(spoon[k]);
				let spoonSpan = $(spoonBox.children()[1]);
				let spoonName = spoonSpan.attr("title");
				let newSpoonSpan = makeSpan();
        setText(newSpoonSpan,spoonName);
				spoonSpan.remove();
				spoonBox.append(newSpoonSpan);
				let spoonColour = setSpoonColour(spoonName);
				spoonBox.css("background-color", spoonColour);
			}
		}
		// switch our links around
		const emojiLink = $("<a></a>", {
			href: "javascript:void(0)",
			id: "emoji",
			html: "emoji",
			on: {
				click: function() {
					changeSettingHandler(this);
				}
			}
		});
		emojiLink.addClass("setting");
		emojiLink.addClass("display-mode");
		const textSpan = makeSpan();
    setText(textSpan,"text");
		textSpan.attr("id","text");
		textSpan.addClass("setting");
		textSpan.addClass("display-mode");
		container.html(textSpan);
		container.append(" ", emojiLink);
		// change the display mode to emoji so the rest of the code behaves right
		const body = $("body");
		body.data("displayMode","text");
	} else if (newMode == "emoji") { // switch to emoji mode
		// change the difficulty header
		const difficultyScreenReaderHeadSpan = makeScreenReaderSpan();
    setText(difficultyScreenReaderHeadSpan,"difficulty");
		const difficultyHeadSpan = makeSpan();
    setText(difficultyHeadSpan,taskDifficulty);
		difficultyHeadSpan.attr("title","difficulty");
		difficultyHeader.html(difficultyScreenReaderHeadSpan);
		difficultyHeader.append(difficultyHeadSpan);
		// change the done? header
		const doneScreenReaderHeadSpan = makeScreenReaderSpan("done?");
		const doneHeadSpan = makeSpan();
    setText(doneHeadSpan);
		doneHeadSpan.attr("title","done?");
		doneHeader.html(doneScreenReaderHeadSpan);
		doneHeader.append(doneHeadSpan);
		// loop over our spoon headers and change them
		let l;
		for (l = 0; l < spoonHeaders.length; l++) {
			let thisSpoon = spoonHeaders[l];
			let spoonType = thisSpoon.classList[2];
			let spoonTypeName;
			if (spoonType == "executive-function") {
				spoonTypeName = "executive function";
			} else {
				spoonTypeName = spoonType;
			}
			const spoonHeadScreenReaderSpan = makeScreenReaderSpan(spoonTypeName);
			const spoonHeadSpan = makeSpan(spoonTypeName);
      setText(spoonHeadSpan,spoonTypeName);
			spoonHeadSpan.attr("title",spoonTypeName);
			spoonHeadSpan.html(spoonTypeListEmoji[l]);
			$(thisSpoon).html(spoonHeadScreenReaderSpan);
			$(thisSpoon).append(spoonHeadSpan);
		}
		// replace text in the task rows with emojis
		let m;
		for (m = 0; m < taskRows.length; m++) {
			let row = $(taskRows[m]);
			let rowKids = row.children();
			// put emojis in the overall difficulty
			let difficultyBox = $(rowKids.filter(".difficultybox")[0]);
			let difficultyKids = difficultyBox.children();
			let difficultyScreenReaderSpan = $(difficultyKids[0]);
			let difficultyText = $(difficultyKids[1]).html();
			let difficultySpan = makeSpan();
      setHTML(difficultySpan,trafficLightSpan(difficultyText,spoonListEmoji));
			difficultySpan.attr("title", difficultyText);
			difficultyBox.html(difficultyScreenReaderSpan);
			difficultyBox.append(difficultySpan);
			difficultyBox.css("background-color","");
			// put emojis in the spoon count rows
			let spoon = rowKids.filter(".spoon");
			let n;
			for (n = 0; n < spoon.length; n++) {
				let spoonBox = $(spoon[n]);
				let spoonSpan = $(spoonBox.children()[1]);
				let spoonName = spoonSpan.html();
				let newSpoonSpan = makeSpan(trafficLightSpan(spoonName,spoonListEmoji));
        setHTML(newSpoonSpan,trafficLightSpan(spoonName,spoonListEmoji));
				newSpoonSpan.attr("title",spoonName);
				spoonSpan.remove();
				spoonBox.append(newSpoonSpan);
				spoonBox.css("background-color","");
			}
		}
		// switch our links around
		const emojiSpan = makeSpan();
    setText(emojiSpan,"emoji");
		emojiSpan.attr("id","emoji");
		emojiSpan.addClass("setting");
		emojiSpan.addClass("display-mode");
		const textLink = $("<a></a>", {
			href: "javascript:void(0)",
			id: "text",
			html: "text",
			on: {
				click: function() {
					changeSettingHandler(this);
				}
			}
		});
		textLink.addClass("setting"),
		textLink.addClass("display-mode");
		container.html(textLink);
		container.append(" ", emojiSpan);
		// change the display mode to emoji so the rest of the code behaves right
		const body = $("body");
		body.data("displayMode","emoji");
	}
}

// -- USER DATA --

/* notes to self

I want a CSV string for each task that looks as follows:
overall difficulty: 0-4
done: 0 or 1 (for no or yes)
task name
one value of 0-4 for each spoon type
that's it

so: examples
3,0,call doctor,0,1,2,0,2,2,1,2,0,0
1,1,order meds,0,1,0,0,1,0,1,0,0,0

right, we're going to start with two buttons, one that imports data, one that exports data
*/

/*

okay how do we import data? let's first take a task and try importing it

*/

/*

okay we now have data validation. to be done:
* deal with placement of the import and export boxes better - I think I want them next to each other,
in predictable places, and with a label
* maybe add in a "You have no tasks!" if the exporter can't find any tasks to export
* grab the data from the import box
* split the data up by \n, the rest is working great
* convert the data back into information the code can use
* slightly modifidy addTask - specifically to take an optional done? value and tick the box/strike out
the task name if necessary
* run each validated task through Add task to put it on the list
* add in an error message that says X tasks cannot be validated, with a Close button

*/

function exportTasksHandler(obj) {
  const taskData = getExportData();
  exportBox(taskData);
  };

function importTasksHandler(obj) {
  importBox();
}

// make a box to grab the data
function importBox() {
  const options = $("#options-para");
  let importDiv;
  let importArea;
  const isImportDiv = $("#import-div");
  const isExportDiv = $("#export-div");
  if (isImportDiv.length === 0) {
    importDiv = buildImportBox();
    importArea = $(importDiv.children()[2]);
    options.append(importDiv);
  } else {
    importDiv = isImportDiv;
    importArea = $("#import-area");
  }
}

function exportBox(data) {
  // okay so here I wanna:
  // make a div to append to the para and see how that works out? might not need the br at all?
  const options = $("#options-para");
  let exportDiv;
  let exportArea;
  const isExportDiv = $("#export-div");
  if (isExportDiv.length === 0) {
    exportDiv = buildExportBox();
    exportArea = $(exportDiv.children()[2]);
    options.append(exportDiv);
  } else {
    exportDiv = isExportDiv;
    exportArea = $("#export-area");
  }
  exportArea.val(data);
}

function buildExportBox() {
  const exportDiv = $("<div id='export-div'></div>");
  const instructions = $("<button>Instructions</button>");
  const buttonsSpan = makeSpan();
  buttonsSpan.attr("id","export-buttons");
  instructions.data("open",0);
  instructions.click(function() {
    exportInstructionsHandler(this);
  })
  const close = $("<button>Close</button>");
  close.click(function() {
    exportCloseHandler(this);
  })
  buttonsSpan.append(instructions);
  buttonsSpan.append(close);
  const exportArea = $("<textarea rows='10' cols='100' id='export-area'></textarea");
  exportDiv.append(buttonsSpan);
  exportDiv.append("<br>");
  exportDiv.append(exportArea);
  return exportDiv;
}

function buildImportBox() {
  const importDiv = $("<div id='import-div'></div>");
  const instructions = $("<button>Instructions</button>");
  const buttonsSpan = makeSpan();
  buttonsSpan.attr("id","import-buttons");
  instructions.data("open",0);
  instructions.click(function() {
    importInstructionsHandler(this);
  })
  const close = $("<button>Close</button>");
  close.click(function() {
    importCloseHandler(this)
  });
  const submit = $("<button>Submit</button>");
  submit.click(function() {
    importSubmitHandler(this);
  })
  buttonsSpan.append(instructions);
  buttonsSpan.append(close);
  buttonsSpan.append(submit);
  const importArea = $("<textarea rows='10' cols='100' id='import-area'></textarea>");
  importDiv.append(buttonsSpan);
  importDiv.append("<br>");
  importDiv.append(importArea);
  return importDiv;
}

function exportCloseHandler(obj) {
  const exportDiv = $("#export-div");
  exportDiv.remove();
}

function importCloseHandler(obj) {
  const importDiv = $("#import-div");
  importDiv.remove();
}

function exportInstructionsHandler(obj) {
  if ($(obj).data.open) {
    const instructionsDiv = $("#export-instructions");
    instructionsDiv.remove();
    $(obj).data.open = 0;
    $(obj).text("Instructions");
  } else {
    $(obj).data.open = 1;
    $(obj).text("Close instructions");
    const buttonsSpan = $("#export-buttons");
    const instructionsDiv = makeExportInstructions();
    buttonsSpan.append(instructionsDiv);
  }
}

function importInstructionsHandler(obj) {
  if ($(obj).data.open) {
    const instructionsDiv = $("#import-instructions");
    instructionsDiv.remove();
    $(obj).data.open = 0;
    $(obj).text("Instructions");
  } else {
    $(obj).data.open = 1;
    $(obj).text("Close instructions");
    const buttonsSpan = $("#import-buttons");
    const instructionsDiv = makeImportInstructions();
    buttonsSpan.append(instructionsDiv);
  }
}

function importSubmitHandler(obj) {
  let data = getImportData();
  let dataList = importTaskList(data);
  let valid = validateTaskList(dataList);
  addImportedTaskList(valid[0]);
  // to do: pass each list in valid[0] to addTask for adding to the list
  // also: pass valid[1] to an error handler in case anything didn't make it
}

function addImportedTaskList(a) {
  for (let i = 0; i < a.length; i++) {
    addImportedTask(a[i]);
  }
}

function addImportedTask(a) {
  const homeTable = $("#tasklist");
	const homeSpoonList = homeTable.data("spoonList");
	const displayMode = $("body").data("displayMode");
  const overallSpoon = reverseSpoon(parseInt(a[0]));
  const done = parseInt(a[1]);
  const name = a[2];
  const spoonsRaw = a.slice(3,a.length);
  let spoonsProcessed = [];
  for (let i = 0; i < spoonsRaw.length; i++) {
    spoonsProcessed.push(reverseSpoon(parseInt(spoonsRaw[i])));
  }
  addTask(homeTable,displayMode,overallSpoon,name,spoonsProcessed,spoonTypeList,homeSpoonList,done)
}

function makeExportInstructions() {
  const instructionsDiv = $("<div id='export-instructions'></div>");
  const instructionsSpan = makeSpan();
  instructionsSpan.html("To export your tasks:</br>" + 
                        "1. Copy the data from the box below</br>" +
                        "2. Paste into a document or note somewhere safe</br>" +
                        "3. When you're ready to come back, click the Import button and follow the instructions");
  instructionsDiv.append(instructionsSpan);
  return instructionsDiv;
}

function makeImportInstructions() {
  const instructionsDiv = $("<div id='import-instructions'></div>");
  const instructionsSpan = makeSpan();
  instructionsSpan.html("To import your tasks:</br>" +
                       "1. Copy your task data from the safe space you saved it in</br>" +
                       "2. Paste the data into the box below</br>" +
                       "3. Press the submit button");
  instructionsDiv.append(instructionsSpan);
  return instructionsDiv;
}

function getExportData() {
	const tableRows = $("#tasklist").children();
	const taskRows = tableRows.filter(".task");
  let taskData = "";
  let rowData;
  for (let i = 0; i < taskRows.length; i++) {
    rowData = getRowData($(taskRows[i]));
    if (i == 0) {
      taskData = taskData.concat(rowData);
    } else {
      rowData = "\n".concat(rowData);
      taskData = taskData.concat(rowData);
    }
  };
  return taskData;
}

function getImportData() {
  const data = $("#import-area").val();
  return data;
}

// our input here is a task row
function getRowData(obj) {
  const displayMode = $("body").data("displayMode");
  let rowData = "";
  // grab the individual task boxes
  const rowKids = obj.children();
  // grab the overall difficulty of the task
  const difficultyBox = $(rowKids[0]);
  const difficultyKids = difficultyBox.children();
  let difficulty;
  if (displayMode == "text") {
    difficulty = $(difficultyKids[1]).text();
  }  else {
    difficulty = $(difficultyKids[1]).attr("title");
  };
  const difficultyVal = parseSpoon(difficulty);
  // is the task done?
  const doneBox = $(rowKids[1]);
  const doneCheckBox = $(doneBox.children()[1]);
  let doneBoxVal;
  if (doneCheckBox.prop("checked")) {
    doneBoxVal = 1;
  } else {
    doneBoxVal = 0;
  }
  // what's the task's name?
  const taskNameBox = $(rowKids[2]);
  const taskNameKids = taskNameBox.children();
  const taskName = $(taskNameKids[1]).text();
  // what are the individual spoon values?
  const spoon = rowKids.filter(".spoon");
  let spoonList = [];
  for (let i = 0; i < spoon.length; i++) {
    // get the spoon value
    let spoonKids = $(spoon[i]).children();
    let spoonVal;
    if (displayMode == "text") {
      spoonVal = parseSpoon($(spoonKids[1]).text());
    } else {
      spoonVal = parseSpoon($(spoonKids[1]).attr("title"));
    }
    spoonList.push(spoonVal);
  }
  rowData = difficultyVal + "," + doneBoxVal + "," + taskName;
  for (let j = 0; j < spoonList.length; j++) {
    rowData = rowData.concat(",");
    rowData = rowData.concat(spoonList[j]);
  }
  return rowData;
}

function importTaskList(s) {
  let data = s.split("\n");
  return data;
}

// our input here is a string with the task data in it
function importTask(s) {
  let data = s.split(",");
  return data;
}

// our input is an array of arrays
function validateTaskList(a) {
  let r = [];
  let failed = 0;
  for (let i = 0; i < a.length; i++) {
    let toTest = importTask(a[i]);
    let isValid = validateTask(toTest);
    if (isValid) {
      r.push(isValid);
    }
    else {
      failed++;
    }
  }
  return [r, failed];
}

function validateTask(a) {
  let v = true;
  const overallSpoon = (validateSpoon(a[0]));
  if (overallSpoon === false) {
      v = false;
  }
  if (validateDone === false) {
    v = false;
  }
  for (let i = 3; i < a.length; i++) {
    let thisSpoon = validateSpoon(a[i]);
    if (thisSpoon === false) {
      v = false;
    }
  }
  if (v) {
    return a;
  } else {
    return false;
  }
}

function validateSpoon(spoon) {
  const int = parseInt(spoon);
  if (isNaN(int)) {
    return false;
  } else if (int >= 0 && int <= 4) {
    return int;
  } else {
    return false;
  }
}

function validateDone(done) {
  const int = parseInt(done);
  if (isNaN(int)) {
    return false;
  } else if (int == 0 || int == 1) {
    return int;
  } else {
    return false;
  }
}

// -- HELPER FUNCTIONS

// set a traffic light emoji (for spoon counts in emoji mode)
function trafficLightSpan(val,l) {
	const span = makeSpan();
	if (val == "very high") {
		span.html(l[0]);
		span.attr("title","very high");
	} else if (val == "high") {
		span.html(l[1]);
		span.attr("title","high");
	} else if (val == "medium") {
		span.html(l[2]);
		span.attr("title","medium");
	} else if (val == "low") {
		span.html(l[3]);
		span.attr("title","low");
	} else {
		span.html(l[4]);
		span.attr("title","none");
	};
	return span;
};

// assign a points value based on a spoon count
function parseSpoon(val) {
	if (val == "very high") {
		return 4;
	} else if (val == "high") {
		return 3;
	} else if (val == "medium") {
		return 2;
	} else if (val == "low") {
		return 1;
	} else {
		return 0;
	}
}

function reverseSpoon(val) {
  if (val === 4) {
    return "very high";
  } else if (val === 3) {
    return "high";
  } else if (val === 2) {
    return "medium";
  } else if (val === 1) {
    return "low";
  } else {
    return "none";
  }
}

// test if a number is equal to a specified value (for difficulty setting purposes)
function isFour(val) {
	if (val == 4) {
		return true;
	}
	return false;
}

function isThree(val) {
	if (val == 3) {
		return true;
	}
	return false;
}

function isTwo(val) {
	if (val == 2) {
		return true;
	}
	return false;
}

function isOne(val) {
	if (val == 1) {
		return true;
	}
	return false;
}

// assign an overall spoon cost from a list of spoon costs
function parseSpoonCost(val,l) {
	if (l.find(isFour) || val >= 15) {
		return "very high";
	} else if (l.find(isThree) || val >= 10) {
		return "high";
	} else if (l.find(isTwo) || val >= 5) {
		return "medium";
	} else if (l.find(isOne)) {
		return "low";
	} else {
		return "none";
	}
}

// add all the values of a list
function sumList(l) {
	let i;
	let j = 0;
	for (i = 0; i < l.length; i++) {
		j += l[i];
	}
	return j;
}

// sets a background colour based on a spoon count (for text mode)
function setSpoonColour(val) {
	if (val == "very high") {
		return "mediumpurple";
	} else if (val == "high") {
		return "#ff3030";
	} else if (val == "medium") {
		return "#ffec8b";
	} else if (val == "low") {
		return "mediumspringgreen";
	} else {
		return "";
	}
}

// crates a table header
function makeTableHead() {
  const th = $("<th></th>");
  return th;
}

// creates a table row
function makeTableRow(val = "") {
	const tr = $("<tr></tr>");
  if (val) {
    tr.addClass(val);
  }
	return tr;
}

// creates a table cell
function makeTableCell(val = "") {
	const td = $("<td></td>");
  if (val) {
    td.addClass(val);
  }
	return td;
}

// creates a table
function makeTable() {
	const table = $("<table></table>");
	return table;
}

// creates a selector from a list
function selectorWithBlank(l) {
	const selector = $("<select></select>");
	const blankOption = $("<option></option>", {
		value: "blank"
	});
	selector.append(blankOption);
	let i;
	for (i = 0; i < l.length; i++) {
		let newOption = $("<option></option>", {
			text: l[i],
			value: l[i]
		});
		selector.append(newOption);
	}
	return selector;
}

// creates a span
function makeSpan() {
	const span = $("<span></span>");
	return span;
}

// creates a hidden span
function makeScreenReaderSpan() {
	const span = makeSpan();
	span.addClass("hidden");
	return span;
}

// clears the value of an html object
function clearVal(obj) {
  obj.val("");
}

// sets the value of an html object
function setVal(obj,val) {
  obj.val(val);
}

function setHTML(obj,val) {
  obj.html(val);
}

function setText(obj,val) {
  obj.text(val);
}

function makeButton(text) {
  const button = $("<button></button>");
  button.val(text);
  button.html(text);
  return button;
}

function makeLink(text,href) {
  const link = $("<a href='" + href+ "'>" + text + "</a>");
  link.text = text;
  link.href = href;
  return link;
}

// -- BASIC DATA --
const spoonList = ["none", "low", "medium", "high", "very high"];
const spoonTypeList = ["physical", "mental", "social", "travel", "executive-function", "emotional", "time", "stress",
"pain", "symptoms"];

const veryHighSpoon = String.fromCodePoint(0x26A0) + String.fromCodePoint(0xFE0F);
const highSpoon = String.fromCodePoint(0x1F534);
const medSpoon = String.fromCodePoint(0x1F7E1);
const lowSpoon = String.fromCodePoint(0x1F7E2);
const noSpoon = String.fromCodePoint(0x26AA);
const spoonListEmoji = [veryHighSpoon, highSpoon, medSpoon, lowSpoon, noSpoon];

const taskDifficulty = String.fromCodePoint(0x1F6A6);
const taskDone = String.fromCodePoint(0x2705);
const spoonPhysical = String.fromCodePoint(0x1F4AA);
const spoonMental = String.fromCodePoint(0x1F9E0);
const spoonSocial = String.fromCodePoint(0x1F44B);
const spoonTravel = String.fromCodePoint(0x1F68C);
const spoonExecutiveFunction = String.fromCodePoint(0x1F4C6);
const spoonEmotional = String.fromCodePoint(0x1F62D);
const spoonTime = String.fromCodePoint(0x1F552);
const spoonStress = String.fromCodePoint(0x1F624);
const spoonPain = String.fromCodePoint(0x1F616);
const spoonSymptoms = String.fromCodePoint(0x1F922);
const spoonTypeListEmoji = [spoonPhysical, spoonMental, spoonSocial, spoonTravel, spoonExecutiveFunction, spoonEmotional,
spoonTime, spoonStress,spoonPain,spoonSymptoms];



