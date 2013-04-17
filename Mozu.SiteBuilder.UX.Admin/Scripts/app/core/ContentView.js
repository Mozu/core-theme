/**
*
*  The content view container is a normal Ext.Container with a special ability to make sure it's only displaying one instance of {@link Taco.core.ux.content.Container} at a time. It's like a Card layout, but non-sequential.
*  Modals and other floating components can be added ad infinitum, but Taco.core.ux.content.Containers are kept to one particular subclass. .
*  @author james_zetlen
*/
Ext.define('Taco.core.ContentView' , {
    extend: 'Ext.container.Container',
    alias: 'widget.contentview',

    autoEl: {
        tag: 'article',
        cls: 'taco-content-view'
    },
    flex: 1,
    layout: { type: 'auto' },

    /**
     * Tests whether the passed argument is a Taco.core.ux.content.Container.
     * @private
     * @param  {Object}  obj The object to test.
     * @return {Boolean}     
     */
    isContentView: function (obj) {
        return obj instanceof Taco.core.ux.content.Container
    },

    /**
     * Hide all items but the passed item. The passed item should be a Taco.core.ux.content.Container.
     * @param  {Taco.core.ux.content.Container} that Item to show.
     * @return {undefined} 
     */
    hideEverythingBut: function (that) {
        var me = this;
        me.items.each(function(item, ix, l) {
            if (me.isContentView(item) && item !== that) {
                item.hide()
            }
        });
    },
    destroyEverythingBut: function (that) {
        var me = this;
        me.items.each(function(item, ix, l) {
            if (me.isContentView(item) && item !== that) {
                
                Ext.defer(function() { item.destroy(); }, 1);
                
            }
        });
    }

});
// Copyright (c) 2012 Volusion, Inc.