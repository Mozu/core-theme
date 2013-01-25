/**
 * @class Taco.view.navigation.ContextSwitcher
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.view.navigation.ContextSwitcher', {
    extend: 'Ext.container.Container',

    autoEl: {
        tag: 'div',
        cls: 'taco-primary-menu-ct'
    },
    autoShow: true,
    border: false,
    floating: true,
    header: false,
    hideMode: 'offsets',
    id: 'contextSwitcher',
    plain: true,
    resizable: false,
    shadow: false,
    x: 200,
    y: 200,
    
    initComponent: function () {
        // this.store = Ext.create('Ext.data.TreeStore', {
        //     root: {
        //         expanded: true,
        //         children: [
        //             { text: 'tenant', children: [
        //                 { text: 'sc0', children: [
        //                     { text: 'site0', leaf: true },
        //                     { text: 'site1', leaf: true }
        //                 ] },
        //                 { text: 'sc1', children: [
        //                     { text: 'site2', leaf: true }
        //                 ] }
        //             ] }
        //         ]
        //     }
        // });

        // this.items = Ext.create('Taco.view.navigation.ContextSwitcherView', {
        //     store: this.store
        // });

        this.callParent(arguments);
    }
});