window.$ = window.jQuery = require('jquery');
const fs = require('fs');
const ROOTPATH = require('electron-root-path');
const path = require('path');
const uuid = require('uuid');
const ipcIndexRenderer = require('electron').ipcRenderer;
const OS = require('os');
var QRCode = require('qrcode');
const date_time = require('date-and-time');
const IniFile = require(__dirname+'/assets/js/utils/IniFile.js');
const Calendar = require(__dirname+'/assets/js/include/Calendar');
const Chart = require(__dirname+'/assets/js/include/Chart.min');

var MAIN_CONTENT_CONTAINER =  $('#MainContentContainer');
var SIDE_NAV_CONTAINER = $('#sideNavbarContainer');
var TOP_NAV_BAR = $('#topNavbarContainer');
var MAIN_CONTENT_IFRAME = $('#MAIN_CONTENT_IFRAME');

var APP_NAME = 'Expense Management';
var API_END_POINT = '';
var PROJECT_URL = '';
var APP_ICON = 'assets/img/logo/logo.png';
var APP_ROOT_PATH = ROOTPATH.rootPath+'/';
var APP_DIR_NAME = __dirname+'/';

const CURRENCY = {
	ar: 'دج',
	fr: 'DA'
};

const SETTINGS_FILE = 'settings';
const DISPLAY_LANG_FILE = APP_ROOT_PATH+'locale/lang.json';

var FUI_DISPLAY_LANG = undefined;

var LOGIN_SESSION = undefined;
var LOGIN_SESSION_FILE = OS.tmpdir()+'/ExpenseManagement/login/session.json';

var USER_CONFIG = {};
var DEFAULT_INI_SETTINGS = null;

var GLOBALS_SCRIPT = null;

const TIME_NOW = new Date();
const CURRENT_DATE = date_time.format(TIME_NOW, 'YYYY-MM-DD');
const CURRENT_TIME = date_time.format(TIME_NOW, 'HH:mm:ss');

// status
const ST_YES = 2;
const ST_NO = 1;

let setupUserAuth;
let imageToDataURL;
let extractFileExtension;
let setOptionSelected;
let loadIniSettings;
let loadIniSettingsSync;
let setConnectionHostname;
let getConnectionHostname;
let saveUserConfig;
let deleteFile;
let reloadUserConfig;
let getUserConfig;
let isConfigExists;
let setContainersDisabled;
let randomRange;
let shuffleArray;
let loadFile;
let setUIDisplayLang;
let loadDisplayLanguage;
let CreateToast;
let parseCSV;
let parseXLSX;
let TopProgressBar;
let getLoginSession;
let setLoginSession;
let loadLoginSession;
let toggleCheck;
let TopLoader;
let toggleSimilarNavbarsLinks;
let generateQRCode;
let listenForBarcodeScanner;
let downloadFile;
let copyLinkToClipboard;
let recursiveCopyDirFilesSync;
let SectionLoader;
let PageLoader;
let trimNumber;
let formatMoney;
let translateMonthName;
let createWindow;
let closeWindow;
let inJSONArray;
let isImageFile;
let isPDFFile;
let draggableScroll;
let filenameSnippet;
let sendApiRequest;

let userLogin;

