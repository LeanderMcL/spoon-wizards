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

$(document).ready(
  function()
  {
	  const body = $("body");
    const taskData = initialiseTaskData();
    // add basic data to the body of the page
	  body.data( 
      { 
        "displayMode": "text",
        "tasks": taskData, 
        "taskID": 0, 
        "spoonEmoji": spoonListEmoji,
        "spoonTypes": spoonTypeList,
        "spoonDifficulties": spoonList
      }
    );
    // build the page
    buildSettings();
    buildTitle();
    buildOptions();
    buildViews();
	  buildTaskList();
    buildArchive();
	  const table = $("#tasklist");
	  $(".savenewtask").click(
      function()
      {
		  saveNewTaskButtonHandler(this);
	    }
    );
	  $("a.setting").click(
      function()
      {
		  changeSettingHandler(this);
	    }
    );
  }
);

// -- SETUP --

// builds the settings paragraph
// currently: the ability to switch between text and emoji mode
function buildSettings()
{
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
  const emojiLink = $("<a></a>",
    {
	    href: "javascript:void(0)",
	    id: "emoji",
	    html: "emoji",
    }
                     );
  emojiLink.addClass("setting");
  emojiLink.addClass("display-mode");
  container.append(textSetting);
  container.append(" ", emojiLink);
  para.append(container);
  body.append(para);
};

// builds the title of the website
function buildTitle()
{
  const body = $("body");
  const title = $("<h1></h1>");
  title.text("Spoon Wizards");
  body.append(title);
}

// builds our options
// currently: the ability to import and export tasks
function buildOptions()
{
  const body = $("body");
  const para = $("<p></p>");
  const container = makeSpan();
  const importButton = makeButton("Import");
  const exportButton = makeButton("Export");
  exportButton.click(
    function()
    {
    exportTasksHandler(this);
    }
  );
  importButton.click(
    function()
    {
      importTasksHandler(this);
    }
  );
  para.addClass("options");
  para.attr("id","options-para");
  container.addClass("options");
  container.addClass("container");
  container.attr("id","options-container");
  container.append(importButton);
  container.append(exportButton);
  // still need to make these buttons do anything at all, so I guess we'll start with the Export button
  para.append(container);
  body.append(para);
};

// builds our different views for tasks
function buildViews()
{
  const body = $("body");
  const para = $("<p></p>");
  const container = makeSpan();
  const taskSetting = makeSpan();
  para.addClass("views");
  para.attr("id", "views-para");
  container.addClass("views");
  container.addClass("views-container");
  taskSetting.addClass("view");
  taskSetting.addClass("id", "tasks");
  taskSetting.text("tasks");
  const archiveLink = $("<a></a>",
    {
      href: "javascript:void(0)",
      id: "archive",
      html: "archive"
    }
                        );
  archiveLink.addClass("view");
  archiveLink.attr("id", "archive");
  container.append(taskSetting);
  container.append(" ", archiveLink);
  para.append(container);
  body.append(para);
}

// builds the task list table
function buildTaskList()
{
	const body = $("body");
  const spoonTypes = body.data("spoonTypes");
  const spoonEmoji = body.data("spoonEmoji"); // will need this to account for emoji mode on page load
  const spoonDifficulties = body.data("spoonDifficulties");
	// create the task list
	const taskList = makeTable();
	taskList.attr("id","tasklist");
  body.append(taskList);
	// make the header row and append to the table
	const headerRow = makeTaskHeaderRow("tasklist",spoonTypes); // will probably need header emojis later
	taskList.append(headerRow);
	// make the new task row and append to the table
	const newTaskRow = makeNewTaskRow(spoonTypes,spoonDifficulties);
	taskList.append(newTaskRow);
	setSpoonWidths(taskList);
}

// builds the archive table
// this is hidden by default
function buildArchive()
{
  const body = $("body");
  const spoonTypes = body.data("spoonTypes");
  const spoonEmoji = body.data("spoonEmoji");
  const spoonDifficulties = body.data("spoonDifficulties");
  // create the archive
  const archive = makeTable();
  archive.attr("id", "archive");
  body.append(archive);
  const headerRow = makeTaskHeaderRow("archive", spoonTypes); // will probably need header emojis later
  archive.append(headerRow);
  setSpoonWidths(archive);
  archive.hide();
}

// -- ADDING TASKS --

// respond to a click on the "add task" button
function saveNewTaskButtonHandler(obj)
{
	// grab the table, spoon list, and display mode for passing on to addTask
	const homeTable = $("#tasklist");
	const homeEmojiList = $("body").data("spoonEmoji");
  const homeTypesList = $("body").data("spoonTypes");
	const displayMode = $("body").data("displayMode");
	// grab the table row containing the button that just got clicked
	const dad = getGrandparent($(obj));
  const taskData = getNewTaskData(dad); // returns a list of difficulty, done, name, and spoons list
  const taskObject = buildTaskData(taskData[0],taskData[1],taskData[2],taskData[3]);
	// list of the tds inside the tr
  // clear the new task row
  clearNewTaskRow(dad);
	// put our newly generated row into the table
  // add our new task to the table
  addTask(homeTable,displayMode,taskObject,homeTypesList,homeEmojiList);
};

// clear the new task row
function clearNewTaskRow(obj)
{
  const kids = obj.children();
  const taskNameBox = $(kids[2]);
  const taskNameInput = $(taskNameBox.children()[1]);
  clearVal(taskNameInput);
  const spoon = kids.filter(".spoon");
  for (let i = 0; i < spoon.length; i++) {
    let spoonBox = $(spoon[i]);
    let spoonForm = $(spoonBox.children()[1]);
    setVal(spoonForm,"blank");
  }
}

