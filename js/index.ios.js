// @flow

import BackgroundFetch from 'react-native-background-fetch'
import constants from './contants'
import type { BackgroundTaskInterface, StatusResponse } from '../types'

const BackgroundTask: BackgroundTaskInterface = {
  ...constants,

  _definition: null,

  define: function(task) {
    this._definition = task
  },

  schedule: function() {
    // Cancel existing tasks
    BackgroundFetch.stop()

    // Configure the native module
    // Automatically calls RNBackgroundFetch#start
    BackgroundFetch.configure(
      {},
      this._definition,
      (taskId) => {
        console.warn(`Task ${taskId} exceeded the maximum allowed running-time.`)
        BackgroundFetch.finish(taskId)
      }
    )
  },

  finish: function(taskId) {
    BackgroundFetch.finish(taskId)
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
