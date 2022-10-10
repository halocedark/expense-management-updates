

let updateMyAccount;
// Overrided in index.js
let rebindEvents;

$(function()
{

// update My Account
updateMyAccount = (EmployeeObject) =>
{
	var url = API_END_POINT+'Employees/updateMe';
	var data = {
		EmployeeObject: EmployeeObject
	}

	return sendAPIPostRequest(url, data);
}


});




