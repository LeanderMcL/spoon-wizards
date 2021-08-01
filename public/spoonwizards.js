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
    $(".view").click(
      function()
      {
        changeViewHandler(this);
      }
    );
  }
);

const testTask = { name: "test task",
                   difficulty: 1,
                   done: 0,
                   spoons: { physical: 1,
                           mental: 0,
                           social: 0,
                           travel: 0,
                           "executive-function": 0,
                           emotional: 0,
                           time: 0,
                           stress: 0,
                           pain: 0,
                           symptoms: 0}
                     }

// -- SETUP --

// builds the settings paragraph
// currently: the ability to switch between text and emoji mode
// note: this assumes the user will always begin in text mode
// this should be fixed later
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
  taskSetting.attr("id", "tasks");
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
  archive.attr("id", "archivelist");
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
  const taskID = assignTaskID();
  saveTaskData(taskID, taskObject);
  addTask(taskID, taskObject);
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

// TODO: merge these two functions, take the table as an argument

// add a new task to the tasklist table
function addTask(taskID, task)
{
  const table = $("#tasklist");
  // create a new row
  const newRow = makeTasklistRow(taskID, task);
  // finally, stick the new row on the table
  const firstTask = tasksExist("tasklist");
  if (firstTask)
  {
    firstTask.before(newRow);
  }
  else
  {
    table.append(newRow);
  }
}

function addArchiveTask(id, task)
{
  const table = $("#archivelist");
  const newRow = makeArchivelistRow(id, task);
  const firstTask = tasksExist("archive");
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
  const row = getGrandparent($(obj)); 
  const task = getRowData(row);
  openTask(row, task);
  editToSave($(obj), $(obj).parent());
}

function editToSave(button, buttonBox)
{
  button.remove();
  const saveButton = makeSaveButton();
  buttonBox.append(saveButton);
}

function saveToEdit(button, buttonBox)
{
  button.remove()
  const editButton = makeEditButton();
  buttonBox.append(editButton);
}

// respond to the Save button
function saveEditedTaskButtonHandler(obj)
{
  // first: grab the task ID and data
  const row = getGrandparent($(obj));
  const taskType = getRowsTable(row);
  const taskID = getSavedTaskID(row);
  const taskData = getNewTaskData(row);
  const taskObject = buildTaskData(taskData[0], taskData[1], taskData[2], taskData[3]);
  // save data to the DOM
  saveTaskData(taskID, taskObject);
  // update the task table
  updateTask(row, taskObject);
  saveToEdit($(obj), $(obj).parent());
}

// updates an edited task
// TBD: update the edited tasks in the DOM, reliant on bug #37
function updateTask(row, task)
{
  // recalculate the task difficulty
  // update the task box
  // close the task
  closeTask(row, task);
}

// -- REMOVING TASKS

// respond to the Delete button
function deleteButtonHandler(obj)
{
	const row = getGrandparent($(obj));
  const taskType = getRowsTable(row);
	const taskNameBox = getNameBox(row);
	const taskName = $(taskNameBox.children()[2]).html();
  const taskID = getSavedTaskID(row);
	const confirmString = "Really delete " + taskName + "?";
	const r = confirm(confirmString);
	if (r == true)
  {
		row.remove();
    removeTaskData(taskType, taskID);
	}
  // TODO: remove the task data from the DOM
}

// respond to the Archive button
function archiveButtonHandler(obj)
{
  // grab spoon data
  // note: this is all super messy, because I have backend stuff to fix
  const row = getGrandparent($(obj));
  const taskID = getSavedTaskID(row);
  const tasks = $("body").data("tasks");
  const task = tasks.active[taskID];
  // set the task to not done
  task.done = 0;
  // remove the task from the active tasks in the DOM
  removeTaskData("tasklist", taskID);
  // save the task into the archive
  saveArchiveData(taskID, task);
  // get rid of the task row
  row.remove();
}

