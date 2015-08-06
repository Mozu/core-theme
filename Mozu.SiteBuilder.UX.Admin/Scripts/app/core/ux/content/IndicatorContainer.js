/**
 * Created by greg_murray on 7/30/2015.
 */
Ext.define('Taco.core.ux.content.IndicatorContainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.taco-indicator',
    requires: [
        'Ext.form.Label',
        'Ext.Button',
        'Ext.tip.ToolTip',
        'Ext.tip.QuickTipManager'
    ],
    padding: '3 0 0 10',
    width: '150px',
    cls: Taco.baseCSSPrefix + 'content-header-publish-state',
    title: null,
    tooltipExplanation: 'Click for info.',
    tooltipContent: '',
    layout: 'hbox',
    // afterrender: Ext.emptyFn,
    getHtmlTooltipContent: function() {
        return this.tooltipContent;
    },

    initComponent: function() {
        var me = this;

        var onClickAnywhereCloseTip = function(evt) {
            me.mun(Ext.getBody(), 'click', onClickAnywhereCloseTip, this);
            if (!me.tipContent) {
                return;
            }
            evt.stopEvent();
            me.tipContent.destroy();
            me.tipContent = null;
        };

        var onTooltipClick = function (btn, evt) {
            Ext.tip.QuickTipManager.unregister(btn.getEl());
            if (!me.tipContent) {
                me.tipContent = Ext.create('Ext.tip.ToolTip', {
                    target: btn.getEl(),
                    cls: Taco.baseCSSPrefix + 'tooltip-help-content',
                    html: me.getHtmlTooltipContent(),
                    //tooltipStore.findRecord('key', tooltipKey).get('value'),
                    padding: '0',
                    focusOnToFront: true,
                    autoHide: false,
                    closable: false,
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'right',
                        defaultAlign: 't',
                        margin: '0 2 0 0',
                        height: 15,
                        items: [
                            {
                                xtype: 'button',
                                text: '',
                                glyph: 'XE011@mozicons',
                                overCls: ''
                            }
                        ]
                    }],
                    listeners: {
                        hide: function () {
                            me.tipContent.destroy();
                            me.tipContent = null;
                        },
                        afterrender: {
                            fn: me.afterrender.bind(null, me)
                        }
                    }
                });
            }
            evt.stopEvent();
            me.tipContent.showBy(btn, 'bl-tr?', [0, -5]);
            me.mon(Ext.getBody(), 'click', onClickAnywhereCloseTip, this);
        };

        this.titleLabel = Ext.widget('label', {
            padding: '1 0 0 10',
            text: me.title
        });

        this.titleTooltipBtn = Ext.create('Ext.Button', {
            ui: 'link',
            //padding: '0 0 0 0',
            text: '',
            glyph: 'XE615@mozicons',
            style: {
                color: 'white',
                width: '25px'
            },
            handler: onTooltipClick,
            itemId: 'titleTooltipBtn',
            tooltip: {
                text: me.tooltipExplanation,
                cls: Taco.baseCSSPrefix + 'tooltip'
            }
        });

        this.items = [
                this.titleLabel,
                this.titleTooltipBtn
            ];

        this.callParent(arguments);
    },

    setText: function(txt, encodeHtml) {
        this.titleLabel.setText(txt, encodeHtml);
    },


    setTooltipContent: function(content) {
        this.tooltipContent = content;
    }

});