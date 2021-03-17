// @flow

import { AppRegistry, NativeModules } from 'react-native'
import constants from './contants'
import type { BackgroundTaskInterface } from '../types'

const { BackgroundTask: RNBackgroundTask } = NativeModules

const BackgroundTask: BackgroundTaskInterface = {
  ...constants,
  _lastStartTime: null,

  define: function(task) {
    // Register the headless task
    const fn = async () => {
      console.log(`Task executing... Time since last execution: ${new Date().getTime() - this._lastStartTime.getTime()}ms`)
      this._lastStartTime = new Date()
      await task()
      console.log(`Task executed successfully. Execution duration: ${new Date().getTime() - this._lastStartTime.getTime()}ms`)
    }
    AppRegistry.registerHeadlessTask('BackgroundTask', () => fn)
  },

  schedule: function(
    {
      period = 900, // 15 minutes
      timeout = 30,
      flex,
    } = {}
  ) {
    // Cancel existing tasks
    RNBackgroundTask.cancel()

    this._lastStartTime = new Date()
    
    // Default flex to within 50% of the period
    if (!flex) {
      flex = Math.floor(period / 2)
    }

    RNBackgroundTask.schedule({
      period,
      timeout,
      flex,
    })
  },

  finish: function() {
    RNBackgroundTask.cancel()
  },

  statusAsync: function() {
    // No options exist on Android to block background tasks
    return Promise.resolve({
      available: true,
    })
  }
}

module.exports = BackgroundTask
