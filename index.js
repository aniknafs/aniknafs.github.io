import { observable } from 'mobx'
import { types, onSnapshot } from "mobx-state-tree"
import { List } from 'immutable' 
import { createStore } from 'redux'

/*
	REDUX Setup
*/
function setStateReducer(state = {}, action) {
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

/*
	REDUX+ImmutableJS Setup
*/
function setImmutableStateReducer(state = List(), action) {
	switch (action.type) {
		case 'SET_LIST':
			return List(action.val)
		case 'ADD_ITEM':
			// console.log('ADD_ITEM: ', action.val)
			return state.push(action.val)      
		case 'REMOVE_ITEM':
			return state.delete(action.val)
		default:
			return state
	}
}

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
		this.list.push(item)
	}
	removeItem(index){
		this.list.splice(index, 1)
	}
} 

document.getElementById('run').addEventListener('click', () => runProfiler(parseInt(document.getElementById('arraySize').value)))

const runProfiler = arraySize => {
	console.group(`Running profiler with ${arraySize} elements`)

	/* 
		Create stores
	*/
	const mstStore = MSTStore.create()
	const reduxStore = createStore(setStateReducer)
	const reduxImmutableStore = createStore(setImmutableStateReducer)
	const mobxStore = new MobxStore()
	
	/* 
		Initialize the store with an array 
	*/
	const input = Array.from(Array(arraySize).keys()).map(x => `Item ${x}`)
	console.group('Initial array creation')

	//plain mutable 
	console.time("mutable (deep clone)")
	const mutableList = JSON.parse( JSON.stringify( input ) ) // has restrictions over the data, e.g. no undefined
	console.timeEnd("mutable (deep clone)")

	//plain immutable
	console.time("immutable with spread")
	let plainImmutableList = [...input]
	console.timeEnd("immutable with spread")

	//ImmutableJS
	console.time("immutablejs")
	let immutableList = List(input)
	console.timeEnd("immutablejs")

	//MST
	console.time("mst (persistable)")
	mstStore.setItems(input)
	console.timeEnd("mst (persistable)")

	console.time("mst (volatile)")
	mstStore.setVolatileList(input)
	console.timeEnd("mst (volatile)")

	//MobX
	console.time("mobx")
	mobxStore.setItems(input)
	console.timeEnd("mobx")

	//REDUX 
	console.time("redux (spread op)")
	reduxStore.dispatch({ 
		type: 'SET_LIST', 
		val: input 
	})
	console.timeEnd("redux (spread op)")

	//REDUX+Immutable
	console.time("redux (immutableJS)")
	reduxImmutableStore.dispatch({ 
		type: 'SET_LIST', 
		val: input 
	})
	console.timeEnd("redux (immutableJS)")

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
	console.time("mst (persistable)")
	mstStore.addItem(newItem)
	console.timeEnd("mst (persistable)")

	console.time("mst (volatile)")
	mstStore.addToVolatileList(input)
	console.timeEnd("mst (volatile)")

	//MobX
	console.time("mobx")
	mobxStore.addItem(newItem)
	console.timeEnd("mobx")

	//REDUX 
	console.time("redux (spread op)")
	reduxStore.dispatch({ 
		type: 'ADD_ITEM', 
		val: newItem
	})
	console.timeEnd("redux (spread op)")

	//REDUX+ImmutableJS
	console.time("redux (immutableJS)")
	reduxImmutableStore.dispatch({ 
		type: 'ADD_ITEM', 
		val: newItem
	})
	console.timeEnd("redux (immutableJS)")
	console.groupEnd() //adding new item

	/* 
		Removing an item 
	*/
	let removeIndex = 1000
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
	console.time("mst (persistable)")
	mstStore.removeItem(removeIndex)
	console.timeEnd("mst (persistable)")

	console.time("mst (volatile)")
	mstStore.removeFromVolatileList(input)
	console.timeEnd("mst (volatile)")

	//MobX
	console.time("mobx")
	mobxStore.removeItem(removeIndex)
	console.timeEnd("mobx")

	//REDUX 
	console.time("redux (spread op)")
	reduxStore.dispatch({ 
		type: 'REMOVE_ITEM', 
		val: removeIndex
	})
	console.timeEnd("redux (spread op)")

	//REDUX+ImmutableJS
	console.time("redux (immutableJS)")
	reduxImmutableStore.dispatch({ 
		type: 'REMOVE_ITEM', 
		val: removeIndex
	})
	console.timeEnd("redux (immutableJS)")

	// console.time("console.log")
	// console.log(reduxImmutableStore.getState())
	// console.timeEnd("console.log")

	// console.time("console.log")
	// reduxImmutableStore.getState().toJS()
	// console.timeEnd("console.log")

	// console.time("getState()")
	// reduxImmutableStore.getState()
	// console.timeEnd("getState()")

	console.groupEnd() //removing item
	console.groupEnd() //profiler 
}