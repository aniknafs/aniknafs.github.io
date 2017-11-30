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
	list: types.optional(types.array(types.string), []) // list is persistable (captured in snapshots)
	})
	.volatile(self => ({ // volatile is not captured in snapshots but is still observable (same MobX observable)
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

	//MST
	console.time("mst (persistable)")
	mstStore.setItems(input)
	console.timeEnd("mst (persistable)")

	console.time("mst (volatile)")
	mstStore.setVolatileList(input)
	console.timeEnd("mst (volatile)")

	console.groupEnd()

	/* 
		Adding an item
	*/

	console.group('Adding a new item')
	const newItem = 'Item NNN'

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

	//MST
	console.time("mst (persistable)")
	mstStore.addItem(newItem)
	console.timeEnd("mst (persistable)")

	console.time("mst (volatile)")
	mstStore.addToVolatileList(input)
	console.timeEnd("mst (volatile)")
	
	console.groupEnd() //adding new item	
	
	/* 
		Removing an item 
	*/

	let removeIndex = 1000
	console.group('Removing an item')

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

	//MST
	console.time("mst (persistable)")
	mstStore.removeItem(removeIndex)
	console.timeEnd("mst (persistable)")

	console.time("mst (volatile)")
	mstStore.removeFromVolatileList(input)
	console.timeEnd("mst (volatile)")

	console.groupEnd() //removing item
	console.groupEnd() //profiler 
}