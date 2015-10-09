Ext.define('Taco.view.publishing.component.button.PublishButton', {
    alias: 'widget.publishbutton',
    extend: 'Ext.button.Split',
    requires: [
        'Taco.core.ux.action.SplitButton',
        'Taco.core.ux.window.Modal',
        'Taco.view.publishing.modal.PublishSetPicker',
        'Taco.model.PublishSet'
    ],
    ui: 'action-primary',
    scale: 'medium',
    text: 'Publish Now',
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
            text: 'Move to Publish Set',
            scope: this,
            itemId: this.itemSelectors.move,
            handler: this._onMoveToPublish
        };

        this.removeOption = {
            text: 'Remove From Publish Set',
            scope: this,
            itemId: this.itemSelectors.remove,
            handler: this._onRemoveFromPublishSet
        };

        this.discardOption = {
            text: 'Discard Draft',
            itemId: this.itemSelectors.discard,
            scope: this,
            handler: this._onDiscardDraft
        };

        this.menu = {
            shadow: true,
            items: [
                this.moveOption,
                this.removeOption,
                this.discardOption
            ]
        };

        this.callParent(arguments);
    },

    setLoading: function(isLoading) {

        var method = isLoading ? 'addCls' : 'removeCls',
            text = isLoading ?  'Proccessing...': 'Publish Now';

        this[method]('taco-button-processing');
        this.setText(text);
    },

    onMenuShow: function(cmp) {

        if (!this.record) {
            console.warn('A record must be supplied for this component to function correctly');
            return false;
        }

        cmp.down('#' + this.itemSelectors.remove)[this.record.get('publishSetCode') ? 'enable' : 'disable']();
    },

    _onMoveToPublish: function() {

        var me = this,
            record = this.record,
            modal = Ext.create('Taco.view.publishing.modal.PublishSetPicker', {
            record: record,
            callback: function(publishSetCode) {
                me.onMoveToPublish(me.record, publishSetCode);
            }
        });

        modal.show();
    },

    _onRemoveFromPublishSet: function() {
        var me = this;
        var name = this.record.get('name') || this.record.get('productName');

        this.getPublishSetById(function(publishSet) {
            me.getModal({
                header: 'Remove Draft',
                message: 'Are you sure you want to remove ' + name + ' from ' + publishSet.get('name') ,
                onSave: me.onRemoveFromPublishSet.bind(me, me.record),
                onCancel: me.onCancelRemove
            });
        });
    },

    _onDiscardDraft: function() {

        var me = this;
        var name = this.record.get('name') || this.record.get('productName');

        this.getModal({
            header: 'Discard Draft',
            message: 'Are you sure you want to discard ' + name + '?',
            primaryText: 'Yes, Discard',
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

        if (!this.record) return false;

        var state = this.record.get('publishState') || this.record.get('publishedState');

        if (!state) return false;

        this[state.toLowerCase() === 'draft' ? 'enable' : 'disable']();
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
                Taco.app.fireEvent('setmessage', 'Error Retrieving Publish Set Information', 'error');
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
            primaryText: config.primaryText ? config.primaryText : 'Confirm',
            secondaryText: config.secondaryText ? config.secondaryText :'Cancel',
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