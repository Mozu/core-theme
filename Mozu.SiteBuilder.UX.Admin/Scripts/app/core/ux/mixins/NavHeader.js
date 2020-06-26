/**
 * @class Taco.core.ux.mixins.NavHeader
 * View Mixin that provides the Content Navigation Toolbar (title, save, cancel, etc)
 * add this to the initComponent of your view to initilize this mixin

 * TODO: Add the next and previous buttons to this class with call to overrideable template methods.
  // to include this mixin in your class:

        mixins: {
            contentNavHeader: 'Taco.core.ux.mixins.NavHeader'
        },


    < ... code fragment ... >

        initComponent: function (){

            //initialize the content navigation toolbar.
            this.mixins.navHeader.init.apply(this);

            this.callParent(arguments)
        }

    < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.NavHeader', {
    requires: [
        'Ext.toolbar.Fill',
        'Ext.toolbar.Spacer',
        'Taco.core.util.ExceptionWhiner',
        'Ext.toolbar.Spacer',
        'Taco.core.ux.mixins.HamburgerButton',
        'Taco.core.ux.mixins.Searchable',
        'Taco.view.navigation.ContextSwitcherBar',
        'Taco.view.navigation.SubNavLinkContainer',
        'Taco.core.ux.content.Tooltip',
        'Taco.core.ux.action.ProgressSplitButton',
        'Taco.core.ux.action.ProgressButton'
    ],

    mixins: {
        permissions: 'Taco.core.ux.mixins.Permissions'
    },

    titleId: 'taco-navigate-to-parent',

    init: function () {
        var me = this;

        this.mixins.permissions.constructor.apply(this, arguments);

        me.navHeader = me;
        me.addEvents(
           /**
            * @event
            * Fired before the cancel event is fired.
            * Returning false from an event listener can prevent the cancel from occurring.
            * @param {Taco.core.ux.window.Modal} this
            */
           'beforecancel',
           /**
            * @event
            * Fired after the cancel button is clicked, but before the close code executes.
            * @param {Taco.core.ux.window.Modal} this
            */
           'cancel',
           /**
            * @event
            * Fired before the save event is run.
            * Returning false from an event listener can prevent the save from occurring.
            * @param {Taco.core.ux.window.Modal} this
            */
           'beforesave',
           /**
            * @event
            * Fired after the save button is clicked, but before the save process has completed. See savesuccess for the event you should listen to to get data fromt his modal.
            * @param {Taco.core.ux.window.Modal} this
            */
           'save',
           /**
            * @event
            * Fired when a save operation was successful.
            * @param {Taco.core.ux.window.Modal} this
            * @param {Mixed} data. Typically a record, but it could be an array, json, or string as well. Optional, but strongly recommended;
            */
           'savesuccess'
        );

        this.initNavHeader();

        this.on({
            afterlayout: this.checkTitleOverflow,
            render: function () {
                // when the view is rendered we need to bind the saveButton to the form if one exists;
                me.bindActionsToForm();
            },
            titlechange: function (panel, newTitle, pillCfg) {

                var me = this;
                var parentTitleCfg = this.parentTitleCfg ? this.parentTitleCfg : {};
                var lightTagLabel = parentTitleCfg.lightTagLabel && this.record
                                        ? this.record.get(parentTitleCfg.lightTagLabel)
                                        : null;

                if (!pillCfg) {
                    pillCfg = parentTitleCfg;
                } else {
                    pillCfg = Ext.apply({}, pillCfg, parentTitleCfg);
                }

                var pillText = pillCfg.pillText && this.record
                                        ? this.record.get(pillCfg.pillText)
                                        : pillCfg.pillText;

                if (!pillText) {
                    pillText = pillCfg.pillText;
                }

                var pillType = typeof pillCfg.pillType === 'function'
                                        ? pillCfg.pillType(pillText)
                                        : pillCfg.pillType;

                if (!pillType) {
                    pillType = pillCfg.pillType;
                }

                var addAction = function() {

                    //reset the html
                    var elem = document.getElementById(me.titleId);
                    if (!elem) {
                        return;
                    }
                    elem.innerHTML = '';

                    Ext.create('Taco.core.ux.action.Action', {
                        text: parentTitleCfg.title || 'Edit View',
                        renderTo: me.titleId,
                        listeners:  {
                            click: me.navigateToParentPage.bind(me, parentTitleCfg)
                        }
                    });
                };

                // override the split editor behavior
                // so when we navigate back from an order, we update the title to 'Orders'
                if (newTitle === 'Orders') {
                      me.titleCmp.update({
                        title: Localizer.langResources.ORDERS.Orders.OrderDetails.Label.orders,
                        id: this.titleId,
                        showTitleBorder: this.showTitleBorder
                      });
                }

                else if (Object.keys(parentTitleCfg).length === 0) {
                    me.titleCmp.update({
                        title: newTitle,
                        id: this.titleId,
                        showTitleBorder: this.showTitleBorder
                    });
                }

                else {
                    me.titleCmp.update({
                        title: parentTitleCfg.title || 'Edit View',
                        subTitle: newTitle,
                        id: this.titleId,
                        lightTagLabel: lightTagLabel,
                        pillText: pillText,
                        pillType: pillType,
                        showTitleBorder: this.showTitleBorder
                    });

                    if (this.pillTooltip) {
                        Ext.destroy(this.pillTooltip);
                    }

                    if (pillCfg.pillTooltipData && pillCfg.pillTooltipTpl) {

                        this.pillTooltip = Ext.create('Taco.core.ux.content.Tooltip', {
                            elementSelector: '[data-role="nav-header-pill"]',
                            arrowPosition: 'top',
                            offsetTop: -22,
                            showToolTipIcon: false,
                            defaultTpl: pillCfg.pillTooltipTpl,
                            defaultTplData: pillCfg.pillTooltipData || {}
                        });
                    }
                    if (!me.titleCmp.hasListener('afterrender')) {
                        me.titleCmp.on('afterrender', addAction);
                    } else if (me.titleCmp.rendered) {
                        addAction();
                    }
                }
            },
            scope: this
        });
    },

    navigateToParentPage: function(cfg) {
        var controller = cfg && cfg.controller ? cfg.controller : '/';
        Taco.app.StateManager.attemptNavigate(controller);


        if (controller === 'orders') {
            //to do, figure out how to remove title
        }
    },

    getTileByURL: function() {

    },


    config: {
        /**
         * @cfg {Object[]}
         * Any additional actions you want to add on top of the default Save/Cancel actions
         */
        additionalActions: null,

        // set to true if this editor is going to be in a modal (save and cancel buttons go to the bottom instead of the top header;
        isModalWrapper :false,

        //temporary data member that is set when user chooses to save and create new;
        createOnSaveSuccess : false,

        enableSaveActionToggle: true,
        createButtonEnabled: false,
        createButtonVisible: true,
        createButtonText: "Create",
        saveButtonEnabled: true,
        saveAndCreateButtonEnabled: false,
        saveButtonVisible: true,
        cancelButtonEnabled: true,
        cancelButtonVisible: true,
        cancelText: "Cancel",
        saveText: "Save",
        // state member that is set when a request to save is active;
        saveInProgress : false,
        saveInProgressText: "Saving...",

        enableSearchBarInHeader: true,
        showbreadCrumbspacer: true,
        showTitleBorder: true,

        // turns off all the default coloration for the content container; ie. makes everything white;
        useWhiteContainer: false,

        navContainerCls: " taco-content-navcontainer ",

        navContainerWhiteCls: " taco-content-navcontainer-white ",

        navContainerBodyCls: " taco-content-navcontainer-body",

        contentViewPaddingCls: " taco-content-navcontainer-padding ",

        navHeaderCls: "taco-navheader",

        extraNavHeaderCls: "",

        title: null,

        titlePanel: null,

        advancedSearchConfig: {
            quickFilterData: [],
            advancedForm: null,
            advancedFormCls: null
        }

    },

    initNavHeader: function () {
        var me = this;

        // need to enable the frame on the panel and exclude the header from it so we can add padding to the panel and let the header have full width;
        Ext.apply(this, {
            frameHeader: true,

            //style: "padding:0px;",
            frame: true
            //,
            // this will add padding around the panel with this mixin;

            //,
            //padding: "20 20 10 20"
        });

        //this.bodyStyle = "padding:20px 20px 10px 20px"


        this.cls = this.cls || "";
        this.cls += this.navContainerCls;

        if (this.useWhiteContainer) {
            this.cls += this.navContainerWhiteCls;
        }

        if (this.addContentViewPadding) {
            // adds the 20px padding that is typical of views inserted into the contentView;
            // can be disabled so that the view can be inserted into some other container where padding will be applied differently;
            this.cls += this.contentViewPaddingCls;
        }

        if (!this.bodyCls) {
            this.bodyCls = "";
        }

        this.bodyCls += this.navContainerBodyCls;


        me.header = {
            xtype: 'container',
            itemId: 'navHeaderTop',
            cls: this.navHeaderCls,
            style: 'height: 52px',
            items: []
        };

        this.createNavHeader();

        this.attachContextMenu();
    },

    attachContextMenu: function () {
        var items = [];

        if (this.contextConfig && !this.hideContextSwitcherBar) {
            items.push(this.header);
            items.push(Ext.create('Taco.view.navigation.ContextSwitcherBar', this.contextConfig));
        }

        if (this.navHeaderSubConfig) {

            if (items.length === 0) items.push(this.header);

            items.push(this.navHeaderSubConfig);
        }

        if (items.length === 0) {
            return false;
        }

        this.header = {
            xtype: 'container',
            itemId: 'navHeaderBottom',
            cls: this.navHeaderCls,
            items: items
        }
    },

    updateTitle: function (title) {
        this.titleCmp.update({title: title});
    },

    createNavHeader: function () {
        /*jshint maxcomplexity:1000 */


        var me = this,
            hasContextSwitcher = (!Ext.isEmpty(this.contextConfig) && !Ext.isEmpty(this.contextConfig.supportedLevels)),
            conf,
            actionBarPadding = '0 0 0 0';

        conf = {
            xtype: "toolbar",
            cls: "taco-navheader-toolbar",
            dock: 'top',
            items: []
        };

        if (!this.hideNavMenu) {
            me.hamburgerButton = Ext.create('Taco.core.ux.mixins.HamburgerButton');
            conf.items.push(me.hamburgerButton);
        }

        if (me.title !== false) {

            me.titleContainer = {
                xtype: "container",
                itemId: 'titleContainer',
                layout: {
                    type: 'hbox',
                    align: 'strecth'
                },
                height: 64,
                cls: 'taco-content-header-title-container',
                items: []
            };

            me.titleCmp = Ext.create('Ext.Component', {
                cls: "taco-content-header-title",
                tpl: [
                    '<tpl>',
                        '<tpl if="showTitleBorder">',
                            '<span class="title" id="{id}" data-role="nav-title"> {title} </span>',
                        '<tpl else>',
                            '<span class="title" id="{id}" data-role="nav-title" style="border-right: 0;"> {title} </span>',
                        '</tpl>',
                        '<tpl if="subTitle">',
                            '<span class="title subTitle" data-role="nav-sub-title"> {subTitle} </span>',
                            '<tpl if="lightTagLabel">',
                                '<i class="taco-light-tag" data-role="nav-tag">{lightTagLabel}</i>',
                            '</tpl>',
                            '<tpl if="pillText">',
                                '<span class="x-column-content-pill x-column-content-pill-{pillType}" data-role="nav-header-pill">',
                                    '{pillText}',
                                '</i>',
                            '</tpl>',
                        '</tpl>',
                    '</tpl>'
                ],
                flex: me.titlePanel ? 0 : 1,
                data: {
                    title: this.getTitle(),
                    subTitle: '',
                    id: this.titleId,
                    showTitleBorder: this.showTitleBorder
                }
            });

            if (this.parentTitleCfg && this.parentTitleCfg.pillTooltipTplData) {

                this.pillTooltip = Ext.create('Taco.core.ux.content.Tooltip', {
                    elementSelector: '[data-role="nav-header-pill"]',
                    arrowPosition: 'top',
                    offsetTop: -22,
                    showToolTipIcon: false,
                    defaultTpl: this.parentTitleCfg.pillTooltipTpl,
                    defaultTplData: this.parentTitleCfg.pillTooltipData || {}
                });
            }

            me.titleContainer.items.push(me.titleCmp);

            if (me.titlePanel) {
                me.titleContainer.items.push(me.titlePanel);
            }

            conf.items.push(me.titleContainer);

            if (!Ext.isEmpty(this.contextConfig) && !Ext.isEmpty(this.contextConfig.supportedLevels)) {

            } else {
                // In order for the title to grow and shrink dynamically and have elipsis we can only do this when there is no trailing "for [ context combo ] "
                if (!me.titlePanel) {
                    me.titleCmp.flex = 1;
                }
            }
        }

        if (me.breadCrumbConfig) {
            Ext.Array.each(me.breadCrumbConfig, function(config) {
                conf.items.push(me.getBreadCrumb(config));
            }, me);
        }

        if (me.enableSearchBarInHeader) {
            me.searchBox = Ext.widget({
                xtype: 'taco-filtercontainer',
                cls: 'taco-filtercontainer',
                searchType: 'navigation',
                width: '100%',
                flex: 1,
                defaultFieldName: me.advancedSearchConfig.defaultFieldName || 'keyword',
                enableQuickFilters : this.enableQuickFilters,
                quickFilterData: [me.advancedSearchConfig.quickFilterData],
                advancedForm: me.advancedSearchConfig.form,
                advancedFormCls: me.advancedSearchConfig.advancedFormCls,
                disableAdvancedSearch: (!me.advancedSearchConfig.disableAdvancedSearch) ? false : true,
                emptySearchText: (!me.advancedSearchConfig.emptySearchText) ? '' : me.advancedSearchConfig.emptySearchText,
                store: me.store || me.getDefaultStore(),
                filterStores: me.advancedSearchConfig.stores,
                value: this.options && this.options.query ? this.options.query : undefined
            });

            conf.items.push(me.searchBox);
        }

        else if (!me.enableSearchBarInHeader && !this.dontFloatHeaderButtons){
            //shifting over the buttons because we have no searchbar
            //conf.items.push('->');
            conf.layout = {
                type: 'hbox',
                align: 'stretch'
            };

            me.titleContainer.flex = 1;

            actionBarPadding = '0 0 0 0';
        }
        if (me.breadCrumbConfig)
        {
        
            me.titleContainer.flex = 0;
            if (me.showbreadCrumbspacer) {       
                conf.items.push('->');
            }
        }
        if (!me.hideSubnavLinks) {
            me.subNavLinkContainer = Ext.create('Taco.view.navigation.SubNavLinkContainer');
            conf.items.push(me.subNavLinkContainer);
        }

        if (!me.actions) {
            me.actions = [];
            me.footerActions = [];

            // todo: finalize button visibility pattern and do search and replace
            if (me.cancelButtonEnabled) {
                me.cancelActionButton = Ext.widget(Ext.apply({}, me.cancelButtonCfg, {
                    xtype: 'button',
                    height: 40,
                    text: me.cancelText,
                    margin: "0 0 0 10",
                    ui: 'link',
                    scale: 'medium',
                    hidden: !me.cancelButtonVisible || this.cancelHidden || !(me.allowCreate() || me.allowUpdate()),
                    itemId: 'cancelActionButton',
                    handler: me.cancelActionHandler,
                    scope: me
                }));

                // if not in the modal wrapper then put in the header.
                if (!me.isModalWrapper) {
                    me.actions.push(me.cancelActionButton);
                } else {
                    me.footerActions.push(me.cancelActionButton);
                }
            }

            if (me.saveButtonEnabled) {

                var saveButtonCfg = Ext.apply({}, me.saveButtonCfg, {
                    xtype: 'button',
                    height: 40,
                    text: me.saveText,
                    margin: "0 0 0 10",
                    ui: 'action-primary',
                    scale: 'medium',
                    hidden: me.saveHidden || !me.saveButtonVisible || !(me.allowCreate() || me.allowUpdate()) ,
                    itemId: 'saveActionButton',
                    allowDepress: false,
                    enableToggle: me.enableSaveActionToggle,
                    formBind: true,
                    toggleHandler: me.saveActionHandler,
                    scope: me
                });

                if (me.saveAndCreateButtonEnabled) {
                    saveButtonCfg.xtype = 'splitbutton';
                    saveButtonCfg.menu = {
                        cls: 'taco-header-split-button',
                        items: [{
                            text: Localizer.langResources.SHARED.save_and_create_new,
                            handler: me.saveAndCreate,
                            scope: me,
                            hidden: !(me.allowUpdate() || me.allowCreate())
                        }]
                    };
                }

                if (saveButtonCfg.xtype === 'splitbutton') {
                    me.saveActionButton = Ext.create('Taco.core.ux.action.ProgressSplitButton', saveButtonCfg);
                }

                else {
                    me.saveActionButton = Ext.create('Taco.core.ux.action.ProgressButton', saveButtonCfg);
                }

                // need to cache a reference to the button since the button is moved outside of the class by the splitEditor

                // if not in the modal wrapper then put in the header.
                if (!me.isModalWrapper) {
                    me.actions.push(me.saveActionButton);
                } else {
                    me.footerActions.push(me.saveActionButton);
                }
            }

            if (me.createButtonEnabled) {
                me.createButton = Ext.create('Ext.button.Button', Ext.apply({}, me.createButtonCfg, {
                    height: 40,
                    text: this.createButtonText,
                    margin: "0 0 0 10",
                    ui: 'action-primary',
                    scale: 'medium',
                    hidden: !me.createButtonVisible || !me.allowCreate(),
                    itemId: 'createActionButton',
                    handler: me.createActionHandler,
                    scope: me
                }));
                me.actions.push(me.createButton);
            }
        }

        if (me.extraButtonEnabled) {
            me.extraButton = Ext.create('Ext.button.Button', Ext.apply({}, me.extraButtonCfg, {
                height: 40,
                text: this.extraButtonText,
                margin: '0 0 0 10',
                ui: 'action-primary',
                scale: 'medium',
                hidden: false,
                itemId: 'extraActionButton',
                handler: me.extraActionHandler,
                scope: me
            }));

            me.actions.push(me.extraButton);
        }


        if (me.moreButtonCfg && me.moreButtonCfg.menu) {
            if (!me.actions) me.actions = [];

            me.actions.push(Ext.apply({}, me.moreButtonCfg, {
                xtype: 'button',
                height: 40,
                ui: 'action',
                scale: 'medium',
                itemId: 'moreActionButton',
                cls: 'taco-more-action-button',
                handler: Ext.emptyFn,
                margin: '0 0 0 10',
                scope: me
            }));
        }

        // Allows class with mixin to insert additional actions. Code copied from EditorWrapper;
        Ext.each(this.additionalActions, function (additionalAction) {
            var beforeItemId = additionalAction.beforeItemId,
                insertIndex;

            if (beforeItemId) {
                Ext.each(this.actions, function (action, index) {
                    if (action.itemId !== beforeItemId) return;
                    insertIndex = index + 1;
                    return false;
                });
            }

            if (insertIndex) {
                this.actions = Ext.Array.insert(this.actions, insertIndex, [additionalAction]);
            } else {
                this.actions.unshift(additionalAction);
            }
        }, this);


        // need to create container for buttons so that they can force the titleCmp to have elipsis
        var actionToolbar = {
            xtype: 'toolbar',
            cls: 'navheader-action-toolbar',
            itemHeader: 'navHeaderActionContainer',
            items: me.actions,
            padding: actionBarPadding
        }

        // if we have no title, the toolbar needs to flex to fill the entire container.
        if (this.title == false) {
            actionToolbar.flex = 1;
        }

        me.actionToolbar = Ext.widget(actionToolbar);

        Ext.Array.push(conf.items, me.actionToolbar);

        // this adds a close X to the header so that a form can be embedded in a dialog and maintain the native X for closing windows.
        if (me.enableWindowCloseButton) {
            this.windowCloseButton = Ext.apply({}, me.closeButtonCfg, {
                xtype: 'tool',
                type: 'close',
                itemId: 'windowCloseButton',
                handler: function () {
                    //find the window and call the close method;
                    var win = this.up('component[closable = true]');
                    if (win) {
                        win.close();
                    }
                },
                scope: me
            });

            Ext.Array.push(conf.items, this.windowCloseButton);
        }

        me.navHeader = Ext.widget(conf);

        me.header.items.unshift(me.navHeader);

        if (me.isModalWrapper) {
            me.footerActions.unshift({ xtype: 'tbfill' });
            me.bbar = {
                xtype: "toolbar",
                padding: "10px 0px 0px 0px",
                items:me.footerActions
            };
        }

    },

    resetSaveButton: function () {
        var me = this;
        if (me.saveActionButton) {
            me.saveInProgress = false;
            me.saveActionButton.stopLoading();
        }
    },

    saveAndCreate: function () {
        var me = this;

        if (me.saveInProgress) {
            return;
        }

        me.saveActionButton.pressed = true;
        me.createOnSaveSuccess = true;
        me.save(me.saveActionButton);

    },

    /**
     * @cfg saveActionHandler
     * The function to execute when the primary action button is clicked.
     */
    saveActionHandler: function (btn) {
        this.save(btn);
    },

    dismissMessages: function()  {
        Taco.app.fireEvent('dissmissmessages');
    },

    /**
     * @private
     * The function to execute when the default save button is pressed
     * This is the beginning of the save process not the end.
     * Listen to the "savesuccess" event to get the final data after the save process completes
     * Subclasses should NOT override this method with their own behavior. They should override the doSave()
     */

    save: function (btn) {
        var me = this

        if (me.saveInProgress) {
            return;
        }

        /**
        *  Dismiss all error and success messages;
        */
        me.dismissMessages();

        if (me.fireEvent('beforesave', me) !== false) {
            me.onSave();
            me.fireEvent('save', me);

            if (me.saveActionButton) {
                me.saveActionButton.startLoading();
            };

            me.saveInProgress = true;

            me.doSave();
        }
    },

    getBreadCrumb: function(config) {
        return Ext.create('Ext.Component', {
            cls: "taco-subnav-breadcrumb",
            tpl: [
                '<tpl>',
                    '<div class="{[this.getClass(values)]}"tabidnex="{tabIndex}"><a> {title} </a></div>',
                '</tpl>',
                {
                    getClass: function(values) {
                        return values.isActive ? 'active' : '';
                    }
                }
            ],
            style: 'text-align: center;',
            data: {
                title: config.title,
                isActive: config.isActive,
                tabIndex: config.tabIndex
            },
            listeners: {
                click: function() {
                     Taco.core.StateManager.attemptNavigate(config.route);
                },
                element: 'el'
            }
        });
    },

    /**
    *  Template method called just before the save event is fired;
    */
    onSave: Ext.emptyFn,

    /**
     * @cfg doSave
     * The function to execute the persistance code if needed;
     * Subclasses should override this method with their own behavior.
     * Be sure to call the "saveSuccess(data)" method with the new data as an argument when the save process is complete;
     */
    doSave: function () {
        var me = this,
            data = null;

        //console.log("doSave")
        //console.warn("The instances and subclasses of this Modal typically overide the doSave() Method and this modal has not.")

        /*
            // your persistance code goes here.
            Call saveSuccess(data)
        */
        //This is required. don't forget to call this method when your override finishes the persistance process.
        me.saveSuccess(data);
    },

    /**
    * Callback method that announces when a bound form has saved successfuly    s
    * When no bound form exists, this method is called immediately when the save button is clicked;
    * Pass in data argument if you want to override the default arguments for the savesuccess event
    * @param  {mixed} data the data that was saved. Could be record, string, object, array. Optional, but strongly recommended; If data not passed the method will attempt to pull the data from a child form;
    */
    saveSuccess: function (data, store, isSuccessful) {
        var me = this;

        me.onSaveSuccess(data, store, isSuccessful);
        this.resetSaveButton()
        me.fireEvent('savesuccess', me, data, store, isSuccessful);

        if (me.createOnSaveSuccess) {
            me.createOnSaveSuccess = false;
            // push the edit url in to history so we can go back to the editor using history. This is not going to navigate though since we are skipping it and going to the create url
            Taco.core.StateManager.addState(me.getEditRoute() + '/' + me.record.getId(), { id: me.record.getId() });
            // go to create view;
            me.create();
        } else {
            // go to the editor view if this is an inital save
            // moved from EditorWrapper.js
            if (me.record && me.record.getId() != me.originalId) {
                this.fireEvent('idchange', me, me.record, me.originalId);
            }
        }
    },


    /**
    *  Template method called just before the savesuccess event is fired;
    */
    onSaveSuccess: Ext.emptyFn,

    /**
    * Callback method that announces when a bound form had a failure while saving
    * @param  {mixed} data the data that was saved. Could be record, string, object, array. Optional, but strongly recommended; If data not passed the method will attempt to pull the data from a child form;
    */
    saveFailure: function () {
        var me = this;
        me.onSaveFailure(arguments);
        this.resetSaveButton();
        me.fireEvent('savefailure', me, arguments);

        me.createOnSaveSuccess = false;

    },

    onSaveFailure: Ext.emptyFn,

    /**
     * @cfg cancelActionHandler
     * The function to execute when the cancel action button is clicked.
     */
    cancelActionHandler: function () {
        this.cancel();
    },

    cancel: function () {
        var me = this;

        if (me.fireEvent('beforecancel', me) !== false) {
            me.onCancel();
            me.fireEvent('cancel', me, me.record);
            me.doCancel();
        }
    },


    onCancel: Ext.emptyFn,

    doCancel: function () {
        this.onComplete();
    },

    /**
     * Runs whenever the save or cancel operations have completed.
     */
    onComplete: function () {
    },

    /**
     * @cfg createActionHandler
     * The function to execute when the create action button is clicked.
     */
    createActionHandler: function () {
        this.create();
    },


    create: function () {
        var me = this;

        if (me.fireEvent('beforecreate', me) !== false) {
            me.onCreate();
            me.fireEvent('create', me);
            me.doCreate();
        }
    },


    onCreate: Ext.emptyFn,

    doCreate: function () {

    },

    getDefaultStore: function() {
        return Ext.create('Ext.data.Store', {
            model: 'Taco.core.data.Model'
        });
    },

    bindActionsToForm: function (form) {
        var actions = this.header.query ? this.header.query('[formBind]') : null,
            form = form || this.form;

        if (form && form.isComponent) {
            form.getForm().getBoundItems().add(actions);
        }
    },

    checkTitleOverflow: function () {
        var innerEl = this.titleCmp ? this.titleCmp.getEl() : null;
        if (!innerEl) return false;

        var titleEl = innerEl.down('[data-role="nav-title"]'),
            titleEl = innerEl.down('[data-role="nav-title"]'),
            subTitleEl = innerEl.down('[data-role="nav-sub-title"]'),
            tagEl = innerEl.down('[data-role="nav-tag"]'),
            draftEl = innerEl.down('[data-role="nav-header-pill"]'),
            width = innerEl.getWidth(),
            scrollWidth = innerEl.dom.scrollWidth,
            maxWidth = width - 10;

        if (!subTitleEl || Date.now() - this.buffer < 50) {
            return;
        }

        maxWidth -= titleEl.getWidth();

        if (tagEl) {
            maxWidth -= tagEl.getWidth();
        }

        if (draftEl) {
            maxWidth -= draftEl.getWidth();
        }

        if (width < scrollWidth) {
            this.lastOverflowCheck = true;
            subTitleEl.setWidth(maxWidth);
        } else {
            subTitleEl.setWidth(null);
            if (this.lastOverflowCheck) {
                this.checkTimeout = setTimeout(this.checkTitleOverflow.bind(this), 0);
            }
            this.lastOverflowCheck = false;
        }
    }

});
