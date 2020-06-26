Ext.define('Taco.view.publishing.component.button.PublishButton', {
    alias: 'widget.publishbutton',
    extend: 'Taco.core.ux.action.ProgressSplitButton',
    requires: [
        'Taco.core.ux.window.Modal',
        'Taco.view.publishing.modal.PublishSetPicker',
        'Taco.model.PublishSet',
        'Taco.core.ux.action.ProgressSplitButton'
    ],
    ui: 'action-primary',
    menuAlign: 'tr-br',
    height: 40,
    scale: 'medium',
    text: Localizer.langResources.SHARED.publish_now,
    margin: '0 0 0 10',
    initComponent: function() {

        /***
            A publish set button will be located on products, entities, and documents which 
            all have different MVC routes, and thus this component will not handle actually sending
            data to its corresponding resources

            This component will handle the basic interactions of displaying modal dialogs, whether the
            button will be disabled/enabled, and what options are currently available
    
            Methods Exposed: 

                onMoveToPublish
                onRemoveFromPublishSet
                onDiscardDraft
            
        ***/

        this.itemSelectors = {
            remove: 'remove-from-publish',
            move: 'move-to-publish',
            disard: 'discard-draft'
        };

        this.moveOption =   {
            text: Localizer.langResources.CATALOG.Products.ProductEdit.move_to_publish_set,
            scope: this,
            itemId: this.itemSelectors.move,
            handler: this._onMoveToPublish
        };

        this.removeOption = {
            text: Localizer.langResources.CATALOG.Products.ProductEdit.remove_from_publish_set,
            scope: this,
            itemId: this.itemSelectors.remove,
            handler: this._onRemoveFromPublishSet
        };

        this.discardOption = {
            text: Localizer.langResources.CATALOG.Products.ProductEdit.discard_draft,
            itemId: this.itemSelectors.discard,
            scope: this,
            handler: this._onDiscardDraft
        };

        this.menu = {
            shadow: true,
            cls: 'taco-header-split-button',
            items: [
                this.moveOption,
                this.removeOption,
                this.discardOption
            ]
        };


        this.callParent(arguments);

        var me = this;

        this.on('enable', this.afterEnable);
        
    },

    afterEnable: function(argument) {
        var me = this;
        
        if(!argument.isDisabled()) {
            return false;
        }


        // on validty change events
        // check after the event, to confirm actual buttonstate

        Ext.defer(function() {
            me.updateButton();
        }, 100)
    },

    setLoading: function(isLoading, cb) {

        var method = isLoading ? 'addCls' : 'removeCls',
            text = isLoading ? Localizer.langResources.SHARED.proccessing : Localizer.langResources.SHARED.publish_now,
            me = this;

        if (isLoading) {
            me.startLoading();
        }

        else {
            me.stopLoading(cb);
        }
    },

    onMenuShow: function(cmp) {

        if (!this.record) {
            console.warn(Localizer.langResources.CATALOG.Products.ProductEdit.record_supplied_msg);
            return false;
        }

        cmp.down('#' + this.itemSelectors.remove)[this.record.get('publishSetCode') ? 'enable' : 'disable']();
    },

    _onMoveToPublish: function() {

        var me = this,
            record = this.record;

        Ext.create('Taco.view.publishing.modal.PublishSetPicker', {
            record: record,
            autoShow: true,
            listeners: {
                aftersaveclose: function(record, publishSetCode) {
                    me.onMoveToPublish(me.record, publishSetCode);
                }
            }
        });

    },

    _onRemoveFromPublishSet: function() {
        var me = this;
        var name = this.record.get('name') || this.record.get('productName');

        this.getPublishSetById(function(publishSet) {
            me.getModal({
                header: Localizer.langResources.CATALOG.Products.ProductEdit.remove_draft,
                message: Localizer.langResources.SHARED.remove_msg + name + ' ' + Localizer.langResources.SHARED.from + ' ' + publishSet.get('name') ,
                onSave: me.onRemoveFromPublishSet.bind(me, me.record),
                onCancel: me.onCancelRemove
            });
        });
    },

    _onDiscardDraft: function() {

        var me = this;
        var name = this.record.get('name') || this.record.get('productName');

        this.getModal({
            header: Localizer.langResources.CATALOG.Products.ProductEdit.discard_draft,
            message: Localizer.langResources.SHARED.discard_msg + name + '?',
            primaryText: Localizer.langResources.SHARED.discard_text,
            onSave: this.onDiscardDraft.bind(me, me.record),
            onCancel: this.onCancelDiscard
        });
    },

    addRecord: function(record) {
        this.record = record;
        this.updateButton();
    },

    handler: function() {
        // main handler
    },

    updateButton: function() {
        var me = this;

        if (!this.record) {
            me.disable();
            return false;
        }

        var state = ((
            this.record.get('publishState') || this.record.get('publishedState')
        ) || '').toLowerCase();

        if (!state && !this.record.phantom) {
            return false;
        }

        if (this.record.phantom) {
            state = 'live';
        }

        var func = state === 'draft'
            || state === 'new'
            || (state !== 'active' && state !== 'live')
            ? 'enable'
            : 'disable';

        // dont do a noop
        // dont remove, since we have a listener for afterEnable
        // we dont want to trigger multiple events
        if (func === 'enable' && !me.disabled 
            || func === 'disable' && me.disabled) {
            return;
        }

        me[func]();

    },

    getPublishSetById: function(cb) {

        Ext.Ajax.request({
            url: '/admin/app/publishsets/getBy/' + this.record.get('publishSetCode'),
            method: 'GET',
            success: function (res, status) {
                var record = Ext.create('Taco.model.PublishSet', JSON.parse(res.responseText).items[0]);
                cb(record);
            },
            failure: function() {
                Taco.app.fireEvent('setmessage', Localizer.langResources.CATALOG.Products.ProductEdit.error_retrieving_publish_set , 'error');
            }
        }, this);
    },

    getModal: function(config) {
        Ext.create('Taco.core.ux.window.Modal', {
            scale: 'small',
            title: config.header,
            modal: true,
            closeAction: 'destroy',
            height: 200,
            primaryText: config.primaryText ? config.primaryText : Localizer.langResources.SHARED.confirm,
            secondaryText: config.secondaryText ? config.secondaryText : Localizer.langResources.SHARED.cancel,
            items: [{
                xtype: 'container',
                layout: { 
                    type: 'hbox' 
                },
                items: [
                    Ext.create('Ext.panel.Panel', {
                        width: '100%',
                        html: config.message
                    })
                ]
            }],
            listeners: {
                aftersaveclose: config.onSave || Ext.emptyFn,
                aftercancelclose: config.onCancel || Ext.emptyFn
            }
        }).show();
    }
});