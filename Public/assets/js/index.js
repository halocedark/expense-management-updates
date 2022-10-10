$(function()
{

// Setup auto checker
function setupAutoChecker()
{
	// messages 
	var MESSAGES_BADGE = SIDE_NAV_CONTAINER.find('#MESSAGES_BADGE');
	var ORDERS_BADGE = SIDE_NAV_CONTAINER.find('#ORDERS_BADGE');
	var delay = 20;
	var interval = setInterval(async () => 
	{
		var totalMsg = 0;
		/*
		// server connection
		var conn_response = null;
		try
		{
			conn_response = await testServerConnection();
			API_END_POINT = DEFAULT_INI_SETTINGS.Server_Settings.API_END_POINT;
			PROJECT_URL = DEFAULT_INI_SETTINGS.Server_Settings.PROJECT_URL;
		}
		catch (e)
		{
			//API_END_POINT = DEFAULT_INI_SETTINGS.Server_Settings.API_END_POINT_LOCAL;
			//PROJECT_URL = DEFAULT_INI_SETTINGS.Server_Settings.PROJECT_URL_LOCAL;
		}
		*/
		// messages private
		listMessagesInbox({
			userHash: USER_CONFIG.employee_hash,
			isRead: 0
		}).then(response =>
		{
			MESSAGES_BADGE.text('0');
			if (response.code == 404)
				return;

			totalMsg += response.data.length;
			MESSAGES_BADGE.text( trimNumber(totalMsg) );
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				CreateToast("اشعار", "لديك رسائل خاصة", "الآن");
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				CreateToast("notification", "Vous avez des messages privés", "maintenant");
			}
		});
		// list replies
		listMessageReplies2({
			userHash: USER_CONFIG.employee_hash,
			folder: 'inbox',
			isNotified: ST_NO
		}).then(response =>
		{
			if (response.code == 404)
				return;

			totalMsg += response.data.length;
			MESSAGES_BADGE.text( trimNumber(totalMsg) );
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				CreateToast("اشعار", "لديك ردود جديدة على رسائلك", "الآن");
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				CreateToast("notification", "Vous avez de nouvelles réponses à vos messages", "maintenant");
			}
		});

	}, delay * 1000);
}
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
			percent: 0,
		}
	};
	// remove listeners
	ipcIndexRenderer.removeAllListeners('update-about-to-download');
	ipcIndexRenderer.removeAllListeners('checking-for-update');
	ipcIndexRenderer.removeAllListeners('update-available');
	ipcIndexRenderer.removeAllListeners('update-not-available');
	ipcIndexRenderer.removeAllListeners('update-error');
	ipcIndexRenderer.removeAllListeners('update-downloaded');
	ipcIndexRenderer.removeAllListeners('download-update-progress');
	// check for updates only
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
// setup Top Navbar
function setupTopNavbar()
{
	var toggleSideBarBTN = TOP_NAV_BAR.find('#toggleSideBarBTN');
	var topbarNavMenu = TOP_NAV_BAR.find('#topbarNavMenu');

	// toggle side bar
	toggleSideBarBTN.off('click');
	toggleSideBarBTN.on('click', e =>
	{
		SIDE_NAV_CONTAINER.toggleClass('hidden');
		MAIN_CONTENT_CONTAINER.toggleClass('maximized');
		TOP_NAV_BAR.toggleClass('maximized');
	});
	// Click on nav
	topbarNavMenu.off('click');
	topbarNavMenu.on('click', e =>
	{
		e.preventDefault();
		var target = $(e.target);
		if ( target.data('role') == 'NAV_LINK' )
		{
			var href = target.attr('href');

			var page = APP_DIR_NAME+href;
			if ( href.length == 0 || href == '#' )
				return;

			getPage(page).then(response =>
			{
				MAIN_CONTENT_CONTAINER.html(response);
				// Re assign events
				rebindEvents();
				// Set navlink active
				//nbNavMenu.find('[data-role="NAV_LINK"]').removeClass('active');
				//target.addClass('active');
				toggleSimilarNavbarsLinks(href);
			});
		}
		else if ( target.data('role') == 'LOGOUT_NAV_LINK' )
		{
			PromptConfirmDialog().then(c =>
			{
				deleteFile(APP_ROOT_PATH+'config.json', () =>
				{
					createWindow('WIN_LOGIN', {
						page: 'index.ejs',
						name: 'WIN_LOGIN'
					});
					// close current window
					closeWindow('WIN_'+USER_CONFIG.LOGIN_TYPE);
				});	
			});
		}
		else if ( target.data('role') == 'CHECK_FOR_UPDATES_NAV_LINK' )
		{
			// translate
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				PromptConfirmDialog('تأكيد العمل', 'هل انت متأكد؟ سيبدأ التحميل مباشرة عند ايجاد اصدار جديد.').then(c =>
				{
					ipcIndexRenderer.send('check-for-updates', '');
				});
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				PromptConfirmDialog("Confirmer l'action", "Êtes-vous sûr? Le téléchargement commencera immédiatement lorsqu'une nouvelle version sera trouvée.").then(c =>
				{
					ipcIndexRenderer.send('check-for-updates', '');
				});
			}
		}
		else
			return;
	});
}
// Setup navbar
function setupNavbar()
{
	var nbNavMenu = SIDE_NAV_CONTAINER.find('#nbNavMenu');
	var EMPLOYEE_NAME = SIDE_NAV_CONTAINER.find('#EMPLOYEE_NAME');
	var EMPLOYEE_TYPE = SIDE_NAV_CONTAINER.find('#EMPLOYEE_TYPE');

	EMPLOYEE_NAME.text(USER_CONFIG.employee_name);
	if ( FUI_DISPLAY_LANG.lang == 'ar' )
		EMPLOYEE_TYPE.text(USER_CONFIG.type.employee_type_name_ar);
	else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		EMPLOYEE_TYPE.text(USER_CONFIG.type.employee_type_name_fr);
	// Click on nav
	nbNavMenu.off('click');
	nbNavMenu.on('click', e =>
	{
		e.preventDefault();
		var target = $(e.target);
		if ( target.data('role') == 'NAV_LINK' )
		{
			var href = target.attr('href');

			var page = APP_DIR_NAME+href;
			if ( href.length == 0 || href == '#' )
				return;

			getPage(page).then(response =>
			{
				MAIN_CONTENT_CONTAINER.html(response);
				// Re assign events
				rebindEvents();
				// Set navlink active
				//nbNavMenu.find('[data-role="NAV_LINK"]').removeClass('active');
				//target.addClass('active');
				toggleSimilarNavbarsLinks(href);
				var parent = target.closest('.list-dropdown-toggle');
				if ( parent[0] != undefined )
				{
					if ( parent[0].nodeName == 'LI' )
					{
						$(parent.find('[data-role="NAV_LINK"]')[0]).addClass('active');
					}
				}
			});
		}
		else if ( target.data('role') == 'LOGOUT_NAV_LINK' )
		{
			PromptConfirmDialog().then(c =>
			{
				deleteFile(APP_ROOT_PATH+'config.json', () =>
				{
					createWindow('WIN_LOGIN', {
						page: 'index.ejs',
						name: 'WIN_LOGIN'
					});
					// close current window
					closeWindow('WIN_'+USER_CONFIG.LOGIN_TYPE);
				});	
			});
		}
		else if ( target.data('role') == 'CHECK_FOR_UPDATES_NAV_LINK' )
		{
			// translate
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				PromptConfirmDialog('تأكيد العمل', 'هل انت متأكد؟ سيبدأ التحميل مباشرة عند ايجاد اصدار جديد.').then(c =>
				{
					ipcIndexRenderer.send('check-for-updates', '');
				});
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				PromptConfirmDialog("Confirmer l'action", "Êtes-vous sûr? Le téléchargement commencera immédiatement lorsqu'une nouvelle version sera trouvée.").then(c =>
				{
					ipcIndexRenderer.send('check-for-updates', '');
				});
			}
		}
		else
			return;
	});
}
// setup stats
async function setupStatistics()
{
	var statisticsContainer = $('#statisticsContainer');
	if ( statisticsContainer[0] == undefined )
		return;

	var ERROR_BOX = statisticsContainer.find('#ERROR_BOX');

	var searchClinicsInput = statisticsContainer.find('#searchClinicsInput');
	var searchBTN = statisticsContainer.find('#searchBTN');
	var clinicSelect = statisticsContainer.find('#clinicSelect');
	var dateInput = statisticsContainer.find('#dateInput');

	var now = new Date();
	dateInput.val( date_time.format(now, 'YYYY-MM-DD') );

	var treasuryStat = statisticsContainer.find('#treasuryStat');
	var patientsStat = statisticsContainer.find('#patientsStat');
	var appointmentsStat = statisticsContainer.find('#appointmentsStat');
	var productsStat = statisticsContainer.find('#productsStat');
	var ordersStat = statisticsContainer.find('#ordersStat');
	var prescsStat = statisticsContainer.find('#prescsStat');

	var allStats1 = statisticsContainer.find('#allStats1');

	var chartEl01 = statisticsContainer.find('#chartEl01');
	var chartEl02 = statisticsContainer.find('#chartEl02');
	var chartEl03 = statisticsContainer.find('#chartEl03');

	let chart01 = null;
	let chart02 = null;
	let chart03 = null;
	// init calendar
	new Calendar({
	    id: '#calendarDiv',
	    calendarSize: 'small',
	    theme: 'basic',
	    disableMonthYearPickers: true,
	    disableDayClick: true,
	    disableMonthArrowClick: true
	});

	var promise01 = null;
	// search clinics
	searchClinicsInput.off('keyup');
	searchClinicsInput.on('keyup', e =>
	{
		var query = searchClinicsInput.val();
		// display loader
		SectionLoader(searchClinicsInput.closest('.section'));
		promise01 = searchClinics(query);
		promise01.then(response =>
		{
			// hide loader
			SectionLoader(searchClinicsInput.closest('.section'), '');
			// clear html
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				clinicSelect.html('<option value="NONE">حدد العيادة</option>');
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				clinicSelect.html('<option value="NONE">Sélectionnez la clinique</option>');
			
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
			});
			clinicSelect.append(html);
		});
	});
	searchClinicsInput.trigger('keyup');
	// 
	searchBTN.off('click');
	searchBTN.on('click', e =>
	{
		searchClinicsInput.trigger('keyup');
	});
	// wait for promise
	await Promise.allSettled([promise01]);
	// select click
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayStats();
	});
	// select date
	dateInput.off('change');
	dateInput.on('change', e =>
	{
		displayStats();
	});
	// function display stats
	displayStats();
	async function displayStats()
	{
		allStats1.html('');
		// check if a clinic is selected
		if ( clinicSelect.find(':selected').val() == 'NONE' )
			return;
		// display loaders
		SectionLoader(treasuryStat);
		SectionLoader(patientsStat);
		SectionLoader(appointmentsStat);
		SectionLoader(productsStat);
		SectionLoader(productsStat);
		SectionLoader(ordersStat);
		SectionLoader(prescsStat);
		// treasury
		var treasury = await listAllTreasuryInfoLocal({
			clinicId: clinicSelect.find(':selected').val(),
			date: dateInput.val()
		});
		// hide loader
		SectionLoader(treasuryStat, '');
		if ( treasury.code == 200 )
		{
			var data = treasury.data;
			var expenses_bydate = data.expenses.bydate;
			var currency = (FUI_DISPLAY_LANG.lang == 'ar') ? CURRENCY.ar : CURRENCY.fr;
			var statAmountHTML = `${formatMoney(parseFloat(data.treasury_amount))}
							<span class="currency">${currency}</span>`;
			treasuryStat.find('#statAmount').html(statAmountHTML);
			treasuryStat.find('#statAmountTooltip').text( data.treasury_amount );

			treasuryStat.find('#statAmount1').text( formatMoney( parseFloat(expenses_bydate.in) )+' '+currency );
			treasuryStat.find('#statAmountTooltip1').text( expenses_bydate.in );	
			treasuryStat.find('#statAmount2').text( formatMoney( parseFloat(expenses_bydate.out) )+' '+currency );
			treasuryStat.find('#statAmountTooltip2').text( expenses_bydate.out );		
			
		}

		// patients
		var patients = await listPatientsLocal({
			clinicId: clinicSelect.find(':selected').val(),
			date: dateInput.val()
		});
		var patCMonthRate = 0;
		// hide loader
		SectionLoader(patientsStat, '');
		if ( patients.code == 200 )
		{
			var data = patients.data;
			var current = (data.today) ? data.today.length : 0;
			var prior = (data.yesterday) ? data.yesterday.length : 0;
			var total = (data.all) ? data.all.length : 0;
			var bydate = data.bydate;
			var inRate = current - (total - current);
			inRate = (inRate / total) * 100;
			var outRate = (total - prior) - prior;
			outRate = (outRate / total) * 100;
			
			if ( current == 0 )
				inRate = 0.00;
			if ( prior == 0 )
				outRate = 0.00;
			patCMonthRate = inRate;

			patientsStat.find('#statAmount1').text( trimNumber(total) );
			patientsStat.find('#statAmountTooltip1').text( total );	
			patientsStat.find('#statAmount2').text( trimNumber(bydate.length) );
			patientsStat.find('#statAmountTooltip2').text( bydate.length );	

			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${total})</span>
								<span class="text-03">مرضى</span>
							</div>`);
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${total})</span>
								<span class="text-03">malade</span>
							</div>`);
			}
		}

		// apts
		var apts = await listAppointementsLocal({
			clinicId: clinicSelect.find(':selected').val(),
			date: dateInput.val()
		});
		var aptCMonthRate = 0;
		// hide loader
		SectionLoader(appointmentsStat, '');
		if ( apts.code == 200 )
		{
			var data = apts.data;
			var current = (data.today) ? data.today.length : 0;
			var prior = (data.yesterday) ? data.yesterday.length : 0;
			var total = (data.all) ? data.all.length : 0;

			var followup = data.followup;
			var general = data.general;

			var inRate = current - (total - current);
			inRate = (inRate / total) * 100;
			var outRate = (total - prior) - prior;
			outRate = (outRate / total) * 100;
			
			if ( current == 0 )
				inRate = 0.00;
			if ( prior == 0 )
				outRate = 0.00;
			aptCMonthRate = inRate;

			appointmentsStat.find('#statAmount1').text( trimNumber(general.all.length) );
			appointmentsStat.find('#statAmountTooltip1').text( general.all.length );	
			appointmentsStat.find('#statAmount2').text( trimNumber(general.bydate.length) );
			appointmentsStat.find('#statAmountTooltip2').text( general.bydate.length );	

			appointmentsStat.find('#statAmount3').text( trimNumber(followup.all.length) );
			appointmentsStat.find('#statAmountTooltip3').text( followup.all.length );	
			appointmentsStat.find('#statAmount4').text( trimNumber(followup.bydate.length) );
			appointmentsStat.find('#statAmountTooltip4').text( followup.bydate.length );

			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${general.all.length})</span>
								<span class="text-03">مواعيد عامة</span>
							</div>`);
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${followup.all.length})</span>
								<span class="text-03">مواعيد متابعة</span>
							</div>`);
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${general.all.length})</span>
								<span class="text-03">Rendez-vous généraux</span>
							</div>`);
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${followup.all.length})</span>
								<span class="text-03">Rendez-vous de suivi</span>
							</div>`);
			}
		}

		// products
		var products = await listProductsLocal({
			clinicId: clinicSelect.find(':selected').val(),
			date: dateInput.val()
		});
		var prodCMonthRate = 0;
		// hide loader
		SectionLoader(productsStat, '');
		if ( products.code == 200 )
		{
			var data = products.data;
			var current = (data.today) ? data.today.length : 0;
			var prior = (data.yesterday) ? data.yesterday.length : 0;
			var total = (data.all) ? data.all.length : 0;
			var bydate = data.bydate;
			var inRate = current - (total - current);
			inRate = (inRate / total) * 100;
			var outRate = (total - prior) - prior;
			outRate = (outRate / total) * 100;
			
			if ( current == 0 )
				inRate = 0.00;
			if ( prior == 0 )
				outRate = 0.00;
			prodCMonthRate = inRate;

			productsStat.find('#statAmount1').text( trimNumber(total) );
			productsStat.find('#statAmountTooltip1').text( total );	
			productsStat.find('#statAmount2').text( trimNumber(bydate.length) );
			productsStat.find('#statAmountTooltip2').text( bydate.length );	

			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${total})</span>
								<span class="text-03">منتجات</span>
							</div>`);
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${total})</span>
								<span class="text-03">produits</span>
							</div>`);
			}
		}

		// orders
		var orders = await listOrdersLocal({
			clinicId: clinicSelect.find(':selected').val(),
			date: dateInput.val()
		});
		var ordCMonthRate = 0;
		// hide loader
		SectionLoader(ordersStat, '');
		if ( orders.code == 200 )
		{
			var data = orders.data;
			var current = (data.today) ? data.today.length : 0;
			var prior = (data.yesterday) ? data.yesterday.length : 0;
			var total = (data.all) ? data.all.length : 0;
			var bydate = data.bydate;
			var inRate = current - (total - current);
			inRate = (inRate / total) * 100;
			var outRate = (total - prior) - prior;
			outRate = (outRate / total) * 100;
			
			if ( current == 0 )
				inRate = 0.00;
			if ( prior == 0 )
				outRate = 0.00;
			ordCMonthRate = inRate;

			ordersStat.find('#statAmount1').text( trimNumber(total) );
			ordersStat.find('#statAmountTooltip1').text( total );	
			ordersStat.find('#statAmount2').text( trimNumber(bydate.length) );
			ordersStat.find('#statAmountTooltip2').text( bydate.length );	

			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${total})</span>
								<span class="text-03">فواتير</span>
							</div>`);
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${total})</span>
								<span class="text-03">Factures</span>
							</div>`);
			}
			// loop data
			var labels = [];
			var fdata = [];
			for (var i = 0; i < data.currentYearStats.length; i++) 
			{
				var v = data.currentYearStats[i];
				// add months
				labels.push( translateMonthName(v.date) );
				// add data
				fdata.push(v.total);
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				const ctx = chartEl02[0].getContext('2d');
				if ( chart02 )
					chart02.destroy();
				chart02 = new Chart(ctx, {
				    type: 'bar',
				    data: {
						labels: labels,
						datasets: [{
							barPercentage: 0.5,
					        barThickness: 50,
					        //maxBarThickness: 8,
					        minBarLength: 2,
							label: 'عدد فواتير شراء المنتجات',
							data: fdata,
							backgroundColor: [
								'rgba(109, 157, 255, 0.2)'
							],
							borderColor: [
								'rgba(109, 157, 255, 1)'
							],
							borderWidth: 1,
							borderRadius: 10,
							hoverOffset: 4
						}]
				    },
				    options: {
				    	scales: {
					      y: {
					        beginAtZero: true
					      }
					    },
				    	plugins: {
							legend: {
								position: 'top',
								rtl: true,
								textDirection: 'rtl'
							},
							title: {
								text: "تحليل فواتير شراء المنتجات خلال اشهر السنة",
								font: {
									weight: 'bold',
									size: "16px"
								},
								display:true,
								position: "top"
							}
						},
						onResize: function(e)
						{
							// set canvas width
							//chartEl01.css('width', '100%');
						}
				    }
				});	
				// set canvas width
				//chartEl02.css('width', '100%');
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				const ctx = chartEl02[0].getContext('2d');
				if ( chart02 )
					chart02.destroy();
				chart02 = new Chart(ctx, {
				    type: 'bar',
				    data: {
						labels: labels,
						datasets: [{
							barPercentage: 0.5,
					        barThickness: 50,
					        //maxBarThickness: 8,
					        minBarLength: 2,
							label: "Nombre de factures d'achat de produits",
							data: fdata,
							backgroundColor: [
								'rgba(109, 157, 255, 0.2)'
							],
							borderColor: [
								'rgba(109, 157, 255, 1)'
							],
							borderWidth: 1,
							borderRadius: 10,
							hoverOffset: 4
						}]
				    },
				    options: {
				    	scales: {
					      y: {
					        beginAtZero: true
					      }
					    },
				    	plugins: {
							legend: {
								position: 'top',
								rtl: false,
								textDirection: 'ltr'
							},
							title: {
								text: "Analyser les factures d'achats de produits au cours des mois de l'année",
								font: {
									weight: 'bold',
									size: "16px"
								},
								display:true,
								position: "top"
							}
						},
						onResize: function(e)
						{
							// set canvas width
							//chartEl01.css('width', '100%');
						}
				    }
				});	
				// set canvas width
				//chartEl02.css('width', '100%');
			}
		}

		// prescriptions
		var prescs = await listPrescriptionsLocal({
			clinicId: clinicSelect.find(':selected').val(),
			date: dateInput.val()
		});
		var prescCMonthRate = 0;
		// hide loader
		SectionLoader(prescsStat, '');
		if ( prescs.code == 200 )
		{
			var data = prescs.data;
			var current = (data.today) ? data.today.length : 0;
			var prior = (data.yesterday) ? data.yesterday.length : 0;
			var total = (data.all) ? data.all.length : 0;
			var bydate = data.bydate;
			var inRate = current - (total - current);
			inRate = (inRate / total) * 100;
			var outRate = (total - prior) - prior;
			outRate = (outRate / total) * 100;
			
			if ( current == 0 )
				inRate = 0.00;
			if ( prior == 0 )
				outRate = 0.00;
			prescCMonthRate = inRate;

			prescsStat.find('#statAmount1').text( trimNumber(total) );
			prescsStat.find('#statAmountTooltip1').text( total );	
			prescsStat.find('#statAmount2').text( trimNumber(bydate.length) );
			prescsStat.find('#statAmountTooltip2').text( bydate.length );

			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${total})</span>
								<span class="text-03">وصفات طبية</span>
							</div>`);
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				allStats1.append(`<div class="mb-1">
								<span class="text-04 text-muted">(${total})</span>
								<span class="text-03">Ordonnance médicale</span>
							</div>`);
			}
			// loop data
			var labels = [];
			var fdata = [];
			for (var i = 0; i < data.currentYearStats.length; i++) 
			{
				var v = data.currentYearStats[i];
				// add months
				labels.push( translateMonthName(v.date) );
				// add data
				fdata.push(v.total);
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				const ctx = chartEl03[0].getContext('2d');
				if ( chart03 )
					chart03.destroy();
				chart03 = new Chart(ctx, {
				    type: 'line',
				    data: {
						labels: labels,
						datasets: [{
							label: 'عدد الوصفات الطبية',
							data: fdata,
							fill: false,
							borderColor: 'rgb(245, 186, 118)',
							borderWidth: 1,
							tension: 0.1
						}]
				    },
				    options: {
				    	scales: {
					      y: {
					        beginAtZero: true
					      }
					    },
				    	plugins: {
							legend: {
								position: 'top',
								rtl: true,
								textDirection: 'rtl'
							},
							title: {
								text: "تحليل الوصفات الطبية المنشأة",
								font: {
									weight: 'bold',
									size: "16px"
								},
								display:true,
								position: "top"
							}
						},
						onResize: function(e)
						{
							// set canvas width
							chartEl03.css('width', '100%');
						}
				    }
				});	
				// set canvas width
				//chartEl02.css('width', '100%');
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				const ctx = chartEl03[0].getContext('2d');
				if ( chart03 )
					chart03.destroy();
				chart03 = new Chart(ctx, {
				    type: 'line',
				    data: {
						labels: labels,
						datasets: [{
							label: "Nombre d'ordonnances",
							data: fdata,
							fill: false,
							borderColor: 'rgb(245, 186, 118)',
							borderWidth: 1,
							tension: 0.1
						}]
				    },
				    options: {
				    	scales: {
					      y: {
					        beginAtZero: true
					      }
					    },
				    	plugins: {
							legend: {
								position: 'top',
								rtl: false,
								textDirection: 'ltr'
							},
							title: {
								text: "Analyse des ordonnances établies",
								font: {
									weight: 'bold',
									size: "16px"
								},
								display:true,
								position: "top"
							}
						},
						onResize: function(e)
						{
							// set canvas width
							chartEl03.css('width', '100%');
						}
				    }
				});	
				// set canvas width
				//chartEl02.css('width', '100%');
			}
		}
		// init chart1
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			const ctx = chartEl01[0].getContext('2d');
			if ( chart01 )
				chart01.destroy();
			chart01 = new Chart(ctx, {
			    type: 'doughnut',
			    data: {
					labels: [
						'المرضى '+patCMonthRate.toFixed(0)+'%',
						'المواعيد '+aptCMonthRate.toFixed(0)+'%',
						'المنتجات '+prodCMonthRate.toFixed(0)+'%',
						'الفواتير '+ordCMonthRate.toFixed(0)+'%',
					],
					datasets: [{
						label: 'My First Dataset',
						data: [
							patCMonthRate.toFixed(0), 
							aptCMonthRate.toFixed(0), 
							prodCMonthRate.toFixed(0),
							ordCMonthRate.toFixed(0)
						],
						backgroundColor: [
							'rgb(232, 225, 253)',
							'rgb(237, 243, 250)',
							'rgb(232, 251, 235)',
							'rgb(255, 204, 221)'
						],
						hoverOffset: 4
					}]
			    },
			    options: {
			    	plugins: {
						legend: {
							position: 'right',
							rtl: true,
							textDirection: 'rtl'
						},
						title: {
							text: "تحليل احصائيات المرضى، المواعيد والمنتجات",
							font: {
								weight: 'bold',
								size: "16px"
							},
							display:true,
							position: "top"
						}
					},
					onResize: function(e)
					{
						// set canvas width
						chartEl01.css('width', '100%');
					}
			    }
			});	
			// set canvas width
			chartEl01.css('width', '100%');
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			const ctx = chartEl01[0].getContext('2d');
			if ( chart01 )
				chart01.destroy();
			chart01 = new Chart(ctx, {
			    type: 'doughnut',
			    data: {
					labels: [
						'Les patients '+patCMonthRate.toFixed(0)+'%',
						'Rendez-vous '+aptCMonthRate.toFixed(0)+'%',
						'Des produits '+prodCMonthRate.toFixed(0)+'%',
						'Factures '+ordCMonthRate.toFixed(0)+'%',
					],
					datasets: [{
						label: 'My First Dataset',
						data: [
							patCMonthRate.toFixed(0), 
							aptCMonthRate.toFixed(0), 
							prodCMonthRate.toFixed(0),
							ordCMonthRate.toFixed(0)
						],
						backgroundColor: [
							'rgb(232, 225, 253)',
							'rgb(237, 243, 250)',
							'rgb(232, 251, 235)',
							'rgb(255, 204, 221)'
						],
						hoverOffset: 4
					}]
			    },
			    options: {
			    	plugins: {
						legend: {
							position: 'left',
							rtl: false,
							textDirection: 'ltr'
						},
						title: {
							text: "Analyse des statistiques patients, rendez-vous et produits",
							font: {
								weight: 'bold',
								size: "16px"
							},
							display:true,
							position: "top"
						}
					},
					onResize: function(e)
					{
						// set canvas width
						chartEl01.css('width', '100%');
					}
			    }
			});	
			// set canvas width
			chartEl01.css('width', '100%');
		}
	}
}
// setup products stats
async function setupProductsStatsPage()
{
	var productsStatsContainer = $('#productsStatsContainer');
	if ( productsStatsContainer[0] == undefined )
		return;

	var ERROR_BOX = productsStatsContainer.find('#ERROR_BOX');

	var clinicSelect = productsStatsContainer.find('#clinicSelect');
	var searchBTN = productsStatsContainer.find('#searchBTN');
	var searchInput = productsStatsContainer.find('#searchInput');
	var pagination = productsStatsContainer.find('#pagination');
	var mostSellsDiv = productsStatsContainer.find('#mostSellsDiv');

	// list clinics
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	
	if ( response.code == 404 )
		return;

	var data = response.data;
	var html = '';
	$.each(data, (k,v) =>
	{
		html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
	});
	clinicSelect.append(html);
	// search
	searchBTN.off('click');
	searchBTN.on('click', e =>
	{
		displayAll();
	});
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		SectionLoader(mostSellsDiv);
		var response = await searchProductsLocal({
			clinicId: clinicSelect.find(':selected').val(),
			query: searchInput.val()
		});
		SectionLoader(mostSellsDiv, '');
		mostSellsDiv.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var productImageUrl = (v.productImageData) ? JSON.parse(v.productImageData).url : 'assets/img/utils/placeholder.jpg';
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<div class="col-lg-12 col-md-12 col-sm-12" data-role="PRODUCT" data-productid="${v.productId}">
							<div class="row gx-2 gy-3">
								<div class="col-md-1 text-center">
									<img src="${productImageUrl}" alt="" class="img-05">
								</div>
								<div class="col-md">
									<div class="d-inline-flex w-100 h-100 flex-align-center">
										<div class="text-03">
											${v.productName}
											<span class="text-04 text-muted">تم شراء المنتج  (${v.stats.sales.total}) مرة</span>
										</div>
									</div>
								</div>
							</div>
						</div>PAG_SEP`;
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<div class="col-lg-12 col-md-12 col-sm-12" data-role="PRODUCT" data-productid="${v.productId}">
							<div class="row gx-2 gy-3">
								<div class="col-md-1 text-center">
									<img src="${productImageUrl}" alt="" class="img-05">
								</div>
								<div class="col-md">
									<div class="d-inline-flex w-100 h-100 flex-align-center">
										<div class="text-03">
											${v.productName}
											<span class="text-04 text-muted">Produit acheté (${v.stats.sales.total}) fois</span>
										</div>
									</div>
								</div>
							</div>
						</div>PAG_SEP`;
			}
		});

		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, mostSellsDiv, options);
	});
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
}
// setup revenue and accumulation
async function setupRevenueAndAccumulationPage()
{
	var revenueAndAccumulationContainer = $('#revenueAndAccumulationContainer');
	if ( revenueAndAccumulationContainer[0] == undefined )
		return;

	var ERROR_BOX = revenueAndAccumulationContainer.find('#ERROR_BOX');

	var clinicSelect = revenueAndAccumulationContainer.find('#clinicSelect');
	var currency = (FUI_DISPLAY_LANG.lang == 'ar') ? CURRENCY.ar : CURRENCY.fr;

	var todayStatDiv = revenueAndAccumulationContainer.find('#todayStatDiv');
	var yesterdayStatDiv = revenueAndAccumulationContainer.find('#yesterdayStatDiv');
	var currentWeekStatDiv = revenueAndAccumulationContainer.find('#currentWeekStatDiv');
	var currentMonthStatDiv = revenueAndAccumulationContainer.find('#currentMonthStatDiv');
	var currentYearStatDiv = revenueAndAccumulationContainer.find('#currentYearStatDiv');

	var chartEl01 = revenueAndAccumulationContainer.find('#chartEl01');
	var chartEl02 = revenueAndAccumulationContainer.find('#chartEl02');

	let chart01 = null;
	let chart02 = null;
	// list clinics
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		clinicSelect.append(html);	
	}
	
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayInfo();
	});
	//
	displayInfo();
	async function displayInfo()
	{
		// loaders
		SectionLoader(todayStatDiv);
		SectionLoader(yesterdayStatDiv);
		SectionLoader(currentWeekStatDiv);
		SectionLoader(currentMonthStatDiv);
		SectionLoader(currentYearStatDiv);

		// today revenue and accumu
		var treasury = await listAllTreasuryInfoLocal({
			clinicId: clinicSelect.find(':selected').val()
		});

		if ( treasury.code == 200 )
		{
			var data = treasury.data;

			var expenses_in = data.expenses.today.in;

			todayStatDiv.find('#revenueValue')
			.text( parseFloat(expenses_in).toFixed(2)+ ' '+currency );
		}

		var orders = await listOrdersLocal({
			clinicId: clinicSelect.find(':selected').val()
		});

		if ( orders.code == 200 )
		{
			var data = orders.data;

			var total = data.stats.today.length;

			todayStatDiv.find('#ordersValue')
			.text( total );
		}
		
		// yesterday revenue and accumu
		if ( treasury.code == 200 )
		{
			var data = treasury.data;

			var expenses_in = data.expenses.yesterday.in;

			yesterdayStatDiv.find('#revenueValue')
			.text( parseFloat(expenses_in).toFixed(2)+ ' '+currency );
		}

		if ( orders.code == 200 )
		{
			var data = orders.data;

			var total = data.stats.yesterday.length;

			yesterdayStatDiv.find('#ordersValue')
			.text( total );
		}

		// current week revenue and accumu
		if ( treasury.code == 200 )
		{
			var data = treasury.data;

			var expenses_in = data.expenses.current_week.in;

			currentWeekStatDiv.find('#revenueValue')
			.text( parseFloat(expenses_in).toFixed(2)+ ' '+currency );
		}

		if ( orders.code == 200 )
		{
			var data = orders.data;

			var total = data.stats.current_week.length;

			currentWeekStatDiv.find('#ordersValue')
			.text( total );
		}

		// current month revenue and accumu
		if ( treasury.code == 200 )
		{
			var data = treasury.data;

			var expenses_in = data.expenses.current_month.in;

			currentMonthStatDiv.find('#revenueValue')
			.text( parseFloat(expenses_in).toFixed(2)+ ' '+currency );
		}

		if ( orders.code == 200 )
		{
			var data = orders.data;

			var total = data.stats.current_month.length;

			currentMonthStatDiv.find('#ordersValue')
			.text( total );
		}

		// current year revenue and accumu
		if ( treasury.code == 200 )
		{
			var data = treasury.data;

			var expenses_in = data.expenses.current_year.in;

			currentYearStatDiv.find('#revenueValue')
			.text( parseFloat(expenses_in).toFixed(2)+ ' '+currency );
		}

		if ( orders.code == 200 )
		{
			var data = orders.data;

			var total = data.stats.current_year.length;

			currentYearStatDiv.find('#ordersValue')
			.text( total );
		}

		// charts
		// revenue
		if ( treasury.code == 200 )
		{
			var data = treasury.data;
			var expenses = data.expenses;
			// loop data
			var labels = [];
			var fdata = [];
			for (var i = 0; i < expenses.currentYearStats.chart.length; i++) 
			{
				var v = expenses.currentYearStats.chart[i];
				// add months
				labels.push( translateMonthName(v.date) );
				// add data
				fdata.push(v.total);
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				const ctx = chartEl02[0].getContext('2d');
				if ( chart02 )
					chart02.destroy();
				chart02 = new Chart(ctx, {
				    type: 'bar',
				    data: {
						labels: labels,
						datasets: [{
							barPercentage: 0.5,
					        barThickness: 50,
					        //maxBarThickness: 8,
					        minBarLength: 2,
							label: 'مجموع الايرادات'+ ' ('+currency+')',
							data: fdata,
							backgroundColor: [
								'rgba(89, 179, 0, 0.2)'
							],
							borderColor: [
								'rgba(153, 255, 51, 1)'
							],
							borderWidth: 1,
							borderRadius: 10,
							hoverOffset: 4
						}]
				    },
				    options: {
				    	scales: {
					      y: {
					        beginAtZero: true
					      }
					    },
				    	plugins: {
							legend: {
								position: 'top',
								rtl: true,
								textDirection: 'rtl'
							},
							title: {
								text: "تحليل الايرادات خلال اشهر السنة",
								font: {
									weight: 'bold',
									size: "16px"
								},
								display:true,
								position: "top"
							}
						},
						onResize: function(e)
						{
							// set canvas width
							//chartEl01.css('width', '100%');
						}
				    }
				});	
				// set canvas width
				//chartEl02.css('width', '100%');
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				const ctx = chartEl02[0].getContext('2d');
				if ( chart02 )
					chart02.destroy();
				chart02 = new Chart(ctx, {
				    type: 'bar',
				    data: {
						labels: labels,
						datasets: [{
							barPercentage: 0.5,
					        barThickness: 50,
					        //maxBarThickness: 8,
					        minBarLength: 2,
							label: "revenu total"+ ' ('+currency+')',
							data: fdata,
							backgroundColor: [
								'rgba(89, 179, 0, 0.2)'
							],
							borderColor: [
								'rgba(153, 255, 51, 1)'
							],
							borderWidth: 1,
							borderRadius: 10,
							hoverOffset: 4
						}]
				    },
				    options: {
				    	scales: {
					      y: {
					        beginAtZero: true
					      }
					    },
				    	plugins: {
							legend: {
								position: 'top',
								rtl: false,
								textDirection: 'ltr'
							},
							title: {
								text: "Analyse des revenus au cours des mois de l'année",
								font: {
									weight: 'bold',
									size: "16px"
								},
								display:true,
								position: "top"
							}
						},
						onResize: function(e)
						{
							// set canvas width
							//chartEl01.css('width', '100%');
						}
				    }
				});	
				// set canvas width
				//chartEl02.css('width', '100%');
			}
		}
		// orders
		if ( orders.code == 200 )
		{
			var data = orders.data;
			// loop data
			var labels = [];
			var fdata = [];
			for (var i = 0; i < data.currentYearStats.length; i++) 
			{
				var v = data.currentYearStats[i];
				// add months
				labels.push( translateMonthName(v.date) );
				// add data
				fdata.push(v.total);
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				const ctx = chartEl01[0].getContext('2d');
				if ( chart01 )
					chart01.destroy();
				chart01 = new Chart(ctx, {
				    type: 'bar',
				    data: {
						labels: labels,
						datasets: [{
							barPercentage: 0.5,
					        barThickness: 50,
					        //maxBarThickness: 8,
					        minBarLength: 2,
							label: 'عدد الطلبات',
							data: fdata,
							backgroundColor: [
								'rgba(255, 51, 133, 0.2)'
							],
							borderColor: [
								'rgba(255, 51, 133, 1)'
							],
							borderWidth: 1,
							borderRadius: 10,
							hoverOffset: 4
						}]
				    },
				    options: {
				    	scales: {
					      y: {
					        beginAtZero: true
					      }
					    },
				    	plugins: {
							legend: {
								position: 'top',
								rtl: true,
								textDirection: 'rtl'
							},
							title: {
								text: "تحليل طلبات شراء المنتجات خلال اشهر السنة",
								font: {
									weight: 'bold',
									size: "16px"
								},
								display:true,
								position: "top"
							}
						},
						onResize: function(e)
						{
							// set canvas width
							//chartEl01.css('width', '100%');
						}
				    }
				});	
				// set canvas width
				//chartEl02.css('width', '100%');
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				const ctx = chartEl01[0].getContext('2d');
				if ( chart01 )
					chart01.destroy();
				chart01 = new Chart(ctx, {
				    type: 'bar',
				    data: {
						labels: labels,
						datasets: [{
							barPercentage: 0.5,
					        barThickness: 50,
					        //maxBarThickness: 8,
					        minBarLength: 2,
							label: "عدد الطلبات",
							data: fdata,
							backgroundColor: [
								'rgba(109, 157, 255, 0.2)'
							],
							borderColor: [
								'rgba(109, 157, 255, 1)'
							],
							borderWidth: 1,
							borderRadius: 10,
							hoverOffset: 4
						}]
				    },
				    options: {
				    	scales: {
					      y: {
					        beginAtZero: true
					      }
					    },
				    	plugins: {
							legend: {
								position: 'top',
								rtl: false,
								textDirection: 'ltr'
							},
							title: {
								text: "Analyse des demandes d'achat de produits au cours des mois de l'année",
								font: {
									weight: 'bold',
									size: "16px"
								},
								display:true,
								position: "top"
							}
						},
						onResize: function(e)
						{
							// set canvas width
							//chartEl01.css('width', '100%');
						}
				    }
				});	
				// set canvas width
				//chartEl02.css('width', '100%');
			}
		}

		// hide loaders
		SectionLoader(todayStatDiv, '');
		SectionLoader(yesterdayStatDiv, '');
		SectionLoader(currentWeekStatDiv, '');
		SectionLoader(currentMonthStatDiv, '');
		SectionLoader(currentYearStatDiv, '');
	}
}
// setup send message
function setupSendMessage()
{
	var sendMessageContainer = $('#sendMessageContainer');
	if ( sendMessageContainer[0] == undefined )
		return;

	var ERROR_BOX = sendMessageContainer.find('#ERROR_BOX');
	var sendMSGForm = sendMessageContainer.find('#sendMSGForm');
	var searchPatientsInput = sendMessageContainer.find('#searchPatientsInput');
	var receiverSelect = sendMessageContainer.find('#receiverSelect');
	var subjectInput = sendMessageContainer.find('#subjectInput');
	var bodyInput = sendMessageContainer.find('#bodyInput');


	var sendToPatientsWrapper = sendMessageContainer.find('#sendToPatientsWrapper');
	var switchToEmployeeMessagingBTN = sendToPatientsWrapper.find('#switchToEmployeeMessagingBTN');
	var sendToEmployeeWrapper = sendMessageContainer.find('#sendToEmployeeWrapper');
	var switchBackToPatientsMessagingBTN = sendToEmployeeWrapper.find('#switchBackToPatientsMessagingBTN');

	var sendMSGToEmployeeForm = sendMessageContainer.find('#sendMSGToEmployeeForm');
	var employeePhoneInput = sendMessageContainer.find('#employeePhoneInput');
	var subject2Input = sendMessageContainer.find('#subject2Input');
	var body2Input = sendMessageContainer.find('#body2Input');

	// back to patients messaging
	switchBackToPatientsMessagingBTN.off('click');
	switchBackToPatientsMessagingBTN.on('click', e =>
	{
		sendToPatientsWrapper.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	// back to manager messaging
	switchToEmployeeMessagingBTN.off('click');
	switchToEmployeeMessagingBTN.on('click', e =>
	{
		sendToEmployeeWrapper.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	// send
	sendMSGForm.off('submit');
	sendMSGForm.on('submit', e =>
	{
		e.preventDefault();
		var target = sendMSGForm;
		var MessageObject = {
			sender: USER_CONFIG.administration.clinicHash,
			receiver: receiverSelect.find(':selected').val(),
			subject: subjectInput.val(),
			body: bodyInput.val()
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("يتم ارسال الرسالة...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("Le message est envoyé...");

		sendMessage(MessageObject).then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0)
			.find('#text').text(response.message);
			// reset
			target[0].reset();
		});
	});
	// search patients
	searchPatientsInput.off('keyup');
	searchPatientsInput.on('keyup', e =>
	{
		var target = searchPatientsInput;
		var SearchObject = {
			clinicId: USER_CONFIG.administration.clinicId,
			query: target.val()
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");
		searchPatientsLocal(SearchObject).then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<option value="${v.patientHashId}">${v.patientName}</option>`;
			});
			// add html
			receiverSelect.html(html);
		});
	});
	searchPatientsInput.trigger('keyup');
	// send to manager
	sendMSGToEmployeeForm.off('submit');
	sendMSGToEmployeeForm.on('submit', async e =>
	{
		e.preventDefault();
		var target = sendMSGToEmployeeForm;

		//display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري استرجاع الرمز التسلسلي للمستلم...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("Récupérer le code de série du destinataire...");

		var response = await getEmployee( '', $.trim(employeePhoneInput.val()) );
		// hide loader
		TopLoader("", false);
		if ( response.code == 404 )
		{
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			return;
		}

		var MessageObject = {
			sender: USER_CONFIG.employee_hash,
			receiver: response.data.employee_hash,
			subject: subject2Input.val(),
			body: body2Input.val()
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("يتم ارسال الرسالة...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("Le message est envoyé...");

		sendMessage(MessageObject).then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0)
			.find('#text').text(response.message);
			// reset
			target[0].reset();
		});
	});
}
//setup sent messages
function setupSentMessages()
{
	var sentMessagesContainer = $('#sentMessagesContainer');
	if ( sentMessagesContainer[0] == undefined )
		return;

	var ERROR_BOX = sentMessagesContainer.find('#ERROR_BOX');
	var searchBTN = sentMessagesContainer.find('#searchBTN');
	var searchInput = sentMessagesContainer.find('#searchInput');
	var msgOptionsList = sentMessagesContainer.find('#msgOptionsList');
	var pagination = sentMessagesContainer.find('#pagination');
	var tableElement = sentMessagesContainer.find('#tableElement');

	var contentsWrapper = sentMessagesContainer.find('#contentsWrapper');
	var msgContentsWrapper = sentMessagesContainer.find('#msgContentsWrapper');
	var messageDiv = msgContentsWrapper.find('#messageDiv');
	var backBTN = msgContentsWrapper.find('#backBTN');
	var addReplyForm = msgContentsWrapper.find('#addReplyForm');
	var replyTextInput = addReplyForm.find('#replyTextInput');
	var repliesCount = addReplyForm.find('#repliesCount');
	var pagination2 = msgContentsWrapper.find('#pagination2');
	var repliesDiv = msgContentsWrapper.find('#repliesDiv');

	// msgOptionsList click
	msgOptionsList.off('click');
	msgOptionsList.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'MARK_AS_READ' )
		{
			var data = {
				list: getSelectedRows(),
				read: true,
				userHash: USER_CONFIG.employee_hash
			};
			setMessagesRead(data).then(response =>
			{
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				// display messages
				displayMessages();
			});
		}
		else if ( target.data('role') == 'DELETE' )
		{
			PromptConfirmDialog().then(c =>
			{
				// display loader
				if ( FUI_DISPLAY_LANG.lang == 'ar' )
					TopLoader("حذف الرسائل...");
				else if ( FUI_DISPLAY_LANG.lang == 'fr' )
					TopLoader("supprimer les messages...");

				removeMessages(getSelectedRows()).then(response =>
				{
					// hide loader
					TopLoader('', false);
					if ( response.code == 404 )
					{
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						return;
					}
					// display messages
					displayMessages();
				});
			});
		}
	});
	// add reply
	addReplyForm.off('submit');
	addReplyForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addReplyForm;
		var msgId = target.data('msgid');
		var MessageObject = {
			msgId: msgId,
			userHash: USER_CONFIG.employee_hash,
			replyText: replyTextInput.val()
		};
		// display loader
		SectionLoader(addReplyForm);
		addMessageReply(MessageObject).then(response =>
		{
			// hide loader
			SectionLoader(addReplyForm, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}

			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			// reset
			target[0].reset();
			//
			displayMsgReplies(msgId);
		});
	});
	// back to messages
	backBTN.off('click');
	backBTN.on('click', e =>
	{
		contentsWrapper.slideDown(200).siblings('.WRAPPER').slideUp(200);
		displayMessages();
	});
	//tableElement click
	tableElement.off('click');
	tableElement.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'CHECK' )
		{
			var parent = target.closest('[data-role="ROW"]');
			toggleCheck(target);
			if ( target.is(':checked') )
				parent.addClass('selected');
			else
				parent.removeClass('selected');
		}
		else if ( target.data('role') == 'ROW' )
		{
			var msgId = target.data('msgid');
			addReplyForm.data('msgid', msgId).attr('data-msgid', msgId);
			//
			msgContentsWrapper.slideDown(200).siblings('.WRAPPER').slideUp(200);
			displayMsgReplies(msgId);
		}
	});
	// search messages
	searchBTN.off('click');
	searchBTN.on('click', e =>
	{
		displayMessages();
	});
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var SearchObject = {
			userHash: USER_CONFIG.employee_hash,
			folder: 'sent',
			query: searchInput.val(),
			part: []
		};
		// display loader
		SectionLoader(tableElement);
		var response = await searchMessages(SearchObject);
		// hide loader
		SectionLoader(tableElement, '');
		// clear html
		tableElement.html('');
		if ( response.code == 404 )
		{
			tableElement.html(`<div class="list-item text-03 mb-1">
									<div style="width:4%;">
										<input type="checkbox" class="form-check-input" data-role="CHECK" data-msgid="">
									</div>
									<div class="no-pointer" style="flex-grow:1;width:15%;">
										<span class="">${response.message}</span>
									</div>
									<div class="no-pointer" style="flex-grow:2;">
										<span class="d-inline-block">
											
										</span>
										<span class="d-inline-block text-muted">
											
										</span>
									</div>
								</div>`);
			return;
		}

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var isReadText = (v.isRead == 1) ? 'opacity-5' : '';
			var bodySnippet = '';
			if ( v.msgBody.length > 40 )
				bodySnippet = v.msgBody.substr(10, 25)+'...';
			html += `<div class="list-item text-03 mb-1 ${isReadText}" data-role="ROW" data-msgid="${v.msgId}">
						<div style="width:4%;">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-msgid="${v.msgId}">
						</div>
						<div class="no-pointer" style="flex-grow:1;width:15%;">
							<span class="">${v.msgSubject.substr(0,20)}...</span>
						</div>
						<div class="no-pointer" style="flex-grow:2;">
							<span class="d-inline-block">
								${v.msgBody.substr(0,50)} - 
							</span>
							<span class="d-inline-block text-muted">
								${bodySnippet}
							</span>
						</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement, options);
	});
	// display messages
	displayMessages();
	function displayMessages()
	{
		searchInput.trigger('keyup');
	}
	// display msg replies
	function displayMsgReplies(msgId)
	{
		var MessageObject = {
			msgId: msgId,
			folder: 'sent',
			part: ['replies'],
			read: true,
			userHash: USER_CONFIG.employee_hash
		};
		// display loader
		SectionLoader(msgContentsWrapper);
		openMessage(MessageObject).then(response =>
		{
			// hide loader
			SectionLoader(msgContentsWrapper, '');
			// clear html
			repliesDiv.html('');
			// add total replies
			var repliesTotal = 0;
			if ( response.data )
			{
				if ( response.data.replies )
					repliesTotal = response.data.replies.length
			}
			repliesCount.text('('+repliesTotal+')');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}

			var data = response.data;
			var html = '';
			// display message
			messageDiv.html(`<div class="row gx-2 gy-1 mb-2">
								<div class="col-lg-12 col-md-12 col-sm-12">
									<span class="text-01">${data.senderName}</span>
								</div>
								<div class="col-lg-12 col-md-12">
									<div class="text-muted">${data.senderPhone}</div>
								</div>
								<div class="col-lg-12 col-md-12">
									<div class="text-muted">${data.msgDate} | ${data.msgTime}</div>
								</div>
							</div>
							<div class="title-medium">
								${data.msgSubject}
							</div>
							<div class="text-02">
								${data.msgBody}
							</div>`);
			// display replies
			if ( data.replies )
			{
				$.each(data.replies, (k,v) =>
				{
					html += `<div class="col-lg-12 col-md-12 col-sm-12 p-2 border rounded">
								<div class="row gx-2 gy-1 mb-2">
									<div class="col-lg-12 col-md-12 col-sm-12">
										<span class="text-01">${v.replier.replierName}</span>
									</div>
									<div class="col-lg-12 col-md-12">
										<div class="text-muted">${v.replier.replierPhone}</div>
									</div>
									<div class="col-lg-12 col-md-12">
										<div class="text-muted">${v.replyDate} | ${v.replyTime}</div>
									</div>
								</div>
								<div class="text-02">
									${v.replyText}
								</div>
							</div>`;
				});	
			}
			repliesDiv.html(html);
		});
	}
	// get select rows
	function getSelectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({msgId: check.data('msgid')});
		}

		return list;
	}
}
//setup inbox messages
function setupInboxMessages()
{
	var inboxMessagesContainer = $('#inboxMessagesContainer');
	if ( inboxMessagesContainer[0] == undefined )
		return;

	var ERROR_BOX = inboxMessagesContainer.find('#ERROR_BOX');
	var searchBTN = inboxMessagesContainer.find('#searchBTN');
	var searchInput = inboxMessagesContainer.find('#searchInput');
	var msgOptionsList = inboxMessagesContainer.find('#msgOptionsList');
	var pagination = inboxMessagesContainer.find('#pagination');
	var tableElement = inboxMessagesContainer.find('#tableElement');

	var contentsWrapper = inboxMessagesContainer.find('#contentsWrapper');
	var msgContentsWrapper = inboxMessagesContainer.find('#msgContentsWrapper');
	var messageDiv = msgContentsWrapper.find('#messageDiv');
	var backBTN = msgContentsWrapper.find('#backBTN');
	var addReplyForm = msgContentsWrapper.find('#addReplyForm');
	var replyTextInput = addReplyForm.find('#replyTextInput');
	var repliesCount = addReplyForm.find('#repliesCount');
	var pagination2 = msgContentsWrapper.find('#pagination2');
	var repliesDiv = msgContentsWrapper.find('#repliesDiv');

	// msgOptionsList click
	msgOptionsList.off('click');
	msgOptionsList.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'MARK_AS_READ' )
		{
			var data = {
				list: getSelectedRows(),
				read: true,
				userHash: USER_CONFIG.employee_hash
			};
			setMessagesRead(data).then(response =>
			{
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				// display messages
				displayMessages();
			});
		}
		else if ( target.data('role') == 'DELETE' )
		{
			PromptConfirmDialog().then(c =>
			{
				// display loader
				if ( FUI_DISPLAY_LANG.lang == 'ar' )
					TopLoader("حذف الرسائل...");
				else if ( FUI_DISPLAY_LANG.lang == 'fr' )
					TopLoader("supprimer les messages...");

				removeMessages(getSelectedRows()).then(response =>
				{
					// hide loader
					TopLoader('', false);
					if ( response.code == 404 )
					{
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						return;
					}
					// display messages
					displayMessages();
				});
			});
		}
	});
	// add reply
	addReplyForm.off('submit');
	addReplyForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addReplyForm;
		var msgId = target.data('msgid');
		var MessageObject = {
			msgId: msgId,
			userHash: USER_CONFIG.employee_hash,
			replyText: replyTextInput.val()
		};
		// display loader
		SectionLoader(addReplyForm);
		addMessageReply(MessageObject).then(response =>
		{
			// hide loader
			SectionLoader(addReplyForm, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}

			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			// reset
			target[0].reset();
			//
			displayMsgReplies(msgId);
		});
	});
	// back to messages
	backBTN.off('click');
	backBTN.on('click', e =>
	{
		contentsWrapper.slideDown(200).siblings('.WRAPPER').slideUp(200);
		displayMessages();
	});
	//tableElement click
	tableElement.off('click');
	tableElement.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'CHECK' )
		{
			var parent = target.closest('[data-role="ROW"]');
			toggleCheck(target);
			if ( target.is(':checked') )
				parent.addClass('selected');
			else
				parent.removeClass('selected');
		}
		else if ( target.data('role') == 'ROW' )
		{
			var msgId = target.data('msgid');
			addReplyForm.data('msgid', msgId).attr('data-msgid', msgId);
			//
			msgContentsWrapper.slideDown(200).siblings('.WRAPPER').slideUp(200);
			displayMsgReplies(msgId);
		}
	});
	// search messages
	searchBTN.off('click');
	searchBTN.on('click', e =>
	{
		displayMessages();
	});
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var SearchObject = {
			userHash: USER_CONFIG.employee_hash,
			folder: 'inbox',
			query: searchInput.val(),
			part: []
		};
		// display loader
		SectionLoader(tableElement);
		var response = await searchMessages(SearchObject);
		// hide loader
		SectionLoader(tableElement, '');
		// clear html
		tableElement.html('');
		if ( response.code == 404 )
		{
			tableElement.html(`<div class="list-item text-03 mb-1">
									<div style="width:4%;">
										<input type="checkbox" class="form-check-input" data-role="CHECK" data-msgid="">
									</div>
									<div class="no-pointer" style="flex-grow:1;width:15%;">
										<span class="">${response.message}</span>
									</div>
									<div class="no-pointer" style="flex-grow:2;">
										<span class="d-inline-block">
											
										</span>
										<span class="d-inline-block text-muted">
											
										</span>
									</div>
								</div>`);
			return;
		}

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var isReadText = (v.isRead == 1) ? 'opacity-5' : '';
			var bodySnippet = '';
			if ( v.msgBody.length > 40 )
				bodySnippet = v.msgBody.substr(10, 25)+'...';
			html += `<div class="list-item text-03 mb-1 ${isReadText}" data-role="ROW" data-msgid="${v.msgId}">
						<div style="width:4%;">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-msgid="${v.msgId}">
						</div>
						<div class="no-pointer" style="flex-grow:1;width:15%;">
							<span class="">${v.msgSubject.substr(0,20)}...</span>
						</div>
						<div class="no-pointer" style="flex-grow:2;">
							<span class="d-inline-block">
								${v.msgBody.substr(0,50)} - 
							</span>
							<span class="d-inline-block text-muted">
								${bodySnippet}
							</span>
						</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement, options);
	});
	// display messages
	displayMessages();
	function displayMessages()
	{
		searchInput.trigger('keyup');
	}
	// display msg replies
	function displayMsgReplies(msgId)
	{
		var MessageObject = {
			msgId: msgId,
			folder: 'inbox',
			part: ['replies'],
			read: true,
			userHash: USER_CONFIG.employee_hash
		};
		// display loader
		SectionLoader(msgContentsWrapper);
		openMessage(MessageObject).then(response =>
		{
			// hide loader
			SectionLoader(msgContentsWrapper, '');
			// clear html
			repliesDiv.html('');
			// add total replies
			var repliesTotal = 0;
			if ( response.data )
			{
				if ( response.data.replies )
					repliesTotal = response.data.replies.length
			}
			repliesCount.text('('+repliesTotal+')');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}

			var data = response.data;
			var html = '';
			// display message
			messageDiv.html(`<div class="row gx-2 gy-1 mb-2">
								<div class="col-lg-12 col-md-12 col-sm-12">
									<span class="text-01">${data.senderName}</span>
								</div>
								<div class="col-lg-12 col-md-12">
									<div class="text-muted">${data.senderPhone}</div>
								</div>
								<div class="col-lg-12 col-md-12">
									<div class="text-muted">${data.msgDate} | ${data.msgTime}</div>
								</div>
							</div>
							<div class="title-medium">
								${data.msgSubject}
							</div>
							<div class="text-02">
								${data.msgBody}
							</div>`);
			// display replies
			if ( data.replies )
			{
				$.each(data.replies, (k,v) =>
				{
					html += `<div class="col-lg-12 col-md-12 col-sm-12 p-2 border rounded">
								<div class="row gx-2 gy-1 mb-2">
									<div class="col-lg-12 col-md-12 col-sm-12">
										<span class="text-01">${v.replier.replierName}</span>
									</div>
									<div class="col-lg-12 col-md-12">
										<div class="text-muted">${v.replier.replierPhone}</div>
									</div>
									<div class="col-lg-12 col-md-12">
										<div class="text-muted">${v.replyDate} | ${v.replyTime}</div>
									</div>
								</div>
								<div class="text-02">
									${v.replyText}
								</div>
							</div>`;
				});	
			}
			repliesDiv.html(html);
		});
	}
	// get select rows
	function getSelectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({msgId: check.data('msgid')});
		}

		return list;
	}
}
// setup settings
function setupSettings()
{
	var settingsContainer = $('#settingsContainer');
	if ( settingsContainer[0] == undefined )
		return;

	var ERROR_BOX = settingsContainer.find('#ERROR_BOX');
	var updateAccountForm = settingsContainer.find('#updateAccountForm');

	// update
	updateAccountForm.off('submit');
	updateAccountForm.on('submit', e =>
	{
		e.preventDefault();
		var target = $(e.target);
		var ProviderObject = {
			employee_id: USER_CONFIG.employee_id,
			employee_name: target.find('#uafNameInput').val(),
			employee_phone: $.trim(target.find('#uafPhoneInput').val()),
			employee_pass: $.trim(target.find('#uafPassInput').val()),
			employee_state: target.find('#uafStateSelect :selected').val(),
			employee_address: target.find('#uafAddressInput').val(),
			employee_birthplace: target.find('#uafPlaceBirthInput').val(),
			employee_birthdate: target.find('#uafDateBirthInput').val()
		};
		// check password match
		if ( target.find('#uafPassInput').val() != target.find('#uafConfirmPassInput').val() )
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text("كلمة المرور لا تتوافق");
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text("Le mot de passe ne correspond pas");
			}
			return;
		}
		// display loader
		SectionLoader(settingsContainer);
		updateMyAccount(ProviderObject).then(response =>
		{
			// hide loader
			SectionLoader(settingsContainer, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			var data = response.data;
			// save new data
			data['LOGIN_TYPE'] = data.type.employee_type_code;
			saveUserConfig(data, () => {});
		});	
	});
	// display states
	getAllStates().then(response =>
	{
		// clear html
		updateAccountForm.find('#uafStateSelect').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.wilaya_name}">${v.wilaya_name}</option>`;
		});
		// add html
		updateAccountForm.find('#uafStateSelect').html(html);
		// display provider info
		displayInfo();
	});
	function displayInfo()
	{
		updateAccountForm.find('#uafNameInput').val( USER_CONFIG.employee_name );
		setOptionSelected( updateAccountForm.find('#uafStateSelect'), USER_CONFIG.employee_state );
		updateAccountForm.find('#uafAddressInput').val( USER_CONFIG.employee_address );
		updateAccountForm.find('#uafPhoneInput').val( USER_CONFIG.employee_phone  );
		updateAccountForm.find('#uafPassInput').val( USER_CONFIG.employee_pass );
		updateAccountForm.find('#uafConfirmPassInput').val( USER_CONFIG.employee_pass );
		updateAccountForm.find('#uafDateBirthInput').val( USER_CONFIG.employee_birthdate );
		updateAccountForm.find('#uafPlaceBirthInput').val( USER_CONFIG.employee_birthplace );
	}
	// update ui settings
	var updateUISettingsForm = settingsContainer.find('#updateUISettingsForm');
	var uiLangSelect = settingsContainer.find('#uiLangSelect'); 

	updateUISettingsForm.off('submit');
	updateUISettingsForm.on('submit', e =>
	{
		e.preventDefault();
		setUIDisplayLang( uiLangSelect.find(':selected').val() ).then(changed =>
		{
			// translate
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				DialogBox('ملحوظة', "تم تغيير لغة العرض، اعد تشغيل البرنامج لملاحظة التغييرات.");
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				DialogBox('N.-B.', "La langue d'affichage a été modifiée, redémarrez le programme pour constater les changements.");
			}
		});
	});
	//
	setOptionSelected(uiLangSelect, FUI_DISPLAY_LANG.lang);
}
// setup add Treatment Class
function setupAddTreatmentClass(options = null)
{
	var addTreatmentClassContainer = $('#addTreatmentClassContainer');
	if ( addTreatmentClassContainer[0] == undefined )
		return;

	var ERROR_BOX = addTreatmentClassContainer.find('#ERROR_BOX');
	var addForm = addTreatmentClassContainer.find('#addForm');
	var classNameInput = addForm.find('#classNameInput');
	var classDescInput = addForm.find('#classDescInput');
	var classPriceInput = addForm.find('#classPriceInput');

	var wrapper01 = addTreatmentClassContainer.find('#wrapper01');

	var ClassObject = {
		classId: (options) ? options.classId : null,
		clinicId: null,
		className: null,
		classDesc: null
	};
	// submt
	addForm.off('submit');
	addForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addForm;
		ClassObject.className = classNameInput.val();
		ClassObject.classDesc = classDescInput.val();
		ClassObject.classPrice = classPriceInput.val();
		// display loader
		SectionLoader(wrapper01);
		// update
		if ( ClassObject.classId != null )
		{
			updateTreatmentClass(ClassObject).then(response =>
			{
				// hide loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				// reset
				target[0].reset();
				ClassObject.classId = null;
			});

			return;
		}
		// add
		addTreatmentClass(ClassObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			// reset
			target[0].reset();
		});
	});
	// display one
	displayOne();
	async function displayOne()
	{
		if ( ClassObject.classId == null )
			return;

		// display loader
		SectionLoader(wrapper01);
		var response = await getTreatmentClass(ClassObject.classId);
		// hide loader
		SectionLoader(wrapper01, '');
		if ( response.code == 404 )
			return;

		var data = response.data;
		classNameInput.val(data.className);
		classDescInput.val(data.classDesc);
		classPriceInput.val(data.classPrice);
	}
}
// setup all registered treatment classes
async function setupAllTreatmentClasses()
{
	var allTreatmentClassesContainer = $('#allTreatmentClassesContainer');
	if ( allTreatmentClassesContainer[0] == undefined )
		return;

	var ERROR_BOX = allTreatmentClassesContainer.find('#ERROR_BOX');

	var clinicSelect = allTreatmentClassesContainer.find('#clinicSelect');
	var deleteSelectedBTN = allTreatmentClassesContainer.find('#deleteSelectedBTN');
	var searchInput = allTreatmentClassesContainer.find('#searchInput');
	var pagination = allTreatmentClassesContainer.find('#pagination');
	var tableElement1 = allTreatmentClassesContainer.find('#tableElement1');

	var wrapper01 = allTreatmentClassesContainer.find('#wrapper01');

	var currency = {
		ar: 'دج',
		fr: 'DA'
	};
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			SectionLoader(tableElement1);
			var response = await deleteTreatmentClass(selectedRows());
			// hide loader
			SectionLoader(tableElement1, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// tableElement1 click
	tableElement1.off('click');
	tableElement1.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var classId = target.data('classid');
			var response = await getPage('views/pages/add-treatment-classes.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddTreatmentClass({classId: classId});
		}
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var val = searchInput.val();
		// display loader
		SectionLoader(tableElement1);
		var response = await searchTreatmentClasses(val);
		// hide loader
		SectionLoader(tableElement1, '');
		// clear html
		tableElement1.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="EMPLOYEE" data-classid="${v.classId}" style="cursor: pointer;">
								<div class="form-check border-bottom p-1">
										<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault_${v.classId}" data-role="CHECK" data-classid="${v.classId}">
										<label class="form-check-label" for="flexCheckDefault_${v.classId}">
											أنقر للتحديد
										</label>
									</div>
								<div class="card-body no-pointer">
									<div class="h5">${v.className}</div>
									<span class="text-04 text-muted">${v.classDesc.substr(0,20)}...</span>
									<div class="text-04">${v.classPrice} ${currency.ar}</div>
								</div>
								<div class="pb-2">
									<a href="#" data-role="UPDATE" class="mx-2 text-dark" data-classid="${v.classId}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="EMPLOYEE" data-classid="${v.classId}" style="cursor: pointer;">
								<div class="form-check border-bottom p-1">
										<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault_${v.classId}" data-role="CHECK" data-classid="${v.classId}">
										<label class="form-check-label" for="flexCheckDefault_${v.classId}">
											Cliquez pour sélectionner
										</label>
									</div>
								<div class="card-body no-pointer">
									<div class="h5">${v.className}</div>
									<span class="text-04 text-muted">${v.classDesc.substr(0,20)}...</span>
									<div class="text-04">${v.classPrice} ${currency.fr}</div>
								</div>
								<div class="pb-2">
									<a href="#" data-role="UPDATE" class="mx-2 text-dark" data-classid="${v.classId}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement1, options);
	});
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement1.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({ classId: check.data('classid') });
		}

		return list;
	}
}
// setup add Appointements
function setupAddFollowUpAppointements(options = null)
{
	var addFollowUpAppointementsContainer = $('#addFollowUpAppointementsContainer');
	if ( addFollowUpAppointementsContainer[0] == undefined )
		return;

	var ERROR_BOX = addFollowUpAppointementsContainer.find('#ERROR_BOX');
	var addForm = addFollowUpAppointementsContainer.find('#addForm');
	var clinicsSearchInput = addForm.find('#clinicsSearchInput');
	var clinicSelect = addForm.find('#clinicSelect');
	//var classesSearchInput = addForm.find('#classesSearchInput');
	var classSelect = addForm.find('#classSelect');
	var aptNoteInput = addForm.find('#aptNoteInput');
	var numberOfSessionsInput = addForm.find('#numberOfSessionsInput');
	var sessionsDiv = addForm.find('#sessionsDiv');
	var aptPriceInput = addForm.find('#aptPriceInput');
	var aptNameInput = addForm.find('#aptNameInput');

	var wrapper01 = addFollowUpAppointementsContainer.find('#wrapper01');

	var promise01 = null;
	var promise02 = null;
	// set default date / time
	var now = new Date();
	var AppointementObject = {
		aptId: (options) ? options.aptId : null,
		clinicId: null,
		classId: null,
		aptNote: null,
		sessions: []
	}
	// addForm submit
	addForm.off('submit');
	addForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addForm;
		AppointementObject.clinicId = clinicSelect.find(':selected').val();
		AppointementObject.classId = classSelect.find(':selected').val();
		AppointementObject.aptNote = aptNoteInput.val();
		AppointementObject.sessions = listSessions();
		AppointementObject.aptPrice = aptPriceInput.val();
		AppointementObject.aptName = aptNameInput.val();
		// display loader
		SectionLoader(wrapper01);
		// update
		if ( AppointementObject.aptId != null )
		{
			updateAppointementWithSessions(AppointementObject).then(response =>
			{
				// hide loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				// reset
				target[0].reset();
				aptDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
				aptTimeInput.val( date_time.format(now, 'HH:mm:ss') );
				//
				AppointementObject.aptId = null;
			});
			return;
		}
		// add
		addAppointementWithSessions(AppointementObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			// reset
			target[0].reset();
			aptDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
			aptTimeInput.val( date_time.format(now, 'HH:mm:ss') );
		});
	});
	// add sessions
	numberOfSessionsInput.off('input');
	numberOfSessionsInput.on('input', e =>
	{
		var count = numberOfSessionsInput.val();
		addSessions(count);
	});
	// search clinics
	clinicsSearchInput.off('keyup');
	clinicsSearchInput.on('keyup', e =>
	{
		var val = clinicsSearchInput.val();
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		promise01 = searchClinics(val);
		promise01.then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				clinicSelect.html(`<option value="" >حدد العيادة</option>`);
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				clinicSelect.html(`<option value="" >Sélectionnez la clinique</option>`);

			var i = 0;
			$.each(data, (k,v) =>
			{
				if ( i == 0 )
					html += `<option value="${v.clinicId}" selected>${v.clinicName}</option>`;
				else
					html += `<option value="${v.clinicId}">${v.clinicName}</option>`;	
				
				i++;
			});
			// add html
			clinicSelect.append(html);
		});
	});
	clinicsSearchInput.trigger('keyup');
	// list clinic treatment classes
	promise02 = listTreatmentClasses();
	promise02.then(response =>
	{
		// hide loader
		TopLoader('', false);
		// clear html
		classSelect.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			classSelect.html(`<option value="" selected>حدد قسم العلاج</option>`);
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			classSelect.html(`<option value="" selected>Sélectionnez la section de traitement</option>`);
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.classId}">${v.className}</option>`;
		});
		// add html
		classSelect.append(html);
	});
	// display one
	displayOne();
	async function displayOne()
	{
		await Promise.allSettled([promise01, promise02]);
		clinicSelect.trigger('change');
		if ( AppointementObject.aptId == null )
			return;

		// display loader
		SectionLoader(wrapper01);

		getAppointement(AppointementObject.aptId).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
				return;

			var data = response.data;

			setOptionSelected(clinicSelect, data.clinicId);
			setOptionSelected(classSelect, data.classId);
			var html = '<div class="list-inputs">';
			for (var i = 0; i < data.sessions.length; i++) 
			{
				var session = data.sessions[i];
				html += `<div class="list-row">
							<div class="list-item">
								<input type="text" class="input-text" data-role="SESSION_NAME"  value="${session.session_name}">
							</div>
							<div class="list-item">
								<input type="date" class="input-text" data-role="SESSION_DATE" value="${session.session_date}">
							</div>
							<div class="list-item">
								<input type="time" step="any" class="input-text" data-role="SESSION_TIME" value="${session.session_time}">
							</div>
						</div>`;
			}
			html += '</div>';
			// add html
			sessionsDiv.html(html);
			aptNoteInput.val(data.aptNote);
			aptPriceInput.val(data.aptPrice);
			aptNameInput.val(data.aptName);
			numberOfSessionsInput.val(data.sessions.length);
		});	
	}
	// add sessions
	function addSessions(count)
	{
		var html = '<div class="list-inputs">';
		var cdate = date_time.format(now,'YYYY-MM-DD');
		var ctime = date_time.format(now,'HH:mm:ss');
		var placeholder = '';
		var session_name = '';
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			placeholder = "اسم الجلسة...";
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			placeholder = "Nom de session...";
		}
		for (var i = 0; i < count; i++) 
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				session_name = `جلسة (${i+1})`;
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				session_name = `session (${i+1})`;
			html += `<div class="list-row">
						<div class="list-item">
							<input type="text" class="input-text" data-role="SESSION_NAME" placeholder="${placeholder}" value="${session_name}">
						</div>
						<div class="list-item">
							<input type="date" class="input-text" data-role="SESSION_DATE" value="${cdate}">
						</div>
						<div class="list-item">
							<input type="time" step="any" class="input-text" data-role="SESSION_TIME" value="${ctime}">
						</div>
					</div>`;
		}
		html += '</div>';
		// add html
		sessionsDiv.html(html);
	}
	// list sessions
	function listSessions()
	{
		var list = [];
		var items = sessionsDiv.find('.list-row');
		for (var i = 0; i < items.length; i++) 
		{
			var row = $(items[i]);
			var session = {
				session_name: row.find('[data-role="SESSION_NAME"]').val(),
				session_date: row.find('[data-role="SESSION_DATE"]').val(),
				session_time: row.find('[data-role="SESSION_TIME"]').val()
			};
			list.push(session);
		}
		return list;
	}
}
// setup all registered appointements
async function setupFollowUpAppointements()
{
	var followupAppointmentsContainer = $('#followupAppointmentsContainer');
	if ( followupAppointmentsContainer[0] == undefined )
		return;

	var ERROR_BOX = followupAppointmentsContainer.find('#ERROR_BOX');

	var clinicsSearchInput = followupAppointmentsContainer.find('#clinicsSearchInput');
	var clinicSelect = followupAppointmentsContainer.find('#clinicSelect');
	var searchAptInput = followupAppointmentsContainer.find('#searchAptInput');
	var pagination1 = followupAppointmentsContainer.find('#pagination1');
	var tableElement1 = followupAppointmentsContainer.find('#tableElement1');

	var searchSessionsInput = followupAppointmentsContainer.find('#searchSessionsInput');
	var pagination2 = followupAppointmentsContainer.find('#pagination2');
	var tableElement2 = followupAppointmentsContainer.find('#tableElement2');

	var tableElement4 = followupAppointmentsContainer.find('#tableElement4');

	var BACK_TO_MAIN_UI_BTN = followupAppointmentsContainer.find('[data-role="BACK_TO_MAIN_UI_BTN"]');
	var BACK_TO_SESSIONS_BTN = followupAppointmentsContainer.find('[data-role="BACK_TO_SESSIONS_BTN"]');

	var wrapper01 = followupAppointmentsContainer.find('#wrapper01');
	var wrapper02 = followupAppointmentsContainer.find('#wrapper02');
	var wrapper03 = followupAppointmentsContainer.find('#wrapper03');
	var sessionName = wrapper03.find('#sessionName');

	var SESSION = {};
	var APT = {};
	// back to main ui
	BACK_TO_MAIN_UI_BTN.off('click');
	BACK_TO_MAIN_UI_BTN.on('click', e =>
	{
		wrapper01.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	// back to sessions ui
	BACK_TO_SESSIONS_BTN.off('click');
	BACK_TO_SESSIONS_BTN.on('click', e =>
	{
		wrapper02.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	// tableElement1 click
	tableElement1.off('click');
	tableElement1.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var aptId = target.data('aptid');
			var response = await getPage('views/pages/add-follow-up-appointements.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddFollowUpAppointements({aptId: aptId});
		}
		else if ( target.data('role') == 'APT' )
		{
			var aptId = target.data('aptid');
			APT.name = target.data('name');
			APT.id = aptId;
			displayAptSessions();
		}
		else if ( target.data('role') == 'ADD_PATIENTS_BTN' )
		{
			var aptId = target.data('aptid');
			var aptName = target.data('aptname');
			var options = {
				aptId: aptId,
				aptName: aptName,
				clinicId: clinicSelect.find(':selected').val()
			};
			AddAppointementPatientsDialog(options, args =>
			{
				displayAllApt();
			});
		}
	});
	// tableElement2 click
	tableElement2.off('click');
	tableElement2.on('click', async e =>
	{
		var target = $(e.target);
		
		if ( target.data('role') == 'SESSION' )
		{
			var session_id = target.data('sessionid');
			SESSION.name = target.data('name');
			SESSION.id = session_id;
			displaySessionPatients();
		}
	});
	// tableElement4 click
	tableElement4.off('click');
	tableElement4.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'SET_PATIENT_ABSENT' )
		{
			PromptConfirmDialog().then(async c =>
			{
				var patientId = target.data('patientid');
				var AppointementObject = {
					session_id: SESSION.id,
					patientId: patientId,
					status: ATT_ABSENT
				};
				// display loader
				SectionLoader(tableElement4);
				var response = await setAppointementSessionPatientAttStatus(AppointementObject);
				// hide loader
				SectionLoader(tableElement4, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				//
				displaySessionPatients();	
			});
		}
	});
	// search apt
	searchAptInput.off('keyup');
	searchAptInput.on('keyup', async e =>
	{
		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			query: searchAptInput.val()
		};
		//display loader
		SectionLoader(tableElement1);
		var response = await searchAppointementsLocal(SearchObject);
		// hide loader
		SectionLoader(tableElement1, '');
		// clear html
		tableElement1.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="APT" data-aptid="${v.aptId}" style="cursor: pointer;" data-name="${v.aptName}">
								<div class="card-body no-pointer">
									<div class="h5">${v.aptName}</div>
									<div class="text-02">(${v.sessions.length}) جلسات</div>
									<div class="text-02">(${v.patients.length}) مرضى</div>
								</div>
								<div class="card-body pt-0">
									<a href="#" data-role="UPDATE" class="text-dark no-link" data-aptid="${v.aptId}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
									<a href="#" data-role="ADD_PATIENTS_BTN" class="mx-2" data-aptid="${v.aptId}" data-aptname="${v.aptName}">اظافة زبائن</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="APT" data-aptid="${v.aptId}" style="cursor: pointer;" data-name="${v.aptName}">
								<div class="card-body no-pointer">
									<div class="h5">${v.aptName}</div>
									<div class="text-02">(${v.sessions.length}) sessions</div>
									<div class="text-02">(${v.patients.length}) malades</div>
								</div>
								<div class="card-body pt-0">
									<a href="#" data-role="UPDATE" class="text-dark no-link" data-aptid="${v.aptId}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
									<a href="#" data-role="ADD_PATIENTS_BTN" class="mx-2" data-aptid="${v.aptId}" data-aptname="${v.aptName}">ajouter des clients</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination1, tableElement1, options);
	});
	// search clinics
	clinicsSearchInput.off('keyup');
	clinicsSearchInput.on('keyup', e =>
	{
		var val = clinicsSearchInput.val();
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		searchClinics(val).then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				clinicSelect.html(`<option value="" >حدد العيادة</option>`);
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				clinicSelect.html(`<option value="" >Sélectionnez la clinique</option>`);

			var i = 0;
			$.each(data, (k,v) =>
			{
				if ( i == 0 )
					html += `<option value="${v.clinicId}" selected>${v.clinicName}</option>`;
				else
					html += `<option value="${v.clinicId}">${v.clinicName}</option>`;	
				
				i++;
			});
			// add html
			clinicSelect.append(html);
		});
	});
	clinicsSearchInput.trigger('keyup');
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAllApt();
	});
	// display all apt
	function displayAllApt()
	{
		searchAptInput.trigger('keyup');
	}
	// display apt sessions
	async function displayAptSessions()
	{
		// display wrapper02
		wrapper02.slideDown(200).siblings('.WRAPPER').slideUp(200);
		// display loader
		SectionLoader(tableElement2);
		var response = await listAppointementSessions(APT.id);
		// hide loader
		SectionLoader(tableElement2, '');
		// clear html
		tableElement2.html('');
		if ( response.code == 404 )
		{
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			return;
		}

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var aptDateFormat = (v.aptDateFormat == 0) ? 'اليوم' : `${v.aptDateFormat} أيام`;
			if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				aptDateFormat = (v.aptDateFormat == 0) ? "aujourd'hui" : `${v.aptDateFormat} jours`;
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="SESSION" data-sessionid="${v.session_id}" style="cursor: pointer;" data-name="${v.session_name}">
								<div class="card-body no-pointer">
									<div class="h5">${v.session_name}</div>
									<div class="text-02">عدد الزبائن: (${v.patients.length})</div>
									<div class="text-02">في: ${v.session_date}</div>
									<div class="text-02">على الساعة: ${v.session_time}</div>
									<div class="text-04 text-muted">(${aptDateFormat})</div>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="SESSION" data-sessionid="${v.session_id}" style="cursor: pointer;" data-name="${v.session_name}">
								<div class="card-body no-pointer">
									<div class="h5">${v.session_name}</div>
									<div class="text-02">les clients: (${v.patients.length})</div>
									<div class="text-02">dans: ${v.session_date}</div>
									<div class="text-02">à l'heure: ${v.session_time}</div>
									<div class="text-04 text-muted">(${aptDateFormat})</div>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination2, tableElement2, options);
	}
	// display session patients
	async function displaySessionPatients()
	{
		// display wrapper03
		wrapper03.slideDown(200).siblings('.WRAPPER').slideUp(200);
		// display loader
		SectionLoader(tableElement4);
		var response = await listAppointementSessionPatients(SESSION.id);
		// hide loader
		SectionLoader(tableElement4, '');
		// clear html
		tableElement4.html('');
		if ( response.code == 404 )
		{
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			return;
		}

		var data = response.data;
		var html = '';
		// set session name
		sessionName.html(`${APT.name} | ${SESSION.name}`);
		$.each(data, (k,v) =>
		{
			var attStatusTag = `${ (v.attendenceStatus == ATT_ABSENT) ? '<div class="tag-1 danger">غائب</div>' : '' }`;
			if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				attStatusTag = `${ (v.attendenceStatus == ATT_ABSENT) ? '<div class="tag-1 danger">absent</div>' : '' }`;
			}
			html += `<div class="list-item d-flex flex-align-center">
						<div class="mx-2" style="width:50px;">
							<button class="btn btn-light btn-sm pointer" data-role="SET_PATIENT_ABSENT" data-patientid="${v.patientId}" style="background:none;">
								<i class="fas fa-trash no-pointer"></i>
							</button>
						</div>
						<div class="text-02 mx-4 ${ (v.attendenceStatus == ATT_ABSENT) ? 'text-line-through' : '' }" style="flex-grow: 1;">
							<div>${v.patientName}</div>
							<div>${v.patientPhone}</div>
						</div>
						<span>${attStatusTag}</span>
					</div>`;		
		});
		// add html
		tableElement4.html(html);
	}
}
// setup add Appointements
function setupAddAppointements(options = null)
{
	var addAppointementsContainer = $('#addAppointementsContainer');
	if ( addAppointementsContainer[0] == undefined )
		return;

	var ERROR_BOX = addAppointementsContainer.find('#ERROR_BOX');
	var addForm = addAppointementsContainer.find('#addForm');
	var clinicsSearchInput = addForm.find('#clinicsSearchInput');
	var clinicSelect = addForm.find('#clinicSelect');
	var classSelect = addForm.find('#classSelect');
	var patientsSearchInput = addForm.find('#patientsSearchInput');
	var patientSelect = addForm.find('#patientSelect');
	var aptNoteInput = addForm.find('#aptNoteInput');
	var aptDateInput = addForm.find('#aptDateInput');
	var aptTimeInput = addForm.find('#aptTimeInput');
	var aptNameInput = addForm.find('#aptNameInput');
	var aptPriceInput = addForm.find('#aptPriceInput');

	var wrapper01 = addAppointementsContainer.find('#wrapper01');

	var promise01 = null;
	var promise02 = null;
	var promise03 = null;
	// set default date / time
	var now = new Date();
	aptDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	aptTimeInput.val( date_time.format(now, 'HH:mm:ss') );
	var AppointementObject = {
		aptId: (options) ? options.aptId : null,
		clinicId: null,
		classId: null,
		patientId: null,
		aptNote: null,
		aptDate: null,
		aptTime: null
	}
	// addForm submit
	addForm.off('submit');
	addForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addForm;
		AppointementObject.clinicId = clinicSelect.find(':selected').val();
		AppointementObject.classId = classSelect.find(':selected').val();
		AppointementObject.patientId = patientSelect.find(':selected').val();
		AppointementObject.aptNote = aptNoteInput.val();
		AppointementObject.aptDate = aptDateInput.val();
		AppointementObject.aptTime = aptTimeInput.val();
		AppointementObject.aptName = aptNameInput.val();
		AppointementObject.aptPrice = aptPriceInput.val();

		// display loader
		SectionLoader(wrapper01);
		// update
		if ( AppointementObject.aptId != null )
		{
			updateAppointement(AppointementObject).then(response =>
			{
				// hide loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				// reset
				target[0].reset();
				aptDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
				aptTimeInput.val( date_time.format(now, 'HH:mm:ss') );
				//
				AppointementObject.aptId = null;
			});
			return;
		}
		// add
		addAppointement(AppointementObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			// reset
			target[0].reset();
			aptDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
			aptTimeInput.val( date_time.format(now, 'HH:mm:ss') );
		});
	});
	// search patients
	patientsSearchInput.off('keyup');
	patientsSearchInput.on('keyup', e =>
	{
		var val = patientsSearchInput.val();
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		promise02 = searchPatients(val);
		promise02.then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<option value="${v.patientId}">${v.patientName}</option>`;
			});
			// add html
			patientSelect.html(html);
		});
	});
	patientsSearchInput.trigger('keyup');
	// search clinics
	clinicsSearchInput.off('keyup');
	clinicsSearchInput.on('keyup', e =>
	{
		var val = clinicsSearchInput.val();
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		promise01 = searchClinics(val);
		promise01.then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				clinicSelect.html(`<option value="" >حدد العيادة</option>`);
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				clinicSelect.html(`<option value="" >Sélectionnez la clinique</option>`);

			var i = 0;
			$.each(data, (k,v) =>
			{
				if ( i == 0 )
					html += `<option value="${v.clinicId}" selected>${v.clinicName}</option>`;
				else
					html += `<option value="${v.clinicId}">${v.clinicName}</option>`;	
				
				i++;
			});
			// add html
			clinicSelect.append(html);
		});
	});
	clinicsSearchInput.trigger('keyup');
	// list clinic treatment classes
	promise03 = listTreatmentClasses();
	promise03.then(response =>
	{
		// hide loader
		TopLoader('', false);
		// clear html
		classSelect.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			classSelect.html(`<option value="" selected>حدد قسم العلاج</option>`);
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			classSelect.html(`<option value="" selected>Sélectionnez la section de traitement</option>`);
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.classId}" data-price="${v.classPrice}">${v.className}</option>`;
		});
		// add html
		classSelect.append(html);
	});
	// select class
	classSelect.off('change');
	classSelect.on('change', e =>
	{
		var price = parseFloat(classSelect.find(':selected').data('price'));
		aptPriceInput.val(price.toFixed(2));
	});
	// display one
	displayOne();
	async function displayOne()
	{
		await Promise.allSettled([promise01, promise02, promise03]);
		if ( AppointementObject.aptId == null )
			return;

		// display loader
		SectionLoader(wrapper01);

		getAppointement(AppointementObject.aptId).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
				return;

			var data = response.data;

			setOptionSelected(classSelect, data.classId);
			setOptionSelected(patientSelect, data.patientId);
			setOptionSelected(clinicSelect, data.clinicId);
			aptNoteInput.val( data.aptNote );
			aptDateInput.val( data.aptDate );
			aptTimeInput.val( data.aptTime );
			aptNameInput.val(data.aptName);
			aptPriceInput.val(data.aptPrice);
		});	
	}
}
// setup all registered appointements
function setupGeneralAppointements()
{
	var generalAppointementsContainer = $('#generalAppointementsContainer');
	if ( generalAppointementsContainer[0] == undefined )
		return;

	var ERROR_BOX = generalAppointementsContainer.find('#ERROR_BOX');
	var clinicsSearchInput = generalAppointementsContainer.find('#clinicsSearchInput');
	var clinicSelect = generalAppointementsContainer.find('#clinicSelect');
	var deleteSelectedBTN = generalAppointementsContainer.find('#deleteSelectedBTN');
	var searchInput = generalAppointementsContainer.find('#searchInput');
	var searchBTN = generalAppointementsContainer.find('#searchBTN');
	var filterDateInput = generalAppointementsContainer.find('#filterDateInput');
	var pagination = generalAppointementsContainer.find('#pagination');
	var tableElement = generalAppointementsContainer.find('#tableElement');

	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteAppointements(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// tableElement click
	tableElement.off('click');
	tableElement.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var aptId = target.data('aptid');
			var response = await getPage('views/pages/add-appointements.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddAppointements({aptId: aptId});
		}
		else if ( target.data('role') == 'SET_PAID' )
		{
			PromptConfirmDialog().then(async c =>
			{
				var aptId = target.data('aptid');
				SectionLoader(tableElement);
				var response = await setGeneralAppointementPaid({
					aptId: aptId,
					status: ST_YES
				});
				SectionLoader(tableElement, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				displayAll();
			});
		}
	});
	// filter by date
	filterDateInput.off('change');
	filterDateInput.on('change', async e =>
	{
		var val = filterDateInput.val();
		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			query: val
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var response = await filterAppointementsByDateGeneralLocal(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var SET_PAID_BTN = `<button class="pointer btn btn-success btn-sm" data-role="SET_PAID" data-aptid="${v.aptId}">
									<i class="fas fa-check no-pointer"></i>
								</button>`;
			var isPaid = (v.isPaid == ST_NO) ? '<div class="tag-1 danger">غير مدفوع</div>' : '<div class="tag-1">مدفوع</div>';
			var aptDateFormat = (v.aptDateFormat == 0) ? 'اليوم' : `${v.aptDateFormat} أيام`;
			if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				isPaid = (v.isPaid == ST_NO) ? '<div class="tag-1 danger">Non payé</div>' : '<div class="tag-1">payé</div>';
				aptDateFormat = (v.aptDateFormat == 0) ? "aujourd'hui" : `${v.aptDateFormat} jours`;
			}
			if ( v.isPaid == ST_YES )
			{
				SET_PAID_BTN = `<button class="pointer btn btn-success btn-sm d-none" data-role="SET_PAID" data-aptid="${v.aptId}">
									<i class="fas fa-check no-pointer"></i>
								</button>`;
			}
			html += `<div class="tr">
						<div class="td">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-aptid="${v.aptId}">
						</div>
						<div class="td">${v.aptName}</div>
						<div class="td">${v.aptPrice}</div>
						<div class="td">
							<div>${v.patient.patientName}</div>
							<div class="text-muted text-04">(${v.patient.patientPhone})</div>
						</div>
						<div class="td">${v.aptNote}</div>
						<div class="td">
							<div>${v.aptDate}</div>
							<div>${v.aptTime}</div>
							<div class="text-04 text-muted">(${aptDateFormat})</div>
						</div>
						<div class="td">
							<div>
								${SET_PAID_BTN}
							</div>
							${isPaid}
						</div>
						<div class="td">
							<button class="btn btn-primary btn-sm pointer" data-role="UPDATE" data-aptid="${v.aptId}">
								<span class="no-pointer"><i class="fas fa-edit"></i></span>
							</button>		
						</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement.find('.tbody'), options);
	});
	// search
	searchBTN.off('click');
	searchBTN.on('click', e =>
	{
		displayAll();
	});
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var val = searchInput.val();
		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			query: val
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var response = await searchAppointementsGeneralLocal(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var SET_PAID_BTN = `<button class="pointer btn btn-success btn-sm" data-role="SET_PAID" data-aptid="${v.aptId}">
									<i class="fas fa-check no-pointer"></i>
								</button>`;
			var isPaid = (v.isPaid == ST_NO) ? '<div class="tag-1 danger">غير مدفوع</div>' : '<div class="tag-1">مدفوع</div>';
			var aptDateFormat = (v.aptDateFormat == 0) ? 'اليوم' : `${v.aptDateFormat} أيام`;
			if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				isPaid = (v.isPaid == ST_NO) ? '<div class="tag-1 danger">Non payé</div>' : '<div class="tag-1">payé</div>';
				aptDateFormat = (v.aptDateFormat == 0) ? "aujourd'hui" : `${v.aptDateFormat} jours`;
			}
			if ( v.isPaid == ST_YES )
			{
				SET_PAID_BTN = `<button class="pointer btn btn-success btn-sm d-none" data-role="SET_PAID" data-aptid="${v.aptId}">
									<i class="fas fa-check no-pointer"></i>
								</button>`;
			}
			html += `<div class="tr">
						<div class="td">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-aptid="${v.aptId}">
						</div>
						<div class="td">${v.aptName}</div>
						<div class="td">${v.aptPrice}</div>
						<div class="td">
							<div>${v.patient.patientName}</div>
							<div class="text-muted text-04">(${v.patient.patientPhone})</div>
						</div>
						<div class="td">${v.aptNote}</div>
						<div class="td">
							<div>${v.aptDate}</div>
							<div>${v.aptTime}</div>
							<div class="text-04 text-muted">(${aptDateFormat})</div>
						</div>
						<div class="td">
							<div>
								${SET_PAID_BTN}
							</div>
							${isPaid}
						</div>
						<div class="td">
							<button class="btn btn-primary btn-sm pointer" data-role="UPDATE" data-aptid="${v.aptId}">
								<span class="no-pointer"><i class="fas fa-edit"></i></span>
							</button>		
						</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement.find('.tbody'), options);
	});
	// search clinics
	clinicsSearchInput.off('keyup');
	clinicsSearchInput.on('keyup', e =>
	{
		var val = clinicsSearchInput.val();
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		searchClinics(val).then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				clinicSelect.html(`<option value="" >حدد العيادة</option>`);
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				clinicSelect.html(`<option value="" >Sélectionnez la clinique</option>`);

			var i = 0;
			$.each(data, (k,v) =>
			{
				if ( i == 0 )
					html += `<option value="${v.clinicId}" selected>${v.clinicName}</option>`;
				else
					html += `<option value="${v.clinicId}">${v.clinicName}</option>`;	
				
				i++;
			});
			// add html
			clinicSelect.append(html);
		});
	});
	clinicsSearchInput.trigger('keyup');
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({ aptId: check.data('aptid') });
		}

		return list;
	}
}
// setup add to treasury
function setupAddToTreasury()
{
	var addToTreasuryContainer = $('#addToTreasuryContainer');
	if ( addToTreasuryContainer[0] == undefined )
		return;

	var ERROR_BOX = addToTreasuryContainer.find('#ERROR_BOX');

	var addForm = addToTreasuryContainer.find('#addForm');
	var treasuryInAmountInput = addForm.find('#treasuryInAmountInput');
	var treasuryReasonInput = addForm.find('#treasuryReasonInput');
	var treasuryNoteInput = addForm.find('#treasuryNoteInput');
	var treasuryDateInput = addForm.find('#treasuryDateInput');
	var treasuryTimeInput = addForm.find('#treasuryTimeInput');

	var cashoutForm = addToTreasuryContainer.find('#cashoutForm');
	var cftreasuryOutAmountInput = cashoutForm.find('#cftreasuryOutAmountInput');
	var cftreasuryReasonInput = cashoutForm.find('#cftreasuryReasonInput');
	var cftreasuryNoteInput = cashoutForm.find('#cftreasuryNoteInput');
	var cftreasuryDateInput = cashoutForm.find('#cftreasuryDateInput');
	var cftreasuryTimeInput = cashoutForm.find('#cftreasuryTimeInput');

	var operationSelect = addToTreasuryContainer.find('#operationSelect');
	var clinicsSearchInput = addToTreasuryContainer.find('#clinicsSearchInput');
	var clinicSelect = addToTreasuryContainer.find('#clinicSelect');
	// set initial data and time
	var now = new Date();
	treasuryDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	treasuryTimeInput.val( date_time.format(now, 'HH:mm:ss') );

	cftreasuryDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	cftreasuryTimeInput.val( date_time.format(now, 'HH:mm:ss') );

	var wrapper01 = addToTreasuryContainer.find('#wrapper01');

	var TreasuryObject = {
		clinicId: null
	};
	// addForm submit
	addForm.off('submit');
	addForm.on('submit', async e =>
	{
		e.preventDefault();
		var target = addForm;
		TreasuryObject.clinicId = clinicSelect.find(':selected').val();
		TreasuryObject.in = treasuryInAmountInput.val();
		TreasuryObject.reason = treasuryReasonInput.val();
		TreasuryObject.note = treasuryNoteInput.val();
		TreasuryObject.date = treasuryDateInput.val();
		TreasuryObject.time = treasuryTimeInput.val();
		// display loader
		SectionLoader(wrapper01);
		var response = await addToTreasury(TreasuryObject);
		// hide loader
		SectionLoader(wrapper01, '');
		if ( response.code == 404 )
		{
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			return;
		}
		ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
		//reset
		target[0].reset();	
		treasuryDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
		treasuryTimeInput.val( date_time.format(now, 'HH:mm:ss') );
	});
	// cashoutForm submit
	cashoutForm.off('submit');
	cashoutForm.on('submit', async e =>
	{
		e.preventDefault();
		var target = cashoutForm;
		TreasuryObject.clinicId = clinicSelect.find(':selected').val();
		TreasuryObject.out = cftreasuryOutAmountInput.val();
		TreasuryObject.reason = cftreasuryReasonInput.val();
		TreasuryObject.note = cftreasuryNoteInput.val();
		TreasuryObject.date = cftreasuryDateInput.val();
		TreasuryObject.time = cftreasuryTimeInput.val();
		// display loader
		SectionLoader(wrapper01);
		var response = await takeFromTreasury(TreasuryObject);
		// hide loader
		SectionLoader(wrapper01, '');
		if ( response.code == 404 )
		{
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			return;
		}
		ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
		//reset
		target[0].reset();	
		cftreasuryDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
		cftreasuryTimeInput.val( date_time.format(now, 'HH:mm:ss') );
	});
	// switch forms
	operationSelect.off('change');
	operationSelect.on('change', e =>
	{
		var val = operationSelect.find(':selected').val();
		if ( val == 'IN' )
			addForm.slideDown(200).siblings('.FORM').slideUp(200);
		else if ( val == 'OUT' )
			cashoutForm.slideDown(200).siblings('.FORM').slideUp(200);
	});
	// search clinics
	clinicsSearchInput.off('keyup');
	clinicsSearchInput.on('keyup', async e =>
	{
		var query = clinicsSearchInput.val();
		// display loader
		SectionLoader(clinicsSearchInput.closest('.section'));
		var response = await searchClinics(query);
		// hide loader
		SectionLoader(clinicsSearchInput.closest('.section'), '');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		clinicSelect.html(html);
	});
	clinicsSearchInput.trigger('keyup');
}
// setup treasury cashouts
async function setupTreasuryCashouts()
{
	var treasuryCashoutsContainer = $('#treasuryCashoutsContainer');
	if ( treasuryCashoutsContainer[0] == undefined )
		return;

	var ERROR_BOX = treasuryCashoutsContainer.find('#ERROR_BOX');

	var clinicSelect = treasuryCashoutsContainer.find('#clinicSelect');
	var deleteSelectedBTN = treasuryCashoutsContainer.find('#deleteSelectedBTN');
	var fromDateInput = treasuryCashoutsContainer.find('#fromDateInput');
	var pagination = treasuryCashoutsContainer.find('#pagination');
	var tableElement = treasuryCashoutsContainer.find('#tableElement');

	var now = new Date();
	fromDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// disply loader
			SectionLoader(tableElement);
			var response = await deleteExpenses(selectedRows());
			// hide loader
			SectionLoader(tableElement, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);
	}
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	clinicSelect.trigger('change');
	// filter
	fromDateInput.off('change');
	fromDateInput.on('change', async e =>
	{
		var val = fromDateInput.val();
		var TreasuryObject = {
			clinicId: clinicSelect.find(':selected').val(),
			date: val
		};
		// disply loader
		SectionLoader(tableElement);
		var response = await filterExpensesByDate(TreasuryObject);
		// hide loader
		SectionLoader(tableElement, '');
		// clear html
		tableElement.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<div class="tr">
						<div class="td">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-id="${v.expense_id}">
						</div>
						<div class="td">${v.expense_in}</div>
						<div class="td">${v.expense_out}</div>
						<div class="td">${v.expense_reason}</div>
						<div class="td">${v.expense_note}</div>
						<div class="td">${v.expense_date} | ${v.expense_time}</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement.find('.tbody'), options);
	});
	displayAll();
	// display all
	function displayAll()
	{
		fromDateInput.trigger('change');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({ id: check.data('id') });
		}

		return list;
	}
}
// setup add employees for clinics
async function setupAddEmployeesForClinics(options = null)
{
	var addEmployeesContainer = $('#addEmployeesForClinicsContainer');
	if ( addEmployeesContainer[0] == undefined )
		return;

	var ERROR_BOX = addEmployeesContainer.find('#ERROR_BOX');

	var addForm = addEmployeesContainer.find('#addForm');
	var clinicSelect = addForm.find('#clinicSelect');
	var nameInput = addForm.find('#nameInput');
	var phoneInput = addForm.find('#phoneInput');
	var addressInput = addForm.find('#addressInput');
	var wilayaSelect = addForm.find('#wilayaSelect');
	var typeSelect = addForm.find('#typeSelect');
	var birthDateInput = addForm.find('#birthDateInput');
	var birthPlaceInput = addForm.find('#birthPlaceInput');
	var salaryInput = addForm.find('#salaryInput');
	var passInput = addForm.find('#passInput');
	var ccpInput = addForm.find('#ccpInput');

	var wrapper01 = addEmployeesContainer.find('#wrapper01');

	var EmployeeObject = {
		employee_id: (options) ? options.employee_id : null
	};

	// addForm submit
	addForm.off('submit');
	addForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addForm;
		EmployeeObject.administration_id = clinicSelect.find(':selected').val();
		EmployeeObject.employee_name = nameInput.val();
		EmployeeObject.employee_phone = phoneInput.val();
		EmployeeObject.employee_pass = passInput.val();
		EmployeeObject.employee_address = addressInput.val();
		EmployeeObject.employee_state = wilayaSelect.find(':selected').val();
		EmployeeObject.employee_type_id = typeSelect.find(':selected').val();
		EmployeeObject.employee_birthplace = birthPlaceInput.val();
		EmployeeObject.employee_birthdate = birthDateInput.val();
		EmployeeObject.employee_salary = salaryInput.val();
		EmployeeObject.employee_administration = '';
		EmployeeObject.employee_ccp = ccpInput.val();
		// display loader
		SectionLoader(wrapper01);
		//update
		if ( EmployeeObject.employee_id != null )
		{
			updateEmployee(EmployeeObject).then(response =>
			{
				// hide loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				//
				target[0].reset();
				EmployeeObject.employee_id = null;

			});
			return;
		}
		// add
		addEmployee(EmployeeObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			 target[0].reset();
		});
	});
	// list states
	// display loader
	SectionLoader(wilayaSelect.closest('.section'));
	var response = await getAllStates();
	// hide loader
	SectionLoader(wilayaSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.wilaya_name}">${v.wilaya_name}</option>`;
		});
		wilayaSelect.html(html);
		setOptionSelected(wilayaSelect, USER_CONFIG.managerState);
	}
	// list employees types
	// display loader
	SectionLoader(typeSelect.closest('.section'));
	var response = await listEmployeesTypes();
	// hide loader
	SectionLoader(typeSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<option value="${v.employee_type_id}">${v.employee_type_name_ar}</option>`;
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<option value="${v.employee_type_id}">${v.employee_type_name_fr}</option>`;
			}
		});
		typeSelect.html(html);
	}
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var clinics = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = clinics.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);	
	}
	// employeed info
	displayOne();
	async function displayOne()
	{
		if ( EmployeeObject.employee_id == null )
			return;

		// display loader
		SectionLoader(wrapper01);
		var response = await getEmployee(EmployeeObject.employee_id);
		// hide loader
		SectionLoader(wrapper01, '');
		var data = response.data;
		nameInput.val(data.employee_name);
		phoneInput.val(data.employee_phone);
		passInput.val(data.employee_pass);
		addressInput.val(data.employee_address);
		setOptionSelected(wilayaSelect, data.employee_state);
		setOptionSelected(typeSelect, data.employee_type_id);
		setOptionSelected(clinicSelect, data.administration_id);
		birthPlaceInput.val(data.employee_birthplace);
		birthDateInput.val(data.employee_birthdate);
		salaryInput.val(data.employee_salary);
		ccpInput.val( data.employee_ccp );
	}

}
async function setupAllClinicEmployees()
{
	var allEmployeesContainer = $('#allClinicEmployeesContainer');
	if ( allEmployeesContainer[0] == undefined )
		return;

	var ERROR_BOX = allEmployeesContainer.find('#ERROR_BOX');

	var clinicSelect = allEmployeesContainer.find('#clinicSelect');
	var deleteSelectedBTN = allEmployeesContainer.find('#deleteSelectedBTN');
	var searchInput = allEmployeesContainer.find('#searchInput');
	var pagination = allEmployeesContainer.find('#pagination');
	var tableElement1 = allEmployeesContainer.find('#tableElement1');

	var tableElement2 = allEmployeesContainer.find('#tableElement2');

	var BACK_TO_MAIN_UI_BTN = allEmployeesContainer.find('[data-role="BACK_TO_MAIN_UI_BTN"]');

	var wrapper01 = allEmployeesContainer.find('#wrapper01');
	var wrapper02 = allEmployeesContainer.find('#wrapper02');
	var wrapper03 = allEmployeesContainer.find('#wrapper03');

	// back to main ui
	BACK_TO_MAIN_UI_BTN.off('click');
	BACK_TO_MAIN_UI_BTN.on('click', e =>
	{
		wrapper01.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	var EmployeeObject = {};
	// tableElement1 click
	tableElement1.off('click');
	tableElement1.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var employee_id = target.data('employeeid');
			var response = await getPage('views/pages/add-employees-for-clinics.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddEmployeesForClinics({employee_id:employee_id});
		}
		else if ( target.data('role') == 'EMPLOYEE' )
		{
			EmployeeObject.employee_id = target.data('employeeid');
			displayInfo();
		}
	});
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', async e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteEmployees(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var SearchObject = {
			query: searchInput.val(),
			administration_id: clinicSelect.find(':selected').val()
		};
		// display loader
		SectionLoader( wrapper01 );
		var response = await searchClinicEmployees(SearchObject);
		// hide loader
		SectionLoader( wrapper01, '' );
		// clear html
		tableElement1.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="EMPLOYEE" data-employeeid="${v.employee_id}" style="cursor: pointer;">
								<div class="form-check border-bottom p-1">
										<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault_${v.employee_id}" data-role="CHECK" data-employeeid="${v.employee_id}">
										<label class="form-check-label" for="flexCheckDefault_${v.employee_id}">
											أنقر للتحديد
										</label>
									</div>
								<div class="card-body no-pointer">
									<div class="h5">${v.employee_name}</div>
									<span class="text-02">${v.employee_phone}</span>
									<span class="text-04 text-muted">(${v.employee_state})</span>
								</div>
								<div class="pb-2">
									<a href="#" data-role="UPDATE" class="mx-2 text-dark" data-employeeid="${v.employee_id}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="EMPLOYEE" data-employeeid="${v.employee_id}" style="cursor: pointer;">
								<div class="form-check border-bottom p-1">
										<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault_${v.employee_id}" data-role="CHECK" data-employeeid="${v.employee_id}">
										<label class="form-check-label" for="flexCheckDefault_${v.employee_id}">
											Cliquez pour sélectionner
										</label>
									</div>
								<div class="card-body no-pointer">
									<div class="h5">${v.employee_name}</div>
									<span class="text-02">${v.employee_phone}</span>
									<span class="text-04 text-muted">(${v.employee_state})</span>
								</div>
								<div class="pb-2">
									<a href="#" data-role="UPDATE" class="mx-2 text-dark" data-employeeid="${v.employee_id}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement1, options);
	});
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);
	}
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// display all 
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// display info
	async function displayInfo()
	{
		// display loader
		SectionLoader(wrapper02);
		wrapper02.slideDown(200).siblings('.WRAPPER').slideUp(200);
		var response = await getEmployee(EmployeeObject.employee_id);
		// hide loader
		SectionLoader(wrapper02, '');
		// clear html
		tableElement2.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			html = `<div class="col-lg-12 col-md-12 col-sm-12 py-2 border-bottom">
							<div class="row gx-4 gy-3">
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-align-center w-100 h-100">
										<div>
											<div class="h5">${data.employee_name}</div>
											<div class="text-02">${data.employee_phone}</div>
											<div class="text-02 text-muted">(${data.employee_address} - ${data.employee_state})</div>
										</div>	
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">كلمة المرور: </span>
								<span class="text-04">${data.employee_pass}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">تاريخ ومكان الميلاد: </span>
								<span class="text-04">${data.employee_birthplace} - ${data.employee_birthdate}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">الحساب الجاري: </span>
								<span class="text-04">${data.employee_ccp}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">الراتب الشهري: </span>
								<span class="text-04">${data.employee_salary}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">القسم: </span>
								<span class="text-04">${data.type.employee_type_name_ar}</span>
							</div>
						</div>`;	
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			html = `<div class="col-lg-12 col-md-12 col-sm-12 py-2 border-bottom">
							<div class="row gx-4 gy-3">
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-align-center w-100 h-100">
										<div>
											<div class="h5">${data.employee_name}</div>
											<div class="text-02">${data.employee_phone}</div>
											<div class="text-02 text-muted">(${data.employee_address} - ${data.employee_state})</div>
										</div>	
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">Mot de passe: </span>
								<span class="text-04">${data.employee_pass}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">date et lieu de naissance: </span>
								<span class="text-04">${data.employee_birthplace} - ${data.employee_birthdate}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">Poste CCP: </span>
								<span class="text-04">${data.employee_ccp}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">salaire mensuel: </span>
								<span class="text-04">${data.employee_salary}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">Section: </span>
								<span class="text-04">${data.type.employee_type_name_ar}</span>
							</div>
						</div>`;	
		}
		// add html
		tableElement2.html(html);
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement1.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			EmployeeObject = {
				employee_id: check.data('employeeid')
			};
			if ( check.is(':checked') )
				list.push(EmployeeObject);
		}

		return list;
	}
}
// setup add employees for central administration
async function setupAddEmployeesForCentralAdministration(options = null)
{
	var addEmployeesContainer = $('#addEmployeesForCentralAdministrationContainer');
	if ( addEmployeesContainer[0] == undefined )
		return;

	var ERROR_BOX = addEmployeesContainer.find('#ERROR_BOX');

	var addForm = addEmployeesContainer.find('#addForm');
	var nameInput = addForm.find('#nameInput');
	var phoneInput = addForm.find('#phoneInput');
	var addressInput = addForm.find('#addressInput');
	var wilayaSelect = addForm.find('#wilayaSelect');
	var typeSelect = addForm.find('#typeSelect');
	var birthDateInput = addForm.find('#birthDateInput');
	var birthPlaceInput = addForm.find('#birthPlaceInput');
	var salaryInput = addForm.find('#salaryInput');
	var passInput = addForm.find('#passInput');
	var ccpInput = addForm.find('#ccpInput');

	var wrapper01 = addEmployeesContainer.find('#wrapper01');

	var EmployeeObject = {
		employee_id: (options) ? options.employee_id : null
	};

	// addForm submit
	addForm.off('submit');
	addForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addForm;
		EmployeeObject.administration_id = '';
		EmployeeObject.employee_name = nameInput.val();
		EmployeeObject.employee_phone = phoneInput.val();
		EmployeeObject.employee_pass = passInput.val();
		EmployeeObject.employee_address = addressInput.val();
		EmployeeObject.employee_state = wilayaSelect.find(':selected').val();
		EmployeeObject.employee_type_id = typeSelect.find(':selected').val();
		EmployeeObject.employee_birthplace = birthPlaceInput.val();
		EmployeeObject.employee_birthdate = birthDateInput.val();
		EmployeeObject.employee_salary = salaryInput.val();
		EmployeeObject.employee_administration = '.';
		EmployeeObject.employee_ccp = ccpInput.val();
		// display loader
		SectionLoader(wrapper01);
		//update
		if ( EmployeeObject.employee_id != null )
		{
			updateEmployee(EmployeeObject).then(response =>
			{
				// hide loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				//
				target[0].reset();
				EmployeeObject.employee_id = null;

			});
			return;
		}
		// add
		addEmployee(EmployeeObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			 target[0].reset();
		});
	});
	// list states
	// display loader
	SectionLoader(wilayaSelect.closest('.section'));
	var response = await getAllStates();
	// hide loader
	SectionLoader(wilayaSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.wilaya_name}">${v.wilaya_name}</option>`;
		});
		wilayaSelect.html(html);
		setOptionSelected(wilayaSelect, USER_CONFIG.managerState);
	}
	// list employees types
	// display loader
	SectionLoader(typeSelect.closest('.section'));
	var response = await listEmployeesTypes('.');
	// hide loader
	SectionLoader(typeSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<option value="${v.employee_type_id}">${v.employee_type_name_ar}</option>`;
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<option value="${v.employee_type_id}">${v.employee_type_name_fr}</option>`;
			}
		});
		typeSelect.html(html);
	}
	// employeed info
	displayOne();
	async function displayOne()
	{
		if ( EmployeeObject.employee_id == null )
			return;

		// display loader
		SectionLoader(wrapper01);
		var response = await getEmployee(EmployeeObject.employee_id);
		// hide loader
		SectionLoader(wrapper01, '');
		var data = response.data;
		nameInput.val(data.employee_name);
		phoneInput.val(data.employee_phone);
		passInput.val(data.employee_pass);
		addressInput.val(data.employee_address);
		setOptionSelected(wilayaSelect, data.employee_state);
		setOptionSelected(typeSelect, data.employee_type_id);
		EmployeeObject.administration_id = data.administration_id;
		birthPlaceInput.val(data.employee_birthplace);
		birthDateInput.val(data.employee_birthdate);
		salaryInput.val(data.employee_salary);
		ccpInput.val( data.employee_ccp );
	}

}
async function setupAllCentralAdministrationEmployees()
{
	var allEmployeesContainer = $('#allCentralAdminstrationEmployeesContainer');
	if ( allEmployeesContainer[0] == undefined )
		return;

	var ERROR_BOX = allEmployeesContainer.find('#ERROR_BOX');

	var deleteSelectedBTN = allEmployeesContainer.find('#deleteSelectedBTN');
	var searchInput = allEmployeesContainer.find('#searchInput');
	var pagination = allEmployeesContainer.find('#pagination');
	var tableElement1 = allEmployeesContainer.find('#tableElement1');

	var tableElement2 = allEmployeesContainer.find('#tableElement2');

	var BACK_TO_MAIN_UI_BTN = allEmployeesContainer.find('[data-role="BACK_TO_MAIN_UI_BTN"]');

	var wrapper01 = allEmployeesContainer.find('#wrapper01');
	var wrapper02 = allEmployeesContainer.find('#wrapper02');
	var wrapper03 = allEmployeesContainer.find('#wrapper03');

	// back to main ui
	BACK_TO_MAIN_UI_BTN.off('click');
	BACK_TO_MAIN_UI_BTN.on('click', e =>
	{
		wrapper01.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	var EmployeeObject = {};
	// tableElement1 click
	tableElement1.off('click');
	tableElement1.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var employee_id = target.data('employeeid');
			var response = await getPage('views/pages/add-employees-for-central-administration.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddEmployeesForCentralAdministration({employee_id:employee_id});
		}
		else if ( target.data('role') == 'EMPLOYEE' )
		{
			EmployeeObject.employee_id = target.data('employeeid');
			displayInfo();
		}
	});
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', async e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteEmployees(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var SearchObject = {
			query: searchInput.val(),
			administration_id: 0,
			employee_administration: '.'
		};
		// display loader
		SectionLoader( wrapper01 );
		var response = await searchClinicEmployees(SearchObject);
		// hide loader
		SectionLoader( wrapper01, '' );
		// clear html
		tableElement1.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="EMPLOYEE" data-employeeid="${v.employee_id}" style="cursor: pointer;">
								<div class="form-check border-bottom p-1">
									<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault_${v.employee_id}" data-role="CHECK" data-employeeid="${v.employee_id}">
									<label class="form-check-label" for="flexCheckDefault_${v.employee_id}">
										أنقر للتحديد
									</label>
								</div>
								<div class="card-body no-pointer">
									<div class="h5">${v.employee_name}</div>
									<span class="text-02">${v.employee_phone}</span>
									<span class="text-04 text-muted">(${v.employee_state})</span>
								</div>
								<div class="pb-2">
									<a href="#" data-role="UPDATE" class="mx-2 text-dark" data-employeeid="${v.employee_id}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="EMPLOYEE" data-employeeid="${v.employee_id}" style="cursor: pointer;">
								<div class="form-check border-bottom p-1">
									<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault_${v.employee_id}" data-role="CHECK" data-employeeid="${v.employee_id}">
									<label class="form-check-label" for="flexCheckDefault_${v.employee_id}">
										Cliquez pour sélectionner
									</label>
								</div>
								<div class="card-body no-pointer">
									<div class="h5">${v.employee_name}</div>
									<span class="text-02">${v.employee_phone}</span>
									<span class="text-04 text-muted">(${v.employee_state})</span>
								</div>
								<div class="pb-2">
									<a href="#" data-role="UPDATE" class="mx-2 text-dark" data-employeeid="${v.employee_id}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement1, options);
	});
	// display all 
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// display info
	async function displayInfo()
	{
		// display loader
		SectionLoader(wrapper02);
		wrapper02.slideDown(200).siblings('.WRAPPER').slideUp(200);
		var response = await getEmployee(EmployeeObject.employee_id);
		// hide loader
		SectionLoader(wrapper02, '');
		// clear html
		tableElement2.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			html = `<div class="col-lg-12 col-md-12 col-sm-12 py-2 border-bottom">
							<div class="row gx-4 gy-3">
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-align-center w-100 h-100">
										<div>
											<div class="h5">${data.employee_name}</div>
											<div class="text-02">${data.employee_phone}</div>
											<div class="text-02 text-muted">(${data.employee_address} - ${data.employee_state})</div>
										</div>	
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">كلمة المرور: </span>
								<span class="text-04">${data.employee_pass}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">تاريخ ومكان الميلاد: </span>
								<span class="text-04">${data.employee_birthplace} - ${data.employee_birthdate}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">الحساب الجاري: </span>
								<span class="text-04">${data.employee_ccp}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">الراتب الشهري: </span>
								<span class="text-04">${data.employee_salary}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">القسم: </span>
								<span class="text-04">${data.type.employee_type_name_ar}</span>
							</div>
						</div>`;	
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			html = `<div class="col-lg-12 col-md-12 col-sm-12 py-2 border-bottom">
							<div class="row gx-4 gy-3">
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-align-center w-100 h-100">
										<div>
											<div class="h5">${data.employee_name}</div>
											<div class="text-02">${data.employee_phone}</div>
											<div class="text-02 text-muted">(${data.employee_address} - ${data.employee_state})</div>
										</div>	
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">Mot de passe: </span>
								<span class="text-04">${data.employee_pass}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">date et lieu de naissance: </span>
								<span class="text-04">${data.employee_birthplace} - ${data.employee_birthdate}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">Poste CCP: </span>
								<span class="text-04">${data.employee_ccp}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">salaire mensuel: </span>
								<span class="text-04">${data.employee_salary}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">Section: </span>
								<span class="text-04">${data.type.employee_type_name_ar}</span>
							</div>
						</div>`;	
		}
		// add html
		tableElement2.html(html);
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement1.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			EmployeeObject = {
				employee_id: check.data('employeeid')
			};
			if ( check.is(':checked') )
				list.push(EmployeeObject);
		}

		return list;
	}
}
// setup products
async function setupAddProducts(options = null)
{
	var addProductsContainer = $('#addProductsContainer');
	if ( addProductsContainer[0] == undefined )
		return;

	var ERROR_BOX = addProductsContainer.find('#ERROR_BOX');

	var addForm = addProductsContainer.find('#addForm');
	var addProductBTN = addForm.find('#addProductBTN');
	var productsDiv = addForm.find('#productsDiv');

	var wrapper01 = addProductsContainer.find('#wrapper01');

	var ProductObject = {
		productId: (options) ? options.productId : null
	};

	addProductRow({
		uploadImage: false
	});
	// submit
	addForm.off('submit');
	addForm.on('submit', async e =>
	{
		e.preventDefault();
		var target = addForm;
		var ProductObjects = [];
		var items = selectedProducts();
		for (var i = 0; i < items.length; i++) 
		{
			var item = $(items[i]);
			ProductObjects.push({
				productHash: uniqid(),
				productName: item.find('[data-role="PRODUCT_NAME"]').val(),
				productDesc: item.find('[data-role="PRODUCT_DESC"]').val(),
				productPrice: item.find('[data-role="PRODUCT_PRICE"]').val(),
				productQuantity: item.find('[data-role="PRODUCT_QUANTITY"]').val(),
				productBarcode: item.find('[data-role="PRODUCT_BARCODE"]').val()
			});
		}
		// update
		// display loader
		SectionLoader(wrapper01);
		if ( ProductObject.productId != null )
		{
			var item = $(items[0]);
			ProductObject.productName = item.find('[data-role="PRODUCT_NAME"]').val();
			ProductObject.productDesc = item.find('[data-role="PRODUCT_DESC"]').val();
			ProductObject.productPrice = item.find('[data-role="PRODUCT_PRICE"]').val();
			ProductObject.productQuantity = item.find('[data-role="PRODUCT_QUANTITY"]').val();
			ProductObject.productBarcode = item.find('[data-role="PRODUCT_BARCODE"]').val();
			if ( item.find('[data-role="PRODUCT_IMAGE_FILE"]')[0].files.length > 0 )
				ProductObject.productImage = item.find('[data-role="PRODUCT_IMAGE_FILE"]')[0].files[0];
			
			updateProduct(ProductObject).then(response =>
			{
				// hide loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0)
					.find('#text').text(response.message);
					return;
				}

				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				// reset
				target[0].reset();
				ProductObject.productId = null;
				//
			});
			return;
		}
		// add
		batchAddProducts(ProductObjects).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				return;
			}

			ERROR_BOX.show(0).delay(7*1000).hide(0)
			.find('#text').text(response.message);
			// reset
			target[0].reset();
			//
			clearProducts();
		});
	});
	// add product
	addProductBTN.off('click');
	addProductBTN.on('click', e =>
	{
		addProductRow({
			uploadImage: false
		});
	});
	// productsDiv click
	productsDiv.off('click');
	productsDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'DELETE_PRODUCT' )
		{
			var parent = target.closest('[data-role="PRODUCT"]');
			parent.remove();
		}
	});
	// select image
	productsDiv.off('change');
	productsDiv.on('change', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'PRODUCT_IMAGE_FILE' )
		{
			var parent = target.closest('[data-role="PRODUCT"]');
			var pimgPreview = parent.find('[data-role="PRODUCT_IMAGE_PREVIEW"]');
			if ( target[0].files.length == 0 )
				return;

			var file = target[0].files[0];
			pimgPreview.attr('src', file.path);
		}
	});
	// barcode
	listenForBarcodeScanner(barcode =>
	{
		var items = selectedProducts();
		for (var i = 0; i < items.length; i++) 
		{
			var item = $(items[i]);
			var PRODUCT_BARCODE = item.find('[data-role="PRODUCT_BARCODE"]');
			if ( PRODUCT_BARCODE.is(':focus') )
				PRODUCT_BARCODE.val(barcode);
		}
	});
	// display one
	displayOne();
	function displayOne()
	{
		if ( ProductObject.productId == null )
			return;

		clearProducts();
		// display loader
		SectionLoader(wrapper01);
		getProduct(ProductObject.productId).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
				return;

			var data = response.data;
			addProductRow({
				uploadImage: true
			});
			var item = $(selectedProducts()[0]);
			// display on form
			var productImageUrl = (data.productImageData) ? JSON.parse(data.productImageData).url : 'assets/img/utils/placeholder.jpg';

			item.find('[data-role="PRODUCT_NAME"]').val(data.productName);
			item.find('[data-role="PRODUCT_DESC"]').val(data.productDesc);
			item.find('[data-role="PRODUCT_PRICE"]').val(data.productPrice);
			item.find('[data-role="PRODUCT_QUANTITY"]').val(data.productQuantity);
			item.find('[data-role="PRODUCT_BARCODE"]').val(data.productBarcode);
			item.find('[data-role="PRODUCT_IMAGE_PREVIEW"]').attr('src', productImageUrl);
		});
	}
	// selected products
	function selectedProducts()
	{
		return productsDiv.find('[data-role="PRODUCT"]');
	}
	// clear products
	function clearProducts()
	{
		productsDiv.html('');
	}
	// add product row
	function addProductRow(options)
	{
		var html = '';
		var imageInputs = `<div class="col-lg-6 col-md-6 col-sm-12">
								<div class="">
									<div class="row gx-3 gy-3">
										<div class="col-md col-sm-12">
											<label for="" class="form-label">اختر صورة</label>
											<input type="file" class="input-text" data-role="PRODUCT_IMAGE_FILE">
										</div>
										<div class="col-md-6 col-sm-12 text-center">
											<img src="assets/img/utils/placeholder.jpg" data-role="PRODUCT_IMAGE_PREVIEW" class="img-03 img-thumbnail" alt="">
										</div>
									</div>
								</div>
							</div>`;
		if ( !options.uploadImage )
			imageInputs = '';
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			html = `<div class="row gx-4 gy-2 p-2 my-3 border rounded" data-role="PRODUCT">
						<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="btn-close" data-role="DELETE_PRODUCT"></div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12">
							<div class="mb-2">
								<label for="" class="form-label">اسم المنتج</label>
								<input type="text" class="input-text input-text-outline" data-role="PRODUCT_NAME">
							</div>
							<div class="">
								<label for="" class="form-label">وصف مختصر</label>
								<textarea rows="4" class="input-text input-text-outline" data-role="PRODUCT_DESC"></textarea>
							</div>		
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12">
							<div class="mb-2">
								<label for="" class="form-label">السعر</label>
								<input type="number" step="any" min="0" class="input-text input-text-outline" data-role="PRODUCT_PRICE" value="0.00">
							</div>
							<div class="">
								<label for="" class="form-label">الكمية</label>
								<input type="number" step="any" value="0" class="input-text input-text-outline" data-role="PRODUCT_QUANTITY">
							</div>		
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12">
							<div class="">
								<label for="" class="form-label">قم بمسح الباركود</label>
								<input type="text" class="input-text input-text-outline" data-role="PRODUCT_BARCODE">
							</div>		
						</div>
						${imageInputs}
					</div>`;
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			html = `<div class="row gx-4 gy-2 p-2 my-3 border rounded" data-role="PRODUCT">
						<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="btn-close" data-role="DELETE_PRODUCT"></div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12">
							<div class="mb-2">
								<label for="" class="form-label">nom du produit</label>
								<input type="text" class="input-text input-text-outline" data-role="PRODUCT_NAME">
							</div>
							<div class="">
								<label for="" class="form-label">Brève description</label>
								<textarea rows="4" class="input-text input-text-outline" data-role="PRODUCT_DESC"></textarea>
							</div>		
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12">
							<div class="mb-2">
								<label for="" class="form-label">le prix</label>
								<input type="number" step="any" min="0" class="input-text input-text-outline" data-role="PRODUCT_PRICE" value="0.00">
							</div>
							<div class="">
								<label for="" class="form-label">Quantité</label>
								<input type="number" step="any" value="0" class="input-text input-text-outline" data-role="PRODUCT_QUANTITY">
							</div>		
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12">
							<div class="">
								<label for="" class="form-label">Scannez le code-barres</label>
								<input type="text" class="input-text input-text-outline" data-role="PRODUCT_BARCODE">
							</div>		
						</div>
						${imageInputs}
					</div>`;
		}	

		productsDiv.append(html);
	}
}
// setup all products
async function setupAllCentersProducts()
{
	var allCentersProductsContainer = $('#allCentersProductsContainer');
	if ( allCentersProductsContainer[0] == undefined )
		return;

	var ERROR_BOX = allCentersProductsContainer.find('#ERROR_BOX');
	var clinicSelect = allCentersProductsContainer.find('#clinicSelect');
	var deleteSelectedBTN = allCentersProductsContainer.find('#deleteSelectedBTN');
	var searchInput = allCentersProductsContainer.find('#searchInput');
	var pagination = allCentersProductsContainer.find('#pagination');
	var tableElement = allCentersProductsContainer.find('#tableElement');

	var currency = {
		ar: 'دج',
		fr: 'DA'
	};
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await batchDeleteProductsFromCenter({
				administration_id: clinicSelect.find(':selected').val(),
				list: selectedRows()
			});
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// tableElement click
	tableElement.off('click');
	tableElement.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var productId = target.data('productid');
			var response = await getPage('views/pages/add-products.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddProducts({productId: productId});
		}
		else if ( target.data('role') == 'DELETE' )
		{
			PromptConfirmDialog().then(async c =>
			{
				var parent = target.closest('[data-role="ROW"]');
				var productId = target.data('productid');
				// display loader
				SectionLoader(parent);
				var response = await deleteProduct(productId);
				// hide loader
				SectionLoader(parent, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				//
				displayAll();
			});
		}
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var val = searchInput.val();
		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			query: val
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var response = await searchProductsLocal(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var productImageUrl = (v.productImageData) ? JSON.parse(v.productImageData).url : 'assets/img/utils/placeholder.jpg';

			html += `<div class="tr flex-align-center">
						<div class="td">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-productid="${v.productId}">
						</div>
						<div class="td">
							<img src="${productImageUrl}" style="width:50px;height:50px;" class="img-thumbnail" alt="">
						</div>
						<div class="td">${v.productName}</div>
						<div class="td">${v.productPrice}</div>
						<div class="td">${v.productQuantity2}</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement.find('.tbody'), options);
	});
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);
	}
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({ productId: check.data('productid') });
		}

		return list;
	}
}
// setup inventory products
async function setupAllInventoryProducts()
{
	var allInventoryProductsContainer = $('#allInventoryProductsContainer');
	if ( allInventoryProductsContainer[0] == undefined )
		return;

	var ERROR_BOX = allInventoryProductsContainer.find('#ERROR_BOX');
	var deleteSelectedBTN = allInventoryProductsContainer.find('#deleteSelectedBTN');
	var searchInput = allInventoryProductsContainer.find('#searchInput');
	var pagination = allInventoryProductsContainer.find('#pagination');
	var tableElement = allInventoryProductsContainer.find('#tableElement');

	var currency = {
		ar: 'دج',
		fr: 'DA'
	};
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteProducts(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// tableElement click
	tableElement.off('click');
	tableElement.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var productId = target.data('productid');
			var response = await getPage('views/pages/add-products.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddProducts({productId: productId});
		}
		else if ( target.data('role') == 'DELETE' )
		{
			PromptConfirmDialog().then(async c =>
			{
				var parent = target.closest('[data-role="ROW"]');
				var productId = target.data('productid');
				// display loader
				SectionLoader(parent);
				var response = await deleteProduct(productId);
				// hide loader
				SectionLoader(parent, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				//
				displayAll();
			});
		}
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var val = searchInput.val();
		var SearchObject = {
			query: val
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var response = await searchProducts(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var productImageUrl = (v.productImageData) ? JSON.parse(v.productImageData).url : 'assets/img/utils/placeholder.jpg';

			html += `<div class="tr flex-align-center">
						<div class="td">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-productid="${v.productId}">
						</div>
						<div class="td">
							<img src="${productImageUrl}" style="width:50px;height:50px;" class="img-thumbnail" alt="">
						</div>
						<div class="td">${v.productName}</div>
						<div class="td">${v.productPrice}</div>
						<div class="td">${v.productQuantity}</div>
						<div class="td">
							<button class="btn btn-primary btn-sm rounded-0 pointer" data-role="UPDATE" data-productid="${v.productId}">
								<i class="fas fa-edit no-pointer"></i>
							</button>
						</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement.find('.tbody'), options);
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({ productId: check.data('productid') });
		}

		return list;
	}
}
// setup all products Invoices
async function setupAllProductsInvoices()
{
	var allCentersProductsInvoicesContainer = $('#allCentersProductsInvoicesContainer');
	if ( allCentersProductsInvoicesContainer[0] == undefined )
		return;

	var ERROR_BOX = allCentersProductsInvoicesContainer.find('#ERROR_BOX');

	var clinicSelect = allCentersProductsInvoicesContainer.find('#clinicSelect');
	var deleteSelectedBTN = allCentersProductsInvoicesContainer.find('#deleteSelectedBTN');
	var searchInput = allCentersProductsInvoicesContainer.find('#searchInput');
	var searchBTN = allCentersProductsInvoicesContainer.find('#searchBTN');
	var fromDateInput = allCentersProductsInvoicesContainer.find('#fromDateInput');
	var toDateInput = allCentersProductsInvoicesContainer.find('#toDateInput');
	var pagination = allCentersProductsInvoicesContainer.find('#pagination');
	var tableElement = allCentersProductsInvoicesContainer.find('#tableElement');

	var currency = {
		ar: 'دج',
		fr: 'DA'
	};
	// set primary dates
	var now = new Date();
	fromDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	toDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	// tableElement click
	tableElement.off('click');
	tableElement.on('click', async e =>
	{
		var target = $(e.target);
		if ( target[0].nodeName == 'TD' )
		{
			var parent = target.closest('tr');
			var nextTR = parent.next();
			nextTR.slideToggle(200)
			parent.toggleClass('expanded');
		}

		if ( target.data('role') == 'UPDATE' )
		{
			var order_id = target.data('orderid');
			var response = await getPage('views/pages/sell-products.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupSellProducts({order_id:order_id});
		}
	});
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', async e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteOrders(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);
	}
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// search between dates
	searchBTN.off('click');
	searchBTN.on('click', async e =>
	{
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			from: fromDateInput.val(),
			to: toDateInput.val(),
			isAccepted: 1
		};

		var response = await searchOrdersBetweenDatesLocal2(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('tbody').html('');
		if ( response.code == 404 )
			return;
		
		var data = response.data;
		var html = '';
		for (var i = 0; i < data.length; i++) 
		{
			var order = data[i];
			// loop items
			if ( order.order_items )
			{
				var itemsHTML = '<ul class="list-group list-group-flush list-group-numbered">';
				var itemsHTML2 = '';
				var productPrice = 0.00;
				var order_item_dept_rate = 0.00;
				var order_item_price = 0.00;
				for (var j = 0; j < order.order_items.length; j++) 
				{
					var item = order.order_items[j];
					productPrice += parseFloat(item.item_info.productPrice);
					order_item_dept_rate += parseFloat(item.item_dept.order_item_dept_rate);
					order_item_price += parseFloat(item.order_item_price);
					itemsHTML += `<li class="list-group-item text-04">${item.item_name}</li>`;
					itemsHTML2 += `<tr>
									<td>${item.item_name}</td>
									<td>${item.order_item_quantity}</td>
									<td>${item.order_item_price}</td>
									<td>${item.order_item_final_amount}</td>
									</tr>`;
				}
				itemsHTML += '</ul>';
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>المنتج</th>
											<th>الكمية</th>
											<th>سعر الوحدة</th>
											<th>السعر الكلي</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>المبلغ الاجمالي</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>مبلغ الدين</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>المبلغ المدفوع</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>le produit</th>
											<th>Quantité</th>
											<th>prix d'Unité</th>
											<th>prix total</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>Montant total</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>Montant de la dette</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>Le montant payé</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}	
		}
		// add html
		var options = {
			data: html.split('PAG_SEP'),
			resultsPerPage: 12
		};
		new SmoothPagination(pagination, tableElement.find('tbody'), options);
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			from: fromDateInput.val(),
			to: toDateInput.val(),
			isAccepted: 1
		};

		var response = await searchOrdersBetweenDatesLocal2(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('tbody').html('');
		if ( response.code == 404 )
			return;
		
		var data = response.data;
		var html = '';
		for (var i = 0; i < data.length; i++) 
		{
			var order = data[i];
			// loop items
			if ( order.order_items )
			{
				var itemsHTML = '<ul class="list-group list-group-flush list-group-numbered">';
				var itemsHTML2 = '';
				var productPrice = 0.00;
				var order_item_dept_rate = 0.00;
				var order_item_price = 0.00;
				for (var j = 0; j < order.order_items.length; j++) 
				{
					var item = order.order_items[j];
					productPrice += parseFloat(item.item_info.productPrice);
					order_item_dept_rate += parseFloat(item.item_dept.order_item_dept_rate);
					order_item_price += parseFloat(item.order_item_price);
					itemsHTML += `<li class="list-group-item text-04">${item.item_name}</li>`;
					itemsHTML2 += `<tr>
									<td>${item.item_name}</td>
									<td>${item.order_item_quantity}</td>
									<td>${item.order_item_price}</td>
									<td>${item.order_item_final_amount}</td>
									</tr>`;
				}
				itemsHTML += '</ul>';
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>المنتج</th>
											<th>الكمية</th>
											<th>سعر الوحدة</th>
											<th>السعر الكلي</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>المبلغ الاجمالي</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>مبلغ الدين</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>المبلغ المدفوع</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>le produit</th>
											<th>Quantité</th>
											<th>prix d'Unité</th>
											<th>prix total</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>Montant total</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>Montant de la dette</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>Le montant payé</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}	
		}
		// add html
		var options = {
			data: html.split('PAG_SEP'),
			resultsPerPage: 12
		};
		new SmoothPagination(pagination, tableElement.find('tbody'), options);
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({ order_id: check.data('orderid') });
		}

		return list;
	}
}
// setup all products billings
function setupAllProductsBillings()
{
	var allProductsBillingsContainer = $('#allProductsBillingsContainer');
	if ( allProductsBillingsContainer[0] == undefined )
		return;

	var ERROR_BOX = allProductsBillingsContainer.find('#ERROR_BOX');

	var deleteSelectedBTN = allProductsBillingsContainer.find('#deleteSelectedBTN');
	var searchInput = allProductsBillingsContainer.find('#searchInput');
	var searchBTN = allProductsBillingsContainer.find('#searchBTN');
	var fromDateInput = allProductsBillingsContainer.find('#fromDateInput');
	var toDateInput = allProductsBillingsContainer.find('#toDateInput');
	var pagination = allProductsBillingsContainer.find('#pagination');
	var tableElement = allProductsBillingsContainer.find('#tableElement');

	var currency = {
		ar: 'دج',
		fr: 'DA'
	};
	// set primary dates
	var now = new Date();
	fromDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	toDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	// tableElement click
	tableElement.off('click');
	tableElement.on('click', async e =>
	{
		var target = $(e.target);
		if ( target[0].nodeName == 'TD' )
		{
			var parent = target.closest('tr');
			var nextTR = parent.next();
			nextTR.slideToggle(200)
			parent.toggleClass('expanded');
		}

		if ( target.data('role') == 'UPDATE' )
		{
			var order_id = target.data('orderid');
			var response = await getPage('views/pages/sell-products.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupSellProducts({order_id:order_id});
		}
	});
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', async e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteOrders(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// search between dates
	searchBTN.off('click');
	searchBTN.on('click', async e =>
	{
		var query = searchInput.val();
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var SearchObject = {
			query: query,
			from: fromDateInput.val(),
			to: toDateInput.val(),
			isAccepted: 1
		};

		var response = await searchOrdersBetweenDates(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('tbody').html('');
		if ( response.code == 404 )
			return;
		
		var data = response.data;
		var html = '';
		for (var i = 0; i < data.length; i++) 
		{
			var order = data[i];
			// loop items
			if ( order.order_items )
			{
				var itemsHTML = '<ul class="list-group list-group-flush list-group-numbered">';
				var itemsHTML2 = '';
				var productPrice = 0.00;
				var order_item_dept_rate = 0.00;
				var order_item_price = 0.00;
				for (var j = 0; j < order.order_items.length; j++) 
				{
					var item = order.order_items[j];
					productPrice += parseFloat(item.item_info.productPrice);
					order_item_dept_rate += parseFloat(item.item_dept.order_item_dept_rate);
					order_item_price += parseFloat(item.order_item_price);
					itemsHTML += `<li class="list-group-item text-04">${item.item_name}</li>`;
					itemsHTML2 += `<tr>
									<td>${item.item_name}</td>
									<td>${item.order_item_quantity}</td>
									<td>${item.order_item_price}</td>
									<td>${item.order_item_final_amount}</td>
									</tr>`;
				}
				itemsHTML += '</ul>';
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td>${order.order_receiver_name}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>المنتج</th>
											<th>الكمية</th>
											<th>سعر الوحدة</th>
											<th>السعر الكلي</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>المبلغ الاجمالي</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>مبلغ الدين</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>المبلغ المدفوع</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td>${order.order_receiver_name}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>le produit</th>
											<th>Quantité</th>
											<th>prix d'Unité</th>
											<th>prix total</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>Montant total</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>Montant de la dette</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>Le montant payé</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}	
		}
		// add html
		var options = {
			data: html.split('PAG_SEP'),
			resultsPerPage: 12
		};
		new SmoothPagination(pagination, tableElement.find('tbody'), options);
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var SearchObject = {
			query: searchInput.val(),
			isAccepted: 1
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var response = await searchOrders(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('tbody').html('');
		if ( response.code == 404 )
			return;
		
		var data = response.data;
		var html = '';
		for (var i = 0; i < data.length; i++) 
		{
			var order = data[i];
			// loop items
			if ( order.order_items )
			{
				var itemsHTML = '<ul class="list-group list-group-flush list-group-numbered">';
				var itemsHTML2 = '';
				var productPrice = 0.00;
				var order_item_dept_rate = 0.00;
				var order_item_price = 0.00;
				for (var j = 0; j < order.order_items.length; j++) 
				{
					var item = order.order_items[j];
					productPrice += parseFloat(item.item_info.productPrice);
					order_item_dept_rate += parseFloat(item.item_dept.order_item_dept_rate);
					order_item_price += parseFloat(item.order_item_price);
					itemsHTML += `<li class="list-group-item text-04">${item.item_name}</li>`;
					itemsHTML2 += `<tr>
									<td>${item.item_name}</td>
									<td>${item.order_item_quantity}</td>
									<td>${item.order_item_price}</td>
									<td>${item.order_item_final_amount}</td>
									</tr>`;
				}
				itemsHTML += '</ul>';
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td>${order.order_receiver_name}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>المنتج</th>
											<th>الكمية</th>
											<th>سعر الوحدة</th>
											<th>السعر الكلي</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>المبلغ الاجمالي</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>مبلغ الدين</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>المبلغ المدفوع</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td>${order.order_receiver_name}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>le produit</th>
											<th>Quantité</th>
											<th>prix d'Unité</th>
											<th>prix total</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>Montant total</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>Montant de la dette</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>Le montant payé</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}	
		}
		// add html
		var options = {
			data: html.split('PAG_SEP'),
			resultsPerPage: 12
		};
		new SmoothPagination(pagination, tableElement.find('tbody'), options);
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({ order_id: check.data('orderid') });
		}

		return list;
	}
}
// setup billings waiting approval
function setupBillingsWaitingApproval()
{
	var billingsWaitingApprovalContainer = $('#billingsWaitingApprovalContainer');
	if ( billingsWaitingApprovalContainer[0] == undefined )
		return;

	var ERROR_BOX = billingsWaitingApprovalContainer.find('#ERROR_BOX');

	var deleteSelectedBTN = billingsWaitingApprovalContainer.find('#deleteSelectedBTN');
	var searchInput = billingsWaitingApprovalContainer.find('#searchInput');
	var searchBTN = billingsWaitingApprovalContainer.find('#searchBTN');
	var fromDateInput = billingsWaitingApprovalContainer.find('#fromDateInput');
	var toDateInput = billingsWaitingApprovalContainer.find('#toDateInput');
	var pagination = billingsWaitingApprovalContainer.find('#pagination');
	var tableElement = billingsWaitingApprovalContainer.find('#tableElement');

	var currency = {
		ar: 'دج',
		fr: 'DA'
	};
	// set primary dates
	var now = new Date();
	fromDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	toDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	// tableElement click
	tableElement.off('click');
	tableElement.on('click', async e =>
	{
		var target = $(e.target);
		if ( target[0].nodeName == 'TD' )
		{
			var parent = target.closest('tr');
			var nextTR = parent.next();
			nextTR.slideToggle(200)
			parent.toggleClass('expanded');
		}

		if ( target.data('role') == 'UPDATE' )
		{
			var order_id = target.data('orderid');
			var response = await getPage('views/pages/sell-products.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupSellProducts({order_id:order_id});
		}
		else if ( target.data('role') == 'ACCEPT' )
		{
			var order_id = target.data('orderid');
			PromptConfirmDialog().then(async c =>
			{
				// display loader
				SectionLoader(tableElement);
				var response = await acceptOrder(order_id);
				// hide loader
				SectionLoader(tableElement, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				//
				displayAll();
			});
		}
	});
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', async e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteOrders(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// search between dates
	searchBTN.off('click');
	searchBTN.on('click', async e =>
	{
		var query = searchInput.val();
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var SearchObject = {
			query: query,
			from: fromDateInput.val(),
			to: toDateInput.val(),
			isAccepted: 0
		};

		var response = await searchOrdersBetweenDates(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('tbody').html('');
		if ( response.code == 404 )
			return;
		
		var data = response.data;
		var html = '';
		for (var i = 0; i < data.length; i++) 
		{
			var order = data[i];
			// loop items
			if ( order.order_items )
			{
				var itemsHTML = '<ul class="list-group list-group-flush list-group-numbered">';
				var itemsHTML2 = '';
				var productPrice = 0.00;
				var order_item_dept_rate = 0.00;
				var order_item_price = 0.00;
				for (var j = 0; j < order.order_items.length; j++) 
				{
					var item = order.order_items[j];
					productPrice += parseFloat(item.item_info.productPrice);
					order_item_dept_rate += parseFloat(item.item_dept.order_item_dept_rate);
					order_item_price += parseFloat(item.order_item_price);
					itemsHTML += `<li class="list-group-item text-04">${item.item_name}</li>`;
					itemsHTML2 += `<tr>
									<td>${item.item_name}</td>
									<td>${item.order_item_quantity}</td>
									<td>${item.order_item_price}</td>
									<td>${item.order_item_final_amount}</td>
									</tr>`;
				}
				itemsHTML += '</ul>';
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td>${order.order_receiver_name}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
							<td>
								<button class="btn btn-outline-success btn-sm pointer" data-role="ACCEPT" data-orderid="${order.order_id}">
										<i class="fas fa-check no-pointer"></i>
								</button>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>المنتج</th>
											<th>الكمية</th>
											<th>سعر الوحدة</th>
											<th>السعر الكلي</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>المبلغ الاجمالي</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>مبلغ الدين</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>المبلغ المدفوع</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td>${order.order_receiver_name}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
							<td>
								<button class="btn btn-outline-success btn-sm pointer" data-role="ACCEPT" data-orderid="${order.order_id}">
										<i class="fas fa-check no-pointer"></i>
								</button>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>le produit</th>
											<th>Quantité</th>
											<th>prix d'Unité</th>
											<th>prix total</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>Montant total</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>Montant de la dette</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>Le montant payé</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}	
		}
		// add html
		var options = {
			data: html.split('PAG_SEP'),
			resultsPerPage: 12
		};
		new SmoothPagination(pagination, tableElement.find('tbody'), options);
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var SearchObject = {
			query: searchInput.val(),
			isAccepted: 0
		};
		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");

		var response = await searchOrders(SearchObject);
		// hide loader
		TopLoader('', false);
		// clear html
		tableElement.find('tbody').html('');
		if ( response.code == 404 )
			return;
		
		var data = response.data;
		var html = '';
		for (var i = 0; i < data.length; i++) 
		{
			var order = data[i];
			// loop items
			if ( order.order_items )
			{
				var itemsHTML = '<ul class="list-group list-group-flush list-group-numbered">';
				var itemsHTML2 = '';
				var productPrice = 0.00;
				var order_item_dept_rate = 0.00;
				var order_item_price = 0.00;
				for (var j = 0; j < order.order_items.length; j++) 
				{
					var item = order.order_items[j];
					productPrice += parseFloat(item.item_info.productPrice);
					order_item_dept_rate += parseFloat(item.item_dept.order_item_dept_rate);
					order_item_price += parseFloat(item.order_item_price);
					itemsHTML += `<li class="list-group-item text-04">${item.item_name}</li>`;
					itemsHTML2 += `<tr>
									<td>${item.item_name}</td>
									<td>${item.order_item_quantity}</td>
									<td>${item.order_item_price}</td>
									<td>${item.order_item_final_amount}</td>
									</tr>`;
				}
				itemsHTML += '</ul>';
			}
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td>${order.order_receiver_name}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
							<td>
								<button class="btn btn-outline-success btn-sm pointer" data-role="ACCEPT" data-orderid="${order.order_id}">
										<i class="fas fa-check no-pointer"></i>
								</button>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>المنتج</th>
											<th>الكمية</th>
											<th>سعر الوحدة</th>
											<th>السعر الكلي</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>المبلغ الاجمالي</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>مبلغ الدين</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>المبلغ المدفوع</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<tr class="expand-row">
							<td>
								<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-orderid="${order.order_id}">
							</td>
							<td>${order.order_hash}</td>
							<td>${order.order_date}|${order.order_time}</td>
							<td>${order.order_total_amount}</td>
							<td>${order.order_amount_paid}</td>
							<td>${order.order_receiver_name}</td>
							<td style="width:15px">
								<svg part="svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" aria-labelledby="ic-caret-up" focusable="false" viewBox="0 0 24 24" class="expand-icon" dataV17f0a767=""><g><path fill-rule="evenodd" clip-rule="evenodd" d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"></path></g></svg>
							</td>
							<td>
								<button class="btn btn-outline-success btn-sm pointer" data-role="ACCEPT" data-orderid="${order.order_id}">
										<i class="fas fa-check no-pointer"></i>
								</button>
							</td>
						</tr>PAG_SEP
						<tr class="expand-row__row" style="display:none;">
							<td colspan="10">
								<table class="table-01">
									<thead>
										<tr>
											<th>le produit</th>
											<th>Quantité</th>
											<th>prix d'Unité</th>
											<th>prix total</th>
										</tr>
									</thead>
									<tbody>
										${itemsHTML2}
									</tbody>
								</table>
								<div class="order-price-table">
									<div class="order-price-table-contents">
										${itemsHTML}	
									</div>
									<div class="order-price-table-contents">
										<div class="order-price-table-td">
											<strong>Montant total</strong>
											<span>${parseFloat(order.order_total_amount).toFixed(2)}</span>
										</div>
										<div class="order-price-table-td">
											<strong>Montant de la dette</strong>
											<span>${parseFloat(order.order_dept_amount).toFixed(2)}</span>
										</div>
										<div class="border-top my-1"></div>
										<div class="order-price-table-td">
											<strong>Le montant payé</strong>
											<span>${parseFloat(order.order_amount_paid).toFixed(2)}</span>
										</div>	
									</div>
								</div>
							</td>
						</tr>PAG_SEP`;	
			}	
		}
		// add html
		var options = {
			data: html.split('PAG_SEP'),
			resultsPerPage: 12
		};
		new SmoothPagination(pagination, tableElement.find('tbody'), options);
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({ order_id: check.data('orderid') });
		}

		return list;
	}
}
// setup add clinics
async function setupAddClinics(options = null)
{
	var addClinicsContainer = $('#addClinicsContainer');
	if ( addClinicsContainer[0] == undefined )
		return;

	var ERROR_BOX = addClinicsContainer.find('#ERROR_BOX');

	var addForm = addClinicsContainer.find('#addForm');
	var nameInput = addForm.find('#nameInput');
	var phoneInput = addForm.find('#phoneInput');
	var wilayaSelect = addForm.find('#wilayaSelect');
	var baladiaInput = addForm.find('#baladiaInput');
	var addressInput = addForm.find('#addressInput');

	var wrapper01 = addClinicsContainer.find('#wrapper01');

	var ClinicObject = {
		clinicId: (options) ? options.clinicId : null
	};
	// addForm submit
	addForm.off('submit');
	addForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addForm;
		ClinicObject.clinicName = nameInput.val();
		ClinicObject.clinicPhone  = phoneInput.val();
		ClinicObject.clinicState  = wilayaSelect.find(':selected').val();
		ClinicObject.clinicBaladia = baladiaInput.val();
		ClinicObject.clinicAddress = addressInput.val();
		// display loader
		SectionLoader(wrapper01);
		// update
		if ( ClinicObject.clinicId != null )
		{
			updateClinic(ClinicObject).then(response =>
			{
				// hide loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				//
				target[0].reset();
				ClinicObject.clinicId = null;
			});
			return;	
		}
		// add
		addClinic(ClinicObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			target[0].reset();
		});
	});
	// list states
	// display loader
	SectionLoader(wilayaSelect.closest('.section'));
	var response = await getAllStates();
	// hide loader
	SectionLoader(wilayaSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.wilaya_name}">${v.wilaya_name}</option>`;
		});
		// add html
		wilayaSelect.html(html);
		setOptionSelected(wilayaSelect, USER_CONFIG.managerState );
	}
	//
	displayOne();
	async function displayOne()
	{
		if ( ClinicObject.clinicId == null )
			return;

		// display loader
		SectionLoader(wrapper01);
		var response = await getClinic(ClinicObject.clinicId);
		// hide loader
		SectionLoader(wrapper01, '');
		if ( response.code == 404 )
			return;

		var data = response.data;
		nameInput.val( data.clinicName );
		phoneInput.val( data.clinicPhone );
		setOptionSelected(wilayaSelect, data.clinicState );
		baladiaInput.val( data.clinicBaladia );
		addressInput.val( data.clinicAddress );
	}
}
async function setupAllClinics()
{
	var allClinicsContainer = $('#allClinicsContainer');
	if ( allClinicsContainer[0] == undefined )
		return;

	var ERROR_BOX = allClinicsContainer.find('#ERROR_BOX');

	var clinicSelect = allClinicsContainer.find('#clinicSelect');
	var deleteSelectedBTN = allClinicsContainer.find('#deleteSelectedBTN');
	var searchInput = allClinicsContainer.find('#searchInput');
	var pagination = allClinicsContainer.find('#pagination');
	var tableElement1 = allClinicsContainer.find('#tableElement1');

	var tableElement2 = allClinicsContainer.find('#tableElement2');

	var BACK_TO_MAIN_UI_BTN = allClinicsContainer.find('[data-role="BACK_TO_MAIN_UI_BTN"]');

	var wrapper01 = allClinicsContainer.find('#wrapper01');
	var wrapper02 = allClinicsContainer.find('#wrapper02');
	var wrapper03 = allClinicsContainer.find('#wrapper03');

	// back to main ui
	BACK_TO_MAIN_UI_BTN.off('click');
	BACK_TO_MAIN_UI_BTN.on('click', e =>
	{
		wrapper01.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	var ClinicObject = {};
	// tableElement1 click
	tableElement1.off('click');
	tableElement1.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var clinicId = target.data('clinicid');
			var response = await getPage('views/pages/add-clinics.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddClinics({clinicId:clinicId});
		}
		else if ( target.data('role') == 'CLINIC' )
		{
			ClinicObject.clinicId = target.data('clinicid');
			displayInfo();
		}
	});
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', async e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteClinics(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var query = searchInput.val();
		// display loader
		SectionLoader( wrapper01 );
		var response = await searchClinics(query);
		// hide loader
		SectionLoader( wrapper01, '' );
		// clear html
		tableElement1.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="CLINIC" data-clinicid="${v.clinicId}" style="cursor: pointer;">
								<div class="form-check border-bottom p-1">
										<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault_${v.clinicId}" data-role="CHECK" data-clinicid="${v.clinicId}">
										<label class="form-check-label" for="flexCheckDefault_${v.clinicId}">
											أنقر للتحديد
										</label>
									</div>
								<div class="card-body no-pointer">
									<div class="h5">${v.clinicName}</div>
									<span class="text-02">${v.clinicPhone}</span>
									<span class="text-04 text-muted">(${v.clinicState})</span>
								</div>
								<div class="pb-2">
									<a href="#" data-role="UPDATE" class="mx-2 text-dark" data-clinicid="${v.clinicId}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				html += `<div class="col-lg-4 col-md-6 col-sm-12">
							<div class="card hover-shadow" data-role="CLINIC" data-clinicid="${v.clinicId}" style="cursor: pointer;">
								<div class="form-check border-bottom p-1">
										<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault_${v.clinicId}" data-role="CHECK" data-clinicid="${v.clinicId}">
										<label class="form-check-label" for="flexCheckDefault_${v.clinicId}">
											Cliquez pour sélectionner
										</label>
									</div>
								<div class="card-body no-pointer">
									<div class="h5">${v.clinicName}</div>
									<span class="text-02">${v.clinicPhone}</span>
									<span class="text-04 text-muted">(${v.clinicState})</span>
								</div>
								<div class="pb-2">
									<a href="#" data-role="UPDATE" class="mx-2 text-dark" data-clinicid="${v.clinicId}">
										<i class="fas fa-edit no-pointer"></i>
									</a>
								</div>
							</div>
						</div>PAG_SEP`;	
			}
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement1, options);
	});
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);
	}
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// display all 
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// display info
	async function displayInfo()
	{
		// display loader
		SectionLoader(wrapper02);
		wrapper02.slideDown(200).siblings('.WRAPPER').slideUp(200);
		var response = await getClinic(ClinicObject.clinicId);
		// hide loader
		SectionLoader(wrapper02, '');
		// clear html
		tableElement2.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			html = `<div class="col-lg-12 col-md-12 col-sm-12 py-2 border-bottom">
							<div class="row gx-4 gy-3">
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-align-center w-100 h-100">
										<div>
											<div class="h5">${data.clinicName}</div>
											<div class="text-02">${data.clinicPhone}</div>
										</div>	
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">الولاية: </span>
								<span class="text-04">${data.clinicState}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">البلدية: </span>
								<span class="text-04">${data.clinicBaladia}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">العنوان: </span>
								<span class="text-04">${data.clinicAddress}</span>
							</div>
						</div>`;	
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			html = `<div class="col-lg-12 col-md-12 col-sm-12 py-2 border-bottom">
							<div class="row gx-4 gy-3">
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-align-center w-100 h-100">
										<div>
											<div class="h5">${data.clinicName}</div>
											<div class="text-02">${data.clinicPhone}</div>
										</div>	
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">l'état: </span>
								<span class="text-04">${data.clinicState}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">Municipal: </span>
								<span class="text-04">${data.clinicBaladia}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">l'adresse: </span>
								<span class="text-04">${data.clinicAddress}</span>
							</div>
						</div>`;	
		}
		// add html
		tableElement2.html(html);
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement1.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			ClinicObject = {
				clinicId: check.data('clinicid')
			};
			if ( check.is(':checked') )
				list.push(ClinicObject);
		}

		return list;
	}
}
// setup patients
async function setupAddPatients(options = null)
{
	var addPatientsContainer = $('#addPatientsContainer');
	if ( addPatientsContainer[0] == undefined )
		return;

	var ERROR_BOX = addPatientsContainer.find('#ERROR_BOX');

	var addForm = addPatientsContainer.find('#addForm');
	var clinicSelect = addForm.find('#clinicSelect');
	var patientNameInput = addForm.find('#patientNameInput');
	var patientPhoneInput = addForm.find('#patientPhoneInput');
	var patientPassInput = addForm.find('#patientPassInput');
	var patientAgeInput = addForm.find('#patientAgeInput');
	var patientGenderSelect = addForm.find('#patientGenderSelect');
	var patientAddressInput = addForm.find('#patientAddressInput');
	var patientBarcodeInput = addForm.find('#patientBarcodeInput');
	var patientBirthPlaceInput = addForm.find('#patientBirthPlaceInput');
	var patientBirthDateInput = addForm.find('#patientBirthDateInput');
	var patientChildrenInput = addForm.find('#patientChildrenInput');
	var patientStateSelect = addForm.find('#patientStateSelect');
	var patientWhatsappInput = addForm.find('#patientWhatsappInput');
	var patientFBInput = addForm.find('#patientFBInput');
	var patientTelegramInput = addForm.find('#patientTelegramInput');
	var diabetesSelect = addForm.find('#diabetesSelect');
	var bloodPressureSelect = addForm.find('#bloodPressureSelect');
	var chronicDiseaseSelect = addForm.find('#chronicDiseaseSelect');

	var qrcodePreviewIMG = addForm.find('#qrcodePreviewIMG');

	var wrapper01 = addPatientsContainer.find('#wrapper01');

	var PatientObject = {
		patientId: (options != null) ? options.patientId : null
	};
	// submit
	addForm.off('submit');
	addForm.on('submit', async e =>
	{
		e.preventDefault();
		var target = addForm;
		PatientObject.clinicId = clinicSelect.find(':selected').val();
		PatientObject.patientName = patientNameInput.val();
		PatientObject.patientPhone = patientPhoneInput.val();
		PatientObject.patientPass = patientPassInput.val();
		PatientObject.patientAge = patientAgeInput.val();
		PatientObject.patientGender = patientGenderSelect.find(':selected').val();
		PatientObject.patientAddress = patientAddressInput.val();
		PatientObject.patientState = patientStateSelect.find(':selected').val();
		PatientObject.patientWhatsapp = patientWhatsappInput.val();
		PatientObject.patientFB = patientFBInput.val();
		PatientObject.patientTelegram = patientTelegramInput.val();
		PatientObject.patientChildren = patientChildrenInput.val();
		PatientObject.patientBirthPlace = patientBirthPlaceInput.val();
		PatientObject.patientBirthDate = patientBirthDateInput.val();
		PatientObject.hasDiabetes = diabetesSelect.find(':selected').val();
		PatientObject.hasBloodPressure = bloodPressureSelect.find(':selected').val();
		PatientObject.hasChronicDisease = chronicDiseaseSelect.find(':selected').val();
		// display loader
		SectionLoader(wrapper01);
		// update
		if ( PatientObject.patientId != null )
		{
			updatePatient(PatientObject).then(response =>
			{
				//  loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0)
					.find('#text').text(response.message);
					return;
				}

				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				// reset
				target[0].reset();
				// clear id
				PatientObject.patientId = null;
				//
			});
			return;
		}
		PatientObject.patientHashId = uniqid();
		//create qr code
		var page = `${PROJECT_URL}Patient/Dashboard/?patient_session=${PatientObject.patientHashId}`;
		var qrcode = await generateQRCode( page );
		PatientObject.patientQRCode = qrcode;
		qrcodePreviewIMG.attr('src', qrcode);
		// translate
		addPatient(PatientObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				return;
			}

			ERROR_BOX.show(0).delay(7*1000).hide(0)
			.find('#text').text(response.message);
			// reset
			target[0].reset();
			//
		});
	});
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);
	}
	// display one
	displayOne(PatientObject.patientId);
	function displayOne(patientId)
	{
		if ( patientId == null )
			return;

		// display loader
		SectionLoader(wrapper01);
		getPatient(patientId).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
				return;

			var data = response.data;
			// display on form
			patientNameInput.val(data.patientName);
			patientPhoneInput.val(data.patientPhone);
			patientPassInput.val( (data.patientPass != null && data.patientPass != '') ? data.patientPass : '' );
			patientAgeInput.val(data.patientAge);
			setOptionSelected(patientGenderSelect, data.patientGender);
			patientAddressInput.val(data.patientAddress);
			patientBarcodeInput.val(data.patientBarcode);
			setOptionSelected(diabetesSelect, data.hasDiabetes);
			setOptionSelected(bloodPressureSelect, data.hasBloodPressure);
			setOptionSelected(chronicDiseaseSelect, data.hasChronicDisease);
			patientBirthPlaceInput.val(data.patientBirthPlace);
			patientBirthDateInput.val(data.patientBirthDate);
			patientChildrenInput.val(data.patientChildren);
			setOptionSelected(patientStateSelect, data.patientState);
			patientWhatsappInput.val(data.patientWhatsapp);
			patientFBInput.val(data.patientFB);
			patientTelegramInput.val(data.patientTelegram);

			PatientObject.patientQRCode = data.patientQRCode;
			qrcodePreviewIMG.attr('src', data.patientQRCode);
		});
	}
}
// setup all patients
async function setupAllPatients()
{
	var allPatientsContainer = $('#allPatientsContainer');
	if ( allPatientsContainer[0] == undefined )
		return;

	var ERROR_BOX = allPatientsContainer.find('#ERROR_BOX');
	var clinicSelect = allPatientsContainer.find('#clinicSelect');
	var deleteSelectedBTN = allPatientsContainer.find('#deleteSelectedBTN');
	var searchInput = allPatientsContainer.find('#searchInput');
	var pagination = allPatientsContainer.find('#pagination');
	var tableElement1 = allPatientsContainer.find('#tableElement1');

	var tableElement5 = allPatientsContainer.find('#tableElement5');

	var patientInfoDiv = allPatientsContainer.find('#patientInfoDiv');

	var contentsWrapper = allPatientsContainer.find('#contentsWrapper');
	var changedSettingsWrapper = allPatientsContainer.find('#changedSettingsWrapper');
	var backBTN = changedSettingsWrapper.find('#backBTN');

	var BACK_TO_MAIN_UI_BTN = allPatientsContainer.find('[data-role="BACK_TO_MAIN_UI_BTN"]');

	var wrapper01 = allPatientsContainer.find('#wrapper01');
	var wrapper02 = allPatientsContainer.find('#wrapper02');
	var wrapper03 = allPatientsContainer.find('#wrapper03');

	var PatientObject = {
		patientId: null
	}

	// back to main ui
	BACK_TO_MAIN_UI_BTN.off('click');
	BACK_TO_MAIN_UI_BTN.on('click', e =>
	{
		wrapper01.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	// tableElement1 click
	tableElement1.off('click');
	tableElement1.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var patientId = target.data('patientid');
			var pageHTML = await getPage('views/pages/add-patients.ejs');
			MAIN_CONTENT_CONTAINER.html(pageHTML);
			setupAddPatients({patientId: patientId});
			//rebindEvents();
		}
		else if ( target.data('role') == 'PATIENT' )
		{
			PatientObject.patientId = target.data('patientid');
			displayInfo();
		}
		else if ( target.data('role') == 'VIEW_MORE_SETTINGS' )
		{
			PatientObject.patientId = target.data('patientid');
			PatientObject.hasChronicDisease = target.closest('[data-role="PATIENT"]').data('has-chronic-disease');
			PatientObject.hasBloodPressure = target.closest('[data-role="PATIENT"]').data('has-blood-pressure');
			PatientObject.hasDiabetes = target.closest('[data-role="PATIENT"]').data('has-diabetes');
			wrapper03.slideDown(200).siblings('.WRAPPER').slideUp(200);
			updateAdditionalSettings();
		}
	});
	// delete
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog().then(c =>
		{
			// translate
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				TopLoader("حذف البيانات...");
				deletePatients( getSelectedRows() ).then(response =>
				{
					// hide loader
					TopLoader('', false);
					if ( response.code == 404 )
					{
						ERROR_BOX.show(0).delay(7*1000).hide(0)
						.find('#text').text(response.message);
						return;
					}
					ERROR_BOX.show(0).delay(7*1000).hide(0)
					.find('#text').text(response.message);
					//
					displayAll();
				});
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				TopLoader("Suprimmer les données...");
				deletePatients( getSelectedRows() ).then(response =>
				{
					// hide loader
					TopLoader('', false);
					if ( response.code == 404 )
					{
						ERROR_BOX.show(0).delay(7*1000).hide(0)
						.find('#text').text(response.message);
						return;
					}
					ERROR_BOX.show(0).delay(7*1000).hide(0)
					.find('#text').text(response.message);
					//
					displayAll();
				});
			}
		});
	});
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);
	}
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', e =>
	{
		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			query: searchInput.val()
		};
		// display loader
		SectionLoader(wrapper01);
		searchPatientsLocal(SearchObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			// clear html
			tableElement1.html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( FUI_DISPLAY_LANG.lang == 'ar' )
				{
					html+= `<div class="col-lg-4 col-md-6 col-sm-12">
								<div class="card hover-shadow" data-role="PATIENT" data-patientid="${v.patientId}" data-has-chronic-disease="${v.hasChronicDisease}" style="cursor: pointer;" data-has-diabetes="${v.hasDiabetes}" data-has-blood-pressure="${v.hasBloodPressure}">
									<div class="py-2 mb-2">
										<div class="form-check">
											<input class="form-check-input" type="checkbox" data-role="CHECK" data-patientid="${v.patientId}" value="" id="flexCheckDefault_${v.patientId}">
											<label class="form-check-label" for="flexCheckDefault_${v.patientId}">
												قم بالتحديد
											</label>
										</div>
									</div>
									<div class="card-body no-pointer">
										<div class="h5">${v.patientName}</div>
										<div class="text-02">${v.patientPhone}</div>
										<div class="text-04">الدين: ${v.patientDeptAmount} ${CURRENCY.ar}</div>
									</div>
									<div class="py-2">
										<a href="#" class="d-inline-block mx-2 text-dark" data-role="VIEW_MORE_SETTINGS" data-patientid="${v.patientId}">عرض المزيد من الاعدادات</a>
										<a href="#" class="d-inline-block text-dark" data-role="UPDATE" data-patientid="${v.patientId}">
											<i class="fas fa-edit no-pointer"></i>
										</a>
									</div>
								</div>
							</div>PAG_SEP`;
				}
				else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				{
					html+= `<div class="col-lg-4 col-md-6 col-sm-12">
								<div class="card hover-shadow" data-role="PATIENT" data-patientid="${v.patientId}" data-has-chronic-disease="${v.hasChronicDisease}" style="cursor: pointer;" data-has-diabetes="${v.hasDiabetes}" data-has-blood-pressure="${v.hasBloodPressure}">
									<div class="py-2 mb-2">
										<div class="form-check">
											<input class="form-check-input" type="checkbox" data-role="CHECK" data-patientid="${v.patientId}" value="" id="flexCheckDefault_${v.patientId}">
											<label class="form-check-label" for="flexCheckDefault_${v.patientId}">
												Selectioner
											</label>
										</div>
									</div>
									<div class="card-body no-pointer">
										<div class="h5">${v.patientName}</div>
										<div class="text-02">${v.patientPhone}</div>
										<div class="text-04">la dette: ${v.patientDeptAmount} ${CURRENCY.fr}</div>
									</div>
									<div class="py-2">
										<a href="#" class="d-inline-block mx-2 text-dark" data-role="VIEW_MORE_SETTINGS" data-patientid="${v.patientId}">Afficher plus de paramètres</a>
										<a href="#" class="d-inline-block text-dark" data-role="UPDATE" data-patientid="${v.patientId}">
											<i class="fas fa-edit no-pointer"></i>
										</a>
									</div>
								</div>
							</div>PAG_SEP`;
				}
			});
			// add html
			var options = {
				data: html.split('PAG_SEP'),
				resultsPerPage: 9
			};
			new SmoothPagination(pagination, tableElement1, options);
		});
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// display info
	async function displayInfo()
	{
		// display loader
		SectionLoader(wrapper02);
		wrapper02.slideDown(200).siblings('.WRAPPER').slideUp(200);
		var response = await getPatient(PatientObject.patientId);
		// hide loader
		SectionLoader(wrapper02, '');
		// clear html
		patientInfoDiv.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		var hasDiabetes = '';
		var hasBloodPressure = '';
		var hasChronicDisease = '';
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			hasDiabetes = (data.hasDiabetes == ST_NO) ? 'لا' : 'نعم';
			hasBloodPressure = (data.hasBloodPressure == ST_NO) ? 'لا' : 'نعم';
			hasChronicDisease = (data.hasChronicDisease == ST_NO) ? 'لا' : 'نعم';

			html = `<div class="col-lg-12 col-md-12 col-sm-12 py-2 border-bottom">
							<div class="row gx-4 gy-3">
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-align-center w-100 h-100">
										<div>
											<div class="h5">${data.patientName}</div>
											<div class="text-02 text-muted">(${data.patientPhone})</div>
										</div>	
									</div>
								</div>
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-center w-100 h-100">
										<img src="${data.patientQRCode}" class="img-03 img-thumbnail" alt="">
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">كلمة المرور: </span>
								<span class="text-04">${data.patientPass}</span>
							</div>
							<div class="">
								<span class="text-01">العمر: </span>
								<span class="text-04">${data.patientAge}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">الجنس: </span>
								<span class="text-04">${data.patientGender}</span>
							</div>
							<div class="">
								<span class="text-01">العنوان: </span>
								<span class="text-04">${data.patientAddress}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">الوضعية: </span>
								<span class="text-04">${data.patientState}</span>
							</div>
							<div class="">
								<span class="text-01">الاولاد: </span>
								<span class="text-04">${data.patientChildren}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">تاريخ ومكان الميلاد: </span>
								<span class="text-04">${data.patientBirthDate} - ${data.patientBirthPlace}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">مرض السكري: </span>
								<span class="text-04">${hasDiabetes}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">ضغط الدم: </span>
								<span class="text-04">${hasBloodPressure}</span>
							</div>
							<div class="">
								<span class="text-01">مرض مزمن: </span>
								<span class="text-04">${hasChronicDisease}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">واتساب: </span>
								<span class="text-04">${data.patientWhatsapp}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">فيسبوك: </span>
								<span class="text-04">${data.patientFB}</span>
							</div>
							<div class="">
								<span class="text-01">تيليغرام: </span>
								<span class="text-04">${data.patientTelegram}</span>
							</div>
						</div>`;	
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			hasDiabetes = (data.hasDiabetes == ST_NO) ? 'non' : 'oui';
			hasBloodPressure = (data.hasBloodPressure == ST_NO) ? 'non' : 'oui';
			hasChronicDisease = (data.hasChronicDisease == ST_NO) ? 'non' : 'oui';

			html = `<div class="col-lg-12 col-md-12 col-sm-12 py-2 border-bottom">
							<div class="row gx-4 gy-3">
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-align-center w-100 h-100">
										<div>
											<div class="h5">${data.patientName}</div>
											<div class="text-02 text-muted">(${data.patientPhone})</div>
										</div>	
									</div>
								</div>
								<div class="col-md-6 col-sm-12">
									<div class="d-inline-flex flex-center w-100 h-100">
										<img src="${data.patientQRCode}" class="img-03 img-thumbnail" alt="">
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">Mot de passe: </span>
								<span class="text-04">${data.patientPass}</span>
							</div>
							<div class="">
								<span class="text-01">l'âge: </span>
								<span class="text-04">${data.patientAge}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">le sexe: </span>
								<span class="text-04">${data.patientGender}</span>
							</div>
							<div class="">
								<span class="text-01">l'adresse: </span>
								<span class="text-04">${data.patientAddress}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">L'état civil: </span>
								<span class="text-04">${data.patientState}</span>
							</div>
							<div class="">
								<span class="text-01">les garçons: </span>
								<span class="text-04">${data.patientChildren}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">date et lieu de naissance: </span>
								<span class="text-04">${data.patientBirthDate} - ${data.patientBirthPlace}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">Diabète: </span>
								<span class="text-04">${hasDiabetes}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">Pression artérielle: </span>
								<span class="text-04">${hasBloodPressure}</span>
							</div>
							<div class="">
								<span class="text-01">Maladie chronique: </span>
								<span class="text-04">${hasChronicDisease}</span>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-12 py-2 border-bottom">
							<div class="mb-2">
								<span class="text-01">WhatsApp: </span>
								<span class="text-04">${data.patientWhatsapp}</span>
							</div>
							<div class="mb-2">
								<span class="text-01">Facebook: </span>
								<span class="text-04">${data.patientFB}</span>
							</div>
							<div class="">
								<span class="text-01">Telegram: </span>
								<span class="text-04">${data.patientTelegram}</span>
							</div>
						</div>`;	
		}
		
		patientInfoDiv.html(html);
	}
	// get selected
	function getSelectedRows()
	{
		var list = [];
		var checks = tableElement1.find('[data-role="CHECK"]');
		for (var i = 0; i < checks.length; i++) 
		{
			var check = $(checks[i]);
			if ( check.is(':checked') )
				list.push({ patientId: check.data('patientid') });
		}

		return list;
	}
	
	// update additional settings
	function updateAdditionalSettings()
	{
		// blood pressure
		var collapseOne = allPatientsContainer.find('#collapseOne');
		var pagination0 = collapseOne.find('#pagination0');
		var tableElement0 = collapseOne.find('#tableElement0');

		if ( PatientObject.hasBloodPressure == ST_NO )
			tableElement0.closest('.accordion-item').addClass('disabled');

		// tableElement click
		tableElement0.off('click');
		tableElement0.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapseOne.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'blood_pressure'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapseOne.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayBloodPressure();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapseOne
		collapseOne.off('shown.bs.collapse');
		collapseOne.on('shown.bs.collapse', e =>
		{
			displayBloodPressure();
		});
		//collapseOne.trigger('shown.bs.collapse');

		// display blood pressure
		function displayBloodPressure()
		{
			// display blood pressure
			SectionLoader(collapseOne.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'blood_pressure'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapseOne.find('.accordion-body'), '');
				// clear html
				tableElement0.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.blood_pressure}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination0, tableElement0.find('.tbody'), options);
			});
		}
		// diabetes
		var collapseTwo = allPatientsContainer.find('#collapseTwo');
		var pagination2 = collapseTwo.find('#pagination2');
		var tableElement2 = collapseTwo.find('#tableElement2');

		if ( PatientObject.hasDiabetes == ST_NO )
			tableElement2.closest('.accordion-item').addClass('disabled');

		// tableElement click
		tableElement2.off('click');
		tableElement2.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapseTwo.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'diabetes'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapseTwo.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayDiabetes();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapseTwo
		collapseTwo.off('shown.bs.collapse');
		collapseTwo.on('shown.bs.collapse', e =>
		{
			displayDiabetes();
		});

		// display diabetes
		function displayDiabetes()
		{
			// display blood pressure
			SectionLoader(collapseTwo.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'diabetes'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapseTwo.find('.accordion-body'), '');
				// clear html
				tableElement2.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{

					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.diabetes}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination2, tableElement2.find('.tbody'), options);
			});
		}
		// weight
		var collapseThree = allPatientsContainer.find('#collapseThree');
		var pagination3 = collapseThree.find('#pagination3');
		var tableElement3 = collapseThree.find('#tableElement3');

		// tableElement click
		tableElement3.off('click');
		tableElement3.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapseThree.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'weight'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapseThree.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayWeight();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapseThree
		collapseThree.off('shown.bs.collapse');
		collapseThree.on('shown.bs.collapse', e =>
		{
			displayWeight();
		});

		// display weight
		function displayWeight()
		{
			// display blood pressure
			SectionLoader(collapseThree.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'weight'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapseThree.find('.accordion-body'), '');
				// clear html
				tableElement3.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.weight}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination3, tableElement3.find('.tbody'), options);
			});
		}
		// abdominal_circumference
		var collapseFour = allPatientsContainer.find('#collapseFour');
		var pagination4 = collapseFour.find('#pagination4');
		var tableElement4 = collapseFour.find('#tableElement4');

		// tableElement click
		tableElement4.off('click');
		tableElement4.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapseFour.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'abdominal_circumference'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapseFour.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayAbdominal_circumference();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapseFour
		collapseFour.off('shown.bs.collapse');
		collapseFour.on('shown.bs.collapse', e =>
		{
			displayAbdominal_circumference();
		});

		// display abdominal_circumference
		function displayAbdominal_circumference()
		{
			// 
			SectionLoader(collapseFour.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'abdominal_circumference'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapseFour.find('.accordion-body'), '');
				// clear html
				tableElement4.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.abdominal_circumference}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination4, tableElement4.find('.tbody'), options);
			});
		}
		// chest_circumference
		var collapseNine = allPatientsContainer.find('#collapseNine');
		var pagination6 = collapseNine.find('#pagination6');
		var tableElement6 = collapseNine.find('#tableElement6');
		// tableElement click
		tableElement6.off('click');
		tableElement6.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapseNine.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'chest_circumference'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapseNine.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayChest_circumference();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapseNine
		collapseNine.off('shown.bs.collapse');
		collapseNine.on('shown.bs.collapse', e =>
		{
			displayChest_circumference();
		});
		// display chest_circumference
		function displayChest_circumference()
		{
			// 
			SectionLoader(collapseNine.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'chest_circumference'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapseNine.find('.accordion-body'), '');
				// clear html
				tableElement6.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.chest_circumference}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination6, tableElement6.find('.tbody'), options);
			});
		}
		// arms_circumference
		var collapseTen = allPatientsContainer.find('#collapseTen');
		var pagination7 = collapseTen.find('#pagination7');
		var tableElement7 = collapseTen.find('#tableElement7');
		// tableElement click
		tableElement6.off('click');
		tableElement6.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapseTen.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'arms_circumference'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapseTen.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayArms_circumference();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapseTen
		collapseTen.off('shown.bs.collapse');
		collapseTen.on('shown.bs.collapse', e =>
		{
			displayArms_circumference();
		});
		// display arms_circumference
		function displayArms_circumference()
		{
			// 
			SectionLoader(collapseTen.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'arms_circumference'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapseTen.find('.accordion-body'), '');
				// clear html
				tableElement7.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.arms_circumference}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination7, tableElement7.find('.tbody'), options);
			});
		}
		// insulin
		var collapseEight = allPatientsContainer.find('#collapseEight');
		var pagination5 = collapseEight.find('#pagination5');
		var tableElement5 = collapseEight.find('#tableElement5');
		// tableElement click
		tableElement5.off('click');
		tableElement5.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapseEight.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'insulin'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapseEight.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayInsulin();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapseEight
		collapseEight.off('shown.bs.collapse');
		collapseEight.on('shown.bs.collapse', e =>
		{
			displayInsulin();
		});
		// display insulin
		function displayInsulin()
		{
			// 
			SectionLoader(collapseEight.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'insulin'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapseEight.find('.accordion-body'), '');
				// clear html
				tableElement5.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.insulin}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination5, tableElement5.find('.tbody'), options);
			});
		}
		// TSH
		var collapse11 = allPatientsContainer.find('#collapse11');
		var pagination8 = collapse11.find('#pagination8');
		var tableElement8 = collapse11.find('#tableElement8');
		// tableElement click
		tableElement8.off('click');
		tableElement8.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapse11.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'TSH'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapse11.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayTSH();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapse11
		collapse11.off('shown.bs.collapse');
		collapse11.on('shown.bs.collapse', e =>
		{
			displayTSH();
		});
		// display TSH
		function displayTSH()
		{
			// 
			SectionLoader(collapse11.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'TSH'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapse11.find('.accordion-body'), '');
				// clear html
				tableElement8.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.TSH}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination8, tableElement8.find('.tbody'), options);
			});
		}
		// HBA1c
		var collapse12 = allPatientsContainer.find('#collapse12');
		var pagination9 = collapse12.find('#pagination9');
		var tableElement9 = collapse12.find('#tableElement9');
		// tableElement click
		tableElement9.off('click');
		tableElement9.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapse12.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'HBA1c'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapse12.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayHBA1c();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapse12
		collapse12.off('shown.bs.collapse');
		collapse12.on('shown.bs.collapse', e =>
		{
			displayHBA1c();
		});
		// display HBA1c
		function displayHBA1c()
		{
			// 
			SectionLoader(collapse12.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'HBA1c'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapse12.find('.accordion-body'), '');
				// clear html
				tableElement9.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.HBA1c}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination9, tableElement9.find('.tbody'), options);
			});
		}
		// VS
		var collapse13 = allPatientsContainer.find('#collapse13');
		var pagination10 = collapse13.find('#pagination10');
		var tableElement10 = collapse13.find('#tableElement10');
		// tableElement click
		tableElement10.off('click');
		tableElement10.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapse13.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'VS'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapse13.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayVS();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapse13
		collapse13.off('shown.bs.collapse');
		collapse13.on('shown.bs.collapse', e =>
		{
			displayVS();
		});
		// display VS
		function displayVS()
		{
			// 
			SectionLoader(collapse13.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'VS'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapse13.find('.accordion-body'), '');
				// clear html
				tableElement10.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.VS}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination10, tableElement10.find('.tbody'), options);
			});
		}
		// CRP
		var collapse14 = allPatientsContainer.find('#collapse14');
		var pagination11 = collapse14.find('#pagination11');
		var tableElement11 = collapse14.find('#tableElement11');
		// tableElement click
		tableElement11.off('click');
		tableElement11.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE' )
			{
				PromptConfirmDialog().then(c =>
				{
					// display loader
					SectionLoader(collapse14.find('.accordion-body'));
					deleteChangedSetting({
						id: target.data('id'),
						column: 'CRP'
					}).then(response =>
					{
						// hide loader
						SectionLoader(collapse14.find('.accordion-body'), '');
						if ( response.code == 404 )	
						{
							ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
							return;
						}
						ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
						// 
						displayCRP();
					});
				});
			}
			else if ( target.data('role') == 'PREVIEW_DOC' )
			{
				e.preventDefault();
				PreviewFileDialog({
					url: target.attr('href')
				});
			}
		});
		// collapse14
		collapse14.off('shown.bs.collapse');
		collapse14.on('shown.bs.collapse', e =>
		{
			displayCRP();
		});
		// display CRP
		function displayCRP()
		{
			// 
			SectionLoader(collapse14.find('.accordion-body'));
			listChangedSettings({
				patientId: PatientObject.patientId,
				column: 'CRP'
			}).then(response =>
			{
				// hide loader
				SectionLoader(collapse14.find('.accordion-body'), '');
				// clear html
				tableElement11.find('.tbody').html('');
				if ( response.code == 404 )
					return;

				var data = response.data;
				var html = '';
				$.each(data, (k,v) =>
				{
					var doc_url = (v.patient_doc_object) ? JSON.parse(v.patient_doc_object).url : '';
					var patient_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">تحميل الملف</a>` : '';
					var preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">فتح الملف للمعاينة</a>` : '';
					if ( FUI_DISPLAY_LANG.lang == 'fr' )
					{
						patient_doc_link = (doc_url) ? `<a href="${doc_url}" data-role="DOWNLOAD_FILE" download="${path.basename(doc_url)}">télécharger un fichier</a>` : '';
						preview_doc_link = (doc_url != '') ? `<a href="${doc_url}" data-role="PREVIEW_DOC">Ouvrir le fichier pour l'aperçu</a>` : '';
					}
					html += `<div class="tr">
								<div class="td">${v.CRP}</div>
								<div class="td">${v.infoDate}|${v.infoTime}</div>
								<div class="td pointer">
									${patient_doc_link}
									<div>
										${preview_doc_link}
									</div>
								</div>
								<div class="td pointer">
									<button class="btn btn-danger btn-sm" data-role="DELETE" data-id="${v.id}">
										<span class="no-pointer">
											<i class="fas fa-trash"></i>
										</span>
									</button>
								</div>
							</div>PAG_SEP`;
				});
				// add html
				var options = {
					data: html.split('PAG_SEP')
				};
				new SmoothPagination(pagination11, tableElement11.find('.tbody'), options);
			});
		}
	}

	// add changed settings
	// save more info
	var moreInfoForm = allPatientsContainer.find('#moreInfoForm');
	var bloodPressureInput = moreInfoForm.find('#bloodPressureInput');
	var diabetesInput = moreInfoForm.find('#diabetesInput');
	var insulinInput = moreInfoForm.find('#insulinInput');
	var TSHInput = moreInfoForm.find('#TSHInput');
	var HBA1cInput = moreInfoForm.find('#HBA1cInput');
	var VSInput = moreInfoForm.find('#VSInput');
	var CRPInput = moreInfoForm.find('#CRPInput');
	var abdominalInput = moreInfoForm.find('#abdominalInput');
	var infoDateInput = moreInfoForm.find('#infoDateInput');
	var infoTimeInput = moreInfoForm.find('#infoTimeInput');
	var fileInput = moreInfoForm.find('#fileInput');

	var bloodPressureSelect = moreInfoForm.find('#bloodPressureSelect');
	var diabetesSelect = moreInfoForm.find('#diabetesSelect');

	var now = new Date();
	// set current date/time in input
	infoDateInput.val(CURRENT_DATE);
	infoTimeInput.val(CURRENT_TIME);
	// moreInfoForm submt
	moreInfoForm.off('submit');
	moreInfoForm.on('submit', e =>
	{
		e.preventDefault();
		var target = moreInfoForm;
		PatientObject.blood_pressure = bloodPressureInput.val();
		PatientObject.diabetes = diabetesInput.val();
		PatientObject.insulin = insulinInput.val();
		PatientObject.TSH = TSHInput.val();
		PatientObject.HBA1c = HBA1cInput.val();
		PatientObject.VS = VSInput.val();
		PatientObject.CRP = CRPInput.val();
		PatientObject.infoDate = infoDateInput.val();
		PatientObject.infoTime = infoTimeInput.val();
		if ( fileInput[0].files.length > 0 )
			PatientObject.patient_doc = fileInput[0].files[0];
		// display loader
		SectionLoader(moreInfoForm);
		addChangedSettings(PatientObject).then(response =>
		{
			// hide loader
			SectionLoader(moreInfoForm, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text')
				.text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text')
			.text(response.message);
			// reset
			target.find('input[type="number"], input[type="text"]').val('');
		});
	});
	// change diabetes, blood pressure .... status
	bloodPressureSelect.off('change');
	bloodPressureSelect.on('change', e =>
	{
		var val = bloodPressureSelect.find(':selected').val();

		if ( val == ST_NO )
			bloodPressureSelect.next().addClass('disabled').val('');
		else if ( val == ST_YES )
			bloodPressureSelect.next().removeClass('disabled').val('');
	});
	diabetesSelect.off('change');
	diabetesSelect.on('change', e =>
	{
		var val = diabetesSelect.find(':selected').val();

		if ( val == ST_NO )
			diabetesSelect.next().addClass('disabled').val('');
		else if ( val == ST_YES )
			diabetesSelect.next().removeClass('disabled').val('');
	});
	// save more info
	var moreInfoForm2 = allPatientsContainer.find('#moreInfoForm2');
	var weightInput = moreInfoForm2.find('#weightInput');
	var abdominalCircumferenceInput = moreInfoForm2.find('#abdominalCircumferenceInput');
	var chestCircumferenceInput = moreInfoForm2.find('#chestCircumferenceInput');
	var ArmsCircumferenceInput = moreInfoForm2.find('#ArmsCircumferenceInput');
	var infoDateInput2 = moreInfoForm2.find('#infoDateInput2');
	var infoTimeInput2 = moreInfoForm2.find('#infoDateInput2');
	var fileInput2 = moreInfoForm2.find('#fileInput2');
	// set current date/time in input
	moreInfoForm2.find('input[type="date"]').val(CURRENT_DATE);
	moreInfoForm2.find('input[type="time"]').val(CURRENT_TIME);
	// moreInfoForm submt
	moreInfoForm2.off('submit');
	moreInfoForm2.on('submit', e =>
	{
		e.preventDefault();
		var target = moreInfoForm2;
		PatientObject.weight = weightInput.val();
		PatientObject.abdominal_circumference = abdominalCircumferenceInput.val();
		PatientObject.chest_circumference = chestCircumferenceInput.val();
		PatientObject.arms_circumference = ArmsCircumferenceInput.val();
		PatientObject.infoDate = infoDateInput2.val();
		PatientObject.infoTime = infoTimeInput2.val();
		if ( fileInput2[0].files.length > 0 )
			PatientObject.patient_doc = fileInput2[0].files[0];
		// display loader
		SectionLoader(moreInfoForm2);
		addChangedSettings(PatientObject).then(response =>
		{
			// hide loader
			SectionLoader(moreInfoForm2, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text')
				.text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text')
			.text(response.message);
			// reset
			target.find('input[type="number"], input[type="text"]').val('');
		});
	});
	// add / sub dept
	var updateDeptForm = allPatientsContainer.find('#updateDeptForm');
	var deptAmountInput = updateDeptForm.find('#deptAmountInput');
	var subDeptBTN = updateDeptForm.find('#subDeptBTN');
	var addDeptBTN = updateDeptForm.find('#addDeptBTN');

	updateDeptForm.off('submit');
	updateDeptForm.on('submit', e =>
	{
		e.preventDefault();
	});
	subDeptBTN.off('click');
	subDeptBTN.on('click', async e =>
	{
		SectionLoader(updateDeptForm);
		var response = await setPatientDept({
			patientId: PatientObject.patientId,
			amount: deptAmountInput.val(),
			operation: 'sub'
		});
		SectionLoader(updateDeptForm, '');
		if ( response.code == 404 )
		{
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text')
			.text(response.message);
			return;
		}
		ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text')
		.text(response.message);
		// reset
		updateDeptForm[0].reset();
	});
	addDeptBTN.off('click');
	addDeptBTN.on('click', async e =>
	{
		SectionLoader(updateDeptForm);
		var response = await setPatientDept({
			patientId: PatientObject.patientId,
			amount: deptAmountInput.val(),
			operation: 'add'
		});
		SectionLoader(updateDeptForm, '');
		if ( response.code == 404 )
		{
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text')
			.text(response.message);
			return;
		}
		ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text')
		.text(response.message);
		// reset
		updateDeptForm[0].reset();
	});
}
// setup add prescriptions
async function setupAddPrescriptions(options = null)
{
	var addPrescriptionsContainer = $('#addPrescriptionsContainer');
	if ( addPrescriptionsContainer[0] == undefined )
		return;

	var ERROR_BOX = addPrescriptionsContainer.find('#ERROR_BOX');
	var clinicSelect = addPrescriptionsContainer.find('#clinicSelect');

	var addForm = addPrescriptionsContainer.find('#addForm');
	var addPresMedsBTN = addForm.find('#addPresMedsBTN');
	var medicinesDiv = addForm.find('#medicinesDiv');
	var prescNoteInput = addForm.find('#prescNoteInput');
	var presQRCodeIMG = addForm.find('#presQRCodeIMG');
	var patientsSearchInput = addForm.find('#patientsSearchInput');
	var patientSelect = addForm.find('#patientSelect');

	var addForm2 = addPrescriptionsContainer.find('#addForm2');
	var searchProductsInput = addForm2.find('#searchProductsInput');
	var productSelect = addForm2.find('#productSelect');
	var addPresMedsBTN2 = addForm2.find('#addPresMedsBTN2');
	var medicinesDiv2 = addForm2.find('#medicinesDiv2');
	var prescNoteInput2 = addForm2.find('#prescNoteInput2');
	var presQRCodeIMG2 = addForm2.find('#presQRCodeIMG2');
	var patientsSearchInput2 = addForm2.find('#patientsSearchInput2');
	var patientSelect2 = addForm2.find('#patientSelect2');

	var TABS_LIST = addPrescriptionsContainer.find('#TABS_LIST');

	var PrescObject = {
		prescriptionId: (options) ? options.prescriptionId : null,
		prescriptionHashId: null,
		patientId: null,
		prescriptionQRCode: null,
		prescriptionNote: null,
		medicines: []
	};

	var promise01 = null;
	var promise02 = null;
	var promise03 = null;
	// search clinics
	await displayClinics();
	// switch wrappers
	TABS_LIST.off('click');
	TABS_LIST.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'TAB' )
		{
			var tab = $(target.data('tab'));
			tab.slideDown(200).siblings('.WRAPPER').slideUp(200);
			target.addClass('active').siblings().removeClass('active');
		}
	});
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		patientsSearchInput.trigger('keyup');
		searchProductsInput.trigger('keyup');
	});
	// add / update
	addForm.off('submit');
	addForm.on('submit', async e =>
	{
		e.preventDefault();
		var target = addForm;
		PrescObject.patientId = patientSelect.find(':selected').val();
		PrescObject.prescriptionNote = prescNoteInput.val();
		PrescObject.medicines = getMedicines();
		PrescObject.employee_id = USER_CONFIG.employee_id;
		PrescObject.clinicId = clinicSelect.find(':selected').val();

		// update
		if ( PrescObject.prescriptionId != null )
		{
			// translate
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("جاري حفظ البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Enregistrement des données...");
			
			updatePrescription(PrescObject).then(response =>
			{
				// hide loader
				TopLoader('', false);
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0)
					.find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				// reset
				target[0].reset();
				PrescObject.prescriptionId = null;
			});
			return;
		}
		// add
		// generate qrcode
		PrescObject.prescriptionHashId = uniqid();
		var page = `${PROJECT_URL}view/prescription/${FUI_DISPLAY_LANG.lang}/?phash=${PrescObject.prescriptionHashId}`;
		var qrcode = await generateQRCode( page );
		presQRCodeIMG.attr('src', qrcode);
		PrescObject.prescriptionQRCode = qrcode;
		// translate
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري حفظ البيانات...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("Enregistrement des données...");
		addPrescription(PrescObject).then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0)
			.find('#text').text(response.message);
			// reset
			target[0].reset();
		});
	});
	// add / update
	addForm2.off('submit');
	addForm2.on('submit', async e =>
	{
		e.preventDefault();
		var target = addForm2;
		PrescObject.patientId = patientSelect2.find(':selected').val();
		PrescObject.prescriptionNote = prescNoteInput2.val();
		PrescObject.medicines = getMedicines2();
		PrescObject.employee_id = USER_CONFIG.employee_id;
		PrescObject.clinicId = clinicSelect.find(':selected').val();
		PrescObject.prescriptionDirection = ST_DIRECTION_INSIDE;
		// update
		if ( PrescObject.prescriptionId != null )
		{
			// translate
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("جاري حفظ البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Enregistrement des données...");
			
			updatePrescription(PrescObject).then(response =>
			{
				// hide loader
				TopLoader('', false);
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0)
					.find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				// reset
				target[0].reset();
				PrescObject.prescriptionId = null;
			});
			return;
		}
		// add
		// generate qrcode
		PrescObject.prescriptionHashId = uniqid();
		var page = `${PROJECT_URL}view/prescription/${FUI_DISPLAY_LANG.lang}/?phash=${PrescObject.prescriptionHashId}`;
		var qrcode = await generateQRCode( page );
		presQRCodeIMG2.attr('src', qrcode);
		PrescObject.prescriptionQRCode = qrcode;
		// translate
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري حفظ البيانات...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("Enregistrement des données...");
		addPrescription(PrescObject).then(response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0)
			.find('#text').text(response.message);
			// reset
			target[0].reset();
		});
	});
	// add medicines
	addPresMedsBTN.off('click');
	addPresMedsBTN.on('click', e =>
	{
		e.preventDefault();
		addMedicines([
			{
				id: 0,
				name: '',
				dose: '',
				duration: '',
				quantity: 1,
				price: 0
			}
		]);
	});
	// add medicines
	addPresMedsBTN2.off('click');
	addPresMedsBTN2.on('click', e =>
	{
		e.preventDefault();
		addMedicines([
			{
				id: productSelect.find(':selected').val(),
				name: productSelect.find(':selected').text(),
				dose: '',
				duration: '',
				quantity: 1,
				price: productSelect.find(':selected').data('price')
			}
		]);
	});
	// medicinesDiv click
	medicinesDiv.off('click');
	medicinesDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'MED_DELETE' )
		{
			var parent = target.closest('[data-role="MED"]');
			parent.remove();
		}
	});
	// medicinesDiv2 click
	medicinesDiv2.off('click');
	medicinesDiv2.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'MED_DELETE' )
		{
			var parent = target.closest('[data-role="MED"]');
			parent.remove();
		}
	});
	// search patients
	patientsSearchInput.off('keyup');
	patientsSearchInput.on('keyup', e =>
	{
		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			query: patientsSearchInput.val()
		};

		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");
		
		promise01 = searchPatientsLocal( SearchObject )
		promise01.then(response =>
		{
			// hide loader
			TopLoader('', false);
			patientSelect.html('');
			patientSelect2.html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<option value="${v.patientId}">${v.patientName}</option>`;
			});
			// add html
			patientSelect.html(html);
			patientSelect2.html(html);
		});
	});
	patientsSearchInput.trigger('keyup');
	patientsSearchInput2.off('keyup');
	patientsSearchInput2.on('keyup', e =>
	{
		var query = patientsSearchInput2.val();
		patientsSearchInput.val(query);
		patientsSearchInput.trigger('keyup');
	});
	// search products
	searchProductsInput.off('keyup');
	searchProductsInput.on('keyup', e =>
	{
		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			query: searchProductsInput.val()
		};

		// display loader
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
			TopLoader("جاري البحث...");
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			TopLoader("En train de rechercher...");
		
		promise02 = searchProductsLocal( SearchObject )
		promise02.then(response =>
		{
			// hide loader
			TopLoader('', false);
			productSelect.html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<option value="${v.productId}" data-price="${v.productPrice}">${v.productName}</option>`;
			});
			// add html
			productSelect.html(html);
		});
	});
	searchProductsInput.trigger('keyup');
	// search clinics
	displayClinics();
	async function displayClinics()
	{
		// search clinics
		// display loader
		SectionLoader(clinicSelect.closest('.section'));
		promise03 = searchClinics('');
		var response = await promise03;
		// hide loader
		SectionLoader(clinicSelect.closest('.section'), '');
		if ( response.code == 200 )
		{
			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
			});
			// add html
			clinicSelect.html(html);
		}

		return promise03;
	}
	// get medicines
	function getMedicines()
	{
		var list = [];
		var items = medicinesDiv.find('[data-role="MED"]');
		for (var i = 0; i < items.length; i++) 
		{
			var item = $(items[i]);
			var name = item.find('[data-role="MED_NAME"]').val();
			var dose = item.find('[data-role="MED_DOSE"]').val();
			var duration = item.find('[data-role="MED_DURATION"]').val();
			var quantity = item.find('[data-role="MED_QUANTITY"]').val();
			list.push({
				medName: name,
				medDose: dose,
				medDuration: duration,
				medQuantity: quantity
			});
		}

		return list;
	}
	// get medicines2
	function getMedicines2()
	{
		var list = [];
		var items = medicinesDiv2.find('[data-role="MED"]');
		for (var i = 0; i < items.length; i++) 
		{
			var item = $(items[i]);
			var id = item.data('productid');
			var name = item.find('[data-role="MED_NAME"]').val();
			var dose = item.find('[data-role="MED_DOSE"]').val();
			var duration = item.find('[data-role="MED_DURATION"]').val();
			var quantity = item.find('[data-role="MED_QUANTITY"]').val();
			var price = item.find('[data-role="MED_PRICE"]').val();
			list.push({
				productId: id,
				medName: name,
				medDose: dose,
				medDuration: duration,
				medQuantity: quantity,
				medPrice: price
			});
		}

		return list;
	}
	// add medicines
	function addMedicines(options)
	{
		var html = '';
		for (var i = 0; i < options.length; i++) 
		{
			var option = options[i];
			// translate
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				html += `<div class="row gx-1 gy-2 mt-1" data-role="MED" data-productid="${option.id}">
								<div class="col-lg-5 col-md col-sm-12">
									<input type="text" class="input-text input-text-outline border-bottom-forced" data-role="MED_NAME" placeholder="اسم الدواء" value="${option.name}">
								</div>
								<div class="col-lg col-md col-sm-12">
									<input type="text" class="input-text input-text-outline border-bottom-forced" data-role="MED_DOSE" placeholder="الجرعة" value="${option.dose}">
								</div>
								<div class="col-lg col-md col-sm-12">
									<input type="text" class="input-text input-text-outline border-bottom-forced" data-role="MED_DURATION" placeholder="المدة الزمنية" value="${option.duration}">
								</div>	
								<div class="col-lg-1 col-md-1 col-sm-12">
									<input type="number" min="1" class="input-text input-text-outline border-bottom-forced" data-role="MED_QUANTITY" placeholder="الكمية" value="${option.quantity}">
								</div>
								<div class="col-lg col-md col-sm-12">
									<input type="number" min="0" step="any" class="input-text input-text-outline border-bottom-forced" data-role="MED_PRICE" placeholder="سعر" value="${option.price}">
								</div>
								<div class="col-lg-1 col-md-1 col-sm-12">
									<div class="d-inline-flex w-100 h-100 flex-center">
										<div class="btn-close" data-role="MED_DELETE"></div>
									</div>
								</div>
							</div>`;	
			}
			else
			{
				html += `<div class="row gx-1 gy-2 mt-1" data-role="MED" data-productid="${option.id}">
								<div class="col-lg-5 col-md col-sm-12">
									<input type="text" class="input-text input-text-outline border-bottom-forced" data-role="MED_NAME" placeholder="nom du médicament" value="${option.name}">
								</div>
								<div class="col-lg col-md col-sm-12">
									<input type="text" class="input-text input-text-outline border-bottom-forced" data-role="MED_DOSE" placeholder="Dosage" value="${option.dose}">
								</div>
								<div class="col-lg col-md col-sm-12">
									<input type="text" class="input-text input-text-outline border-bottom-forced" data-role="MED_DURATION" placeholder="Durée" value="${option.duration}">
								</div>	
								<div class="col-lg-1 col-md-1 col-sm-12">
									<input type="number" min="1" class="input-text input-text-outline border-bottom-forced" data-role="MED_QUANTITY" placeholder="Quantité" value="${option.quantity}">
								</div>
								<div class="col-lg col-md col-sm-12">
									<input type="number" min="0" step="any" class="input-text input-text-outline border-bottom-forced" data-role="MED_PRICE" placeholder="le prix" value="${option.price}">
								</div>
								<div class="col-lg-1 col-md-1 col-sm-12">
									<div class="d-inline-flex w-100 h-100 flex-center">
										<div class="btn-close" data-role="MED_DELETE"></div>
									</div>
								</div>
							</div>`;	
			}
		}
		
		medicinesDiv.append(html);
		medicinesDiv2.append(html);
	}
	// display one
	displayOne();
	async function displayOne(prescriptionId)
	{
		if ( PrescObject.prescriptionId == null )
			return;

		// translate
		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			// display loader
			TopLoader("جلب البيانات...");
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			// display loader
			TopLoader("Récupération des données...");
		}
		getPrescription(PrescObject.prescriptionId).then(async response =>
		{
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
				return;

			var data = response.data;
			setOptionSelected(clinicSelect, data.clinicId);
			clinicSelect.trigger('change');
			if ( promise01 )
				await promise01;

			if ( promise02 )
				await promise02;
			// display on form
			// append medicines
			if ( data.medicines )
			{
				var medArr = [];
				for (var i = 0; i < data.medicines.length; i++) 
				{
					var med = data.medicines[i];
					medArr.push({
						id: med.productId,
						name: med.medName,
						dose: med.medDose,
						duration: med.medDuration,
						quantity: med.medQuantity,
						price: med.medPrice
					});
				}
				addMedicines(medArr);
			}
			if ( data.prescriptionDirection == ST_DIRECTION_OUTSIDE )
			{
				prescNoteInput.val(data.prescriptionNote);
				presQRCodeIMG.attr('src', data.prescriptionQRCode);
				setOptionSelected(patientSelect, data.patientId);
				$(TABS_LIST.find('[data-role="TAB"]')[0]).trigger('click');
			}
			else if ( data.prescriptionDirection == ST_DIRECTION_INSIDE )
			{
				prescNoteInput2.val(data.prescriptionNote);
				presQRCodeIMG2.attr('src', data.prescriptionQRCode);
				setOptionSelected(patientSelect2, data.patientId);	
				$(TABS_LIST.find('[data-role="TAB"]')[1]).trigger('click');
			}
		});
	}
}
// setup all perscriptions
async function setupAllPrescriptions()
{
	var allPrescriptionsContainer = $('#allPrescriptionsContainer');
	if ( allPrescriptionsContainer[0] == undefined )
		return;

	var ERROR_BOX = allPrescriptionsContainer.find('#ERROR_BOX');
	var clinicSelect = allPrescriptionsContainer.find('#clinicSelect');
	var deleteSelectedBTN = allPrescriptionsContainer.find('#deleteSelectedBTN');
	var searchInput = allPrescriptionsContainer.find('#searchInput');
	var pagination = allPrescriptionsContainer.find('#pagination');
	var tableElement1 = allPrescriptionsContainer.find('#tableElement1');

	var tableElement5 = allPrescriptionsContainer.find('#tableElement5');

	var contentsWrapper = allPrescriptionsContainer.find('#contentsWrapper');
	var changedSettingsWrapper = allPrescriptionsContainer.find('#changedSettingsWrapper');
	var backBTN = changedSettingsWrapper.find('#backBTN');

	var BACK_TO_MAIN_UI_BTN = allPrescriptionsContainer.find('[data-role="BACK_TO_MAIN_UI_BTN"]');

	var wrapper01 = allPrescriptionsContainer.find('#wrapper01');

	var PrescObject = {
		prescriptionId: null
	}

	// back to main ui
	BACK_TO_MAIN_UI_BTN.off('click');
	BACK_TO_MAIN_UI_BTN.on('click', e =>
	{
		wrapper01.slideDown(200).siblings('.WRAPPER').slideUp(200);
	});
	// search clinics
	// display loader
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	// hide loader
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		// add html
		clinicSelect.html(html);
	}
	// select clinic
	clinicSelect.off('change');
	clinicSelect.on('change', e =>
	{
		displayAll();
	});
	// tableElement1 click
	tableElement1.off('click');
	tableElement1.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var prescriptionId = target.data('prescid');
			var response = await getPage('views/pages/add-prescriptions.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupAddPrescriptions({prescriptionId: prescriptionId});
			//rebindEvents();
		}
		else if ( target.data('role') == 'GO_TO_STORE' )
		{
			var prescriptionId = target.data('prescid');
			// loader
			SectionLoader(wrapper01);
			var response = await getPrescription(prescriptionId);
			// loader
			SectionLoader(wrapper01, '');
			var data = response.data;
			for (var i = 0; i < data.medicines.length; i++) 
			{
				var med = data.medicines[i];
				var product = med.product;
				var productImage = (product.productImageData) ? JSON.parse(product.productImageData).url
										: 'assets/img/utils/placeholder.jpg';
				OrdersCartDialog({
					user_id: data.patientId,
					id: med.productId,
					name: med.medName,
					image: productImage,
					price: med.medPrice,
					quantity: med.medQuantity
				});
			}
			var response = await getPage('views/pages/sell-products.ejs');
			MAIN_CONTENT_CONTAINER.html(response);
			setupSellProducts();
		}
	});
	// delete
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog().then(c =>
		{
			SectionLoader(wrapper01);
			deletePrescriptions( getSelectedRows() ).then(response =>
			{
				// hide loader
				SectionLoader(wrapper01, '');
				if ( response.code == 404 )
				{
					ERROR_BOX.show(0).delay(7*1000).hide(0)
					.find('#text').text(response.message);
					return;
				}
				ERROR_BOX.show(0).delay(7*1000).hide(0)
				.find('#text').text(response.message);
				//
				displayAll();
			});
		});
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', e =>
	{
		var SearchObject = {
			clinicId: clinicSelect.find(':selected').val(),
			query: searchInput.val()
		};
		// display loader
		SectionLoader(wrapper01);
		searchPrescriptionsLocal(SearchObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			// clear html
			tableElement1.html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				var medicines = (v.medicines) ? v.medicines.length : 0;
				if ( FUI_DISPLAY_LANG.lang == 'ar' )
				{
					if ( v.prescriptionDirection == ST_DIRECTION_INSIDE )
					{
						html+= `<div class="col-lg-4 col-md-6 col-sm-12">
									<div class="card hover-shadow" data-role="PRESC" data-prescid="${v.prescriptionId}" style="cursor: pointer;">
										<div class="pt-2 px-2">
											<div class="form-check">
												<input class="form-check-input" type="checkbox" data-role="CHECK" data-prescid="${v.prescriptionId}" value="" id="flexCheckDefault_${v.prescriptionId}">
												<label class="form-check-label" for="flexCheckDefault_${v.prescriptionId}">
													قم بالتحديد
												</label>
											</div>
										</div>
										<div class="card-body no-pointer">
											<div class="h5">حررت من طرف: ${v.doctor.employee_name}</div>
											<span class="text-02">ل:  ${v.patientName}</span>
											<span class="text-04">(${medicines}) أدوية موصوفة</span>
											<div class="text-muted mt-2">في: ${v.prescriptionDate} | ${v.prescriptionTime}</div>
										</div>
										<div class="py-2 px-2">
											<a href="#" class="d-inline-block text-dark" data-role="UPDATE" data-prescid="${v.prescriptionId}">
												<i class="fas fa-edit no-pointer"></i>
											</a>
										</div>
									</div>
								</div>PAG_SEP`;	
					}
					else if ( v.prescriptionDirection == ST_DIRECTION_OUTSIDE )
					{
						html+= `<div class="col-lg-4 col-md-6 col-sm-12">
									<div class="card hover-shadow" data-role="PRESC" data-prescid="${v.prescriptionId}" style="cursor: pointer;">
										<div class="pt-2 px-2">
											<div class="form-check">
												<input class="form-check-input" type="checkbox" data-role="CHECK" data-prescid="${v.prescriptionId}" value="" id="flexCheckDefault_${v.prescriptionId}">
												<label class="form-check-label" for="flexCheckDefault_${v.prescriptionId}">
													قم بالتحديد
												</label>
											</div>
										</div>
										<div class="card-body no-pointer">
											<div class="h5">حررت من طرف: ${v.doctor.employee_name}</div>
											<span class="text-02">ل:  ${v.patientName}</span>
											<span class="text-04">(${medicines}) أدوية موصوفة</span>
											<div class="text-muted mt-2">في: ${v.prescriptionDate} | ${v.prescriptionTime}</div>
										</div>
										<div class="py-2 px-2">
											<a href="#" class="d-inline-block text-dark" data-role="UPDATE" data-prescid="${v.prescriptionId}">
												<i class="fas fa-edit no-pointer"></i>
											</a>
										</div>
									</div>
								</div>PAG_SEP`;	
					}
				}
				else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				{
					if ( v.prescriptionDirection == ST_DIRECTION_INSIDE )
					{
						html+= `<div class="col-lg-4 col-md-6 col-sm-12">
									<div class="card hover-shadow" data-role="PRESC" data-prescid="${v.prescriptionId}" style="cursor: pointer;">
										<div class="pt-2 px-2">
											<div class="form-check">
												<input class="form-check-input" type="checkbox" data-role="CHECK" data-prescid="${v.prescriptionId}" value="" id="flexCheckDefault_${v.prescriptionId}">
												<label class="form-check-label" for="flexCheckDefault_${v.prescriptionId}">
													Cliquez pour sélectionner
												</label>
											</div>
										</div>
										<div class="card-body no-pointer">
											<div class="h5">édité par: ${v.doctor.employee_name}</div>
											<span class="text-02">à:  ${v.patientName}</span>
											<span class="text-04">(${medicines}) Médicaments</span>
											<div class="text-muted mt-2">dans: ${v.prescriptionDate} | ${v.prescriptionTime}</div>
										</div>
										<div class="py-2 px-2">
											<a href="#" class="d-inline-block text-dark" data-role="UPDATE" data-prescid="${v.prescriptionId}">
												<i class="fas fa-edit no-pointer"></i>
											</a>
										</div>
									</div>
								</div>PAG_SEP`;	
					}
					else if ( v.prescriptionDirection == ST_DIRECTION_OUTSIDE )
					{
						html+= `<div class="col-lg-4 col-md-6 col-sm-12">
									<div class="card hover-shadow" data-role="PRESC" data-prescid="${v.prescriptionId}" style="cursor: pointer;">
										<div class="pt-2 px-2">
											<div class="form-check">
												<input class="form-check-input" type="checkbox" data-role="CHECK" data-prescid="${v.prescriptionId}" value="" id="flexCheckDefault_${v.prescriptionId}">
												<label class="form-check-label" for="flexCheckDefault_${v.prescriptionId}">
													Cliquez pour sélectionner
												</label>
											</div>
										</div>
										<div class="card-body no-pointer">
											<div class="h5">édité par: ${v.doctor.employee_name}</div>
											<span class="text-02">à:  ${v.patientName}</span>
											<span class="text-04">(${medicines}) Médicaments</span>
											<div class="text-muted mt-2">dans: ${v.prescriptionDate} | ${v.prescriptionTime}</div>
										</div>
										<div class="py-2 px-2">
											<a href="#" class="d-inline-block text-dark" data-role="UPDATE" data-prescid="${v.prescriptionId}">
												<i class="fas fa-edit no-pointer"></i>
											</a>
										</div>
									</div>
								</div>PAG_SEP`;	
					}
				}
			});
			// add html
			var options = {
				data: html.split('PAG_SEP'),
				resultsPerPage: 9
			};
			new SmoothPagination(pagination, tableElement1, options);
		});
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// get selected
	function getSelectedRows()
	{
		var list = [];
		var checks = tableElement1.find('[data-role="CHECK"]');
		for (var i = 0; i < checks.length; i++) 
		{
			var check = $(checks[i]);
			if ( check.is(':checked') )
				list.push({ prescriptionId: check.data('prescid') });
		}

		return list;
	}
}
// setup send products to centers page
async function setupSendProductsToCentersPage()
{
	var sendProductsToCentersContainer = $('#sendProductsToCentersContainer');
	if ( sendProductsToCentersContainer[0] == undefined )
		return;

	var ERROR_BOX = sendProductsToCentersContainer.find('#ERROR_BOX');

	var addForm = sendProductsToCentersContainer.find('#addForm');
	var clinicSelect = addForm.find('#clinicSelect');
	var productsSearchInput = addForm.find('#productsSearchInput');
	var productSelect = addForm.find('#productSelect');
	var addProductBTN = addForm.find('#addProductBTN');
	var productsDiv = addForm.find('#productsDiv');

	var wrapper01 = sendProductsToCentersContainer.find('#wrapper01');
	var promise01 = null;
	// addForm submit
	addForm.off('submit');
	addForm.on('submit', async e =>
	{
		e.preventDefault();
		var target = addForm;

		SectionLoader(wrapper01);
		console.log(selectedProducts());
		var response = await batchAddProductsToCenter( selectedProducts() );
		SectionLoader(wrapper01, '');
		if ( response.code == 404 )
		{
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			return;
		}
		ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
		clearProducts();
	});
	// add product row
	addProductBTN.off('click');
	addProductBTN.on('click', e =>
	{
		addProductRow({
			productId: productSelect.find(':selected').val(),
			productName: productSelect.find(':selected').text(),
			productQuantity: productSelect.find(':selected').data('quantity')
		});
	});
	// productsDiv click
	productsDiv.off('click');
	productsDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'DELETE_PRODUCT' )
		{
			var parent = target.closest('[data-role="PRODUCT"]');
			parent.remove();
		}
	});
	// list clinics
	SectionLoader(clinicSelect.closest('.section'));
	var response = await searchClinics('');
	SectionLoader(clinicSelect.closest('.section'), '');
	if ( response.code == 200 )
	{
		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.clinicId}">${v.clinicName}</option>`;
		});
		clinicSelect.html(html);
	}
	// search products
	productsSearchInput.off('keyup');
	productsSearchInput.on('keyup', async e =>
	{
		promise01 = searchProducts({
			query: productsSearchInput.val()
		});
		SectionLoader(productSelect.closest('.section'));
		var response = await promise01;
		SectionLoader(productSelect.closest('.section'), '');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.productId}" data-quantity="${v.productQuantity}">${v.productName}</option>`;
		});
		productSelect.html(html);
	});
	productsSearchInput.trigger('keyup');
	// clear products
	function clearProducts()
	{
		productsDiv.html('');
	}
	// add product row
	function addProductRow(options)
	{
		var html = '';

		if ( FUI_DISPLAY_LANG.lang == 'ar' )
		{
			html = `<div data-role="PRODUCT" data-productid="${options.productId}" class="mb-2 py-1 border-bottom row gx-2 gy-2">
						<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="btn-close" data-role="DELETE_PRODUCT"></div>
						</div>
						<div class="col-lg col-md col-sm-12">
							<div class="d-inline-flex flex-align-center w-100 h-100">
								<div class="text-03">${options.productName}</div>
							</div>
						</div>
						<div class="col-lg col-md col-sm-12">
							<input type="number" step="any" class="input-text input-text-outline" min="1" value="${options.productQuantity}" placeholder="الكمية..." data-role="PRODUCT_QUANTITY">
						</div>
					</div>`;
		}
		else if ( FUI_DISPLAY_LANG.lang == 'fr' )
		{
			html = `<div data-role="PRODUCT" data-productid="${options.productId}" class="mb-2 py-1 border-bottom row gx-2 gy-2">
						<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="btn-close" data-role="DELETE_PRODUCT"></div>
						</div>
						<div class="col-lg col-md col-sm-12">
							<div class="d-inline-flex flex-align-center w-100 h-100">
								<div class="text-03">${options.productName}</div>
							</div>
						</div>
						<div class="col-lg col-md col-sm-12">
							<input type="number" step="any" class="input-text input-text-outline" min="1" value="${options.productQuantity}" placeholder="Quantite..." data-role="PRODUCT_QUANTITY">
						</div>
					</div>`;
		}

		productsDiv.append(html);
	}
	// selected products
	function selectedProducts()
	{
		var list = [];
		var items = productsDiv.find('[data-role="PRODUCT"]');
		for (var i = 0; i < items.length; i++) 
		{
			var item = $(items[i]);
			list.push({
				administration_id: clinicSelect.find(':selected').val(),
				productId: item.data('productid'),
				productQuantity: item.find('[data-role="PRODUCT_QUANTITY"]').val()
			});
		}

		return list;
	}
}
// setup employees attendance
function setupEmployeesAttendance()
{
	var employeesAttendanceContainer = $('#employeesAttendanceContainer');
	if ( employeesAttendanceContainer[0] == undefined )
		return;

	var ERROR_BOX = employeesAttendanceContainer.find('#ERROR_BOX');

	var deleteSelectedBTN = employeesAttendanceContainer.find('#deleteSelectedBTN');
	var searchInput = employeesAttendanceContainer.find('#searchInput');
	var searchBTN = employeesAttendanceContainer.find('#searchBTN');
	var fromDateInput = employeesAttendanceContainer.find('#fromDateInput');
	var toDateInput = employeesAttendanceContainer.find('#toDateInput');
	var pagination = employeesAttendanceContainer.find('#pagination');
	var tableElement = employeesAttendanceContainer.find('#tableElement');

	// set primary dates
	var now = new Date();
	fromDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	toDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	// tableElement click
	tableElement.off('click');
	tableElement.on('click', async e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'UPDATE' )
		{
			var parent = target.closest('[data-role="ROW"]');
			var EmployeeObject = {
				employee_id: target.data('employeeid'),
				att_status: parent.find('[data-role="ATT_SELECT"] :selected').val(),
				att_note: parent.find('[data-role="ATT_NOTE"]').val()
			};
			// display loader
			SectionLoader( tableElement.closest('.section') );
			var response = await updateEmployeeAtt(EmployeeObject);
			// hide loader
			SectionLoader( tableElement.closest('.section'), '' );
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		}
	});
	// delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', async e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			// display loader
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
				TopLoader("حذف البيانات...");
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
				TopLoader("Suprimmer les données...");

			var response = await deleteEmployees(selectedRows());
			// hide loader
			TopLoader('', false);
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			//
			displayAll();
		});
	});
	// search
	searchBTN.off('click');
	searchBTN.on('click', async e =>
	{
		var SearchObject = {
			employee_administration: '.',
			query: searchInput.val(),
			from: fromDateInput.val(),
			to: toDateInput.val()
		};
		// display loader
		SectionLoader( tableElement.closest('.section') );
		var response = await searchEmployeesAttBetweenDates(SearchObject);
		// hide loader
		SectionLoader( tableElement.closest('.section'), '' );
		// clear html
		tableElement.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var type = '';
			var ATT_SELECT = '';
			var ATT_NOTE_PH = '';
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				type = (v.type) ? v.type.employee_type_name_ar : '';
				ATT_SELECT = `<option ${ (v.attendance.att_status == ATT_NONE) ? 'selected' : '' } value="${ATT_NONE}">غير محدد</option>
							<option ${ (v.attendance.att_status == ATT_ABSENT) ? 'selected' : '' } value="${ATT_ABSENT}">غائب</option>
							<option ${ (v.attendance.att_status == ATT_PRESENT) ? 'selected' : '' } value="${ATT_PRESENT}">حاضر</option>
							<option ${ (v.attendance.att_status == ATT_LATE) ? 'selected' : '' } value="${ATT_LATE}">متأخر</option>`;
				ATT_NOTE_PH = 'أكتب الملاحظة هنا...';
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				type = (v.type) ? v.type.employee_type_name_fr : '';
				ATT_SELECT = `<option ${ (v.attendance.att_status == ATT_NONE) ? 'selected' : '' } value="${ATT_NONE}">Non spécifié</option>
							<option ${ (v.attendance.att_status == ATT_ABSENT) ? 'selected' : '' } value="${ATT_ABSENT}">absent</option>
							<option ${ (v.attendance.att_status == ATT_PRESENT) ? 'selected' : '' } value="${ATT_PRESENT}">present</option>
							<option ${ (v.attendance.att_status == ATT_LATE) ? 'selected' : '' } value="${ATT_LATE}">en retard</option>`;
				ATT_NOTE_PH = 'Écrivez une note ici...';
			}
			html += `<div class="tr" data-role="ROW" data-employeeid="${v.employee_id}">
						<div class="td">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-employeeid="${v.employee_id}" data-id="${v.attendance.id}">
						</div>
						<div class="td">${v.employee_name}</div>
						<div class="td pointer mx-1">
							<select name="" data-role="ATT_SELECT" class="input-text border-0">
								${ATT_SELECT}
							</select>
						</div>
						<div class="td pointer">
							<input type="text" class="input-text border-0" value="${v.attendance.att_note}" placeholder="${ATT_NOTE_PH}" data-role="ATT_NOTE">
						</div>
						<div class="td">${v.attendance.att_date} | ${v.attendance.att_time}</div>
						<div class="td">
							<div class="btn-group btn-group-sm">
								<button class="btn btn-primary btn-sm pointer rounded-0" data-role="UPDATE" data-employeeid="${v.employee_id}">
									<span class="no-pointer"><i class="fas fa-edit"></i></span>
								</button>
							</div>
						</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement.find('.tbody'), options);
	});
	// search
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var SearchObject = {
			query: searchInput.val(),
			administration_id: 0,
			employee_administration: '.'
		};
		// display loader
		SectionLoader( tableElement.closest('.section') );
		var response = await searchClinicEmployees(SearchObject);
		// hide loader
		SectionLoader( tableElement.closest('.section'), '' );
		// clear html
		tableElement.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			var type = '';
			var ATT_SELECT = '';
			var ATT_NOTE_PH = '';
			if ( FUI_DISPLAY_LANG.lang == 'ar' )
			{
				type = (v.type) ? v.type.employee_type_name_ar : '';
				ATT_SELECT = `<option ${ (v.attendance.att_status == ATT_NONE) ? 'selected' : '' } value="${ATT_NONE}">غير محدد</option>
							<option ${ (v.attendance.att_status == ATT_ABSENT) ? 'selected' : '' } value="${ATT_ABSENT}">غائب</option>
							<option ${ (v.attendance.att_status == ATT_PRESENT) ? 'selected' : '' } value="${ATT_PRESENT}">حاضر</option>
							<option ${ (v.attendance.att_status == ATT_LATE) ? 'selected' : '' } value="${ATT_LATE}">متأخر</option>`;
				ATT_NOTE_PH = 'أكتب الملاحظة هنا...';
			}
			else if ( FUI_DISPLAY_LANG.lang == 'fr' )
			{
				type = (v.type) ? v.type.employee_type_name_fr : '';
				ATT_SELECT = `<option ${ (v.attendance.att_status == ATT_NONE) ? 'selected' : '' } value="${ATT_NONE}">Non spécifié</option>
							<option ${ (v.attendance.att_status == ATT_ABSENT) ? 'selected' : '' } value="${ATT_ABSENT}">absent</option>
							<option ${ (v.attendance.att_status == ATT_PRESENT) ? 'selected' : '' } value="${ATT_PRESENT}">present</option>
							<option ${ (v.attendance.att_status == ATT_LATE) ? 'selected' : '' } value="${ATT_LATE}">en retard</option>`;
				ATT_NOTE_PH = 'Écrivez une note ici...';
			}
			html += `<div class="tr" data-role="ROW" data-employeeid="${v.employee_id}">
						<div class="td">
							<input type="checkbox" class="form-check-input pointer" data-role="CHECK" data-employeeid="${v.employee_id}" data-id="${v.attendance.id}">
						</div>
						<div class="td">${v.employee_name}</div>
						<div class="td pointer mx-1">
							<select name="" data-role="ATT_SELECT" class="input-text border-0">
								${ATT_SELECT}
							</select>
						</div>
						<div class="td pointer">
							<input type="text" class="input-text border-0" value="${v.attendance.att_note}" placeholder="${ATT_NOTE_PH}" data-role="ATT_NOTE">
						</div>
						<div class="td">${v.attendance.att_date} | ${v.attendance.att_time}</div>
						<div class="td">
							<div class="btn-group btn-group-sm">
								<button class="btn btn-primary btn-sm pointer rounded-0" data-role="UPDATE" data-employeeid="${v.employee_id}">
									<span class="no-pointer"><i class="fas fa-edit"></i></span>
								</button>
							</div>
						</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination, tableElement.find('.tbody'), options);
	});
	searchInput.off('focus');
	searchInput.on('focus', displayAll);
	// display all 
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			var parent = check.closest('[data-role="ROW"]');
			var att_status = parent.find('[data-role="ATT_SELECT"] :selected').val();
			var att_note = parent.find('[data-role="ATT_NOTE"]').val();
			if ( check.is(':checked') )
			{
				list.push({ 
					employee_id: check.data('employeeid'),
					att_status: att_status,
					att_note: att_note
				});
			}	
		}

		return list;
	}
}
// setup Employees accouning page
async function setupEmployeesAccountingPage()
{
	var employeesAccountingContainer = $('#employeesAccountingContainer');
	if ( employeesAccountingContainer[0] == undefined )
		return;

	var ERROR_BOX = employeesAccountingContainer.find('#ERROR_BOX');
	var addForm = employeesAccountingContainer.find('#addForm');
	var employeesSearchInput = addForm.find('#employeesSearchInput');
	var employeeSelect = addForm.find('#employeeSelect');
	var cashoutAmountInput  = addForm.find('#cashoutAmountInput');
	var paymentDateInput = addForm.find('#paymentDateInput');
	var paymentTimeInput = addForm.find('#paymentTimeInput');

	var wrapper01 = employeesAccountingContainer.find('#wrapper01');
	// initialize data and time
	var now = new Date();
	paymentDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
	paymentTimeInput.val( date_time.format(now, 'HH:mm:ss') );

	var CashoutRecordObject = {};
	// addForm submit
	addForm.off('submit');
	addForm.on('submit', e =>
	{
		e.preventDefault();
		var target = addForm;
		CashoutRecordObject.employee_id = employeeSelect.find(':selected').val();
		CashoutRecordObject.cashout_amount = cashoutAmountInput.val();
		CashoutRecordObject.cashout_date = paymentDateInput.val();
		CashoutRecordObject.cashout_time = paymentTimeInput.val();
		// display loader
		SectionLoader(wrapper01);
		// add
		addCashoutRecord(CashoutRecordObject).then(response =>
		{
			// hide loader
			SectionLoader(wrapper01, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			target[0].reset();
			paymentDateInput.val( date_time.format(now, 'YYYY-MM-DD') );
			paymentTimeInput.val( date_time.format(now, 'HH:mm:ss') );
		});
	});
	// search employees
	employeesSearchInput.off('keyup');
	employeesSearchInput.on('keyup', async e =>
	{
		var SearchObject = {
			query: employeesSearchInput.val(),
			employee_administration:'.'
		};
		SectionLoader(wrapper01);
		var response = await searchClinicEmployees(SearchObject);
		SectionLoader(wrapper01, '');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<option value="${v.employee_id}">${v.employee_name}</option>`;
		});
		employeeSelect.html(html);
	});
	employeesSearchInput.trigger('keyup');
}
// setup all cashout records page
function setupAllEmployeesCashoutRecordsPage()
{
	var allEmployeescashoutRecordsContainer = $('#allEmployeescashoutRecordsContainer');
	if ( allEmployeescashoutRecordsContainer[0] == undefined )
		return;

	var ERROR_BOX = allEmployeescashoutRecordsContainer.find('#ERROR_BOX');
	var searchBTN = allEmployeescashoutRecordsContainer.find('#searchBTN');
	var searchInput = allEmployeescashoutRecordsContainer.find('#searchInput');
	var fromDateInput = allEmployeescashoutRecordsContainer.find('#fromDateInput');
	var toDateInput = allEmployeescashoutRecordsContainer.find('#toDateInput');
	var deleteSelectedBTN = allEmployeescashoutRecordsContainer.find('#deleteSelectedBTN');
	var pagination1 = allEmployeescashoutRecordsContainer.find('#pagination1');
	var tableElement1 = allEmployeescashoutRecordsContainer.find('#tableElement1');

	var wrapper01 = allEmployeescashoutRecordsContainer.find('#wrapper01');
	
	// tableElement1 click
	tableElement1.off('click');
	tableElement1.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'ROW' )
		{
			var check = target.find('[data-role="CHECK"]');
			toggleCheck(check);
		}
	});
	// delete
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog().then(async c =>
		{
			SectionLoader(tableElement1);
			var response = await removeCashoutRecords( selectedRows() );
			SectionLoader(tableElement1, '');
			if ( response.code == 404 )
			{
				ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
				return;
			}
			ERROR_BOX.show(0).delay(7*1000).hide(0).find('#text').text(response.message);
			displayAll();
		});
	});
	// search
	searchBTN.off('click');
	searchBTN.on('click', async e =>
	{
		var SearchObject = {
			from: fromDateInput.val(),
			to: toDateInput.val(),
			employee_administration: '.'
		};

		SectionLoader(tableElement1);
		var response = await searchCashoutRecordsBetweenDatesLocal(SearchObject);
		SectionLoader(tableElement1, '');
		// clear html
		tableElement1.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<div class="tr" data-role="ROW">
						<div class="td">
							<input type="checkbox" class="form-check-input" data-role="CHECK" data-id="${v.id}">
						</div>
						<div class="td">${v.employee_name}</div>
						<div class="td">${v.employee_ccp}</div>
						<div class="td">${parseFloat(v.cashout_amount).toFixed(2)}</div>
						<div class="td">${v.cashout_date} ${v.cashout_time}</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination1, tableElement1.find('.tbody'), options);
	});
	searchInput.off('keyup');
	searchInput.on('keyup', async e =>
	{
		var SearchObject = {
			query: searchInput.val(),
			employee_administration: '.'
		};

		SectionLoader(tableElement1);
		var response = await searchCashoutRecordsLocal(SearchObject);
		SectionLoader(tableElement1, '');
		// clear html
		tableElement1.find('.tbody').html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data, (k,v) =>
		{
			html += `<div class="tr" data-role="ROW">
						<div class="td">
							<input type="checkbox" class="form-check-input" data-role="CHECK" data-id="${v.id}">
						</div>
						<div class="td">${v.employee_name}</div>
						<div class="td">${v.employee_ccp}</div>
						<div class="td">${parseFloat(v.cashout_amount).toFixed(2)}</div>
						<div class="td">${v.cashout_date} ${v.cashout_time}</div>
					</div>PAG_SEP`;
		});
		// add html
		var options = {
			data: html.split('PAG_SEP')
		};
		new SmoothPagination(pagination1, tableElement1.find('.tbody'), options);
	});
	// display all
	displayAll();
	function displayAll()
	{
		searchInput.trigger('keyup');
	}
	// selected rows
	function selectedRows()
	{
		var list = [];
		var items = tableElement1.find('[data-role="CHECK"]');
		for (var i = 0; i < items.length; i++) 
		{
			var check = $(items[i]);
			if ( check.is(':checked') )
				list.push({id: check.data('id')});
		}

		return list;
	}
}
// Rebind events
rebindEvents = () =>
{
	setupTopNavbar();
	setupNavbar();
	setupStatistics();
	setupProductsStatsPage();
	setupRevenueAndAccumulationPage()
	setupSendMessage();
	setupSentMessages();
	setupInboxMessages();
	setupSettings();
	setupAddTreatmentClass();
	setupAllTreatmentClasses();
	setupAddFollowUpAppointements();
	setupFollowUpAppointements();
	setupAddAppointements();
	setupGeneralAppointements();
	setupAddToTreasury();
	setupTreasuryCashouts();
	setupAddEmployeesForClinics();
	setupAllClinicEmployees();
	setupAddEmployeesForCentralAdministration();
	setupAllCentralAdministrationEmployees();
	setupAddProducts();
	setupAllCentersProducts();
	setupAllInventoryProducts();
	setupAllProductsInvoices();
	setupAllProductsBillings();
	setupBillingsWaitingApproval();
	setupAddClinics();
	setupAllClinics();
	setupAddPatients();
	setupAllPatients();
	setupAddPrescriptions();
	setupAllPrescriptions();
	setupSendProductsToCentersPage();
	setupEmployeesAttendance();
	setupEmployeesAccountingPage();
	setupAllEmployeesCashoutRecordsPage();
}
// replace with files that has proper interface
if ( FUI_DISPLAY_LANG.lang == 'ar' )
{
	// change style sheet
	$('head').append('<link rel="stylesheet" type="text/css" class="MAIN_STYLESHEET" href="../assets/css/main_ar.css">');
	setTimeout(() => {
		$($('.MAIN_STYLESHEET')[0]).remove();
	}, 0);
	// change pagination scripts
	$('#PAGINATION').remove();
	$('body').append('<script type="text/javascript" id="PAGINATION" src="../assets/js/pagination_ar.js"></script>');
}
else if ( FUI_DISPLAY_LANG.lang == 'fr' )
{
	// change style sheet
	$('head').append('<link rel="stylesheet" type="text/css" class="MAIN_STYLESHEET" href="../assets/css/main_fr.css">');
	setTimeout(() => {
		$($('.MAIN_STYLESHEET')[0]).remove();
	}, 0);
	// change pagination scripts
	$('#PAGINATION').remove();
	$('body').append('<script type="text/javascript" id="PAGINATION" src="../assets/js/pagination_fr.js"></script>');
}
rebindEvents();
// Setup auto checker
setupAutoChecker();
// setup auto updates
setupAppUpdates();
// First UI user will see
var href = 'views/pages/add-patients.ejs';
getPage(href).then(response =>
{
	MAIN_CONTENT_CONTAINER.html(response);
	// Re assign events
	rebindEvents();
	toggleSimilarNavbarsLinks(href);
	// hide loader
	PageLoader(false);
});


})