// add a new task to the tasklist table
function addTask(table,displayMode,task,spoonTypes,spoonEmojis)
{
  // assign the task a task ID
  const taskID = assignTaskID();
  // add the task data to the DOM
  saveTaskData(taskID,task);
  // create a new row
  const newRow = makeTableRow("task");
  // overall task difficulty
  const difficultyBox = makeTableCell("difficultybox");
  const difficultyScreenReaderSpan = makeScreenReaderSpan("difficulty");
  let spoonCostSpan;
  if (displayMode == "text")
  {
    spoonCostSpan = makeSpan();
    setText(spoonCostSpan,reverseSpoon(task.difficulty));
    let difficultyBGColour = setSpoonColour(task.difficulty);
    difficultyBox.css("background-color", difficultyBGColour);
  }
  else if (displayMode == "emoji")
  {
    spoonCostSpan = trafficLightSpan(task.difficulty,spoonEmojis);
  }
  // if neither of these ifs is true, I probably want to generate an error message and return here
  difficultyBox.append(difficultyScreenReaderSpan);
  difficultyBox.append(spoonCostSpan);
  newRow.append(difficultyBox);
  // add a checkbox so we can mark the task done
	const doneBox = makeTableCell("donebox");
	const doneScreenReaderSpan = makeScreenReaderSpan("done?");
	doneBox.append(doneScreenReaderSpan);
	const done = $
  (
    "<input></input>",
    {
		  type: "checkbox",
		  on: {
			click: function() {
				 doneHandler(this);
			}
		 }
	  }
  );
	done.addClass("done");
  if (task.done) // could probably test this once rather than twice
  {
    done.prop("checked", true);
  }
	doneBox.append(done);
	newRow.append(doneBox);
  // add the task name
  const nameBox = makeTableCell("tasknamebox");
  const taskIdSpan = makeSpan();
  taskIdSpan.addClass("taskid");
  const taskIdInput = $
  (
    "<input></input>",
    {
      type: "hidden"
    }
  );
  setVal(taskIdInput, taskID);
  taskIdSpan.append(taskIdInput);
  const taskNameScreenReaderSpan = makeScreenReaderSpan();
  setText(taskNameScreenReaderSpan,"task name");
  const taskNameSpan = makeSpan();
  taskNameSpan.addClass("taskname");
  setText(taskNameSpan,task.name);
  if (task.done)
  {
    nameBox.addClass("completed");
  }
  nameBox.append(taskIdSpan);
  nameBox.append(taskNameScreenReaderSpan);
  nameBox.append(taskNameSpan);
  newRow.append(nameBox);
  // spoon counts
  for (let i = 0; i < spoonTypes.length; i++)
  {
    let spoonBox = makeTableCell("spoon");
    let spoonType = spoonTypes[i];
    spoonBox.addClass(spoonType);
    let spoonScreenReaderSpan = makeScreenReaderSpan(spoonType);
    let spoonVal = task.spoons[spoonType];
    let spoonName = reverseSpoon(spoonVal);
    let spoonSpan;
    if (displayMode == "text")
    {
      spoonSpan = makeSpan();
      setText(spoonSpan,spoonName);
      let spoonBGColour = setSpoonColour(spoonVal);
      spoonBox.css("background-color", spoonBGColour);
    }
    else if (displayMode == "emoji")
    {
      spoonSpan = trafficLightSpan(spoonVal,spoonEmojis);
    }
    spoonBox.append(spoonScreenReaderSpan);
    spoonBox.append(spoonSpan);
    newRow.append(spoonBox);
  }
  // add the edit button
  const editButtonBox = makeTableCell("changetask");
	const editButton = $
  (
    "<input></input>",
    {
		  type: "button",
		  value: "Edit",
		  on:
      {
			  click: function()
        {
				  editButtonHandler(this);
			  }
		  }
		}
  );
	editButton.addClass("edittask");
	editButtonBox.html(editButton);
	newRow.append(editButtonBox);
  // add the delete button (or archive button for completed tasks)
  const deleteButtonBox = makeTableCell("removetask");
	const deleteButton = $(
    "<input></input>", 
    {
		  type: "button",
		  value: "Delete",
		  on:
      {
			  click: function()
        {
				  deleteButtonHandler(this);
			  }
		  }
	  }
  );
  deleteButton.addClass("deletetask");
  setHTML(deleteButtonBox,deleteButton);
  const archiveButtonBox = makeTableCell("archivetask");
  const archiveButton = $("<input></input>",
    {
		  type: "button",
		  value: "Archive",
		  on:
      {
			  click: function()
        {
				  archiveButtonHandler(this);
			  }
		  }
	  }
  );
  archiveButton.addClass("archivetask");
  setHTML(archiveButtonBox,archiveButton);
	newRow.append(deleteButtonBox);
  newRow.append(archiveButtonBox);
  // finally, stick the new row on the table
  const firstTask = tasksExist();
  if (firstTask)
  {
    firstTask.before(newRow);
  }
  else
  {
    table.append(newRow);
  }
}

// -- EDITING TASKS --

// respond to a click on the "Edit" button
function editButtonHandler(obj)
{
	const displayMode = $("body").data("displayMode");
	const dad = getGrandparent($(obj));
	const kids = dad.children();
	// change the task name field back to an input box
	const taskNameBox = $(kids[2]);
	const taskNameSpan = $(taskNameBox.children()[2]);
	const taskName = $(taskNameBox.children()[2]).html();
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
	for (let i = 0; i < spoon.length; i++)
  {
		let spoonSelector = $("<select></select>");
		let classes = spoon[i].classList;
		let spoonContent = $(spoon[i]);
		let spoonTitle;
		let spoonSpan = $(spoonContent.children()[1]);
		if (displayMode == "emoji")
    {
			spoonTitle = $(spoonContent.children()[1]).attr("title");
		}
    else if (displayMode == "text")
    {
			spoonTitle = $(spoonContent.children()[1]).html();
			$(spoon[i]).css("background-color","");
		}
		let j;
		spoonSelector.addClass(classes[1]);
		if (spoonTitle == "very high")
    {
			spoonSelector.append(blankOption, noneOption, lowOption, mediumOption, highOption, veryHighOptionSelected);
		} else if (spoonTitle == "high")
    {
			spoonSelector.append(blankOption, noneOption, lowOption, mediumOption, highOptionSelected, veryHighOption);
		} else if (spoonTitle == "medium")
    {
			spoonSelector.append(blankOption, noneOption, lowOption, mediumOptionSelected, highOption, veryHighOption);
		} else if (spoonTitle == "low")
    {
			spoonSelector.append(blankOption, noneOption, lowOptionSelected, mediumOption, highOption, veryHighOption);
		} else
    {
			spoonSelector.append(blankOption, noneOption, lowOption, mediumOption, highOption, veryHighOption);
		}
		spoonSpan.remove();
		$(spoon[i]).append(spoonSelector);
	}
	// change the edit button back to a save button with its own handler function
	const saveButton = $
  (
    "<input></input>",
    {
		  type: "button",
		  value: "Save",
		  on:
      {
			  click: function()
        {
				  saveEditedTaskButtonHandler(this);
			  }
		  }
	  }
  );
	saveButton.addClass("saveedited");
	const changeTask = $(kids.filter(".changetask")[0]);
	changeTask.html(saveButton);
}

