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
    description:""
}
export const PersonTemplate = {    
    name: "",
    committees: [],

}
export const CommitteeTemplate = {    
    name: "",
    members: []
}