// respond to the Redo button
function redoButtonHandler(obj)
{
  // grab spoon data
  const row = getGrandparent($(obj));
  const oldTaskID = getSavedTaskID(row);
  const newTaskID = assignTaskID();
  const tasks = $("body").data("tasks");
  const task = tasks.archive[oldTaskID];
  // save the task to active tasks
  saveTaskData(newTaskID, task);
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
  const taskNameBox = getNameBox(row);
  // add "completed" class
  // this adds a strikethrough
  taskNameBox.addClass("completed");
  // update the task's done value in the DOM
  const taskID = getSavedTaskID(row);
  const tasks = $("body").data("tasks");
  const task = tasks.active[taskID];
  task.done = 1;
}

// marks a task as not completed
function uncompleteTask(row)
{
  // grab the specific parts of the row I need
  // again - look into multiple assignment to see if I can shorten this code
  const taskNameBox = getNameBox(row);
  // remove "completed" class
  // removes the strikethrough
  taskNameBox.removeClass("completed");
  // update the task's done value in the DOM
  const taskID = getSavedTaskID(row);
  const tasks = $("body").data("tasks");
  const task = tasks.active[taskID];
  task.done = 0;
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
  for (let i = 0; i < a.length; i++) 
  {
    addImportedTask(a[i]);
  }
}

// adds a task to the task list
// task should be pre-validated
function addImportedTask(a)
{
  let homeTable;
  if (a[0] === "t")
  {
    homeTable = $("#tasklist");
  }
  else if (a[0] === "a")
  {
    homeTable = $("#archivelist");
  }
  else
  {
    developerError("addImportedTask() called with invalid task type");
  }
  const homeSpoonTypes = $("body").data("spoonTypes");
	const homeSpoonEmoji = $("body").data("spoonEmoji");
	const displayMode = $("body").data("displayMode");
  const overallSpoon = parseInt(a[1]);
  const done = parseInt(a[2]);
  const name = a[3];
  const spoonsRaw = a.slice(4,a.length);
  let spoonsProcessed = [];
  for (let i = 0; i < spoonsRaw.length; i++)
  {
    spoonsProcessed.push([homeSpoonTypes[i], reverseSpoon(parseInt(spoonsRaw[i]))]);
  }
  const taskObject = buildTaskData(overallSpoon, done, name, spoonsProcessed);
  const taskID = assignTaskID();
  if (a[0] === "t")
  {
    saveTaskData(taskID, taskObject);
    addTask(taskID, taskObject);
  }
  else if (a[0] == "a")
  {
    saveArchiveData(taskID, taskObject);
    addArchiveTask(taskID, taskObject);
  }
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
function saveTaskData(id, obj)
{
  const data = $("body").data();
  const activeTasks = data.tasks.active;
  activeTasks[id] = obj;
}

function saveArchiveData(id, obj)
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
  const rowType = row.attr("class");
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
	const taskNameBox = getNameBox(row);
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
  if (rowType == "newtask")
  {
	  for (let j = 0; j < spoon.length; j++)
    {
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
	  }
  }
  else if (rowType == "task")
  {
    for (let k = 0; k < spoon.length; k++)
    {
      let spoonBox = $(spoon[k]);
      let spoonType = spoonBox.attr("class").split(" ")[1];
      let spoonVal;
      let spoonForm = $(spoonBox.children()[1]);
      if (spoonForm.val() == "blank")
      {
        spoonVal = "none";
      }
      else
      {
        spoonVal = spoonForm.val();
      }
      spoonCosts.push([spoonType, spoonVal]);
    }
  }
  else
  {
    developerError("getNewTaskData() called on invalid row type");
    return;
  }
  return [spoonCost,done,taskName,spoonCosts];
}

