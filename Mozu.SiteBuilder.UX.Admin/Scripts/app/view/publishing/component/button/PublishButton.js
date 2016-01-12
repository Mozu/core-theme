Ext.define('Taco.view.publishing.component.button.PublishButton', {
    alias: 'widget.publishbutton',
    extend: 'Ext.button.Split',
    requires: [
        'Taco.core.ux.window.Modal',
        'Taco.view.publishing.modal.PublishSetPicker',
        'Taco.model.PublishSet'
    ],
    ui: 'action-primary',
    height: 40,
    scale: 'medium',
    text: 'Publish Now',
    margin: '0 0 0 10',
    renderTpl: [
        '<span id="{id}-btnWrap" role="presentation" class="{baseCls}-wrap',
            '<tpl if="splitCls"> {splitCls}</tpl>',
            '{childElCls}" unselectable="on">',
            '<span class="taco-check-save taco-button-overlay"></span>',
            '<span class="taco-animated-circle taco-button-overlay"></span>',
            '<span id="{id}-btnEl" class="{baseCls}-button" role="presentation">',
                '<span id="{id}-btnInnerEl" class="{baseCls}-inner {innerCls}',
                    '{childElCls}" unselectable="on">',
                    '{text}',
                '</span>',
                '<span role="presentation" id="{id}-btnIconEl" class="{baseCls}-icon-el {iconCls}',
                    '{childElCls} {glyphCls}" unselectable="on" style="',
                    '<tpl if="iconUrl">background-image:url({iconUrl});</tpl>',
                    '<tpl if="glyph && glyphFontFamily">font-family:{glyphFontFamily};</tpl>">',
                    '<tpl if="glyph">&#{glyph};</tpl><tpl if="iconCls || iconUrl">&#160;</tpl>',
                '</span>',
            '</span>',
        '</span>',
        // if "closable" (tab) add a close element icon
        '<tpl if="closable">',
            '<span id="{id}-closeEl" role="presentation"',
                ' class="{baseCls}-close-btn"',
                '<tpl if="closeText">',
                    ' title="{closeText}" aria-label="{closeText}"',
                '</tpl>',
                '>',
            '</span>',
        '</tpl>'
    ],
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
            text = isLoading ?  'Proccessing...': 'Publish Now',
            me = this;

        if (isLoading) {
            me.addCls('taco-button-processing');
            Ext.defer(function() {
                //add animation class to button -- to be removed on return of save
                me.addCls('taco-button-show-processing');
                me.addCls('taco-button-processing-complete');

                Ext.defer(function() {
                    me.addCls('taco-button-show-processing-complete');
                }, 10);

            }, 50)
        }

        else {
            me.removeCls('taco-button-show-processing');

            Ext.defer(function() {
                me.removeCls('taco-button-show-processing-complete');
            }, 1000)
        }
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
        var me = this;

        if (!this.record) {
            me.disable();
            return false;
        }

        var state = this.record.get('publishState') || this.record.get('publishedState');

        if (!state && !this.record.phantom) return false;

        if (this.record.phantom) state = 'live';

        Ext.defer(function() {
            me[state.toLowerCase() === 'draft' || state.toLowerCase() === 'new' ? 'enable' : 'disable']();
        }, 1100)

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