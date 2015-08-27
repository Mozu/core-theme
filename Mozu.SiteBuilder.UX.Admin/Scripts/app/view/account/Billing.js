/**
 * @class Taco.view.account.Billing
 */

/*

// deprecated


	Ext.define('Taco.view.account.Billing', {
		extend: 'Taco.core.ux.content.Container',
	    requires: ['Taco.view.account.Navigation','Taco.view.account.Overview'],

	    initComponent: function () {
	        var me = this;

	        me.header = {
	            title: 'My Account'
	        };

			me.navigation = Ext.create('Taco.view.account.Navigation');

			me.items = Ext.create('Ext.panel.Panel', {
	        	defaults: { margin: '20 220 0 0 '},
	            layout: { type: 'vbox', align: 'left' },
				items: [{
					xtype: 'component',
					autoEl: {
						tag: 'h1', html: 'Billing Information'
					}
				}]
			});

	        Ext.apply(me.body, {
	            layout: { type: 'vbox', align: 'left' },
	            items: [ me.navigation, me.items ]
	        });

	        me.callParent(arguments);
	    }
	});
*/