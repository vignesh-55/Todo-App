import format from 'date-fns/format'

const projectForm = document.querySelector('[data-projectForm]');
const listForm = document.querySelector('[data-listForm]');
const todoList = document.querySelector('.todoList');

const projectFormInput = document.querySelector('[data-projectInput]');
const listFormInput = document.querySelector('[data-listInput-title]');
const listFormPriority = document.querySelector('[data-listInput-priority]');
const listFormDate = document.querySelector('[data-projectInput-time]');

const projectUL = document.querySelector('.projectUl');
const deleteProject = document.querySelector('.deleteProject');
const deleteList = document.querySelector('.deleteList');

const listTitle = document.querySelector('.listTitle');

const LOCAL_STORAGE_PROJECT = 'list.projects';
const LOCAL_STORAGE_PROJ_SELECTED_ID = 'list.selectedId';
let projectArr = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PROJECT)) || [];
let selectedProjectId = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PROJ_SELECTED_ID));

let setCurrentDate = (() => {
    let today = new Date(),
    day = today.getDate(),
    month = today.getMonth()+1, 
    year = today.getFullYear();
        if(day<10){
            day='0'+day
        } 
        if(month<10){
            month='0'+month
        }
    today = year+'-'+month+'-'+day;
        
    listFormDate.setAttribute("min", today);
    listFormDate.setAttribute("value", today);
})();

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectTitle = projectFormInput.value;
    if(projectTitle == null || projectTitle == "" ) return;
    if(projectArr.some(project => project.name == projectTitle)) {
        projectFormInput.value = '';
        alert("Enter a different project name")
        return;
    };
    let projectWithId = createProjectWithId(projectTitle);
    projectArr.push(projectWithId);
    saveToLocal();
    appendProject();
    projectFormInput.value = null;
});

listForm.addEventListener('submit', (e) => {
    if(listForm.classList.contains('update')) return;
    e.preventDefault();
    const selectedProject = projectArr.find(project => project.id === selectedProjectId);
    const listName = listFormInput.value;
    if(listName == null || listName == "" ) return;
    if(selectedProject.tasks.some(task => task.name == listName)) {
        listFormInput.value = '';
        alert("Enter a different name");
        return;
    };
    const priority = listFormPriority.value;
    const duedate = listFormDate.value;    
    if(selectedProjectId == null){ listFormInput.value = '';}
    let listWithId = createListWithId(listName, priority, duedate);
    selectedProject.tasks.push(listWithId);
    saveToLocal();
    appendTodoList(todoList);
    listForm.reset();
});

projectUL.addEventListener('click',(e) => {
    const newProjectID = e.target.dataset.projectId;
    if(e.target.tagName.toLowerCase() == 'li'){
        selectedProjectId = newProjectID;
        // localStorage.setItem(LOCAL_STORAGE_PROJ_SELECTED_ID,JSON.stringify(selectedProjectId));
        saveToLocal();
        appendProject()
        appendTodoList(todoList);
    };
})

todoList.addEventListener('click',(e) => {
    if(e.target.tagName.toLowerCase() == 'input'){
        const taskId = e.target.parentNode.parentNode.dataset.listId
        const selectedProject = projectArr.find(project => project.id === selectedProjectId);
        const selectedTask = selectedProject.tasks.find(task => task.id == taskId);
        selectedTask.completed = e.target.checked;
        saveToLocal();
        appendTodoList(todoList);
    };
})

function createProjectWithId(projectName){
    return {
        id: Date.now().toString(),
        name: projectName,
        tasks: []
    }
}
// list id
function createListWithId(taskName, taskPriority, duedate){
    return {
        id: Date.now().toString(),
        name: taskName,
        priority: taskPriority,
        date: duedate,
        completed: false
    }
}

function saveToLocal(){
    localStorage.setItem(LOCAL_STORAGE_PROJECT,JSON.stringify(projectArr));
    localStorage.setItem(LOCAL_STORAGE_PROJ_SELECTED_ID,JSON.stringify(selectedProjectId));
}

