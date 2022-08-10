
let host = "http://localhost:5000/";



// login js
export async function request_findUser(user_email){
    const request = await fetch(`${host}getUser/${user_email}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((resp) =>resp)
    .catch(error=>console.log(error))
    return request;
}

//login js
export async function request_getAllInfo(userEmail){
    const request = await fetch(`${host}getAllInfo/${userEmail}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((data) => data)
    .catch(error=>console.log(error))
    return request;
}

//register js
export async function request_isEmailExist(userEmail){
    const request = await fetch(`${host}getAllUsers`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },

    })
    .then(resp=>resp.json())
    .then((resp) => resp)
    .catch(error=>console.log(error))
    for(let i=0; i<request.length; i++){
        if (userEmail==request[i].email){
            console.log("hello");
            return true;
        }
    }
    return false;
}

//register js
export async function request_addUser(data){
    await fetch(`${host}addUser`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

// sidebar js
// settings js
export async function request_updateUserInfo(userEmail, data){
    fetch(`${host}updateUser/${userEmail}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
        })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

// sidebar js
// settings js
export async function request_updateUserTools(userEmail, data){
    await fetch(`${host}updateTools/${userEmail}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

// sidebar js
// settings js
export async function request_updateScheduleTime(userEmail, data){
    await fetch(`${host}updateSchedule/${userEmail}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

// delete js
export async function request_deleteSomeElement(url){
    const request = await fetch(`${host}${url}`,{
        method: 'DELETE',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then(resp => resp)
    .catch(error=>console.log(error))
    return request
}

// schedule js
// task js
export async function request_updateTask(email, data){
    await fetch(`${host}updateTask/${email}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

// prompt js
// task js
export async function request_addTask(userEmail, userData){
    const request = await fetch(`${host}addTask/${userEmail}`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(resp=>resp.json())
    .then((data)=>data)
    .catch(error=>console.log(error))
    return request;
}

//note js
export async function request_updateNote(email,data){
    await fetch(`${host}updateNote/${email}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

//note js
export async function request_addNote(email, data){
    await fetch(`${host}addNote/${email}`,{
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

//note js

export async function request_passAudio( formData, email, path){
    const request = await fetch(`${host}convertToText/${email}/${path}`,{
        method: 'POST',
        body: formData
    })
    .then(resp=>resp.json())
    .then((data) => data)
    .catch(error=>console.log(error))
    return request;
}

export async function request_passPdf( email, formData){
    const request = await fetch(`${host}convertToPdf/${email}`,{
        method: 'POST',
        body: formData
    })
    .then(resp=>resp.json())
    .then((data) => data)
    .catch(error=>console.log(error))
    return request;
}

export async function request_updateSettingsLastNotes(email, data){
    await fetch(`${host}updateNotesLast/${email}`, {
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

export async function request_addProject(email, data){
    await fetch(`${host}addProject/${email}`,{
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

export async function request_saveProject(email, data){
    await fetch(`${host}saveProject/${email}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

export async function request_deleteProject(email, data){
    await fetch(`${host}deleteProject/${email}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

//login js load js
export async function request_weekScores(userEmail, week){
    const request = await fetch(`${host}weekScores/${userEmail}/${week.start}/${week.end} `,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },

    })
    .then(resp=>resp.json())
    .then((resp) => resp)
    .catch(error=>console.log(error))
    return request;
}

export async function request_updateHistory(email, data){
    await fetch(`${host}updateHistory/${email}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

export async function request_updateStyle(email, data){
    await fetch(`${host}updateStyle/${email}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

export async function request_addNewHistory(email, data){
    await fetch(`${host}addNewHistory/${email}`,{
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

export async function request_addStudyBlockElems(email, data){
    await fetch(`${host}addStudyBlockElems/${email}`,{
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

export async function request_removeStudyBlockElem(url){
    const request = await fetch(`${host}removeStudyBlockElem/${url}`,{
        method: 'DELETE',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then(resp => resp)
    .catch(error=>console.log(error))
    return request
}

export async function request_updateallStudyBlocks(email, data){
    const request = await fetch(`${host}updateallStudyBlocks/${email}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then(resp => resp)
    .catch(error=>console.log(error))
    return request
}

//------------------------------------------Here-------------------------------------------

// menu js
export async function request_addTool(userTool, userData){
    const request = await fetch(`${host}add${userTool}`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
    return request;
}

// load js
// menu js
// sidebar js
export async function request_getUserTools(userEmail){
    const request = await fetch(`${host}getUserTools/${userEmail}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },

    })
    .then(resp=>resp.json())
    .then((resp) =>resp)
    .catch(error=>console.log(error))
    return request;
}

// tasks js
export async function request_addComplexTask(data){
    await fetch(`${host}addComplexTask`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

// schedule js
// task js
export async function request_updateSimpleTaskStage(data){
    await fetch(`${host}updateSimpleTaskStage`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

// schedule js
// task js
// tasks js
export async function request_allSimpleTasks(userEmail){
    const request = await fetch(`${host}getAllSimpleTasks/${userEmail}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((resp) => resp)  
    .catch(error=>console.log(error))
    return request;
}


// load js
// menu js
// profile js
// sidebar js
export async function request_getUser(userEmail){
    const request = await fetch(`${host}getUserFullName/${userEmail}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((resp) => resp)  
    .catch(error=>console.log(error))
    return request;
}


export async function request_updateId(data){
    await fetch(`${host}updateId`,{
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(resp=>resp.json())
    .then()
    .catch(error=>console.log(error))
}

export async function request_getTasksByDate(userEmail, gap){
    const request = await fetch(`${host}getTaskRange/${userEmail}/${gap}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((resp) => resp)  
    .catch(error=>console.log(error))
    return request;
}

export async function request_getMaxIdComplexTask(userEmail){
    const request = await fetch(`${host}getMaxId/${userEmail}/complex/None`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((resp) => resp)
    .catch(error=>console.log(error))
    return request;
}

export async function request_getSimpleTaskListForComplexTask(userEmail, complexTaskId){
    const request = await fetch(`${host}getSimpleTasks/${userEmail}/${complexTaskId}`,{
    method: 'GET',
    headers: {
        'Content-Type':'application/json'
    },
    })
    .then(resp=>resp.json())
    .then((resp) => resp)  
    .catch(error=>console.log(error))
    return request;
}

export async function request_getSimpleTaskId(userEmail, complexId){
    const request = await fetch(`${host}getMaxId/${userEmail}/simple/${complexId}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((resp) => resp)  
    .catch(error=>console.log(error))
    return request;
}

export async function request_getSimpleTask(userEmail, complexId, id){
    const request = await fetch(`${host}getSimpleTask/${userEmail}/${complexId}/${id}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    })
    .then(resp=>resp.json())
    .then((resp) => resp)  
    .catch(error=>console.log(error))
    return request;
}


export async function request_getNotes(userEmail, method){
    const request = await fetch(`${host}getNotes/${userEmail}/${method}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((data) => data)
    .catch(error=>console.log(error))
    return request;
}

export async function request_getMaxId(userEmail){
    const request = await fetch(`${host}getMaxId/${userEmail}/notes/None`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((resp) => resp)
    .catch(error=>console.log(error))
    return request;
}


export async function request_getNoteInfo(userEmail, id){
    const request = await fetch(`${host}getNote/${userEmail}/${id}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },

    })
    .then(resp=>resp.json())
    .then((resp) => resp)
    .catch(error=>console.log(error))
    return request;
}

export async function request_isNoteIdExist(userData){
    const request = await fetch(`${host}checkId/${userData.userEmail}/${userData.id}`,{
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        },
    })
    .then(resp=>resp.json())
    .then((resp) => resp)
    .catch(error=>console.log(error))
    return request;
}

// export async function request_makeSaved(userEmail){
//     const request = await fetch(`http://localhost:5000//saved/${userEmail}`,{
//         method: 'GET',
//         headers: {
//             'Content-Type':'application/json'
//         },
//     })
//     .then(resp=>resp.json())
//     .then((resp) => resp)  
//     .catch(error=>console.log(error))
//     return request;
// }

// export async function request_addSaved( data){
//     await fetch(`http://localhost:5000//addSaved`,{
//         method: 'PUT',
//         headers: {
//             'Content-Type':'application/json'
//         },
//         body: JSON.stringify(data)
//         })
//     .then(resp=>resp.json())
//     .then()
//     .catch(error=>console.log(error))
// }

// export async function request_removeSaved(data){
//     await fetch(`http://localhost:5000//removeSaved`,{
//         method: 'PUT',
//         headers: {
//             'Content-Type':'application/json'
//         },
//         body: JSON.stringify(data)
//         })
//     .then(resp=>resp.json())
//     .then()
//     .catch(error=>console.log(error))
// }