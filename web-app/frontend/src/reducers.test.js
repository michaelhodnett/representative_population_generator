import React from 'react';
import ReactDOM from 'react-dom';
import {mainReducer} from './reducers';
import {
  removeCountyAction,
  setSelectAllCheckedAction,
  setSelectAllUncheckedAction,
  selectCountyAction,
} from './actions'


it('removes all zips of a county when county gets removed', () => {
  const state = {
    app: {
      selectedCounties: ['Alameda', 'Other'],
      selectedCountyZips: ['Alameda-94530', 'Alameda-94501', 'Other-11111'],
    }
  }
  const nextState = mainReducer(state, removeCountyAction('Alameda'))
  expect(nextState.app.selectedCountyZips.length).toBe(1)
  expect(nextState.app.selectedCounties.length).toBe(1)
});


it('should not add a county twice', () => {
  const state = {
    data: {
      areas: [],
    },
    app: {
      selectedCounties: ['Alameda'],
      selectedCountyZips: [],
    }
  }
  const nextState = mainReducer(state, selectCountyAction('Alameda'))
  expect(nextState.app.selectedCounties.length).toBe(1)
});


it('adds all county-zips when select all gets checked', () => {
  const state = {
    data: {
      counties: {
        'Alameda': {
          zips: ['94501', '94502', '94505'],
        },
      }
    },
    app: {
      isSelectAllChecked: false,
      selectedCounties: ['Alameda'],
      selectedCountyZips: ['Alameda-94501'],
    },
  }
  const nextState = mainReducer(state, setSelectAllCheckedAction())
  expect(nextState.app.selectedCountyZips.length).toBe(3)
  expect(nextState.app.isSelectAllChecked).toBe(true)
})


it('removes all county-zips when select all gets unchecked', () => {
  const state = {
    app: {
      isSelectAllChecked: true,
      selectedCounties: ['Alameda', 'Marin'],
      selectedCountyZips: ['Alameda-11111', 'Alameda-11112', 'Marin-22222'],
    },
  }
  const nextState = mainReducer(state, setSelectAllUncheckedAction())
  expect(nextState.app.selectedCountyZips.length).toBe(0)
  expect(nextState.app.isSelectAllChecked).toBe(false)
})


it('Do not add all count-zips of a new county when select all is checked but uncheck select-all', () => {
  const state = {
    data: {
      counties: {
        'Alameda': {
          zips: ['11111'],
        },
        'Marin': {
          zips: ['22222', '22223'],
        }
      }
    },
    app: {
      isSelectAllChecked: true,
      selectedCounties: ['Alameda'],
      selectedCountyZips: ['Alameda-11111'],
    },
  }
  const nextState = mainReducer(state, selectCountyAction('Marin'))
  expect(nextState.app.selectedCounties.length).toBe(2)
  expect(nextState.app.selectedCountyZips.length).toBe(1)
  expect(nextState.app.isSelectAllChecked).toBe(false)
})


it('resets data loaded via CSV when a new county is selected', () => {
  const state ={
    data: {
      areas: ['Something'],
      counties: {
        'Alameda': {
          zips: ['11111'],
        },
      },
    },
    app: {
      selectedCounties: [],
      selectedCountyZips: [],
    }
  }
  const nextState = mainReducer(state, selectCountyAction('Alameda'))
  expect(nextState.data.areas.length).toBe(0)
})
