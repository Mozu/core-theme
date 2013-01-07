/**
 * @class Taco.view.account.Overview
 */

	Ext.define('Taco.view.account.Overview', {
	    extend: 'Taco.core.ux.content.Container',
	    requires: ['Taco.view.account.Navigation','Taco.core.ux.Panel','Taco.model.AccountInformation','Taco.view.address.AddressForm','Taco.view.account.AccountInformation','Taco.core.ux.modal.Helper','Taco.store.CountryComboBox'],

		initComponent: function () {
			var me = this;

	        me.header = {
	            title: 'My Account'
	        };

			me.navigation = Ext.create('Taco.view.account.Navigation');

			me.space = Ext.create('Taco.core.ux.Panel', {
				items: [
					Ext.create('Ext.Img', {
						height: 191, width: 510,
						src: 'data:image/gif;base64,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'
					})
				]
			});

			var comingSoon = function (text) {
				Ext.create('Taco.core.ux.modal.Confirmation', {
                    text: text,
                    autoShow: true
                });
			};

	        me.overview = Ext.create('Taco.core.ux.Panel', {
	        	defaults: {
	        		margin: '0 0 10 0'
	        	},
				layout: { type: 'vbox', align: 'left' },
				items: [{
					xtype: 'label',
					autoEl: {
	                    tag: 'h3',
	                    html: 'Account Owner<br />Contact Information'
	                }
				}, {
					xtype: 'panel',
					layout: 'vbox',
					defaults: { margin: '0 25 10 0' },
					items: [{
						xtype: 'label', html: me.recordId.get('email')
					}, {
						xtype: 'label', html: '&check; Receive news and updates about VNext'
					}, {
						xtype: 'action', text: 'Edit info & password',
						listeners: {
							click: function () {
								Ext.create('Taco.core.ux.modal.Helper', {
									form: {
					                    editors: ['Taco.view.account.AccountInformation'],
					                    record: Ext.create('Taco.model.AccountInformation', {
					                    	firstName: me.recordId.get('firstName'),
					                    	lastName: me.recordId.get('lastName'),
					                    	email: me.recordId.get('email')
					                    })
					                }
				                });
							}
						}
					}]
				}, me.space, {
					xtype: 'action', text: 'Put my site on hold',
						listeners: {
							click: function () {
								comingSoon('Coming soon...');
							}
						}
				}, {
					xtype: 'action', text: 'Cancel my site',
						listeners: {
							click: function () {
								comingSoon('You can\'t cancel right now because we haven\'t built it.');
							}
						}
				}]
			});

			me.items = Ext.create('Taco.core.ux.Panel', {
	        	defaults: { margin: '20 220 0 0 '},
	            layout: { type: 'hbox', align: 'left' },
				items: [ 
					me.overview
				]
			});

			Ext.apply(me.body, {
	            layout: { type: 'vbox', align: 'left' },
	            items: [me.navigation, me.items]
	        });

	        me.callParent(arguments);
		}
	});

