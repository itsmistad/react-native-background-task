// @flow

import BackgroundFetch from 'react-native-background-fetch'
import constants from './contants'
import type { BackgroundTaskInterface, StatusResponse } from '../types'

const BackgroundTask: BackgroundTaskInterface = {
  ...constants,

  _definition: null,
  _lastStartTime: null,
  _taskIds: [],

  define: function(task) {
    this._definition = (taskId) => {
      console.log(`Task "${taskId}" executing... Time since last execution: ${new Date().getTime() - this._lastStartTime.getTime()}ms`)
      this._lastStartTime = new Date()
      this._taskIds.push(taskId)
      await task()
      const index = this._taskIds.findIndex((tId) => tId === taskId)
      if (index >= 0) {
        console.log(`Task "${taskId}" executed successfully. Execution duration: ${new Date().getTime() - this._lastStartTime.getTime()}ms`)
        BackgroundFetch.finish(taskId)
        this._taskIds.splice(index, 1)
      }
    }
  },

  schedule: function() {
    // Cancel existing tasks
    BackgroundFetch.stop()

    this._lastStartTime = new Date()

    // Configure the native module
    // Automatically calls RNBackgroundFetch#start
    BackgroundFetch.configure(
      {},
      this._definition,
      (taskId) => {
        console.warn(`Task "${taskId}" exceeded the maximum allowed running-time. Execution duration: ${new Date().getTime() - this._lastStartTime.getTime()}ms`)
        BackgroundFetch.finish(taskId)
        const index = this._taskIds.findIndex((tId) => tId === taskId)
        if (index >= 0) {
          this._taskIds.splice(index, 1)
        }
      }
    )
  },

  finish: function() {
    for (let taskId of this._taskIds) {
      BackgroundFetch.finish(taskId)
    }
    this._taskIds = []
  },

  statusAsync: function() {
    return new Promise(resolve => {
      BackgroundFetch.status(status => {
        if (status === BackgroundFetch.STATUS_RESTRICTED) {
          return resolve({
            available: false,
            unavailableReason: 'restricted',
          })
        } else if (status === BackgroundFetch.STATUS_DENIED) {
          return resolve({
            available: false,
            unavailableReason: 'denied',
          })
        }

        return resolve({
          available: true,
        })
      })
    })
  }
}

module.exports = BackgroundTask