// gets task data from the tasklist
function getExportData()
{
  // okay instead of getting the list of table rows which are only updated on switch
  // I want to get the list of tasks from the DOM
  const tasks = $("body").data("tasks");
  const taskListKeys = Object.keys(tasks["active"]);
  const archiveListKeys = Object.keys(tasks["archive"]);
	const taskListRows = $("#tasklist").children().filter(".task");
  const archiveListRows = $("#archivelist").children().filter(".task");
  let taskData = "";
  let rowData;
  if (taskListKeys)
  {
    for (let i = 0; i < taskListKeys.length; i++)
    {
      rowData = stringifyTaskData("tasklist", getSavedTask("tasklist", taskListKeys[i]));
      if (taskData.length === 0)
      {
        taskData = taskData.concat(rowData);
      } else
      {
        taskData = taskData.concat("\n", rowData);
      }
    }
  }
  if (archiveListKeys)
    for (let j = 0; j < archiveListKeys.length; j++)
    {
      rowData = stringifyTaskData("archivelist", getSavedTask("archivelist", archiveListKeys[j]));
      if (taskData.length === 0)
      {
        taskData = taskData.concat(rowData);
      }
      else
      {
        taskData = taskData.concat("\n", rowData);
      }
    }
  return taskData;
}

function getImportData()
{
  const data = $("#import-area").val();
  return data;
}

// our input here is a closed task row

// our input here is a closed task row
function getRowData(row)
{
  const taskID = getSavedTaskID(row);
  const taskType = getRowsTable(row);
  const task = getSavedTask(taskType, taskID);
  return task;
}