$(async function()
{

GLOBALS_SCRIPT = $('#GLOBALS_SCRIPT');
MAIN_CONTENT_IFRAME = $('#MAIN_CONTENT_IFRAME');

// DATABASE
userLogin = (RequestBody) =>
{
	var url = 'Users/login';

	return sendApiRequest(url, 'POST', RequestBody);
}
// END DATABASE

// send api request
sendApiRequest = (url, method, data) =>
{
	return new Promise((resolve, reject) =>
	{
		console.log(url);
		$.ajax({
			url: API_END_POINT+url,
			type: method,
			headers: {
				'Accept': 'application/json',
				'X-CSRF-TOKEN': uuid.v4()
			},
			processData: false,
			contentType: false,
			data: data,
			success: function(response, textStatus, xhr)
			{
				resolve(response);
				console.log(response);
			},
			error: function(xhr)
			{
				reject(xhr);
			}
		});
	});
}
// file Name Snippet
filenameSnippet = (filename, max = 20) =>
{
	if ( filename.length <= max )
		return filename;

	var ext = extractFileExtension(filename);
	var sub1 = filename.substr(0, 20)+'...';
	var sub2 = filename.substr(13, 6)+'.'+ext;

	return sub1+sub2;
}
// make scroll draggable
draggableScroll = (element) =>
{
	let pos = { 
		top: 0, 
		left: 0, 
		x: 0, 
		y: 0 
	};

	element.off('mousedown')
	.on('mousedown', mouseDownHandler);

	// mouse down handler
	function mouseDownHandler(e)
	{
		pos = {
	        // The current scroll
	        left: element[0].scrollLeft,
	        top: element[0].scrollTop,
	        // Get the current mouse position
	        x: e.clientX,
	        y: e.clientY
	    };

	    element.on('mousemove', mouseMoveHandler);
	    element.on('mouseup', mouseUpHandler);
	}
	// mouse move handler
	function mouseMoveHandler(e)
	{
		// How far the mouse has been moved
	    var dx = e.clientX - pos.x;
	    var dy = e.clientY - pos.y;

	    // Scroll the element
	    element[0].scrollTop = pos.top - dy;
	    element[0].scrollLeft = pos.left - dx;
	}
	// mouse up handler
	function mouseUpHandler(e)
	{
		// How far the mouse has been moved
	    var dx = e.clientX - pos.x;
	    var dy = e.clientY - pos.y;

	    // Scroll the element
	    element[0].scrollTop = pos.top - dy;
	    element[0].scrollLeft = pos.left - dx;

	    element.off('mousemove', mouseMoveHandler);
	    element.off('mouseup', mouseUpHandler);
	}
}
// is pdf file
isPDFFile = (url) =>
{
	var ext = ['pdf'];
	
	return ext.includes( extractFileExtension(url) );
}
// is image file
isImageFile = (url) =>
{
	var ext = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'];
	
	return ext.includes( extractFileExtension(url) );
}
// in JSON Array
inJSONArray = (json_arr, k, v) =>
{
	var isExists = false;
	for (var i = 0; i < json_arr.length; i++) 
	{
		var json = json_arr[i];
		console.log(json[k]);
		if ( json[k] == v )
		{
			isExists = true;
			break;
		}
	}

	return isExists;
}
// Test server connection
testServerConnection = () =>
{
	return new Promise((resolve, reject) =>
	{
		$.ajax({
			url: API_END_POINT+'ServerInfo',
			type: 'POST',
			success: function(response)
			{
				if ( response.code == 404 )
				{
					reject(response);
					return;
				}
				resolve(response);
			},
			error: function( jqXHR, textStatus, errorThrown)
			{
				if ( textStatus == 'error' )
				{
					reject({
						xhr: jqXHR,
						status: textStatus,
						error: errorThrown
					});
				}
			}
		});
	});
}
// close Window
closeWindow = (name) =>
{
	ipcIndexRenderer.send('close-window', {
		name: name
	});
}
// create window
createWindow = (options = null) =>
{
	ipcIndexRenderer.send('create-window', {
		options: options
	});
}
// translate Month Name
translateMonthName = (month) =>
{
	const AR_MONTHS = {
		january: 'جانفي',
		february: 'فيفري',
		march: 'مارس',
		april: 'افريل',
		may: 'ماي',
		june: 'جوان',
		july: 'جويلية',
		august: 'اوت',
		september: 'سبتمبر',
		october: 'اكتوبر',
		november: 'نوفمبر',
		december: 'ديسمبر'
	};
	const FR_MONTHS = {
		january: 'Janvier',
		february: 'Février',
		march: 'Mars',
		april: 'Avril',
		may: 'Mai',
		june: 'Juin',
		july: 'Juillet',
		august: 'Août',
		september: 'Septembre',
		october: 'Octobre',
		november: 'Novembre',
		december: 'Décembre'
	};

	if ( FUI_DISPLAY_LANG.lang == 'ar' )
		return AR_MONTHS[month.toLowerCase()];
	else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		return FR_MONTHS[month.toLowerCase()];
}
//trim currency Number
trimCurrencyNumber = (num, prefix = '+', currency = (FUI_DISPLAY_LANG.lang == 'ar') ? 'دج' : 'DA' ) =>
{
	if ( num >= 10000 )
		num = (num / 10000).toFixed(2) + prefix+' '+currency;

	return num;
}
// format money
formatMoney = (num) =>
{
	/*
	if ( FUI_DISPLAY_LANG.lang == 'ar' )
	{
		if ( num >= 10000000 )
			num = (num / 10000000).toFixed(2) + ' مليار ';
		else if ( num >= 10000 )
			num = (num / 10000).toFixed(2) + 'مليون ';
		else if ( num >= 1000 )
			num = (num / 1000).toFixed(2) + 'ألف ';	
	}
	else if ( FUI_DISPLAY_LANG.lang == 'fr' )
	{
		if ( num >= 10000000 )
			num = (num / 10000000).toFixed(2) + ' milliards';
		else if ( num >= 10000 )
			num = (num / 10000).toFixed(2) + ' millions';
		else if ( num >= 1000 )
			num = (num / 1000).toFixed(2) + ' mille';	
	}
	*/

	return parseFloat(num).toFixed(2);
}
//trim Number
trimNumber = (num, prefix = '+') =>
{
	if ( num >= 10000 )
		num = (num / 10000).toFixed(2) + prefix;
	else if ( num >= 1000 )
		num = (num / 1000).toFixed(2) + prefix;
	else if ( num >= 100 )
		num = (num / 100).toFixed(2) + prefix;

	return num;
}
// Page Loader
PageLoader = (visible = true) =>
{
	var PAGE_LOADER = $('#PAGE_LOADER');

	if ( visible )
		PAGE_LOADER.fadeIn(200);
	else
		PAGE_LOADER.fadeOut(200);
}
// Section Loader
SectionLoader = (parent,loader = 'loader-01') =>
{
	var loaderHTML = `<div class="loader-container" id="BlockLoaderqsdqsdqsd">
							<span class="${loader}"></span>
					</div>`;
	var loaderElement = parent.find('#BlockLoaderqsdqsdqsd');

	if ( loaderElement.length == 0 )
	{
		parent.addClass('position-relative');
		parent.append(loaderHTML);	
	}
	loaderElement = parent.find('#BlockLoaderqsdqsdqsd');
	if ( loader == '' )
		loaderElement.remove();
}
// recursive Copy Dir Files Sync
recursiveCopyDirFilesSync = (source, dest) =>
{
	var files = fs.readdirSync(source);
	//create dest dir
	if ( !fs.existsSync(dest) )
		fs.mkdirSync(dest, {recursive:true});

	files.forEach(file =>
	{
		var filename = source+file;
		var dest_filename = dest+file;
		if ( fs.lstatSync(filename).isFile() )
			fs.copyFileSync(filename, dest_filename);
	});
}
// Copy To Clipboard
copyLinkToClipboard = (element, val) =>
{
	var inputHTML = '<input type="text" id="copyToClipboardHiddenInput" style="display: none;">';
	var input = $(inputHTML).insertAfter(element);
	input = $('#copyToClipboardHiddenInput');
	input.val(val);
	input.focus();
	input.select();
	input[0].setSelectionRange(0, 99999);
	navigator.clipboard.writeText( input.val() );
	input.remove();
}
// download file
downloadFile = (url, filename, progressInfo, onComplete) =>
{
	var DOWNLOAD_START_TIME = undefined;
	var request = $.ajax({
		xhr: function() 
		{
		  var xhr = new XMLHttpRequest();
			xhr.responseType = 'blob';
			xhr.addEventListener('progress', (e) =>
			{
			    if (e.lengthComputable) 
		        {
		            var percentComplete = (e.loaded / e.total) * 100;
		            // Time Remaining
		            var seconds_elapsed = ( new Date().getTime() - DOWNLOAD_START_TIME ) / 1000;
		            bytes_per_second = e.loaded / seconds_elapsed;
		            //var bytes_per_second = seconds_elapsed ? e.loaded / seconds_elapsed : 0 ;
		            var timeleft = (new Date).getTime() - DOWNLOAD_START_TIME;
		            timeleft = e.total - e.loaded;
		            timeleft = timeleft / bytes_per_second;
		            // Upload speed
		            var Kbytes_per_second = bytes_per_second / 1024 ;
		            var transferSpeed = Math.floor(Kbytes_per_second);
		            progressInfo({e: e, timeleft: timeleft.toFixed(0), transferSpeed: transferSpeed, percent: percentComplete});
		        }
			}, false);
		   return xhr;
		},
		type: 'GET',
		url: url,
		async: true,
		cache: false,
		data: {},
		beforeSend: function(e)
		{
			// Set start time
			DOWNLOAD_START_TIME = new Date().getTime();
		},
		success: function(response)
		{
			var reader = new FileReader();
			reader.readAsArrayBuffer( response );
			reader.onload = () =>
		    {
		    	var buffer = Buffer.from(reader.result);
		    	fs.writeFile( filename, buffer, (err) => 
		    	{
		    		if ( err )
		    		{
		    			console.error(err);
		    			return;
		    		}

		    		if ( typeof onComplete == 'function' )
		    			onComplete(filename);
		    	});
		    };
		}
	});

	return request;
}
// Listen for barcode scanner
listenForBarcodeScanner = (CALLBACK) =>
{
	var scannedBarcode = '';
	var timer = undefined;
	$(window).off('keypress');
	$(window).on('keypress', e =>
	{
		scannedBarcode += e.key;
	    if (timer) 
	    {
	        clearTimeout(timer);
	    }

	    timer = setTimeout(() => 
	    {
	    	CALLBACK(scannedBarcode);
	        scannedBarcode = '';   
	    }, 500);
	});
}
// generate QRCode
generateQRCode = (data) =>
{
	return new Promise((resolve, reject) =>
	{
		QRCode.toDataURL(data,{ errorCorrectionLevel: 'H' }, (err, url) =>
		{
			if ( err )
			{
				reject(err);
				return;
			}
			resolve(url);
		});	
	});
}
// toggle Similar Navbars Links
toggleSimilarNavbarsLinks = (href) =>
{
	var sbLinks = SIDE_NAV_CONTAINER.find('[data-role="NAV_LINK"]');
	var tbLinks = TOP_NAV_BAR.find('[data-role="NAV_LINK"]');

	// toggle side bar links
	sbLinks.removeClass('active');
	for (var i = 0; i < sbLinks.length; i++) 
	{
		var link = $(sbLinks[i]);
		if ( link.attr('href') == href )
		{
			link.addClass('active');
			break;
		}
	}
	// toggle top bar links
	tbLinks.removeClass('active');
	for (var i = 0; i < tbLinks.length; i++) 
	{
		var link = $(tbLinks[i]);
		if ( link.attr('href') == href )
		{
			link.addClass('active');
			break;
		}
	}
}
// Top loader
TopLoader = (text, visible = true) =>
{
	var sideNavLoader = $('#topLoader');

	sideNavLoader.find('#text').text(text);
	if ( visible )
	{
		sideNavLoader.css('display', 'block');
	}
	else
	{
		sideNavLoader.css('display', 'none');
	}
}
// toggle checkbox checked
toggleCheck = (checkbox, isChecked = null) =>
{
	if ( isChecked != null )
	{
		checkbox.attr('checked', isChecked);
		return;
	}
	checkbox.attr('checked', !checkbox.prop('checked') );
}
// load Login Session
loadLoginSession = () =>
{
	if ( !fs.existsSync(LOGIN_SESSION_FILE) )
		return;

	fs.readFile(LOGIN_SESSION_FILE, (err, data) =>
	{
		setLoginSession(JSON.parse(data));
	});
}
// set Login Session
setLoginSession = (sessionObject) =>
{
	LOGIN_SESSION = sessionObject;
}
// get login session
getLoginSession = () =>
{
	return LOGIN_SESSION;
}
// top progress bar
TopProgressBar = (options) => 
{
	var topProgressBarContainer = $('#topProgressBarContainer');
	var closeBTN = topProgressBarContainer.find('#closeBTN');
	var titleElement = topProgressBarContainer.find('#titleElement');
	var versionElement = topProgressBarContainer.find('#versionElement');
	var progressElement = topProgressBarContainer.find('#progressElement');

	// display
	show();
	// set title
	titleElement.text(options.title);
	// set version
	versionElement.text(options.version);
	// set progress
	progressElement.find('.progress-bar').css('width', options.progress.percent.toFixed(0)+'%')
	.text(options.progress.percent.toFixed(2)+'%');
	
	if ( options.hideOnComplete == true )
		hide();
	// close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		forceHide();
	});
	// show
	function show()
	{
		if ( !topProgressBarContainer.hasClass('active') )
			topProgressBarContainer.addClass('active');
	}
	// hide
	function hide()
	{
		topProgressBarContainer.removeClass('active');
	}
	// Force Hide dialog
	function forceHide()
	{
		topProgressBarContainer.css('display', 'none');
	}
}
// parse xlsx
parseXLSX = (xlsxFile, CALLBACK) =>
{
	readXlsxFile(xlsxFile).then(data =>
	{
		CALLBACK(data);
	});
}
// parse csv
parseCSV = (csvFile, CALLBACK) =>
{
	var config = {
		download: false,
		encoding: 'utf-8',
		complete: function(results)
		{
			CALLBACK(results);
		},
		error: function(error)
		{
			if ( error )
			{
				console.log(error);
			}
		}
	};
	Papa.parse(csvFile, config);
}
// Unique id
uniqid = () =>
{
	return uuid.v4();
}
// Toast
CreateToast = (title = '', body = '', time = 'À présent', delay = 10000) =>
{
	var toastContainer = $('#toastContainer');

	// Create toast
	var tclass = uniqid();
	var toastHTML = `<div class="${tclass} toast" role="alert" aria-live="polite" aria-atomic="true" data-delay="${delay}">
						<div class="toast-header">
							<img src="assets/img/utils/notify.png" style="width: 15px; height:15px;" class="rounded me-2" alt="...">
							<strong class="me-auto">${title}</strong>
							<small class="text-muted">${time}</small>
							<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
						</div>
						<div class="toast-body" style="font-weight: 300;">
							${body}
						</div>
					</div>`;
	toastContainer.append(toastHTML);
	// Get list of toasts
	var toastEl = toastContainer.find('.'+tclass)[0];
	var toast = new bootstrap.Toast(toastEl, 'show');
	// Delete all toasts when finished hiding
	//for (var i = 0; i < toastList.length; i++) 
	//{
		//var toast = toastList[i];
		//toast._config.autohide = false;
		toast._config.delay = $(toast._element).data('delay');
		toast.show();
		toast._element.addEventListener('hidden.bs.toast', () =>
		{
			$(toast._element).remove();
		});
		setTimeout(() => { $(toast._element).remove(); }, toast._config.delay);
	//}
}
// set ui display lang
setUIDisplayLang = (lang) =>
{
	// delete lang file
	fs.unlinkSync(DISPLAY_LANG_FILE);
	var fini = new IniFile(APP_ROOT_PATH);

	var UI_Settings = {
		DISPLAY_LANG: lang
	};

	return fini.write(SETTINGS_FILE, UI_Settings, 'UI_Settings');
}
// Load display language
loadDisplayLanguage = () =>
{
	
	if ( fs.existsSync(DISPLAY_LANG_FILE) )
	{
		var data = fs.readFileSync(DISPLAY_LANG_FILE).toString('utf-8');
		FUI_DISPLAY_LANG = JSON.parse(data);
	}
	
	/*
	return new Promise(resolve =>
	{
		ipcIndexRenderer.removeAllListeners('translation-file-created');
		ipcIndexRenderer.on('translation-file-created', (e,info) =>
		{
			FUI_DISPLAY_LANG = info;
			resolve(info);
		});	
	});	
	*/
}
// load file
loadFile = (filepath, CALLBACK) =>
{
	if ( !fs.existsSync(filepath) )
		return '';

	fs.readFile(filepath, 'utf8', (error, data) =>
	{
		if ( error )
		{
			console.log(error);
			return;
		}
		CALLBACK(data);
	});
}
// Print file to pdf
printFileToPdf = (filepath = '', textDir = 'rtr') =>
{
	loadFile(filepath, filedata =>
	{
		var printWindow = window.open('', '', `width=${ $(window).width() }, height=${ $(window).height() }`);
	    // open the window
	    printWindow.document.open();
	    var domHTML = document.head.outerHTML;
	    domHTML+= `<body style="padding: 1em 2em;" dir="${textDir}">${filedata}</body>`;
		printWindow.document.write( domHTML );
		var winDomElement = $(printWindow.document);
		printWindow.document.close();
		printWindow.focus();
		printWindow.onload = (event) => 
		{
		  	printWindow.print();
	        printWindow.close();
		};
		/*
		setTimeout(function() {
	        printWindow.print();
	        printWindow.close();
	    }, 2000);
	    */
	})
	
}
// Print to pdf
printHTMLToPdf = (printableElement = '', textDir = 'ltr') =>
{
	var printWindow = window.open('', '', `width=${ $(window).width() }, height=${ $(window).height() }`);
	// open the window
	printWindow.document.open();
	var domHTML = document.head.outerHTML;
	domHTML+= `<body style="padding: 1em 2em;" dir="${textDir}">${printableElement}</body>`;
	printWindow.document.write( domHTML );
	var winDomElement = $(printWindow.document);
	printWindow.document.close();
	printWindow.focus();
	printWindow.onload = (event) => 
	{
	  	printWindow.print();
        printWindow.close();
	};
	/*
	setTimeout(function() {
        printWindow.print();
        printWindow.close();
    }, 2000);
    */
}
shuffleArray = (array) => 
{
  return array.sort(() => Math.random() - 0.5);
}
// Random range
randomRange = (min, max) => 
{ 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// Set containers disabled
setContainersDisabled = (disabled = false) =>
{
	if ( disabled )
	{
		MAIN_CONTENT_CONTAINER.addClass('disabled');
		SIDE_NAV_CONTAINER.addClass('disabled');
		TOP_NAV_BAR.addClass('disabled');
	}
	else
	{
		MAIN_CONTENT_CONTAINER.removeClass('disabled');
		SIDE_NAV_CONTAINER.removeClass('disabled');
		TOP_NAV_BAR.removeClass('disabled');
	}
}
//Save user data
saveUserConfig = (json, CALLBACK) =>
{
	data = JSON.stringify(json);
	fs.writeFile(ROOTPATH.rootPath+'/config.json', data, (error) => 
	{
		if ( typeof CALLBACK == 'function' )
			CALLBACK(error);

		// reload User Config
		reloadUserConfig();
	});
}
// Delete file
deleteFile = (file, CALLBACK) =>
{
	if (fs.existsSync(file)) 
	{
		fs.unlink(file, (error) =>
		{
			CALLBACK(error);
		});
  	}
}
// reload user config
reloadUserConfig = () =>
{
	USER_CONFIG = getUserConfig();
}
// Get user data
getUserConfig = () =>
{
	if ( !isConfigExists() )
		return null;
	config = fs.readFileSync(APP_ROOT_PATH+'config.json', 'utf-8');
	json = JSON.parse(config);
	return json;
}
// Check config file exists
isConfigExists = () =>
{
	exists = false;
	if ( fs.existsSync(APP_ROOT_PATH+'config.json') )
		exists = true;

	return exists;
}
// Get connection hostname
getConnectionHostname = () =>
{
	var settings = loadIniSettingsSync();

	if ( !settings )
		return 'localhost';

	if ( settings.Server_Settings == null )
		return 'localhost';

	return settings.Server_Settings.HOSTNAME;

}
// Set connection hostname
setConnectionHostname = (hostname) =>
{
	var fini = new IniFile(APP_ROOT_PATH);

	var Server_Settings = {
		HOSTNAME: $.trim(hostname)
	};

	fini.writeSync(SETTINGS_FILE, Server_Settings, 'Server_Settings');
	setupAPISettings();
}
// Load ini settings
loadIniSettings = (CALLBACK) =>
{
	var fini = new IniFile(APP_ROOT_PATH);
	fini.read(SETTINGS_FILE).then(data =>
	{
		CALLBACK(data);
	});
}
// Load ini settings sync
loadIniSettingsSync = () =>
{
	var fini = new IniFile(APP_ROOT_PATH);
	DEFAULT_INI_SETTINGS = fini.readSync(SETTINGS_FILE);
	return DEFAULT_INI_SETTINGS;
}
// Set setect option selected
setOptionSelected = (selectElement, val, triggerEvent = false) =>
{
	selectElement.find('option').each((k, v) =>
	{
		var option = $(v);
		// Remove selection
		option.removeAttr('selected', '');
		if ( val == option.val() )
		{
			option.attr('selected', 'selected');
			return;
		}
	});
	// Trigger event
	if (triggerEvent)
		selectElement.trigger('change');
}
// Extract file extension
extractFileExtension = (filename) =>
{
	return path.extname(filename).replace('.', '');
}
// Image to data url
imageToDataURL = (File) =>
{
	return new Promise((resolve, reject) =>
	{
		var reader = new FileReader();

		reader.onload = () =>
		{
			resolve( reader.result );
		};

		if ( File == null )
		{
			reject('Image File is not specified');
			return;
		}

		reader.readAsDataURL(File);
	});
}

// display loader
//PageLoader();
// Call globally
loadDisplayLanguage();

//loadLoginSession();
reloadUserConfig();
// load ini settings
loadIniSettingsSync();
API_END_POINT = DEFAULT_INI_SETTINGS.Server_Settings.API_END_POINT;
PROJECT_URL = DEFAULT_INI_SETTINGS.Server_Settings.PROJECT_URL;

/*
// add dynamic scripts
var index_js = '<script type="text/javascript" src="assets/js/index.js"></script>';
var dialogs_js = '<script type="text/javascript" src="../assets/js/include/Dialogs.js"></script>';
var functions_js = '<script type="text/javascript" src="assets/js/include/Functions.js">';
var classes_js = '<script type="text/javascript" src="../assets/js/include/Classes.js"></script>';
var pagination_js = '<script type="text/javascript" id="PAGINATION" src="../assets/js/pagination_ar.js"></script>';
var bootstrap_js = '<script type="text/javascript" src="../assets/js/bootstrap.min.js"></script>';
var popper_js = '<script type="text/javascript" src="../assets/js/popper.min.js"></script>';

if ( isConfigExists() )
{
	//$(index_js).insertAfter(GLOBALS_SCRIPT);
	//$(dialogs_js).insertAfter(GLOBALS_SCRIPT);
	//$(functions_js).insertAfter(GLOBALS_SCRIPT);
	//$(classes_js).insertAfter(GLOBALS_SCRIPT);
	//$(pagination_js).insertAfter(GLOBALS_SCRIPT);
	//$(bootstrap_js).insertAfter(GLOBALS_SCRIPT);
	//$(popper_js).insertAfter(GLOBALS_SCRIPT);	
}
*/

});
