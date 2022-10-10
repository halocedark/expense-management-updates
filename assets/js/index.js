$(function()
{

// Setup app updates
function setupAppUpdates()
{
	var title = '';
	if ( FUI_DISPLAY_LANG.lang == 'ar' )
		title = 'تنزيل التحديثات...';
	else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		title = 'Télécharger les mises à jour...';
	var options =
	{
		title: title,
		version: '',
		progress: {
			percent: 12,
		}
	};
	//TopProgressBar(options);
	// check for updates
	ipcIndexRenderer.send('check-for-updates', '');
	//
	ipcIndexRenderer.on('update-about-to-download', (e, info) =>
	{
		console.log(info);
	});
	ipcIndexRenderer.on('checking-for-update', (e, info) =>
	{
		// Translate
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			// Display loader
			TopLoader('البحث عن تحديثات...');
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			// Display loader
			TopLoader("Vérification des mises à jour...");
		}
	});
	ipcIndexRenderer.on('update-available', (e, info) =>
	{
		// Hide loader
		TopLoader('', false);
		options.version = 'v'+info.version;
		console.log(info);
		// translate
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			CreateToast("اشعار", `تم العثور على اصدار جديد: ${options.version}`, 'الآن', 20000);
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			CreateToast("Notification", `Nouvelle version trouvée: ${options.version}`, "à l'heure actuelle", 20000);
		}
	});
	ipcIndexRenderer.on('update-not-available', (e, info) =>
	{
		// Hide loader
		TopLoader('', false);
		console.log(info);
	});
	ipcIndexRenderer.on('update-error', (e, info) =>
	{
		// Hide loader
		TopLoader('', false);
		console.log(info);
	});
	ipcIndexRenderer.on('update-downloaded', (e, info) =>
	{
		// Translate
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			PromptConfirmDialog('تأكيد', 'تم تنزيل التحديثات ، هل تريد التثبيت؟')
			.then(confirmed =>
			{
				ipcIndexRenderer.send('quit-and-install-update', info);
			});
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			PromptConfirmDialog("Confirmer", "Mises à jour téléchargées, souhaitez-vous les installer ?")
			.then(confirmed =>
			{
				ipcIndexRenderer.send('quit-and-install-update', info);
			});
		}
		console.log(info);
	});
	ipcIndexRenderer.on('download-update-progress', (e, info) =>
	{
		// Display update dialog
		options.progress.percent = info.percent;
		//options.total = info.total;
		//options.transferred = info.transferred;
		//options.bytesPerSecond = info.bytesPerSecond;
		TopProgressBar(options);
	});
}
// setup user auth
function setupUserAuth()
{
	var userAuthContainer = $('#userAuthContainer');
	if ( userAuthContainer[0] == undefined )
		return;

	var ERROR_BOX = userAuthContainer.find('#ERROR_BOX');

	var signupWrapper = userAuthContainer.find('#signupWrapper');
	var signupForm = signupWrapper.find('#signupForm');
	var switchToSigninForm = signupForm.find('#switchToSigninForm');

	var loginFormTypeSelect = userAuthContainer.find('#loginFormTypeSelect');

	var signinWrapper = userAuthContainer.find('#signinWrapper');
	var GENERAL_LOGIN_FORM = signinWrapper.find('#GENERAL_LOGIN_FORM');

	// go to signin
	switchToSigninForm.off('click');
	switchToSigninForm.on('click', e =>
	{
		e.preventDefault();
		signinWrapper.slideDown(200);
		signupWrapper.slideUp(200);
	});
	// sign up
	signupForm.off('submit');
	signupForm.on('submit', e =>
	{
		e.preventDefault();
		var target = signupForm;
		
	});
	// GENERAL_LOGIN_FORM submit
	GENERAL_LOGIN_FORM.off('submit');
	GENERAL_LOGIN_FORM.on('submit', e =>
	{
		e.preventDefault();
		target = GENERAL_LOGIN_FORM;
		var loginType = loginFormTypeSelect.find(':selected').val();
		var RequestBody = new FormData(target[0]);
		RequestBody.append('username', target.find('#sfUsername').val().trim());
		RequestBody.append('password', target.find('#sfPassword').val().trim());

		// translate
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("تسجيل الدخول ، برجاء الانتظار ...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("Connectez-vous, veuillez patienter...");
		userLogin( RequestBody )
		.then(response =>
		{
			// hide loader
			TopLoader('', false);

			var data = response.data;
			
			
		}, error =>
		{
			console.log(error);
		});	
	});
}
// setup iframe contents
function setupMainIframe()
{
	//DEFAULT_INI_SETTINGS.Server_Settings.PROJECT_DASHBOARD_URL;
	//console.log(MAIN_CONTENT_IFRAME);
	MAIN_CONTENT_IFRAME.attr('src', DEFAULT_INI_SETTINGS.Server_Settings.PROJECT_DASHBOARD_URL);
	SectionLoader(MAIN_CONTENT_CONTAINER, 'loader-02');
	MAIN_CONTENT_IFRAME.off('load');
	MAIN_CONTENT_IFRAME.on('load', e =>
	{
		SectionLoader(MAIN_CONTENT_CONTAINER, '');
	});
}
/*
// replace with files that has proper interface
if ( FUI_DISPLAY_LANG.lang == 'ar' )
{
	// change style sheet
	$('head').append('<link rel="stylesheet" type="text/css" class="MAIN_STYLESHEET" href="assets/css/main_rtl.css">');
	setTimeout(() => {
		$($('.MAIN_STYLESHEET')[0]).remove();
	}, 0);
}
else if ( FUI_DISPLAY_LANG.lang == 'fr' )
{
	// change style sheet
	$('head').append('<link rel="stylesheet" type="text/css" class="MAIN_STYLESHEET" href="assets/css/main_ltr.css">');
	setTimeout(() => {
		$($('.MAIN_STYLESHEET')[0]).remove();
	}, 0);
}
setupUserAuth();
*/
// hide loader
//PageLoader(false);
// setup auto updates
setupAppUpdates();
setupMainIframe();

})


