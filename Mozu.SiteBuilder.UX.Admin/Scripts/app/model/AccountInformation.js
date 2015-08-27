/**
 * @class Taco.model.AccountInformation
 */

	Ext.define('Taco.model.AccountInformation', {
	    extend: 'Taco.core.data.Model',
	    fields: [
	        { name: 'email',           type: 'string' },
	        { name: 'firstName',       type: 'string' },
	        { name: 'lastName',        type: 'string' },
	        { name: 'newPassword',     type: 'string' },
	        { name: 'oldPassword',     type: 'string' },
	        { name: 'confirmPassword', type: 'string' }
	    ]
	});
