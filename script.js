let tasks = [];

const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const categoryInput = document.getElementById("categoryInput");
const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchInput");

let currentFilter = "all";

loadFromLocalStorage();
renderTasks();

document.getElementById("addTaskBtn").addEventListener("click", addTask);
taskInput.addEventListener("keypress", e=>{
if(e.key==="Enter") addTask();
});

document.querySelectorAll(".filters button").forEach(btn=>{
btn.addEventListener("click",()=>{
currentFilter = btn.dataset.filter;
renderTasks();
});
});

searchInput.addEventListener("input", renderTasks);

document.getElementById("darkToggle").addEventListener("click",()=>{
document.body.classList.toggle("dark");
});

function addTask(){

const text = taskInput.value.trim();

if(text==="") return;

const task = {
id:Date.now(),
text:text,
completed:false,
deadline:deadlineInput.value,
category:categoryInput.value
};

tasks.push(task);

taskInput.value="";
deadlineInput.value="";

saveToLocalStorage();
renderTasks();

// Add animation class to the new task
setTimeout(() => {
const newLi = taskList.lastElementChild;
if (newLi) {
newLi.classList.add('new-task');
}
}, 10);
}

function renderTasks(){

taskList.innerHTML="";

let filtered = tasks.filter(task=>{

if(currentFilter==="active") return !task.completed;
if(currentFilter==="completed") return task.completed;

return true;

});

const keyword = searchInput.value.toLowerCase();

filtered = filtered.filter(task=>task.text.toLowerCase().includes(keyword));

filtered.forEach(task=>{

const li = document.createElement("li");
li.setAttribute('data-id', task.id);

if(task.completed) li.classList.add("completed");

li.draggable = true;

li.innerHTML = `

<div class="task-left">

<input type="checkbox" ${task.completed?"checked":""}>

<span>${task.text}</span>

</div>

<div class="task-meta">

${task.category} | ${task.deadline || "No deadline"}

</div>

<div>

<button class="edit">✏️</button>
<button class="delete">❌</button>

</div>

`;

const checkbox = li.querySelector("input");

checkbox.addEventListener("change",()=>toggleComplete(task.id));

li.querySelector(".delete").addEventListener("click",()=>deleteTask(task.id));

li.querySelector(".edit").addEventListener("click",()=>editTask(task.id));

enableDrag(li,task);

taskList.appendChild(li);

});

updateProgressBar();
updateStatistics();
}

function deleteTask(id){

tasks = tasks.filter(task=>task.id!==id);

saveToLocalStorage();
renderTasks();
}

function toggleComplete(id){

const taskElement = document.querySelector(`li[data-id="${id}"]`);
if (taskElement) {
taskElement.classList.add('completing');
setTimeout(() => {
tasks = tasks.map(task=>{
if(task.id===id) task.completed = !task.completed;
return task;
});

saveToLocalStorage();
renderTasks();
}, 300);
} else {
tasks = tasks.map(task=>{
if(task.id===id) task.completed = !task.completed;
return task;
});

saveToLocalStorage();
renderTasks();
}
}

function editTask(id){

const newText = prompt("Edit task:");

if(!newText) return;

tasks = tasks.map(task=>{
if(task.id===id) task.text = newText;
return task;
});

saveToLocalStorage();
renderTasks();
}

function saveToLocalStorage(){

localStorage.setItem("tasks", JSON.stringify(tasks));

}

function loadFromLocalStorage(){

const data = localStorage.getItem("tasks");

if(data) tasks = JSON.parse(data);

}

function updateProgressBar(){

const completed = tasks.filter(t=>t.completed).length;

const percent = tasks.length ===0 ? 0 : (completed/tasks.length)*100;

document.getElementById("progressFill").style.width = percent + "%";

}

function updateStatistics(){

document.getElementById("totalTasks").textContent = tasks.length;

const completed = tasks.filter(t=>t.completed).length;

document.getElementById("completedTasks").textContent = completed;

document.getElementById("activeTasks").textContent = tasks.length - completed;

}

function enableDrag(element,task){

element.addEventListener("dragstart", e=>{
e.dataTransfer.setData("id", task.id);
});

element.addEventListener("dragover", e=>{
e.preventDefault();
});

element.addEventListener("drop", e=>{

const draggedId = Number(e.dataTransfer.getData("id"));

const draggedIndex = tasks.findIndex(t=>t.id===draggedId);
const targetIndex = tasks.findIndex(t=>t.id===task.id);

const draggedTask = tasks.splice(draggedIndex,1)[0];

tasks.splice(targetIndex,0,draggedTask);

saveToLocalStorage();
renderTasks();

});

}