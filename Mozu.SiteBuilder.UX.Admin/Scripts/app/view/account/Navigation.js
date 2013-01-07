/**
 * @class Taco.view.account.Navigation
 */

	Ext.define('Taco.view.account.Navigation', {
	    extend: 'Taco.core.ux.Panel',
	    requires:['Taco.core.ux.action.Action'],
    	defaults: { margin: '0 25, 0 0' },
		layout: { type: 'hbox', align: 'left' },
		items: [
		    {  
		        xtype:'action' ,
                text: 'Overview',
                listeners: {
                    click : function () {
	                    Taco.app.StateManager.addState('account/overview', {

	                        controller: 'account',
	                        action: 'overview'
	                    });
	                    Ext.ModelManager.getModel('Taco.model.User').load(
                            Taco.User.id
                            , {
			                success: function (data) {
			                    Taco.app.contentView.add(Ext.create('Taco.view.account.Overview', {
			                        recordId: data
			                    }));
			                }
			            });
                    }
                }
		    },
		     {  
		         xtype:'action' ,
                text: 'Billing Information',
                listeners: {
                    click : function () {
	                    Taco.app.StateManager.addState('account/billing', {
	                        controller: 'account',
	                        action: 'billing'
	                    });
						Taco.app.contentView.add(Ext.create('Taco.view.account.Billing'));
                    }
                }
            },{  
		        xtype:'action' ,
                text: 'Users',
                listeners: {
                    click : function () {
	                    Taco.app.StateManager.addState('account/users', {
	                        controller: 'account',
	                        action: 'users'
	                    });
						Taco.app.contentView.add(Ext.create('Taco.view.account.Users'));
                    }
                }
            }, {
                xtype: 'action',
                text: 'Roles',
                listeners: {
                    click: function () {
                        Taco.app.StateManager.addState('roles', {
                            controller: 'roles',
                            action: 'index'
                        });
                        Taco.app.contentView.add(Ext.create('Taco.view.role.Index'));
                    }
                }
            }
		]
    });
