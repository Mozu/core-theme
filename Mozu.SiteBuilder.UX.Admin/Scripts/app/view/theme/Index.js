/**
 * @class Taco.view.themes.Index
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.theme.Index', {
    extend: 'Taco.core.ux.browser.SearchListTree',
    requires: [
        'Taco.store.ThemeListingsTree',
        'Taco.core.ux.content.SiteViewDropdown'
    ],

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    enableNavHeader: true,

    enablePaging: false,

    title: 'Themes',

    addContentViewPadding: true,

    createButtonEnabled: false,

    cancelButtonEnabled: false,

    saveButtonEnabled: false,

    enableSearchBarInHeader: false,

    enablePaging: false,

    enableSearch: false,

    store: 'Taco.store.ThemeListingsTree',

    enableRowReorder: false,

    initComponent: function() {

    	var me = this;

    	this.columns = [
    		{
                text: 'Name',
                xtype: 'treecolumn',
                flex: 1,
                checkboxText: '',
                dataIndex: 'name',
                minWidth: 150
            },
            {
                text: 'Status',
                dataIndex: 'applied',
                width: 200,
                renderer: function(val) {
                	if (val) {
                		return '<span class="x-column-content-pill x-column-content-pill-true">Applied to ' +  val + '</span>'
                	}
                }
            },
            {
                text: 'Version',
                dataIndex: 'version',
                width: 120
            },
            {
                text: 'Author',
                dataIndex: 'author',
                width: 120
            },
            {
                text: 'Install Date',
                xtype: 'datecolumn',
                format: 'M d, Y',
                dataIndex: 'installDate',
                width: 120
            },
            {
                xtype: 'taco.menucolumn',
                getClass: function(scope, cmp) {
                    if (cmp.record.isLeaf()) {
                        return 'x-action-col-icon x-action-col-0 taco-grid-row-menu-trigger';
                    }
                    else {
                        return 'x-hide-display';
                    }

                },
                menuItems: this.getMenuItems()
          	}
        ];

        this.additionalActions = [
            {
                xtype: 'taco-siteviewdropdown',
                menuAlign: 'tr-br?'
            }
        ];

        this.moreButtonCfg = {
        	menu: [
        		{
        			text: 'Expand All',
        			handler: function() {
        				me.expandAll();
        			}
        		},
        		{
        			text: 'Collapse All',
        			handler: function() {
        				me.collapseAll();
        			}
        		}
        	]
        };

    	this.callParent(arguments);

    },

    buildAppliedView: function() {
        this.appliedStore = Ext.create('Taco.store.ThemeListingsApplied');

        this.appliedStore.load();

        this.appliedView = Ext.create('Taco.view.theme.ThemeView', {
            store: this.appliedStore,
            margin: '5 0 0 0',
            width: 318
        });
    },

    getMenuItems: function() {
        var me = this;
        return [
			{
	            text: 'Apply',

	            menuColumnHandler: function (item, eventData) {
	                var record = eventData.record,
	                    path = record.getPath();
	                Ext.defer(function () {
	                    record.applyTheme({
	                        success: function() {
	                            me.store.reload();
	                        },
	                        apply: true
	                    });
	                }, 0);
	            }
            },
            {
                text: 'Settings',

                menuColumnHandler: function (item, eventData) {
                    var record = eventData.record;
                    Ext.defer(function () {
                        Taco.core.StateManager.attemptNavigate('themesettings/edit/' + record.getId(), {
                            complexMetaData: {
                                record: record
                            }
                        });
                    }, 1, this);
                }
            },
            {
                text: 'Preview',
                menuColumnHandler: function (item, eventData) {
                    var record = eventData.record;

                    var height = Taco.app.viewPort.getHeight();
                    var width = Taco.app.viewPort.getWidth();

                    Ext.create('Ext.window.Window', {
                        title: record.get('name') + (record.get('version') ? ' ('+ record.get('version') + ')' : '') + ' Theme Preview',
                        height: height - 20,
                        width: width - 20,
                        layout: 'fit',

                        items: [
                            {
                                flex: 1,
                                itemId: 'iframe',
                                xtype: 'uxiframe',
                                src: '/_gosite/' + Taco.app.context.getSiteId() + '?environment=editing&redir=' + encodeURIComponent(Ext.String.urlAppend('/', '/?iseditmode=true&SBTHEME=' + record.getId())),
                                listeners: {
                                    load: function (iframe) {
                                        Ext.EventManager.on(iframe.getDoc(), 'click', function (e, target) {
                                            var url = target.pathname + target.search;
                                            if (target.hostname === iframe.getWin().location.hostname && !e.browserEvent.defaultPrevented) {


                                                iframe.getWin().location.href = Ext.String.urlAppend(url, 'SBTHEME=' + record.getId());

                                                e.stopEvent();
                                            }
                                        }, this, {
                                            delegate: 'a'
                                        });
                                    }
                                }
                            }
                        ]
                    }).show();
            	}
        	},
        	{
        		text: 'Remove',
        		menuColumnHandler: function(item, eventData) {
        			var record = eventData.record;

					var theme = Ext.create('Taco.model.ThemeListing', {
					    id: record.getId(),
					    isSelectedDesktop: record.get('isSelectedDesktop'),
					    isSelectedMobile: record.get('isSelectedMobile'),
					    isSelectedTablet: record.get('isSelectedTablet')
					});

					theme.applyTheme({
						success: function() {
						    me.store.reload();
						},
						apply: false
					});
        		}
        	}
        ];
    }

});