function appendProject(){
    clearList(projectUL);
    if(projectArr.length == 0){
        listTitle.textContent = '';
    }
    projectArr.forEach(project => {
        const li = document.createElement('li');
        li.dataset.projectId = project.id;
        if(project.id == selectedProjectId){
            li.classList.add('selected');
            listTitle.innerText = `${project.name} List`;
        }
// need to check
        if(selectedProjectId == null){
            listTitle.innerText = '';
        }

        li.innerText = project.name;
        projectUL.appendChild(li);
    });
}
// append list
function appendTodoList(parent){
    clearList(parent);
    const selectedProject = projectArr.find(project => project.id === selectedProjectId);
    // console.log(selectedProjectId);
    selectedProject.tasks.forEach(list => {
        const list1st = document.createElement('div');
        list1st.classList.add('list1st')
        const checkBox = document.createElement('input');
        const statusCheck = document.createElement('div');
        statusCheck.classList.add('statusCheck');
        checkBox.setAttribute('type','checkbox');
        checkBox.setAttribute('name',list.name);
        checkBox.setAttribute('id',list.name);
        checkBox.checked = list.completed;
        statusCheck.appendChild(checkBox);

        const label = document.createElement('label');
        label.htmlFor = list.name;
        label.innerText = list.name;
        statusCheck.appendChild(label);

        const dateReminder = document.createElement('span');
        dateReminder.classList.add('dueDate');
        const datefrmt = new Date(list.date);
        let newDay = datefrmt.getDate(),
        newMonth = datefrmt.getMonth()+1, 
        newYear = datefrmt.getFullYear();
        var result = format(new Date(newYear, newMonth-1, newDay), 'PP')
        dateReminder.innerText = result;

        const urgency = document.createElement('span');
        urgency.classList.add('priority');
        urgency.innerText = list.priority;
        urgency.style.color = setPriorityColor(list.priority);

        const buttons = document.createElement('div');
        buttons.classList.add('buttons');

        const editBtn = document.createElement('button');
        editBtn.classList.add('editButton');
        editBtn.innerHTML = '&epar;';
        buttons.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('deleteButton');
        deleteBtn.innerHTML = '&Dfr;';
        buttons.appendChild(deleteBtn);

        list1st.appendChild(statusCheck);
        list1st.appendChild(dateReminder);
        list1st.appendChild(urgency);
        list1st.appendChild(buttons);
        list1st.dataset.listId = list.id;

        todoList.appendChild(list1st);
    });
}

function setPriorityColor(value){
    if(value == 'high'){
        return 'red'; 
    }else if(value == 'medium'){
        return 'orange';
    }else{
        return'green';
    }
}
// clear parent
function clearList(parent){
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}

//delete selected project
deleteProject.addEventListener('click', () => {
    projectArr = projectArr.filter(project => project.id !== selectedProjectId);
    selectedProjectId = null;
    saveToLocal();
    appendProject();
    appendTodoList(todoList)
});

//delete all list in the selected project
deleteList.addEventListener('click', () => {
    projectArr.find(project => project.id == selectedProjectId).tasks = [];
    saveToLocal();
    appendTodoList(todoList);
    // appendTodoList(list1st)
});

function updateList(element){
    if(element.classList.contains('update')){
        const listnewName = element.querySelector('[data-listInput-title]');
        const listnewPriority = element.querySelector('[data-listInput-priority]');
        const listnewDate = element.querySelector('[data-projectInput-time]');
        element.addEventListener('submit', e => {
        e.preventDefault();
        const selectedProject = projectArr.find(project => project.id === selectedProjectId);
        const taskID = element.previousSibling.getAttribute('data-list-id');
        const toUpdateTask = selectedProject.tasks.find(task => task.id == taskID);
        const newName = listnewName.value || toUpdateTask.name;
        if(newName !== toUpdateTask.name && selectedProject.tasks.some(task => task.name == newName)) {
            listnewName.value = '';
            alert("Enter a different name");
            return;
        }
        const newPriority = listnewPriority.value || toUpdateTask.priority;
        const newDuedate = listnewDate.value || toUpdateTask.date;
        toUpdateTask.name = newName;
        toUpdateTask.priority = newPriority;
        toUpdateTask.date = newDuedate;
        saveToLocal();
        appendTodoList(todoList)
    })}
}

todoList.addEventListener('click',(e) => {
    const ifanyForm = Array.from(todoList.children);
    if(ifanyForm.find(formArr => formArr.tagName == 'FORM')) return;
    if(e.target.tagName.toLowerCase() == 'button' && e.target.className == 'editButton'){
        let editForm = listForm.cloneNode(true);
        editForm.classList.add('update');
        e.target.parentNode.parentNode.after(editForm);
        updateList(editForm);
    };
})

todoList.addEventListener('click',(e) => {
    if(e.target.tagName.toLowerCase() == 'button' && e.target.className == 'deleteButton'){
        const taskId = e.target.parentNode.parentNode.dataset.listId;
        const selectedProject = projectArr.find(project => project.id === selectedProjectId);
        selectedProject.tasks = selectedProject.tasks.filter(task => task.id !== taskId);
        saveToLocal();
        appendTodoList(todoList);
    };
})

appendProject(projectUL);
appendTodoList(todoList);


// delete a list -> done
// add edit feature - change name, priority, status, due, details -> done
// bundle a list
// import eport things
// clean code
// transitions
// responsiveness
// set reminder -> done
// mark as complete -> done
// create a default project list
// add accordion  >< have to look