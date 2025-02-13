'use strict'
/* eslint-env browser */
/* globals chrome */

// Manifest v2 polyfill
if (chrome.runtime.getManifest().manifest_version === 2) {
  chrome.action = chrome.browserAction

  chrome.storage.sync = {
    get: (...args) =>
      new Promise((resolve) => chrome.storage.local.get(...args, resolve)),
    set: (...args) =>
      new Promise((resolve) => chrome.storage.local.set(...args, resolve)),
  }
}

// eslint-disable-next-line no-unused-vars
const Utils = {
  agent: chrome.runtime.getURL('/').startsWith('moz-')
    ? 'firefox'
    : chrome.runtime.getURL('/').startsWith('safari-')
    ? 'safari'
    : 'chrome',

  /**
   * Use promises instead of callbacks
   * @param {Object} context
   * @param {String} method
   * @param  {...any} args
   */
  promisify(context, method, ...args) {
    return new Promise((resolve, reject) => {
      context[method](...args, (...args) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }

        resolve(...args)
      })
    })
  },

  /**
   * Open a browser tab
   * @param {String} url
   * @param {Boolean} active
   */
  open(url, active = true) {
    chrome.tabs.create({ url, active })
  },

  /**
   * Get value from local storage
   * @param {String} name
   * @param {string|mixed|null} defaultValue
   */
  async getOption(name, defaultValue = null) {
    try {
      const option = await chrome.storage.sync.get(name)

      if (option[name] !== undefined) {
        return option[name]
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('wappalyzer | utils |', error)
    }

    return defaultValue
  },

  /**
   * Set value in local storage
   * @param {String} name
   * @param {String} value
   */
  async setOption(name, value) {
    try {
      await chrome.storage.sync.set({
        [name]: value,
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('wappalyzer | utils |', error)
    }
  },

  /**
   * Apply internationalization
   */
  i18n() {
    Array.from(document.querySelectorAll('[data-i18n]')).forEach(
      (node) => (node.innerHTML = chrome.i18n.getMessage(node.dataset.i18n))
    )
  },

  sendMessage(source, func, args) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          source,
          func,
          args: args ? (Array.isArray(args) ? args : [args]) : [],
        },
        (response) => {
          chrome.runtime.lastError
            ? reject(new Error(chrome.runtime.lastError.message))
            : resolve(response)
        }
      )
    })
  },

  globEscape(string) {
    return string.replace(/\*/g, '\\*')
  },
}
