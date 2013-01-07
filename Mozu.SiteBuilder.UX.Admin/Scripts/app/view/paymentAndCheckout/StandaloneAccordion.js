/**
 * @class Taco.view.paymentAndCheckout.StandaloneAccordion
 * @author Michael Speed Elder
 * Date: 8/23/12
 * Time: 5:28 PM
 *
 * A container that holds a header bar and an expandable subcontainer,
 * which is opened and closed by toggling the header bar.
 */

Ext.define('Taco.view.paymentAndCheckout.StandaloneAccordion', {
    extend: 'Ext.container.Container',
    // extend: 'Taco.core.ux.content.Container',
    alias: 'widget.standalone-accordion',
    cls: 'taco-standalone-accordion',
    layout: 'vbox',

    headerText: 'Default headerText',
    accordionHeight: 300,
    accordionContents: null,
    opened: false,
    // accordionContents: Ext.create('Ext.container.Container', {
    //     height: 300,
    //     width: '100%',
    //     style: {
    //         'background-color': '#333'
    //     },
    //     items: [{
    //         xtype: 'component',
    //         html: '<p>The quick brown fox jumped over the lazy red dog. All work and no play makes Jack a dull boy.  Lorem ipsum, ipso facto. The quick brown fox jumped over the lazy red dog. All work and no play makes Jack a dull boy.  Lorem ipsum, ipso facto. The quick brown fox jumped over the lazy red dog. All work and no play makes Jack a dull boy.  Lorem ipsum, ipso facto.</p>'
    //     }]
    // }),

    initComponent: function () {
        var me = this,
            contents;

        me.headerBar = Ext.create('Ext.Component', {
            cls: 'taco-standalone-accordion-header',
            html: '<span class="taco-opened-arrow">&#9660;</span><span class="taco-closed-arrow">&#9654;</span><span class="taco-header-text">' + me.headerText + '</span>'
        });

        contents = me.accordionContents = Ext.create('Ext.container.Container', {
            width: '100%',
            layout: 'vbox',
            items: me.accordionContents // *** array from config
        });

        me.items = [ me.headerBar, contents ];

        me.callParent( arguments );

        if( me.opened ) {
//            console.log('initComponent[ standalone-accordion ]', contents.getHeight() );
            contents.addCls('taco-standalone-accordion-contents').setHeight( me.accordionHeight );
//            console.log('initComponent[ standalone-accordion ]', contents.getHeight() );
            me.addCls('opened');
        } else {
            contents.addCls('taco-standalone-accordion-contents').setHeight( 0 );
            me.addCls('closed');
        }

        me.mon(
            me,
            'afterrender',
            function () {
               me.headerBar.getEl().on({
                   click: me.expandAccordion,
                   scope: me
               })
            }
        );

        // me.headerBar.getEl().on({
        //     click: me.expandAccordion,
        //     scope: me.accordionContents
        // });
    },

    expandAccordion: function () {
        var me = this,
            accordionContents = me.accordionContents;
        // console.log('expandAccordion', accordionContents.getHeight() );
        if( !accordionContents.getHeight() ) {
            me.addCls('opened');
            me.removeCls('closed');
            accordionContents.animate({
                dynamic: true,
                to: {
                    height: me.accordionHeight
                }
            });
        }
        else {
            me.addCls('closed');
            me.removeCls('opened');
            accordionContents.animate({
                dynamic: true,
                to: {
                    height: 0
                }
            });
        }
    }
});