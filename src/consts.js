export const TaskTemplate = {
    id: -1,    
    name: "",
    done: false,
    current: false,
    started: undefined,
    type: "",
    parent: undefined,
    tasks: [],
    leader: '',
    due: undefined,
    daysLeft: undefined,
    excitement: 0,
    priority: 0,
    estimatedDuration: 0,
    actualDuration: 0,
    prereqs: [],
    tags: new Set(),
    color: "#e5e8ff",
    description:"",
    prereqs: [],
}
export const PersonTemplate = {    
    name: "",
    committees: [],
    email: ""
}
export const CommitteeTemplate = {    
    name: "",
    members: []
}
export const ProjectTemplate = {
    name: '',
    people: [],
    description: "",
    status: "",
    tasks: []
}
export const EventTemplate = {
    name: '',
    people: [],
    description: "",
    status: "",
    tasks: [],
    tag: '',
    doc: ''
}
export const WaterfallTemplate = {
    tasks: []

}

/*
Example waterfall

Get money => print posters => put up posters
1 week        2 days            1 day   
*/