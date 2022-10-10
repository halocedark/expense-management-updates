const {app, BrowserWindow, ipcMain } = require('electron');
const ejse = require('ejs-electron');
const path = require('path');
const isDev = require('electron-is-dev');
const IniFile = require(__dirname+'/assets/js/utils/IniFile.js');
const ROOTPATH = require('electron-root-path');
const fs = require('fs');
const {autoUpdater} = require('electron-updater');
const OS = require('os');
const uuid = require('uuid');

let loadingScreen;
let WINDOWS = [];
var UI_DISPLAY_LANG = {};

// Main Window
function CreateWindow(options = null)
{
	var width = 1400;
	var height = 800;
	var icon = 'assets/img/logo/logo.png';
	var name = 'WIN_LOGIN';
	var webPreferences = {
		nodeIntegration: true, 
		contextIsolation: false,
		preload: path.join(__dirname, 'preload.js')
	};
	var show = true;
	var page = 'index.ejs';
	var devtools = true;
	if ( options )
	{
		width = (options.width) ? options.width : width;
		height = (options.height) ? options.height : height;
		icon = (options.icon) ? options.icon : icon;
		name = (options.name) ? options.name : name;
		webPreferences = (options.webPreferences) ? options.webPreferences : webPreferences;
		show = (options.show) ? options.show : show;
		page = (options.page) ? options.page : page;
		devtools = (options.devtools) ? options.devtools : devtools;
	}
	// Create Browser Window
	var winOptions = 
	{
		width: width,
		height: height,
		icon: icon,
		name: name,
		webPreferences: webPreferences,
		show: show
	};
	win = new BrowserWindow(winOptions);
	win.name = name;
	// Load index.html
	win.loadFile(page);
	// Open dev tools
	if ( devtools )
	{
		devtools = new BrowserWindow();
		win.webContents.setDevToolsWebContents(devtools.webContents);
	    win.webContents.openDevTools({ mode: 'detach' });	
	}
	// Set Win to null
	win.on('closed', () =>
	{
		win = null;
	});
	// Delete Default Context menu
	win.setMenu(null);
	// send translation object
	loadLang();
	// add window to array
	WINDOWS.push(win);
	return win;
}
// Loading Screen
function CreateLoadingScreen()
{
	// Create Browser Window
	var winOptions = 
	{
		width: 700,
		height: 500,
		icon: __dirname+'/assets/ico/main.png',
		webPreferences: { nodeIntegration: true, contextIsolation: false },
		show: true,
		resizable: false,
		frame: false
	};
	loadingScreen = new BrowserWindow(winOptions);
	// Load index.html
	loadingScreen.loadFile('loadingScreen.ejs');
	// Open dev tools
	//loadingScreen.webContents.openDevTools();
	// Set Win to null
	loadingScreen.on('closed', () =>
	{
		loadingScreen = null;
	});
	// Delete Default Context menu
	loadingScreen.setMenu(null);

	return loadingScreen;
}
// Setup auto updater
function setupAutoUpdater(win)
{
	var updatePromise = undefined;
	// Setup auto updater
	autoUpdater.on('checking-for-update', () =>
	{
		win.webContents.send('checking-for-update');
	});
	autoUpdater.on('update-available', (info) =>
	{
		win.webContents.send('update-available', info);
		win.webContents.send('update-about-to-download', updatePromise);
	});
	autoUpdater.on('update-not-available', (info) =>
	{
		win.webContents.send('update-not-available', info);
	});
	autoUpdater.on('update-downloaded', (info) =>
	{
		win.webContents.send('update-downloaded', info);
	});
	autoUpdater.on('download-progress', (progressInfo) =>
	{
		win.webContents.send('download-update-progress', progressInfo);
	});
	autoUpdater.on('error', (err) =>
	{
		win.webContents.send('update-error', err);
	});
}
// save Login Session
function saveLoginSession()
{
	var sessionId = uuid.v4();
	var loginSessionDir = OS.tmpdir()+'/CustomerProvider/login/';
	if ( !fs.existsSync(loginSessionDir) )
	{
		fs.mkdir(loginSessionDir, {recursive: true}, (err) =>
		{
			if ( err )
			{
				console.error(err);
				return;
			}

			var data = {
				session: sessionId
			};
			fs.writeFile(loginSessionDir+'session.json', JSON.stringify(data), (err) =>
			{
				if ( err )
				{
					console.error(err);
					return;
				}
			});
		});
	}
}
// Setup ini settings
function setupDefaultIniSettings()
{
	if ( fs.existsSync(ROOTPATH.rootPath+'/settings.ini') )
		return;
		
	var fini = new IniFile(ROOTPATH.rootPath+'/');
	// UI_Settings
	settings = {
		DISPLAY_LANG: 'ar'
	};
	fini.writeSync('settings', settings, 'UI_Settings');
	// Server_Settings
	settings = {
		API_END_POINT: 'http://promagdz.com/api/Projects/ExpensesManagementAPI/',
		PROJECT_URL: 'http://promagdz.com/Projects/ExpensesManagementAPI/',
		PROJECT_DASHBOARD_URL: 'http://promagdz.com/Projects/ExpensesManagementAPI/dashboard/login'
	};
	fini.writeSync('settings', settings, 'Server_Settings');
}
// Read ini file
function loadIniSettings()
{
	var ini = new IniFile(ROOTPATH.rootPath+'/');
	return ini.readSync('settings');
}
// Load language
function loadLang()
{
	// Create default values in settings.ini
	setupDefaultIniSettings();
	//
	var settings = loadIniSettings();
	if ( settings )
	{
		if ( settings.UI_Settings == null )
			return;

		var lang = settings.UI_Settings.DISPLAY_LANG;
		var Translation = require(__dirname+'/assets/js/locale/'+lang);

		var trans = new Translation();
		UI_DISPLAY_LANG = trans.get();
		//UI_DISPLAY_LANG['lang'] = lang;
		// Set Lang variable object
		ejse.data('UI_DISPLAY_LANG', trans.get());
		// Save lang data in external file
		// Create dir if not exists
		var langDir = ROOTPATH.rootPath+'/locale/';
		if ( !fs.existsSync(langDir) )
			fs.mkdirSync(langDir, { recursive: true });

		// Create file
		if ( !fs.existsSync(langDir+'lang.json') )
			fs.writeFileSync(langDir+'lang.json', JSON.stringify(UI_DISPLAY_LANG));
		// send translation object
		//win.webContents.send('translation-file-created', UI_DISPLAY_LANG);
	}	
}
// Run CreateWindow func
app.whenReady().then(async () =>
{
	//CreateLoadingScreen().show();
	// Create ini file
	// save Login Session
	//saveLoginSession();
	//
	CreateWindow().webContents.on('did-finish-load', () => // Also 'ready-to-show'
	{
		
	})
});
// Quit when all windows closed
app.on('window-all-closed', () =>
{
	if ( process.platform !== 'darwin' )
	{
		app.quit();
	}
});
// auto updates events
ipcMain.on('quit-and-install-update', (e, arg) =>
{
	autoUpdater.quitAndInstall();
});
ipcMain.on('check-for-updates', (e, arg) =>
{
	// set auto download
	autoUpdater.autoDownload = true;
	// Check for updates
	if ( !isDev )
	{
		autoUpdater.checkForUpdates();
	}
});
ipcMain.on('check-for-updates-only', (e, arg) =>
{
	// set auto download
	autoUpdater.autoDownload = false;
	// Check for updates
	if ( !isDev )
	{
		autoUpdater.checkForUpdates();
	}
});
// Open dev tools
ipcMain.on('open-dev-console', (e, arg) =>
{
	devtools = new BrowserWindow();
	win.webContents.setDevToolsWebContents(devtools.webContents);
    win.webContents.openDevTools({ mode: 'detach' });
});
// Create new window
ipcMain.on('create-window', (e, arg) =>
{
	arg.options.devtools = true;
	let win = CreateWindow(arg.options);
	// auto updates
	setupAutoUpdater(win);
});
// Close window
ipcMain.on('close-window', (e, arg) =>
{
	for (var i = 0; i < WINDOWS.length; i++) 
	{
		var win = WINDOWS[i];
		if ( win.name == arg.name )
		{
			win.destroy();
			WINDOWS.splice(i,1);
			break;
		}
	}
});