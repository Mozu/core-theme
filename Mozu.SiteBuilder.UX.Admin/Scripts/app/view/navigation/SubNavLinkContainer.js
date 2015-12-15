/**
 * @class Taco.view.SubNavLinkContainer
 * @author Ben Cripps
 * 
 */

Ext.define('Taco.view.navigation.SubNavLinkContainer', {
    extend: 'Ext.container.Container',
    alias: 'taco.subnavlinkcontainer',
    store: 'Taco.store.SubnavLinks',

    initComponent: function () {
       
        this.store = Ext.create('Taco.store.SubnavLinks', {
        	listeners: {
        		load: {
        			scope: this,
        			fn: this.createLinks
        		}
        	}
        });

        this.items = [];

        this.callParent(arguments);
    },

    createLinks: function() {
    	var me = this;
    	var links = [];

    	this.store.each(function(item) {
    		links.push(me.getLinkComponent(item));
    	})
    	
    	this.add(links);
    },

    getLinkComponent: function(config) {

    	var me = this;

    	return Ext.create('Ext.Component', {
    		tpl: [
    			'<span>',
    				'<tpl>{[this.getIcon(values)]}</tpl>',
    			'</span>',
    			{
    				getIcon: function(record) {
                        
    					if (record.badgeImage) {
    						return '<span><img src="' + record.badgeImage + '" /><span>';
    					}

    					else if (record.badgeInitials) {
    						return '<span style="padding-top: 10px">' + this.normalizeBadgeId(record.badgeInitials) + '</span>';
    					}

    					else if (!record.badgeInitials) {
                            var badge = this.normalizeBadgeId(record.path && record.path.length > 0 ? record.path.join('').substring(0,2).toLowerCase() : 'Mz');
                            
    						return '<span style="padding-top: 10px">' + badge + '</span>';
    					}
    				},
                    normalizeBadgeId: function(str) {
                        var string = str.toLowerCase();
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    }
    			},
    		],
    		cls: 'taco-subnavlink',
    		data: config.data,
    		listeners: {
	            click: me.onClick.bind(me, config),
	            element: 'el'
	        }
    	})

    },

    onClick: function(record) {

    	var displayMode = record.get('displayMode');

    	if (displayMode === 'navigate' || !displayMode) {
    		window.open(record.get('href'));
    	}

    	else if (displayMode === 'modal') {

    	}
    }

});