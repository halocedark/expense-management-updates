let DialogBox;
let PromptInputDialog;
let PromptConfirmDialog;
let PreviewFileDialog;

$(function()
{

// Preview File Dialog
PreviewFileDialog = (options) =>
{
	var previewFileDialog = $('#previewFileDialog');
	var closeBTN = previewFileDialog.find('#closeBTN');

	var bodyDiv = previewFileDialog.find('#bodyDiv');

	show();
	// check file type
	if ( isImageFile(options.url) )
	{
		bodyDiv.html(`<img src="${options.url}" class="img-fluid" alt="">`);
	}

	if ( isPDFFile(options.url) )
	{
		bodyDiv.html(`<iframe src="${options.url}" class="iframe-fit" frameborder="0" scrolling="true"></iframe>`);
	}
	draggableScroll(bodyDiv);
	// close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		hide();
	});
	//
	function show()
	{
		previewFileDialog.addClass('active');
	}
	function hide()
	{
		previewFileDialog.removeClass('active');
	}
}
// Dialog Box
DialogBox = (title = '', html) =>
{
	var modalDialogBoxTogglerBTN = $('#modalDialogBoxTogglerBTN');
	var modalDialogBox = $('#modalDialogBox');
	var mbdTitle = modalDialogBox.find('#mbdTitle');
	var mdbBody = modalDialogBox.find('#mdbBody');
	// Display
	modalDialogBoxTogglerBTN.trigger('click');
	// Set Title
	mbdTitle.html(title);
	// Set HTML
	mdbBody.html(html);
	// change text direction
	if ( FUI_DISPLAY_LANG.lang == 'fr' )
	{
		mdbBody.closest('.modal').removeClass('text-align-r');
	}
}
// Prompt Input dialog
PromptInputDialog = (title, placeholder = 'Enter text here...') =>
{
	var promptDialogContainer = $('#promptInputDialog');
	var promptDialogTitle = promptDialogContainer.find('.block-title');
	var promptDialogCloseBTN = promptDialogContainer.find('#closeBTN');
	var promptDialogTextInput = promptDialogContainer.find('#promptDialogTextInput');
	var promptDialogOK = promptDialogContainer.find('#okBTN');
	var promptDialogCancel = promptDialogContainer.find('#cancelBTN');

	// change text direction
	if ( FUI_DISPLAY_LANG.lang == 'fr' )
	{
		promptDialogContainer.removeClass('text-align-r');
	}
	var promise = new Promise((resolve, reject) =>
	{
		// Display dialog
		show();
		// Set title
		promptDialogTitle.text(title);
		// Set input placeholder
		promptDialogTextInput.attr('placeholder', placeholder);
		//CLose dialog
		promptDialogCloseBTN.off('click');
		promptDialogCloseBTN.on('click', e =>
		{
			e.preventDefault();
			close();
		});

		// Click OK
		promptDialogOK.off('click');
		promptDialogOK.on('click', () =>
		{
			// Close dialog
			close();
			resolve(promptDialogTextInput.val());
		});	
		// Click CANCEL
		promptDialogCancel.off('click');
		promptDialogCancel.on('click', () =>
		{
			// Close dialog
			close();
			reject(null);
		});
	});

	// Display dialog
	function show()
	{
		promptDialogContainer.addClass('active');
	}
	// Close dialog
	function close()
	{
		promptDialogContainer.removeClass('active');
	}

	return promise;
}
// Prompt confirm dialog
PromptConfirmDialog = (title = '', html = '') =>
{
	var promptDialogContainer = $('#promptConfirmDialog');
	var promptDialogTitle = promptDialogContainer.find('.block-title');
	var promptDialogCloseBTN = promptDialogContainer.find('#closeBTN');
	var promptDialogBody = promptDialogContainer.find('.block-body');
	var promptDialogOK = promptDialogContainer.find('#okBTN');
	var promptDialogCancel = promptDialogContainer.find('#cancelBTN');

	// change text direction
	if ( FUI_DISPLAY_LANG.lang == 'fr' )
	{
		promptDialogContainer.removeClass('text-align-r');
	}
	if ( title.length == 0 )
	{
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			title = "تأكيد العمل";
		if ( FUI_DISPLAY_LANG.lang == 'fr' )
			title = "Confirmer";
	}

	if ( html.length == 0 )
	{
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			html = "هل أنت متأكد؟";
		if ( FUI_DISPLAY_LANG.lang == 'fr' )
			html = "Êtes-vous sûr?";
	}
	var promise = new Promise((resolve, reject) =>
	{
		// Display dialog
		show();
		// Set title
		promptDialogTitle.text(title);
		// Set body html
		promptDialogBody.html(html);
		//CLose dialog
		promptDialogCloseBTN.off('click');
		promptDialogCloseBTN.on('click', e =>
		{
			e.preventDefault();
			close();
		});

		// Click OK
		promptDialogOK.off('click');
		promptDialogOK.on('click', () =>
		{
			// Close dialog
			close();
			resolve(true);
		});	
		// Click CANCEL
		promptDialogCancel.off('click');
		promptDialogCancel.on('click', () =>
		{
			// Close dialog
			close();
			reject(false);
		});
	});

	// Display dialog
	function show()
	{
		promptDialogContainer.addClass('active');
	}
	// Close dialog
	function close()
	{
		promptDialogContainer.removeClass('active');
	}

	return promise;
}


});
