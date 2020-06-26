/**
 * @class  Taco.view.discount.Taco.view.couponSet.GeneratedCodeForm
 * @author Travis Johnson
 * @description Dicounts General Form
 */
Ext.define('Taco.view.couponSet.GeneratedCodeForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-couponset-general',

    requires: [
        'Taco.core.util.ExceptionWhiner'
    ],

    require: [
        'Taco.core.ux.TooltipLabel'
    ],
    ui: 'subform',
    margin: '0 0 39 0',

    title: Localizer.langResources.MARKETING.CouponSets.code_configuration,
    
    config : {
        isCreateMode: false
    },

    initComponent: function() {
        var me = this;

        // horizontal space between fields
        var defaultFieldMargin = 50;
        // how wide should fields be that display currency amounts
        var defaultFieldWidth = 166; // 3 column width
        //widest width that will fit in an override container at the smallest browser width;
        var fullFieldWidth = (defaultFieldWidth * 3) + (2 * defaultFieldMargin);
        // field width when part of a two column layout
        var twoColumnFieldWidth = (fullFieldWidth / 2)  -  (defaultFieldMargin/2);

        Ext.tip.QuickTipManager.init();

        this.numberOfCodes = Ext.create('Ext.form.field.Number', {
            name: 'setSize',
            hideTrigger: true,
            width: twoColumnFieldWidth,
            margin: "0 50 0 0",
            fieldLabel: Localizer.langResources.MARKETING.CouponSets.number_of_codes,
            //emptyText: '',
            readOnly: !me.isCreateMode,
            minValue: 0,
            allowBlank: false
        });


        this.codePrefix = Ext.create('Ext.form.field.Text', {
                name: 'couponSetCode',
                itemId: 'coupon-set-prefix-field',
                readOnly: !me.isCreateMode,
                fieldLabel: Localizer.langResources.MARKETING.CouponSets.code_prefix,
                labelAlign: 'top',
                allowBlank: true,
                enforceMaxLength: true,
                maxLength: 32,
                flex:1,
                emptyText: Localizer.langResources.MARKETING.CouponSets.generated_if_blank,
                enableKeyEvents: true,
                //regex: /^[BCDFGHJKLMNPQRSTVWXYZ1-9\$!]+$/i,
                //regexText: 'Invalid character. Vowels, the number 0, and any special characters, except "$" or "!", are not allowed.',
                tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                    elementId: 'coupon-set-prefix-field',
                    hoverTarget: 'bodyEl',
                    messageKey: 'couponSet.generatedCode.prefix',
                    offsetLeft: 70,
                    offsetTop: 45
                }),
                listeners: {
                    keyup: me.updatePreview,
                    scope: me
                }

            }
        );

        this.suggestButton = Ext.create('Ext.button.Button', {
            ui: "action",
            disabled: !me.isCreateMode,
            hidden: !me.isCreateMode,
            scale: "medium",
            width: 100,
            margin: "41 0 0 5",
            text: Localizer.langResources.MARKETING.CouponSets.suggest_text,
            handler: me.suggestPrefix,
            scope: me
        });

        this.previewCode = Ext.widget('displayfield', {
            height: 100,
            width: twoColumnFieldWidth,
            fieldStyle: {
                color: 'grey'
            },
            fieldBodyCls: 'taco-readonly-display-preview',
            value: this.getPreviewText()
        });

        this.items = [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [{
                        xtype: 'fieldcontainer',
                        layout: 'vbox',
                        width: twoColumnFieldWidth,
                        items: [
                            this.numberOfCodes,
                            {
                                xtype: 'fieldcontainer',
                                layout: 'hbox',
                                width: twoColumnFieldWidth,
                                items: [
                                    this.codePrefix,
                                    this.suggestButton
                                ]
                            }
                        ]
                    }, {
                        xtype: 'component',
                        padding: '0 50 0 0'
                    },
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        width: twoColumnFieldWidth,
                        items: [{
                            xtype: 'label',
                            cls: 'x-form-item-label x-form-item-label-top',
                            text: 'Preview'
                            },
                            this.previewCode
                        ]
                    }
                ]
            }
        ];

        this.mon(Taco.app, 'couponsetcreated', function(data) {
            me.codePrefix.setValue(data.get('couponSetCode'));
            me.setIsCreateMode(false);
            me.suggestButton.hide();
            me.codePrefix.setReadOnly(true);
            me.numberOfCodes.setReadOnly(true);
        }, me);

        if (this.record && this.record.get("couponSetCode") && this.previewCode) {
            this.previewCode.setValue(this.getPreviewText())
        }
        this.callParent(arguments);
    },

    updatePreview: function () {
        this.previewCode.setValue(this.getPreviewText());
    },

    getPreviewText: function () {
        if (this.record && this.record.get('couponSetCode')) {
            var prefix = this.record.get("couponSetCode");
            return prefix + "XXXXXXXXX";
        }
        else if(this.codePrefix && this.codePrefix.getValue() != '') {
            
            var prefix = this.codePrefix.getValue();
            return prefix + "XXXXXXXXX";
        }
        else {
            return "Enter number of codes & code prefix.";
        }
    },

    suggestPrefix: function() {
        var me = this;

        Ext.Ajax.request({
            url: '/admin/app/couponset/uniqueCode',
            success: function (response) {
                var data = Ext.JSON.decode(response.responseText);
                if (!data || !data.items) return;
                me.codePrefix.setValue(data.items.value);
                me.updatePreview(me.codePrefix);
            },
            failure: Taco.core.util.ExceptionWhiner.handleRemoteFailure
        });

    },
    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});