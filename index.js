import { observable } from 'mobx'
import { types, onSnapshot } from "mobx-state-tree"
import { List } from 'immutable' 
import { createStore } from 'redux'

/*
    REDUX Setup
*/
function setStateReducer(state = 0, action) {
  switch (action.type) {
    case 'SET_LIST':
        return { ...state, list: [...action.val] }
    case 'ADD_ITEM':
        return { ...state, list: [...state.list, action.val] }
    case 'REMOVE_ITEM':
        return { ...state, list: [...state.list.slice(0, action.val), ...state.list.slice(action.val+1)] }
    default:
        return state
  }
}
let ReduxStore = createStore(setStateReducer)
ReduxStore.subscribe( ()=>{
    // console.log('store', ReduxStore.getState());
})
/*
    MST Setup
*/
const MSTStore = types.model({
    list: types.optional(types.array(types.string), []) // this list is snapshottable
    })
    .volatile(self => ({ // volatile state is observable (same MobX observable)
        volatileList: []
    }))
    .actions(self => ({
        setItems(items){
            self.list = items
        },
        addItem(item){
            self.list.push(item)
        },
        removeItem(index){
            self.list.splice(index, 1)
        },
        setVolatileList(value) {
            self.volatileList = value
        },
        addToVolatileList(item){
            self.volatileList.push(item)
        },
        removeFromVolatileList(index){
            self.volatileList.splice(index, 1)
        }
    }))
const mstStore = MSTStore.create()
let snapshotListener = onSnapshot(mstStore, snapshot => { 
    // console.log('new snapshot: ', snapshot);
})

/* 
    MobX Setup
*/
class MobxStore {
    constructor(){
        this.list = observable([]) 
    }
    setItems(items){
        this.list = items
    }
    addItem(item){
        this.list.push(item);
    }
    removeItem(index){
        this.list.splice(index, 1)
    }
} 
const mobxStore = new MobxStore()

/* 
    Initialize the store with an array 
*/
console.group('Working with array')
const input = Array.from(Array(10000).keys()).map(x => `Item ${x}`)
console.group('Initial array creation')

//plain mutable
console.time("mutable")
const mutableList = JSON.parse( JSON.stringify( input ) ); // has restrictions over the data, e.g. no undefined
console.timeEnd("mutable")

//plain immutable
console.time("immutable with spread")
let plainImmutableList = [...input]
console.timeEnd("immutable with spread")

//ImmutableJS
console.time("immutablejs")
const immutableList = List(input);
console.timeEnd("immutablejs")

//MST
console.time("mst")
mstStore.setItems(input)
console.timeEnd("mst")

console.time("mst (volatile)")
mstStore.setVolatileList(input)
console.timeEnd("mst (volatile)")

//MobX
console.time("mobx")
mobxStore.setItems(input)
console.timeEnd("mobx")

//REDUX 
console.time("redux")
ReduxStore.dispatch({ 
    type: 'SET_LIST', 
    val: input 
})
console.timeEnd("redux")

console.groupEnd()

/* 
    Adding an item
*/
console.group('Adding a new item')
const newItem = 'Item NNN'

//mutable
console.time("mutable")
mutableList.push(newItem)
console.timeEnd("mutable")

//plain immutable
console.time("immutable with spread")
plainImmutableList = [...plainImmutableList, newItem]
console.timeEnd("immutable with spread")

//Immutablejs 
console.time("immutablejs")
immutableList.push(newItem)
console.timeEnd("immutablejs")

//MST
console.time("mst")
mstStore.addItem(newItem)
console.timeEnd("mst")

console.time("mst (volatile)")
mstStore.addToVolatileList(input)
console.timeEnd("mst (volatile)")

//MobX
console.time("mobx")
mobxStore.addItem(newItem)
console.timeEnd("mobx")

//REDUX 
console.time("redux")
ReduxStore.dispatch({ 
    type: 'ADD_ITEM', 
    val: newItem
})
console.timeEnd("redux")
console.groupEnd() //adding new item

/* 
    Removing an item 
*/
let removeIndex = 1000;
console.group('Removing an item')

//mutable
console.time("mutable")
mutableList.splice(removeIndex,1)
console.timeEnd("mutable")

//plain immutable
console.time("immutable with spread")
let plainImmutableList2 = [...plainImmutableList.slice(0, removeIndex), ...plainImmutableList.slice(removeIndex+1)]
console.timeEnd("immutable with spread")

//Immutablejs 
console.time("immutablejs")
immutableList.delete(1000)
console.timeEnd("immutablejs")

//MST
console.time("mst")
mstStore.removeItem(removeIndex)
console.timeEnd("mst")

console.time("mst (volatile)")
mstStore.removeFromVolatileList(input)
console.timeEnd("mst (volatile)")

//MobX
console.time("mobx")
mobxStore.removeItem(removeIndex)
console.timeEnd("mobx")

//REDUX 
console.time("redux")
ReduxStore.dispatch({ 
    type: 'REMOVE_ITEM', 
    val: removeIndex
})
console.timeEnd("redux")

console.groupEnd() //removing item
console.groupEnd() //array


console.group('Working with complex object tree')
const tree = Array(10000).keys().map(x => `Item ${x}`)