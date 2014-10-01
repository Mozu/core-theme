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
        'Ext.toolbar.Spacer'
    ],

    mixins: {
        permissions: 'Taco.core.ux.mixins.Permissions'
    },

    init: function () {
        var me = this
        this.mixins.permissions.constructor.apply(this, arguments);

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

        me.mon(me, {
            render: {
                fn: function () {
                    // when the view is rendered we need to bind the saveButton to the form if one exists;
                    me.bindActionsToForm();
                },
                scope: me
            },
            titlechange: {
                fn: function (panel, newTitle) {
                    me.titleCmp.update(newTitle);

                },
                scope: me
            }
        });
    },


    config: {
        /**
         * @cfg {Object[]}
         * Any additional actions you want to add on top of the default Save/Cancel actions
         */
        additionalActions: null,

        enableSaveActionToggle: true,
        createButtonEnabled: false,
        createButtonVisible: true,
        createButtonText: "Create",
        saveButtonEnabled: true,
        saveButtonVisible: true,
        cancelButtonEnabled: true,
        cancelButtonVisible: true,
        cancelText: "Cancel",
        saveText: "Save",
        saveInProgressText: "Saving...",
        title: null
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
        this.cls += " taco-content-navcontainer ";

        if (this.addContentViewPadding) {
            // adds the 20px padding that is typical of views inserted into the contentView;
            // can be disabled so that the view can be inserted into some other container where padding will be applied differently;
            this.cls += " taco-content-navcontainer-padding ";
        }

        if (!this.bodyCls) {
            this.bodyCls = "";
        }

        this.bodyCls += " taco-content-navcontainer-body";

        //cls: "taco-content-container",


        me.header = {
            xtype: "container",
            cls: "taco-navheader",
            // need to set the min height to 
            style: "height:52px;",
            items: []
        }

        this.createNavHeader()
    },

    createNavHeader: function () {
        var me = this,
            hasContextSwitcher = (!Ext.isEmpty(this.contextConfig) && !Ext.isEmpty(this.contextConfig.supportedLevels)),
            conf;

        me.titleContainer = {
            xtype: "container",
            layout: 'hbox',
            flex: 1,
            items: []
        };

        if (me.title !== false) {
            // just call view.setTitle("new title here") to update the title;
            me.titleCmp = Ext.create('Ext.Component', {
                cls: "taco-content-header-title",
                html: this.getTitle()
            });

            me.titleContainer.items.push(me.titleCmp);
        }

        conf = {
            xtype: "toolbar",
            cls: "taco-navheader-toolbar",
            dock: 'top',
            items: []
        };

        conf.items.push(me.titleContainer);

        if (!Ext.isEmpty(this.contextConfig) && !Ext.isEmpty(this.contextConfig.supportedLevels)) {
            me.titleContainer.items.push({
                autoEl: 'h3',
                itemId: 'forLable',
                style: {
                    'line-height': '3rem',
                    'margin': '0px 10px 0px 10px',
                    'font-weight': 'normal'
                },
                xtype: 'component',
                html: 'for'
            });

            me.titleContainer.items.push(Ext.create('Taco.core.ux.content.ContextMenu', this.contextConfig));

        } else {
            // In order for the title to grow and shrink dynamically and have elipsis we can only do this when there is no trailing "for [ context combo ] "
            me.titleCmp.flex = 1;
        }

        if (!me.actions) {
            me.actions = [];


            // todo: finalize button visibility pattern and do search and replace
            if (me.cancelButtonEnabled) {
                me.actions.push(Ext.apply({}, me.cancelButtonCfg, {
                    xtype: 'button',
                    text: me.cancelText,
                    margin: "0 0 0 10",
                    ui: 'action',
                    scale: 'medium',
                    hidden: !me.cancelButtonVisible || this.cancelHidden || !this.allowCreate(),
                    itemId: 'cancelActionButton',
                    handler: me.cancelActionHandler,
                    scope: me
                }));
            }

            if (me.saveButtonEnabled) {

                var saveButtonCfg = Ext.apply({}, me.saveButtonCfg, {
                    xtype: 'button',
                    text: me.saveText,
                    margin: "0 0 0 10",
                    ui: 'action-primary',
                    scale: 'medium',
                    hidden: me.saveHidden || !me.saveButtonVisible || !me.allowCreate(),
                    itemId: 'saveActionButton',
                    allowDepress: false,
                    enableToggle: me.enableSaveActionToggle,
                    formBind: true,
                    toggleHandler: me.saveActionHandler,
                    scope: me

                })

                // need to cache a reference to the button since the button is moved outside of the class by the splitEditor
                me.saveActionButton = Ext.widget(saveButtonCfg);

                me.actions.push(me.saveActionButton);
            }

            if (me.createButtonEnabled) {
                me.actions.push(Ext.apply({}, me.createButtonCfg, {
                    xtype: 'button',
                    text: this.createButtonText,
                    margin: "0 0 0 10",
                    ui: 'action-primary',
                    scale: 'medium',
                    hidden: !me.createButtonVisible,
                    itemId: 'createActionButton',
                    handler: me.createActionHandler,
                    scope: me
                }));
            }
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
        Ext.Array.push(conf.items, {
            xtype: 'container',
            itemHeader: 'navHeaderActionContainer',
            items: me.actions
        });

        me.navHeader = Ext.widget(conf);



        me.header.items.unshift(me.navHeader);
    },

    resetSaveButton: function () {
        var me = this;
        if (me.saveActionButton) {
            me.saveActionButton.toggle(false, true);
            me.saveActionButton.removeCls('taco-button-processing');
            me.saveActionButton.setText(this.saveText);
        }
    },

    /**
     * @cfg saveActionHandler
     * The function to execute when the primary action button is clicked.
     */
    saveActionHandler: function (btn) {
        this.save(btn);
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

        // prevent multiple saves;
        if (me.saveActionButton && me.saveActionButton.pressed == false) {
            return;
        }

        if (me.fireEvent('beforesave', me) !== false) {
            me.onSave();
            me.fireEvent('save', me);

            if (me.saveActionButton) {
                me.saveActionButton.addCls('taco-button-processing');
                me.saveActionButton.setText(this.saveInProgressText);
            };

            me.doSave();
        }
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
    * Callback method that announces when a bound form has saved successfuly    
    * When no bound form exists, this method is called immediately when the save button is clicked;
    * Pass in data argument if you want to override the default arguments for the savesuccess event
    * @param  {mixed} data the data that was saved. Could be record, string, object, array. Optional, but strongly recommended; If data not passed the method will attempt to pull the data from a child form;
    */
    saveSuccess: function (data) {
        var me = this;
        me.onSaveSuccess(data);
        this.resetSaveButton()

        me.fireEvent('savesuccess', me, data);

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
        console.log("doCancel")
        this.onComplete();
    },

    /**
     * Runs whenever the save or cancel operations have completed.
     */
    onComplete: function () {
        console.log("onComplete")
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
        console.log("doCreate")
    },

    bindActionsToForm: function (form) {
        var actions = this.header.query('[formBind]'),
            form = form || this.form;

        if (form && form.isComponent) {
            form.getForm().getBoundItems().add(actions);
        }
    }

});