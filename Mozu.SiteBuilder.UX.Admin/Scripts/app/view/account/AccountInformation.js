/**
 * @class Taco.view.account.AccountInformation
 */
Ext.define('Taco.view.account.AccountInformation', {
	extend: 'Taco.core.ux.form.Form',
	requires: ['Taco.model.AccountInformation','Taco.core.FormPanel'],

    initComponent: function () {
    	var me = this;

    	me.fields = [{
    		fieldLabel: 'Log in email',
    		name: 'email',
    		width: 420
		}, {
			xtype: 'container',
			defaults: {
		        labelAlign: 'top',
		        labelSeparator: '',
	    		xtype: 'textfield',
		    	width: 200,
	    		margin: '0 20 0 0'
		    },
			layout: { type: 'hbox' },
			items: [{
    			fieldLabel: 'First Name',
    			name: 'firstName'
    		}, {
    			fieldLabel: 'Last Name',
    			name: 'lastName'
    		}]
		}, {
	        fieldLabel: 'Old Password',
	        inputType: 'password',
			width: 200,
	        name: 'oldPassword'
	    }, {
	        fieldLabel: 'New Password',
	        inputType: 'password',
			width: 200,
	        name: 'newPassword'
	    }, {
	        fieldLabel: 'Confirm',
	        inputType: 'password',
    		width: 200,
	        name: 'confirmPassword'
	    }];

		me.accountInformation = Ext.create('Taco.core.FormPanel', {
		    defaults: {
		        labelAlign: 'top',
		        labelSeparator: '',
	    		xtype: 'textfield'
		    },
			items: me.fields
	    });

		this.items = [me.accountInformation];

    	me.callParent(arguments);
    },

    update: function () {
    	var me = this;
        
    	Ext.Ajax.request({
            url: '/admin/app/account/information/update',
            method: 'POST',
            success: function (response) {
                Taco.app.signalCacheFlush({ model: 'Taco.model.AccountInformation' });
            	me.hide();
        	},
            failure: function (response) {
        	},
            jsonData: me.getValues()
        });
    }
});
