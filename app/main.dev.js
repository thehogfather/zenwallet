/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron'
import zenNode from '@zen/zen-node'

import db from './services/store'
import MenuBuilder from './menu'

const isUiOnly = (process.env.UIONLY || process.argv.indexOf('--uionly') > -1 || process.argv.indexOf('uionly') > -1)

db.defaults({
  userPreferences: {
    width: 1200,
    height: 800,
  },
  savedContracts: [
    {
      name: 'Jezreel Valley Adumim 2018 Red',
      hash: '99f1aed539e83caa26467a0143024c197421fdab7bc1aff905fce314c48b7f80',
      address: 'tc1qn8c6a4feaq725fjx0gq5xqjvr96zrldt00q6l7g9ln33f3yt07qq2qt6a7',
    },
  ],
  config: {
    alreadyRedeemedTokens: false,
    autoLogoutMinutes: 30,
    miner: false,
  },
}).write()

let mainWindow = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')()
  const path = require('path')
  const p = path.join(__dirname, '..', 'app', 'node_modules')
  require('module').globalPaths.push(p)
} else {
  require('electron-context-menu')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS',
    'MOBX_DEVTOOLS',
  ]

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log)
}


/**
 * Add event listeners...
 */

let node

app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions()
  }
  const { width: _width, height: _height } = db.get('userPreferences').value()
  mainWindow = new BrowserWindow({
    width: _width,
    height: _height,
    title: app.getName(),
  })

  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds()
    db.get('userPreferences').assign({ width, height }).write()
  });

  console.log('process.argv', process.argv)

  const args = []
  if (process.env.WIPE || process.argv.indexOf('--wipe') > -1 || process.argv.indexOf('wipe') > -1) {
    args.push('--wipe')
    console.log('WIPING DB')
  } else {
    console.log('NOT WIPING DB')
  }

  if (process.env.MINER || process.argv.indexOf('--miner') > -1 || process.argv.indexOf('miner') > -1) {
    args.push('--miner')
    console.log('RUNNING A MINER')
  } else {
    console.log('NOT RUNNING A MINER')
  }

  if (process.env.ZEN_LOCAL === 'L1') {
    args.push('-l1')
  }
  if (process.env.ZEN_LOCAL === 'localhost') {
    args.push('--localhost')
  }

  console.log('process args', args)

  if (isUiOnly) {
    console.log('OPENING UI ONLY')
  } else {
    console.log('LAUNCHING NODE')
    node = zenNode(args)
    node.stderr.pipe(process.stderr)
    node.stdout.pipe(process.stdout)

    ipcMain.on('init-fetch-logs', (event) => {
      node.stdout.on('data', (chunk) => {
        const log = chunk.toString('utf8')
        console.log(`Received ${log} bytes of data.`)
        event.sender.send('blockchainLogs', log)
      });
    })

    node.on('exit', () => {
      console.log('Closed');
      app.quit();
    });
  }

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  process.on('SIGINT', () => {
    console.log('Please close zen-wallet by closing the app window');
    if (isUiOnly) {
      app.quit()
    } else {
      console.log('Sending SIGINT to Node');
      node.kill('SIGINT');
    }
  })
})

app.on('window-all-closed', () => {
  if (isUiOnly) {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    app.quit()
  } else if (process.platform !== 'darwin') {
    console.log('Sending SIGINT to Node');
    node.kill('SIGINT');
    app.quit()
  }
})
