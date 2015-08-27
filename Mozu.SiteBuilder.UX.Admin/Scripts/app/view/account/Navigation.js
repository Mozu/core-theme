/**
 * @class Taco.view.account.Navigation
 */
/*
// deprecated

	Ext.define('Taco.view.account.Navigation', {
	    extend: 'Ext.panel.Panel',
	    requires:['Taco.core.ux.action.Action'],
    	defaults: { margin: '0 25, 0 0' },
		layout: { type: 'hbox', align: 'left' },
		items: [
		    {  
		        xtype:'action' ,
                text: 'Overview',
                listeners: {
                    click : function () {
                        Taco.app.StateManager.attemptNavigate('account');
                    }
                }
		    },
		     {  
		         xtype:'action' ,
                text: 'Billing Information',
                listeners: {
                    click : function () {
                        Taco.app.StateManager.attemptNavigate('account/billing');
                    }
                }
            },{  
		        xtype:'action' ,
                text: 'Users',
                listeners: {
                    click : function () {
                        Taco.app.StateManager.attemptNavigate('account/users');
                    }
                }
            }, {
                xtype: 'action',
                text: 'Roles',
                listeners: {
                    click: function () {
                        Taco.app.StateManager.attemptNavigate('account/roles');
                    }
                }
            }
		]
    });

*/