// respond to the Save button
function saveEditedTaskButtonHandler(obj)
{
	// code goes here
	// save the new name/spoon values in place
	// reinstate the edit button
	const displayMode = $("body").data("displayMode");
	const homeTable = $("#tasklist");
	const homeSpoonList = $("body").data("spoonTypes");
  const homeSpoonEmoji = $("body").data("spoonEmoji");
	const dad = getGrandparent($(obj));
	const kids = dad.children();
  const taskData = getNewTaskData(dad);
  const taskID = getSavedTaskID(dad);
  const taskObject = buildTaskData(taskData[0],taskData[1],taskData[2],taskData[3]);
  updateTask(dad,displayMode,taskID,taskObject,homeSpoonList,homeSpoonEmoji);
}

// updates an edited task
// TBD: update the edited tasks in the DOM, reliant on bug #37
function updateTask(row,displayMode,taskID,task,spoonTypes,spoonEmojis)
{
  // update the task data in the DOM
  saveTaskData(taskID,task);
  const kids = row.children();
  // update the overall difficulty
  const difficultyBox = $(kids.filter(".difficultybox")[0]);
  const difficultySpan = $(difficultyBox.children()[1]);
  let spoonCostSpan;
  const spoonCost = task.difficulty;
  const spoonName = reverseSpoon(spoonCost);
  if (displayMode == "emoji")
  {
		spoonCostSpan = trafficLightSpan(spoonCost,spoonEmojis);
	}
  else if (displayMode == "text")
  {
		const bgColour = setSpoonColour(spoonCost);
    spoonCostSpan = makeSpan();
    setText(spoonCostSpan,spoonName)
		difficultyBox.css("background-color",bgColour);
	}
  difficultySpan.remove();
  difficultyBox.append(spoonCostSpan);
  // update the task name
  const taskNameBox = $(kids.filter(".tasknamebox")[0]);
	const taskNameInput = $(taskNameBox.children()[2]);
	const taskName = task.name;
	const taskNameSpan = makeSpan();
  setText(taskNameSpan,taskName)
	taskNameInput.remove();
	taskNameBox.append(taskNameSpan);
  // update spoon counts
  const spoon = kids.filter(".spoon");
  const taskSpoons = task.spoons;
  for (let i = 0; i < spoonTypes.length; i++)
  {
    let spoonBox = $(spoon.filter("." + spoonTypes[i])[0]);
    let spoonForm = spoonBox.children();
    let spoonSpan = $(spoonForm[1]);
    let newSpoonSpan;
    let spoonVal = taskSpoons[spoonTypes[i]];
    let spoonValName = reverseSpoon(spoonVal);
    // TBD here: convert the numbers to their appropriate values when in the code below
    if (displayMode == "emoji")
    {
			newSpoonSpan = trafficLightSpan(spoonVal,spoonEmojis);
		}
    else if (displayMode == "text")
    {
			let spoonBGColour = setSpoonColour(spoonVal);
			newSpoonSpan = makeSpan();
      setText(newSpoonSpan,spoonValName);
			spoonBox.css("background-color",spoonBGColour);
		}
    spoonSpan.remove();
    spoonBox.append(newSpoonSpan);
  }
  // reinstate the edit button
  const editButtonBox = $(kids.filter(".changetask")[0]);
	const editButton = $
  (
    "<input></input>",
    {
		  type: "button",
		  value: "Edit",
		  on: 
      {
			  click: function()
        {
				  editButtonHandler(this);
			  }
		  }
		}
  );
	editButton.addClass("edittask");
	editButtonBox.html(editButton);
  logTaskData();
}

// -- REMOVING TASKS

// respond to the Delete button
function deleteButtonHandler(obj)
{
	const dad = getGrandparent($(obj));
	const kids = dad.children();
	const taskNameBox = $(kids.filter(".tasknamebox")[0]);
	const taskName = $(taskNameBox.children()[2]).html();
	const confirmString = "Really delete " + taskName + "?";
	const r = confirm(confirmString);
	if (r == true)
  {
		dad.remove();
	}
}

// respond to the Archive button
function archiveButtonHandler(obj)
{
  // grab spoon data
  // note: this is all super messy, because I have backend stuff to fix
  const row = getGrandparent($(obj));
  const rowData = getRowData(row);
  const dataList = importTask(rowData)
  const spoonTypes = $("body").data("spoonTypes");
  const spoonData = buildSpoonList(spoonTypes,dataList.slice(3));
  const taskObj = buildTaskData(dataList[0],dataList[1],dataList[2],spoonData);
  const taskID = getSavedTaskID(row);
  // remove the task from the active tasks in the DOM
  removeTaskData("tasklist", taskID);
  // save the task into the archive
  saveArchiveData(taskID, taskObj);
  // get rid of the task row
  row.remove();
}

// -- COMPLETING TASKS

// respond to a click on the checkbox for a task
function doneHandler(obj)
{
	const thisBox = $(obj);
	const amIChecked = thisBox.prop("checked");
	const dad = getGrandparent(thisBox);
	const kids = dad.children();
	const taskNameBox = $(kids.filter(".tasknamebox")[0]);
	const removeTaskBox = $(kids.filter(".removetask")[0]);
	if (amIChecked) // checkbox is checked
  { 
    completeTask(dad);
	}
  else // it's not
  { 
    uncompleteTask(dad);
  }
}

// marks a task as completed
function completeTask(row)
{
  // grab the specific parts of the row I need
  // could this be shortened and still be decently readable?
  const kids = row.children();
  const taskNameBox = $(kids.filter(".tasknamebox"));
  // add "completed" class
  // this adds a strikethrough
  taskNameBox.addClass("completed");
}

// marks a task as not completed
function uncompleteTask(row)
{
  // grab the specific parts of the row I need
  // again - look into multiple assignment to see if I can shorten this code
  const kids = row.children();
  const taskNameBox = $(kids.filter(".tasknamebox"));
  // remove "completed" class
  // removes the strikethrough
  taskNameBox.removeClass("completed");
}

// -- USER SETTINGS