function stringifyTaskData(s, task)
{
  let rowData = "";
  const spoonTypes = $("body").data("spoonTypes");
  if (s === "tasklist")
  {
    // stuff
    rowData = "t";
  }
  else if (s === "archivelist")
  {
    // more stuff
    rowData = "a";
  }
  else
  {
    developerError("stringifyTaskData() called with invalid task type");
  }
  rowData = rowData.concat(",", task.difficulty, ",", task.done, ",", task.name);
  for (let i = 0; i < spoonTypes.length; i++)
  {
    rowData = rowData.concat(",", task.spoons[spoonTypes[i]]);
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
  if (validateTaskType(a[0]) === false)
  {
    v = false;
  }
  if (validateSpoon(a[1]) === false)
  {
      v = false;
  }
  if (validateDone(a[2]) === false)
  {
    v = false;
  }
  for (let i = 4; i < a.length; i++)
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

// validates a task type
function validateTaskType(s)
{
  if (s === "t" || s === "a")
  {
    return true;
  }
  return false;
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

// errors for devs - logged to the console
function developerError(s)
{
  console.log(s);
}

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

// this should handle the button clicking and call changeView()
function changeViewHandler(obj)
{
  const viewType = $(obj).attr("id");
  changeView(viewType);
}

// this should change the view between task and archive view
function changeView(view)
{
  // basically: determine which view is required and call taskView or archiveView()
  if (view === "archive")
  {
    archiveView();
  }
  else if (view == "tasks")
  {
    taskView();
  }
  else
  {
    developerError("changeView() called with invalid view type");
  }
}

// this should implement the task view
function taskView()
{
  // set up necessary data
  const taskList = $("#tasklist");
  const archiveList = $("#archivelist");
  const tasks = $("body").data("tasks");
  const active = tasks["active"];
  const activeKeys = Object.keys(active);
  // first, update the tasklist with data from the DOM
  const activeList = getIDList("tasklist");
  if (activeList.length > 0) // there are already entries in the table
  {
    for (let i = 0; i < activeKeys.length; i++)
    {
      if (!activeList.find(element => element === activeKeys[i]))
      {
        // write the task to the table
        addTask(activeKeys[i], active[activeKeys[i]]);
      }
    }
  }
  else
  {
    for (let j = 0; j < activeKeys.length; j++)
    {
      // write the task to the table
      addTask(activeKeys[j], active[activeKeys[j]]);
    }
  }
  // hide the archive
  archiveList.hide();
  // show the tasklist
  taskList.show();
  // switch our links around
  switchViewLinks("archive");
}

// this should implement the archive view
function archiveView()
{
  const tasklist = $("#tasklist");
  const archivelist = $("#archivelist");
  // first, update the archive with data from the DOM
  const archivedList = getIDList("archivelist");
  const tasks = $("body").data("tasks");
  const archive = tasks["archive"];
  const archiveKeys = Object.keys(archive);
  if (archivedList.length > 0) // there are already entries in the table
  {
    for (let i = 0; i < archiveKeys.length; i++)
    {
      if (!archivedList.find(element => element === archiveKeys[i]))
      {
        // write the task to the table
        addArchiveTask(archiveKeys[i], archive[archiveKeys[i]]);
      }
    }
  }
  else
  {
    for (let j = 0; j < archiveKeys.length; j++)
    {
      // write the task to the table probably by calling addTask
      addArchiveTask(archiveKeys[j], archive[archiveKeys[j]]);
    }
  }
  // hide the tasklist
  tasklist.hide();
  // show the archive
  archivelist.show();
  // switch our links around
  switchViewLinks("tasks");
}

function switchViewLinks(s)
{
  const container = ($(".views-container"));
  if (s === "tasks")
  {
    const taskLink = makeViewLink("tasks");
    taskLink.click(function()
                  {
      changeViewHandler(this);
    });
    const archiveSpan = makeViewText("archive");
    container.empty();
    container.append(taskLink, " ", archiveSpan);
  }
  else if (s === "archive")
  {
    const taskSpan = makeViewText("tasks");
    const archiveLink = makeViewLink("archive");
    archiveLink.click(function()
                     {
      changeViewHandler(this);
    });
    container.empty();
    container.append(taskSpan, " ", archiveLink);
  }
  else
  {
    developerError("switchViewLinks() called with invalid view type");
  }
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

// returns the difficulty box of a saved task
function getDifficultyBox(row)
{
  return $(row.children().filter(".difficultybox")[0]);
}

// returns the name box of a saved task
function getNameBox(row)
{
  return $(row.children().filter(".tasknamebox")[0])
}

// removes task from the DOM
function removeTaskData(s,id)
{
  const tasks = $("body").data().tasks;
  if (s === "tasklist")
  {
    delete tasks.active[id];
  }
  else if (s === "archivelist")
  {
    delete tasks.archive[id];
  }
  else
  {
    developerError("removeTaskData() called with invalid task type");
  }
}

function getSavedTask(s, taskID)
{
  const tasks = $("body").data("tasks");
  let task = {};
  if (s === "tasklist")
  {
    task = tasks.active[taskID];
  }
  else if (s === "archivelist")
  {
    task = tasks.archive[taskID];
  }
  else
  {
    developerError("getSavedTask() called with invalid task type");
  }
  return task;
}
  
// get list of IDs from the relevant table
function getIDList(s)
{
  let IDList = [];
  if (s === "tasklist")
  {
    const rows = $("#tasklist").children().filter(".task");
    if (rows.length === 0)
    {
      return [];
    }
    else
    {
      for (let i = 0; i < rows.length; i++)
      {
        IDList.push(getSavedTaskID($(rows[i])));
      }
      return IDList;
    }
  }
  else if (s === "archivelist")
  {
    const rows = $("#archivelist").children().filter(".task");
    if (rows.length === 0)
    {
      return [];
    }
    else
    {
      for (let i = 0; i < rows.length; i++)
      {
        IDList.push(getSavedTaskID($(rows[i])));
      }
      return IDList;
    }
  }
  else
  {
    developerError("getIDList() called with invalid task type");
    return IDList;
  }
}

// find out what table we're in
function getRowsTable(row)
{
  return row.parent().attr("id");
}

// open up a task for editing by the user
function openTask(row, task)
{
  openNameBox(row, task.name);
  openSpoonBoxes(row, task.spoons);
}

function openNameBox(row, name)
{
  const nameBox = getNameBox(row);
  const nameSpan = $(nameBox.children().filter(".taskname"));
  nameSpan.remove();
  const nameInput = makeInput();
  setVal(nameInput, name);
  nameBox.append(nameInput);
  // replace with an input box
  // put the task name in as the value of the input box
}

function openSpoonBoxes(row, spoons)
{
  let spoonVals = Object.keys(spoons);
  for (let i = 0; i < spoonVals.length; i++)
  {
    openSpoonBox(row, spoonVals[i], spoons[spoonVals[i]]);
  }
}

function openSpoonBox(row, spoonType, spoon)
{
  const spoonClass = ".".concat(spoonType);
  const spoonBox = $(row.children().filter(spoonClass));
  const spoonSpan = $(spoonBox.children()[1]);
  spoonSpan.remove();
  const selector = makeSpoonSelector(reverseSpoon(spoon));
  spoonBox.append(selector);
  spoonBox.css("background-color", "");
}

// close a task so the user can no longer edit it
function closeTask(row, task)
{
  // stuff
  closeNameBox(row, task.name, task.done);
  closeSpoonBoxes(row, task.spoons);
}

function closeNameBox(row, name, done)
{
  const nameBox = getNameBox(row);
  const nameInput = nameBox.children().filter("input");
  nameInput.remove();
  const nameSpan = makeNameSpan(name);
  if (done)
  {
    nameBox.addClass("done");
  }
  nameBox.append(nameSpan);
}

function closeSpoonBoxes(row, spoons)
{
  let spoonVals = Object.keys(spoons);
  for (let i = 0; i < spoonVals.length; i++)
  {
    closeSpoonBox(row, spoonVals[i], spoons[spoonVals[i]]);
  }
}

function closeSpoonBox(row, spoonType, spoon)
{
  const displayMode = $("body").data("displayMode");
  const spoonEmojis = $("body").data("spoonEmoji");
  const spoonClass = ".".concat(spoonType);
  const spoonBox = $(row.children().filter(spoonClass));
  const spoonInput = spoonBox.children().filter("select");
  spoonInput.remove();
  const spoonSpan = makeSpoonSpan(displayMode, spoonEmojis, spoon);
  const bgColour = setSpoonColour(spoon);
  spoonBox.css("background-color", bgColour);
  spoonBox.append(spoonSpan);
}

// -- HTML WRANGLING

// makes a view link
function makeViewLink(text)
{
  const link = makeLink(text, "javascript:void(0)");
  link.attr("id", text);
  link.addClass("view");
  return link;
}

/// makes a view text
function makeViewText(text)
{
  const textSpan = makeSpan();
  textSpan.attr("id", text);
  textSpan.addClass("view");
  setText(textSpan, text);
  return textSpan;
}

// returns the first task row if it exists, otherwise false
function tasksExist(s)
{
  let taskType;
  if (s === "tasklist")
  {
    // work on the tasklist
    taskType = "#tasklist";
  }
  else if (s === "archive")
  {
    // work on the archive
    taskType = "#archivelist";
  }
  else
  {
    developerError("tasksExist() called with invalid task type");
    return false;
  }
  const tasks = $(taskType).children().filter(".task");
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

// makes a new task row for the tasklist table
function makeNewTaskRow(spoonTypes, spoonDifficulties)
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

// makes a task row for the tasklist
function makeTasklistRow(id, task)
{
  // stuff
  const spoonTypes = $("body").data("spoonTypes");
  const displayMode = $("body").data("displayMode");
  const spoonEmojis = $("body").data("spoonEmoji");
  // make a new row
  let newRow = makeTableRow("task");
  // create and append the difficulty
  const difficultyBox = makeDifficultyBox(displayMode, spoonEmojis, task.difficulty);
  newRow.append(difficultyBox);
  // create and append the done checkbox
  const doneBox = makeDoneBox(task.done);
  newRow.append(doneBox);
  // create and append the task name
  const nameBox = makeNameBox(id, task.name, task.done);
  newRow.append(nameBox);
  // create and append the spoon counts
  const spoonBoxes = makeSpoonBoxes(displayMode, spoonEmojis, spoonTypes, task.spoons);
  for (let i = 0; i < spoonBoxes.length; i++)
  {
    newRow.append(spoonBoxes[i]);
  }
  // create and append the edit box
  const editBox = makeEditBox();
  newRow.append(editBox);
  // create and append the delete box
  const deleteBox = makeDeleteBox();
  newRow.append(deleteBox);
  // create and append the archive box
  const archiveBox = makeArchiveBox();
  newRow.append(archiveBox);
  return newRow;
}

// makes a task row for the archive
function makeArchivelistRow(id, task)
{
  // get necessary data from the DOM
  const spoonTypes = $("body").data("spoonTypes");
  const displayMode = $("body").data("displayMode");
  const spoonEmojis = $("body").data("spoonEmoji");
  // make a new row
  let newRow = makeTableRow("task");
  // create and append the difficulty
  const difficultyBox = makeDifficultyBox(displayMode, spoonEmojis, task.difficulty);
  newRow.append(difficultyBox);
  // create and append the task name
  const nameBox = makeNameBox(id, task.name, task.done);
  newRow.append(nameBox);
  // create and append the spoon counts
  const spoonBoxes = makeSpoonBoxes(displayMode, spoonEmojis, spoonTypes,task.spoons);
  for (let i = 0; i < spoonBoxes.length; i++)
  {
    newRow.append(spoonBoxes[i]);
  }
  // create and append the edit button
  const editBox = makeEditBox();
  newRow.append(editBox)
  // create and append the delete box
  const deleteBox = makeDeleteBox();
  newRow.append(deleteBox);
  // create and append the redo button
  const redoBox = makeRedoBox();
  newRow.append(redoBox);
  return newRow;
}

// makes a difficulty box for a task row
function makeDifficultyBox(displayMode, spoonEmojis, difficulty)
{
  const difficultyBox = makeTableCell("difficultybox");
  const difficultyScreenReaderSpan = makeScreenReaderSpan("difficulty");
  let spoonCostSpan;
  if (displayMode == "text")
  {
    spoonCostSpan = makeSpan();
    setText(spoonCostSpan, reverseSpoon(difficulty));
    let difficultyBGColour = setSpoonColour(difficulty);
    difficultyBox.css("background-color", difficultyBGColour);
  }
  else if (displayMode == "emoji")
  {
    spoonCostSpan = trafficLightSpan(difficulty,spoonEmojis);
  }
  difficultyBox.append(difficultyScreenReaderSpan, spoonCostSpan);
  return difficultyBox;
}

// makes a done box for a task row
function makeDoneBox(done)
{
  const doneBox = makeTableCell("donebox");
	const doneScreenReaderSpan = makeScreenReaderSpan("done?");
	doneBox.append(doneScreenReaderSpan);
	const doneCheckBox = makeDoneCheckbox();
  if (done) // could probably test this once rather than twice
  {
    doneCheckBox.prop("checked", true);
  }
	doneBox.append(doneCheckBox);
  return doneBox;
}

function makeDoneCheckbox()
{
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
  return done;
}

// makes a name box for a task row
function makeNameBox(taskID, name, done)
{
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
  const taskNameSpan = makeNameSpan(name);
  if (done)
  {
    nameBox.addClass("completed");
  }
  nameBox.append(taskIdSpan);
  nameBox.append(taskNameScreenReaderSpan);
  nameBox.append(taskNameSpan);
  return nameBox;
}

function makeNameSpan(name)
{
  const nameSpan = makeSpan();
  nameSpan.addClass("taskname");
  setText(nameSpan, name);
  return nameSpan;
}

// makes the spoon boxes for a task row
function makeSpoonBoxes(displayMode, spoonEmojis, spoonTypes, spoonValues)
{
  // stuff
  let spoons = [];
  for (let i = 0; i < spoonTypes.length; i++)
  {
    let spoon = makeSpoonBox(displayMode, spoonEmojis, spoonTypes[i], spoonValues[spoonTypes[i]]);
    spoons.push(spoon);
  }
  return spoons;
}

// makes a spoon box for a task row
function makeSpoonBox(displayMode, spoonEmojis, spoonType, spoonValue)
{
  let spoonBox = makeTableCell("spoon");
  spoonBox.addClass(spoonType);
  let spoonScreenReaderSpan = makeScreenReaderSpan(spoonType);
  let spoonName = reverseSpoon(spoonValue);
  const spoonSpan = makeSpoonSpan(displayMode, spoonEmojis, spoonValue);
  if (displayMode == "text")
  {
    let spoonBGColour = setSpoonColour(spoonValue);
    spoonBox.css("background-color", spoonBGColour);
  }
  spoonBox.append(spoonScreenReaderSpan);
  spoonBox.append(spoonSpan);
  return spoonBox;
}

function makeSpoonSpan(displayMode, spoonEmojis, spoon)
{
  let spoonSpan;
  if (displayMode === "text")
  {
    spoonSpan = makeSpan();
    setText(spoonSpan, reverseSpoon(spoon));
  }
  else if (displayMode == "emoji")
  {
    spoonSpan = trafficLightSpan(spoon, spoonEmojis);
  }
  else
  {
    developerError("makeSpoonSpan() called with invalid display mode")
  }
  return spoonSpan;
}

// makes the edit button for a task row
function makeEditBox()
{
  const editButtonBox = makeTableCell("changetask");
  const editButton = makeEditButton();
	editButton.addClass("edittask");
	editButtonBox.html(editButton);
  return editButtonBox;
}

function makeEditButton()
{
  const editButton = makeButton("Edit");
  editButton.click(
    function()
    {
      editButtonHandler(this);
    }
  );
  return editButton;
}

function makeSaveButton()
{
  const saveButton = makeButton("Save");
  saveButton.click(
    function()
    {
      saveEditedTaskButtonHandler(this);
    }
  );
  return saveButton;
}

function makeDeleteBox()
{
  const deleteButtonBox = makeTableCell("removetask");
	const deleteButton = makeDeleteButton();
  deleteButton.addClass("deletetask");
  setHTML(deleteButtonBox,deleteButton);
  return deleteButtonBox;
}

function makeDeleteButton()
{
  const deleteButton = makeButton("Delete");
  deleteButton.click(
    function()
    {
      deleteButtonHandler(this);
    }
  )
  return deleteButton;
}

function makeArchiveBox()
{
  const archiveButtonBox = makeTableCell("archivetask");
  const archiveButton = makeArchiveButton();
  archiveButton.addClass("archivetask");
  setHTML(archiveButtonBox,archiveButton);
  return archiveButtonBox;
}

function makeArchiveButton()
{
  const archiveButton = makeButton("Archive");
  archiveButton.click(
    function()
    {
      archiveButtonHandler(this);
    }
  );
  return archiveButton;
}

function makeRedoBox()
{
  //stuff
  const redoButtonBox = makeTableCell("redotask");
  const redoButton = makeRedoButton();
  redoButton.addClass("redotask");
  redoButtonBox.html(redoButton);
  return redoButtonBox;
}

function makeRedoButton()
{
  const redoButton = makeButton("Redo");
  redoButton.click(
    function()
    {
      redoButtonHandler(this);
    }
  );
  return redoButton;
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
  const cell = makeTableCell("tasknamebox");
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

// makes an input box
function makeInput()
{
  const input = $("<input></input>");
  return input;
}

function makeSpoonSelector(s)
{
  const spoonValues = $("body").data("spoonDifficulties");
  const selector = selectorWithBlank(spoonValues);
  const options = selector.children();
  for (let i = 0; i < options.length; i++)
  {
    if (options[i].value === s)
    {
      options[i].selected = "selected";
    }
  }
  return selector;
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