// switches between text and emoji mode
function changeSettingHandler(obj)
{
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
	if (newMode == "text")
  { // switch to text mode
		// change the difficulty header
		difficultyHeader.html("difficulty");
		// change the done? header
		doneHeader.html("done?");
		// loop over our spoon headers and change them
		for (let i = 0; i < spoonHeaders.length; i++)
    {
			let thisSpoon = spoonHeaders[i];
			let spoonType = thisSpoon.classList[1];
			if (spoonType == "executive-function") {
				spoonType = "executive function";
			}
			$(thisSpoon).html(spoonType);
		}
		// replace emojis in the task rows with text
		for (let j = 0; j < taskRows.length; j++)
    { // iterating over the tasks
			let row = $(taskRows[j]);
			let rowKids = row.children();
			// convert the overall difficulty to text
			let difficultyBox = $(rowKids.filter(".difficultybox")[0]);
			let difficultyScreenReaderSpan = $(difficultyBox.children()[0]);
			let difficultySpan = $(difficultyBox.children()[1]);
			let difficultyName = difficultySpan.attr("title");
      let difficultyVal = parseSpoon(difficultyName);
			let newDifficultySpan = makeSpan();
      setText(newDifficultySpan,difficultyName);
			difficultyBox.html(difficultyScreenReaderSpan);
			difficultyBox.append(newDifficultySpan);
			let spoonColour = setSpoonColour(difficultyVal);
			difficultyBox.css("background-color", spoonColour);
			// convert each invididual spoon to text
			let spoon = rowKids.filter(".spoon");
			for (let k = 0; k < spoon.length; k++)
      {
				let spoonBox = $(spoon[k]);
				let spoonSpan = $(spoonBox.children()[1]);
				let spoonName = spoonSpan.attr("title");
        let spoonVal = parseSpoon(spoonName);
				let newSpoonSpan = makeSpan();
        setText(newSpoonSpan,spoonName);
				spoonSpan.remove();
				spoonBox.append(newSpoonSpan);
				let spoonColour = setSpoonColour(spoonVal);
				spoonBox.css("background-color", spoonColour);
			}
		}
		// switch our links around
		const emojiLink = $
    (
      "<a></a>",
      {
			  href: "javascript:void(0)",
			  id: "emoji",
			  html: "emoji",
			  on:
        {
				  click: function()
          {
					  changeSettingHandler(this);
				  }
			  }
		  }
    );
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
	}
  else if (newMode == "emoji") // switch to emoji mode
  { 
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
    setText(doneHeadSpan,taskDone);
		doneHeadSpan.attr("title","done?");
		doneHeader.html(doneScreenReaderHeadSpan);
		doneHeader.append(doneHeadSpan);
		// loop over our spoon headers and change them
		for (let l = 0; l < spoonHeaders.length; l++)
    {
			let thisSpoon = spoonHeaders[l];
			let spoonType = thisSpoon.classList[2];
			let spoonTypeName;
			if (spoonType == "executive-function")
      {
				spoonTypeName = "executive function";
			}
      else {
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
		for (let m = 0; m < taskRows.length; m++)
    {
			let row = $(taskRows[m]);
			let rowKids = row.children();
			// put emojis in the overall difficulty
			let difficultyBox = $(rowKids.filter(".difficultybox")[0]);
			let difficultyKids = difficultyBox.children();
			let difficultyScreenReaderSpan = $(difficultyKids[0]);
			let difficultyText = $(difficultyKids[1]).html();
      let difficulty = parseSpoon(difficultyText);
			let difficultySpan = makeSpan();
      setHTML(difficultySpan,trafficLightSpan(difficulty,spoonListEmoji));
			difficultySpan.attr("title", difficultyText);
			difficultyBox.html(difficultyScreenReaderSpan);
			difficultyBox.append(difficultySpan);
			difficultyBox.css("background-color","");
			// put emojis in the spoon count rows
			let spoon = rowKids.filter(".spoon");
			for (let n = 0; n < spoon.length; n++)
      {
				let spoonBox = $(spoon[n]);
				let spoonSpan = $(spoonBox.children()[1]);
				let spoonName = spoonSpan.html();
        let spoonCost = parseSpoon(spoonName);
				let newSpoonSpan = makeSpan();
        setHTML(newSpoonSpan,trafficLightSpan(spoonCost,spoonListEmoji));
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
		const textLink = $
    (
      "<a></a>",
      {
			  href: "javascript:void(0)",
			  id: "text",
			  html: "text",
			  on:
        {
				  click: function()
          {
					  changeSettingHandler(this);
				  }
			  }
		  }
    );
		textLink.addClass("setting"),
		textLink.addClass("display-mode");
		container.html(textLink);
		container.append(" ", emojiSpan);
		// change the display mode to emoji so the rest of the code behaves right
		const body = $("body");
		body.data("displayMode","emoji");
	}
}

// -- IMPORTING AND EXPORTING TASKS

/*
* maybe add in a "You have no tasks!" if the exporter can't find any tasks to export
* add in an error message that says X tasks cannot be validated, with a Close button

*/

// respond to the Export button
function exportTasksHandler(obj)
{
  const taskData = getExportData();
  const para = $("#options-para");
  if (taskData)
  {
    exportBox(taskData);
  }
  else
  {
    error("You have no tasks!",para);
  }
}

// respond to the Import button
function importTasksHandler(obj) {
  importBox();
}

// make a box to grab import data
function importBox()
{
  const options = $("#options-para");
  let importDiv;
  let importArea;
  const isImportDiv = $("#import-div");
  const isExportDiv = $("#export-div");
  if (isImportDiv.length === 0)
  { // there's no import div
    importDiv = buildImportBox();
    importArea = $(importDiv.children()[2]);
    options.append(importDiv);
  }
  else
  {
    importDiv = isImportDiv;
    importArea = $("#import-area");
  }
}

// make a box to contain the export data
function exportBox(data)
{
  // okay so here I wanna:
  // make a div to append to the para and see how that works out? might not need the br at all?
  const options = $("#options-para");
  let exportDiv;
  let exportArea;
  const isExportDiv = $("#export-div");
  if (isExportDiv.length === 0)
  { // there's no export div
    exportDiv = buildExportBox();
    exportArea = $(exportDiv.children()[2]);
    options.append(exportDiv);
  }
  else
  {
    exportDiv = isExportDiv;
    exportArea = $("#export-area");
  }
  exportArea.val(data);
}

// build the export box
function buildExportBox()
{
  const exportDiv = $("<div id='export-div'></div>");
  const instructions = $("<button>Instructions</button>");
  const buttonsSpan = makeSpan();
  buttonsSpan.attr("id","export-buttons");
  instructions.data("open",0);
  instructions.click(
    function() {
      exportInstructionsHandler(this);
    }
  )
  const close = $("<button>Close</button>");
  close.click(
    function()
    {
      exportCloseHandler(this);
    }
  )
  buttonsSpan.append(instructions);
  buttonsSpan.append(close);
  const exportArea = $("<textarea rows='10' cols='100' id='export-area'></textarea");
  exportDiv.append(buttonsSpan);
  exportDiv.append("<br>");
  exportDiv.append(exportArea);
  return exportDiv;
}

// build the import box
function buildImportBox()
{
  const importDiv = $("<div id='import-div'></div>");
  const instructions = $("<button>Instructions</button>");
  const buttonsSpan = makeSpan();
  buttonsSpan.attr("id","import-buttons");
  instructions.data("open",0);
  instructions.click
  (
    function()
    {
      importInstructionsHandler(this);
    }
  )
  const close = $("<button>Close</button>");
  close.click
  (
    function()
    {
      importCloseHandler(this)
    }
  );
  const submit = $("<button>Submit</button>");
  submit.click
  (
    function()
    {
      importSubmitHandler(this);
    }
  )
  buttonsSpan.append(instructions);
  buttonsSpan.append(close);
  buttonsSpan.append(submit);
  const importArea = $("<textarea rows='10' cols='100' id='import-area'></textarea>");
  importDiv.append(buttonsSpan);
  importDiv.append("<br>");
  importDiv.append(importArea);
  return importDiv;
}

// closes the export box
function exportCloseHandler(obj)
{
  const exportDiv = $("#export-div");
  exportDiv.remove();
}

// closes the import box
function importCloseHandler(obj)
{
  const importDiv = $("#import-div");
  importDiv.remove();
}

// shows and hides instructions for exporting data
function exportInstructionsHandler(obj)
{
  if ($(obj).data.open)
  {
    const instructionsDiv = $("#export-instructions");
    instructionsDiv.remove();
    $(obj).data.open = 0;
    $(obj).text("Instructions");
  }
  else
  {
    $(obj).data.open = 1;
    $(obj).text("Close instructions");
    const buttonsSpan = $("#export-buttons");
    const instructionsDiv = makeExportInstructions();
    buttonsSpan.append(instructionsDiv);
  }
}

// shows and hides instructions for exporting data
function importInstructionsHandler(obj)
{
  if ($(obj).data.open)
  {
    const instructionsDiv = $("#import-instructions");
    instructionsDiv.remove();
    $(obj).data.open = 0;
    $(obj).text("Instructions");
  }
  else
  {
    $(obj).data.open = 1;
    $(obj).text("Close instructions");
    const buttonsSpan = $("#import-buttons");
    const instructionsDiv = makeImportInstructions();
    buttonsSpan.append(instructionsDiv);
  }
}

// handles submitting tasks to be imported
function importSubmitHandler(obj)
{
  const data = getImportData();
  const importDiv = $("#import-div");
  if (data)
  {
    const dataList = importTaskList(data);
    const valid = validateTaskList(dataList);
    const importArea = $("#import-area");
    addImportedTaskList(valid[0]);
    if (valid[1].length > 0)
    {
      const errorString = buildImportErrorString(valid[1].length);
      error(errorString,importDiv);
      importArea.val(buildErrorImportVal(valid[1]));
    }
    else
    {
      importDiv.remove();
      if ($("#error").length != 0)
      {
        $("#error").remove();
      }
    }
  }
  else
  {
    error("You haven't added any tasks!",importDiv);
  }
}

// adds a list of tasks to the task list
// tasks should be pre-validated
function addImportedTaskList(a)
{
  for (let i = a.length - 1; i >= 0; i--) // iterate backwards over the list so we don't keep reversing it
  {
    addImportedTask(a[i]);
  }
}

// adds a task to the task list
// task should be pre-validated
function addImportedTask(a)
{
  const homeTable = $("#tasklist");
  const homeSpoonTypes = $("body").data("spoonTypes");
	const homeSpoonEmoji = $("body").data("spoonEmoji");
	const displayMode = $("body").data("displayMode");
  const overallSpoon = parseInt(a[0]);
  const done = parseInt(a[1]);
  const name = a[2];
  const spoonsRaw = a.slice(3,a.length);
  let spoonsProcessed = [];
  for (let i = 0; i < spoonsRaw.length; i++)
  {
    spoonsProcessed.push([homeSpoonTypes[i], reverseSpoon(parseInt(spoonsRaw[i]))]);
  }
  const taskObject = buildTaskData(overallSpoon, done, name, spoonsProcessed);
  addTask(homeTable,displayMode,taskObject,homeSpoonTypes,homeSpoonEmoji)
}

// creates the instructions for exporting
function makeExportInstructions()
{
  const instructionsDiv = $("<div id='export-instructions'></div>");
  const instructionsSpan = makeSpan();
  instructionsSpan.html
  (
    "To export your tasks:</br>" + 
    "1. Copy the data from the box below</br>" +
    "2. Paste into a document or note somewhere safe</br>" +
    "3. When you're ready to come back, click the Import button and follow the instructions");
  instructionsDiv.append(instructionsSpan);
  return instructionsDiv;
}

// creates the instructions for importing
function makeImportInstructions()
{
  const instructionsDiv = $("<div id='import-instructions'></div>");
  const instructionsSpan = makeSpan();
  instructionsSpan.html("To import your tasks:</br>" +
                       "1. Copy your task data from the safe space you saved it in</br>" +
                       "2. Paste the data into the box below</br>" +
                       "3. Press the submit button");
  instructionsDiv.append(instructionsSpan);
  return instructionsDiv;
}

// -- USER DATA --

// create the basic object structure for task data
function initialiseTaskData()
{
  const taskData = { active: { }, archive: { } };
  return taskData;
}

// builds data for a specific task
function buildTaskData(difficulty, done, name, spoons)
{
  console.log(spoons);
  const taskData = { };
  taskData.name = name;
  taskData.difficulty = difficulty;
  taskData.done = done;
  taskData.spoons = buildSpoonData(spoons);
  return taskData;
}

// builds object data for the spoon counts from a list of two-item lists
function buildSpoonData(a)
{
  let spoonData = { };
  for (let i = 0; i < a.length; i++)
    {
      let spoonType = a[i][0];
      let spoonVal = a[i][1];
      spoonData[spoonType] = parseSpoon(spoonVal);
    }
  return spoonData;
}

// saves task data to the DOM by its ID
function saveTaskData(id,obj)
{
  const data = $("body").data();
  const activeTasks = data.tasks.active;
  activeTasks[id] = obj;
}

function saveArchiveData(id,obj)
{
  const data = $("body").data();
  const archive = data.tasks.archive;
  archive[id] = obj;
}

// assign an ID number
function assignTaskID() {
  const data = $("body").data();
  const taskID = data.taskID + 1;
  data.taskID++;
  return taskID;
}

// grabs task data from an open row (either a new task or while being edited)
function getNewTaskData(row)
{
  const kids = row.children();
  // set an overall difficulty for the task
	const spoon = kids.filter(".spoon");
	let spoonValList = [];
	for (let i = 0; i < spoon.length; i++) {
		let spoonForm = $(spoon[i]).children();
		let spoonVal = $(spoonForm[1]).val();
		spoonValList.push(parseSpoon(spoonVal));
	}
	const spoonTotal = sumList(spoonValList);
	const spoonCost = parseSpoon((parseSpoonCost(spoonTotal,spoonValList)));
	let spoonCostSpan;
	// if this is an edited task, check if the task is completed
  const doneBox = $(kids[1]);
  let done;
  if ($(doneBox).children().length != 0) { // we're editing a row, and there's a checkbox to test
    let doneCheck = $($(doneBox).children()[1]).prop("checked");
    if (doneCheck)
    {
      done = 1;
    }
    else {
      done = 0;
    }
  }
  else {
    done = 0;
  }
  // add the task name
	const taskNameBox = $(kids[2]);
	const grandkids = taskNameBox.children();
  let taskNameInput;
  if (grandkids.length == 2)
  {
    taskNameInput = $(grandkids[1]);
  }
  else
  {
    taskNameInput = $(grandkids[2]);
  }
	const taskName = taskNameInput.val();
	// spoon counts
  let spoonCosts = [];
	for (let j = 0; j < spoon.length; j++)
  {
		let newSpoonBox = makeTableCell();
		let spoonForm = $(spoon[j]).children();
    let spoonType = $(spoonForm[1]).attr("class");
		let spoonVal;
		if ($(spoonForm[1]).val() == "blank")
    {
			spoonVal = "none";
		}
    else
    {
			spoonVal = $(spoonForm[1]).val();
		}
    spoonCosts.push([spoonType, spoonVal]);
		let spoonDad = spoonForm.parent();
	}
  return [spoonCost,done,taskName,spoonCosts];
}

// gets task data from the tasklist
function getExportData()
{
	const tableRows = $("#tasklist").children();
	const taskRows = tableRows.filter(".task");
  let taskData = "";
  let rowData;
  for (let i = 0; i < taskRows.length; i++)
  {
    rowData = getRowData($(taskRows[i]));
    if (i == 0)
    {
      taskData = taskData.concat(rowData);
    } else
    {
      rowData = "\n".concat(rowData);
      taskData = taskData.concat(rowData);
    }
  };
  return taskData;
}

function getImportData()
{
  const data = $("#import-area").val();
  return data;
}

// our input here is a closed task row
function getRowData(obj)
{
  const displayMode = $("body").data("displayMode");
  let rowData = "";
  // grab the individual task boxes
  const rowKids = obj.children();
  // grab the overall difficulty of the task
  const difficultyBox = $(rowKids[0]);
  const difficultyKids = difficultyBox.children();
  let difficulty;
  if (displayMode == "text")
  {
    difficulty = $(difficultyKids[1]).text();
  }
  else
  {
    difficulty = $(difficultyKids[1]).attr("title");
  };
  const difficultyVal = parseSpoon(difficulty);
  // is the task done?
  const doneBox = $(rowKids[1]);
  const doneCheckBox = $(doneBox.children()[1]);
  let doneBoxVal;
  if (doneCheckBox.prop("checked"))
  {
    doneBoxVal = 1;
  }
  else
  {
    doneBoxVal = 0;
  }
  // what's the task's name?
  const taskNameBox = $(rowKids[2]);
  const taskNameKids = taskNameBox.children();
  const taskName = $(taskNameKids[2]).text();
  // what are the individual spoon values?
  const spoon = rowKids.filter(".spoon");
  let spoonList = [];
  for (let i = 0; i < spoon.length; i++)
  {
    // get the spoon value
    let spoonKids = $(spoon[i]).children();
    let spoonVal;
    if (displayMode == "text")
    {
      spoonVal = parseSpoon($(spoonKids[1]).text());
    }
    else
    {
      spoonVal = parseSpoon($(spoonKids[1]).attr("title"));
    }
    spoonList.push(spoonVal);
  }
  rowData = difficultyVal + "," + doneBoxVal + "," + taskName;
  for (let j = 0; j < spoonList.length; j++)
  {
    rowData = rowData.concat(",");
    rowData = rowData.concat(spoonList[j]);
  }
  return rowData;
}

// splits the string grabbed from the Import div into individual lines
function importTaskList(s) {
  let data = s.split("\n");
  return data;
}

// our input here is a string with the task data in it - returns a list of task data
function importTask(s)
{
  let data = s.split(",");
  return data;
}

// our input is an array of arrays
function validateTaskList(a)
{
  let r = [];
  let failed = []
  for (let i = 0; i < a.length; i++)
  {
    let toTest = importTask(a[i]);
    let isValid = validateTask(toTest);
    if (isValid[1]) {
      r.push(isValid[0]);
    }
    else
    {
      failed.push(isValid[0]);
    }
  }
  return [r, failed];
}

// validates an individual task
function validateTask(a)
{
  let v = true;
  const overallSpoon = (validateSpoon(a[0]));
  if (overallSpoon === false)
  {
      v = false;
  }
  if (validateDone === false)
  {
    v = false;
  }
  for (let i = 3; i < a.length; i++)
  {
    let thisSpoon = validateSpoon(a[i]);
    if (thisSpoon === false)
    {
      v = false;
    }
  }
  if (v) {
    return [a, true];
  } else {
    return [a, false];
  }
}

// validates a spoon value, which should be a digit between 0 and 4
function validateSpoon(spoon)
{
  const int = parseInt(spoon);
  if (isNaN(int))
  {
    return false;
  }
  else if (int >= 0 && int <= 4)
  {
    return int;
  }
  else
  {
    return false;
  }
}

// validates a done value, which should be 0 or 1
function validateDone(done)
{
  const int = parseInt(done);
  if (isNaN(int))
  {
    return false;
  }
  else if (int == 0 || int == 1)
  {
    return int;
  }
  else
  {
    return false;
  }
}

// update the tasklist or archive table with data from the DOM
function updateTable(s)
{
  // stuff
}

// -- ERROR HANDLING

// creates an error message with an OK button to remove it
function error(s, obj)
{
  if ($("#error").length == 0) {
    const div = $("<div></div>");
    div.addClass("error");
    div.attr("id","error");
    let errorTextSpan = makeSpan();
    errorTextSpan.attr("id", "error-text");
    setHTML(errorTextSpan,s);
    const button = makeButton("OK");
    button.click(function() {
      errorOkHandler(this);
    });
    div.append(errorTextSpan);
    div.append(" ");
    div.append(button);
    obj.append(div);
  }
  else
  {
    let errorTextSpan = $("#error-text");
    setHTML(errorTextSpan,s);
  }
}

// removes an error message when you click OK
function errorOkHandler(obj)
{
  const div = $(obj).parent();
  div.remove();
}

function buildImportErrorString(x)
{
  let s;
  let task = x > 1? x.toString() + " tasks" : "task";
  s = "The " + task + " above could not be imported.";
  return s;
}

// builds the error string for when you try to import invalid tasks
function buildErrorImportVal(l)
{
  let s = "";
  for (let i = 0; i < l.length; i++)
  {
    let stringPart = "";
    for (let j = 0; j < l[i].length; j++)
    {
      if (j > 0)
      {
        stringPart += ",";
      }
      stringPart += l[i][j];
    }
    if (i > 0)
    {
      s += "\n";
    }
    s += stringPart;
  }
  return s;
}

// -- SPOON PARSING

// set a traffic light emoji (for spoon counts in emoji mode)
function trafficLightSpan(val, l)
{
	const span = makeSpan();
	if (val == 4)
  {
		span.html(l[0]);
		span.attr("title","very high");
	}
  else if (val == 3)
  {
		span.html(l[1]);
		span.attr("title","high");
	}
  else if (val == 2)
  {
		span.html(l[2]);
		span.attr("title","medium");
	}
  else if (val == 1)
  {
		span.html(l[3]);
		span.attr("title","low");
	}
  else
  {
		span.html(l[4]);
		span.attr("title","none");
	};
	return span;
};

// assign a points value based on a spoon count
function parseSpoon(val)
{
	if (val == "very high")
  {
		return 4;
	}
  else if (val == "high")
  {
		return 3;
	}
  else if (val == "medium")
  {
		return 2;
	}
  else if (val == "low")
  {
		return 1;
	}
  else
  {
		return 0;
	}
}

// takes a numeric input and returns the text value of its difficulty
function reverseSpoon(val)
{
  if (val === 4)
  {
    return "very high";
  }
  else if (val === 3)
  {
    return "high";
  }
  else if (val === 2)
  {
    return "medium";
  }
  else if (val === 1)
  {
    return "low";
  }
  else {
    return "none";
  }
}

// test if a number is equal to a specified value (for difficulty setting purposes)
function isFour(val)
{
	if (val == 4)
  {
		return true;
	}
	return false;
}

function isThree(val)
{
	if (val == 3)
  {
		return true;
	}
	return false;
}

function isTwo(val)
{
	if (val == 2)
  {
		return true;
	}
	return false;
}

function isOne(val)
{
	if (val == 1)
  {
		return true;
	}
	return false;
}

// assign an overall spoon cost from a list of spoon costs
function parseSpoonCost(val, l) 
{
	if (l.find(isFour) || val >= 15)
  {
		return "very high";
	}
  else if (l.find(isThree) || val >= 10)
  {
		return "high";
	}
  else if (l.find(isTwo) || val >= 5)
  {
		return "medium";
	}
  else if (l.find(isOne)) {
		return "low";
	}
  else {
		return "none";
	}
}

// add all the values of a list
function sumList(l) {
	let sum = 0;
	for (let i = 0; i < l.length; i++)
  {
		sum += l[i];
	}
	return sum;
}

// sets a background colour based on a spoon count (for text mode)
function setSpoonColour(val)
{
	if (val == 4)
  {
		return "mediumpurple";
	}
  else if (val == 3)
  {
		return "#ff3030";
	}
  else if (val == 2)
  {
		return "#ffec8b";
	}
  else if (val == 1)
  {
		return "mediumspringgreen";
	}
  else
  {
		return "";
	}
}

// returns the right version of executive function for display
function parseSpoonName(s)
{
  let parsed;
  if (s === "executive-function")
  {
    parsed = "executive function";
  } else {
    parsed = s;
  }
  return parsed;
}

// this takes some types and values and returns a spoon list for using elsewhere
// TODO: make everything numeric so I don't need to do the reverseSpoon here
function buildSpoonList(types,values)
{
  let data = [];
  for (let i = 0; i < types.length; i++)
  {
    data[i] = [];
    data[i][0] = types[i];
    data[i][1] = reverseSpoon(parseInt(values[i]));
  }
  return data;
}

// -- TASK VIEWS

// this should change the view between task and archive view
function changeView()
{
  // stuff
  // basically: determine which view is required and call taskView or archiveView()
}

// this should implement the task view
function taskView()
{
  // stuff
  // first, update the tasklist with data from the DOM
  // hide the archive
  // show the tasklist
}

// this should implement the archive view
function archiveView()
{
  // stuff
  // first, update the archive with data from the DOM
  // hide the tasklist
  // show the archive
}

// -- TASK READING AND WRITING

// returns the task ID of a saved task
function getSavedTaskID(row)
{
  const nameBox = getNameBox(row);
  const taskIDSpan = $(nameBox.children().filter(".taskid")[0]);
  const taskID = $(taskIDSpan.children()[0]).val();
  return taskID;
}

// returns the name box of a saved task
function getNameBox(row)
{
  return $(row.children().filter(".tasknamebox")[0])
}

function removeTaskData(s,id)
{
  const tasks = $("body").data().tasks;
  console.log(tasks);
  if (s === "tasklist")
  {
    console.log("task list");
    delete tasks.active[id];
  }
}

// -- HTML WRANGLING

// returns the first task row if it exists, otherwise false
function tasksExist()
{
  const tasks = $(".task");
  if (tasks.length == 0)
  {
    return false;
  }
  else
  {
    return $(tasks[0]);
  }
}

// crates a table header
function makeTableHead(val = "")
{
  const th = $("<th></th>");
  if (val)
  {
    th.addClass(val);
  }
  return th;
}

// create a difficulty header
// nb: this assumes text mode and I probably shouldn't
function makeDifficultyHead()
{
  const head = makeTableHead("difficultyhead");
  setText(head,"difficulty");
  return head;
}

// create a done header
// refactor for emoji mode later
function makeDoneHead()
{
  const head = makeTableHead("donehead");
  setText(head,"done?");
  return head;
}

// create a task name header
function makeNameHead()
{
  const head = makeTableHead("namehead");
  setText(head,"task");
  return head;
}

// create spoon name headers
// returns an array of header objects
function makeSpoonHeads(a)
{
  let heads = [];
  for (let i = 0; i < a.length; i++)
  {
    let head = makeSpoonHead(a[i]);
    heads.push(head);
  }
  return heads;
}

// create individual spoon name headers
function makeSpoonHead(s)
{
  const head = makeTableHead("spoonhead");
  head.addClass(s);
  setText(head,parseSpoonName(s));
  return head;
}

// creates a table row
function makeTableRow(val = "") {
	const tr = $("<tr></tr>");
  if (val) {
    tr.addClass(val);
  }
	return tr;
}

// makes a header row for the tasklist or archive table
// TODO: account for emoji mode
function makeTaskHeaderRow(s,spoonTypes)
{
  const row = makeTableRow("header");
  const difficultyHead = makeDifficultyHead();
  const nameHead = makeNameHead();
  const spoonHeads = makeSpoonHeads(spoonTypes);
  let doneHead;
  if (s === "tasklist")
  {
    row.attr("id", "taskhead");
    doneHead = makeDoneHead();
    row.append(difficultyHead,doneHead,nameHead);
  }
  else if (s === "archive")
  {
    row.attr("id", "archivehead");
    row.append(difficultyHead,nameHead);
  }
  for (let i = 0; i < spoonHeads.length; i++)
  {
    row.append(spoonHeads[i]);
  }
  return row;
}

// makes a new task row for the tasklist or archive table
function makeNewTaskRow(spoonTypes,spoonDifficulties)
{
  const row = makeTableRow("newtask");
  const difficultyBox = makeNewTaskDifficulty();
  const doneBox = makeNewTaskDone();
  const nameBox = makeNewTaskName();
  const spoonBoxes = makeNewTaskSpoons(spoonTypes,spoonDifficulties);
  const addBox = makeNewTaskAdd();
  row.append(difficultyBox,doneBox,nameBox);
  for (let i = 0; i < spoonBoxes.length; i++)
  {
    row.append(spoonBoxes[i]);
  }
  row.append(addBox);
  return row;
}

// creates a table cell
function makeTableCell(val = "")
{
	const td = $("<td></td>");
  if (val)
  {
    td.addClass(val);
  }
	return td;
}

// makes the difficulty cell for a new task row
function makeNewTaskDifficulty()
{
  const cell = makeTableCell("difficulty");
  return cell;
}

function makeNewTaskDone()
{
  const cell = makeTableCell("done");
  return cell;
}

function makeNewTaskName()
{
  const cell = makeTableCell("name");
  const screenReaderName = makeScreenReaderSpan("task name");
  const textInput = makeTextInput();
  cell.append(screenReaderName,textInput);
  return cell;
}

function makeNewTaskSpoons(spoonTypes,spoonDifficulties)
{
  let cells = [];
  for (let i = 0; i < spoonTypes.length; i++)
  {
    let cell = makeNewTaskSpoon(spoonTypes[i],spoonDifficulties);
    cells.push(cell);
  }
  return cells;
}

function makeNewTaskSpoon(s,spoonDifficulties)
{
  const cell = makeTableCell("spoon");
  cell.addClass(s);
  const spoonName = parseSpoonName(s);
  const screenReaderSpan = makeScreenReaderSpan(spoonName);
  const spoonSelector = selectorWithBlank(spoonDifficulties);
  spoonSelector.addClass(s);
  cell.append(screenReaderSpan,spoonSelector);
  // TODO:
  // add the rest of the stuff needed from buildTaskList
  // so that we have screen reader friendliness and a text input
  return cell;
}

function makeNewTaskAdd()
{
  const cell = makeTableCell("changetask");
  const button = makeButton("Add");
  button.addClass("savenewtask");
  cell.append(button);
  return cell;
}

// creates a table
function makeTable()
{
	const table = $("<table></table>");
	return table;
}

// this is a kludge for now
// sets the width of all spoon cells to be the same as the first one
function setSpoonWidths(table)
{
  const kids = $(table.children());
  const row = $(kids[0]);
  const cells = $(row.children());
  const spoons = cells.filter(".spoonhead");
  const width = spoons.outerWidth();
  spoons.outerWidth(width);
}

// creates a selector from a list
function selectorWithBlank(l)
{
	const selector = $("<select></select>");
	const blankOption = $
  (
    "<option></option>",
    {
		  value: "blank"
	  }
  );
	selector.append(blankOption);
	for (let i = 0; i < l.length; i++)
  {
		let newOption = $
    ("<option></option>",
     {
			text: l[i],
			value: l[i]
		  }
    );
		selector.append(newOption);
	}
	return selector;
}

// creates a span
function makeSpan()
{
	const span = $("<span></span>");
	return span;
}

// creates a hidden span
function makeScreenReaderSpan()
{
	const span = makeSpan();
	span.addClass("hidden");
	return span;
}

// clears the value of a jquery object
function clearVal(obj)
{
  obj.val("");
}

// sets the value of a jquery object
function setVal(obj,val)
{
  obj.val(val);
}

// sets the html attribute of a jquery object
function setHTML(obj,val) {
  obj.html(val);
}

// sets the text attribute of a jquery object
function setText(obj,val)
{
  obj.text(val);
}

// makes a button
function makeButton(text)
{
  const button = $("<button></button>");
  button.val(text);
  button.html(text);
  return button;
}

// makes a link
function makeLink(text,href)
{
  const link = $("<a href='" + href+ "'>" + text + "</a>");
  link.text = text;
  link.href = href;
  return link;
}

// makes a blank text input box
function makeTextInput()
{
  const textInput = $("<input></input>", {
		  type: "text"
	});
  return textInput;
}

// gets the grandparent of a jquery object
function getGrandparent(obj)
{
  const grandparent = obj.parent().parent();
  return grandparent;
}

// -- DEBUG FUNCTIONS --

// logs all task data to the console
function logTaskData()
{
  console.log($("body").data().tasks);
}

// -- BASIC DATA --
const spoonList = ["none", "low", "medium", "high", "very high"];
const spoonTypeList = ["physical", "mental", "social", "travel", "executive-function", "emotional", "time", "stress",
"pain", "symptoms"];

const veryHighSpoon = String.fromCodePoint(0x1F7E3) + String.fromCodePoint(0xFE0F);
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



