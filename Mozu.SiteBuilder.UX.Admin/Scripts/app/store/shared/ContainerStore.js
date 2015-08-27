/**
 * @class Taco.store.shared.ContainerStore
 * Who doesn't love The Container Store? So many delightful filing cabinets!
 *
 * A ContainerStore takes an {Ext.Container} as its `container` property, and then uses that container's items collection as its data. It subscribes to changes on that items collection and keeps it in sync. Useful for links to particular items in a container!
 */

    Ext.define('Taco.store.shared.ContainerStore', {
        extend: 'Ext.data.Store',
        throttle: 300,
        constructor: function () {
            var loadFn = Ext.Function.createThrottled(function () {
                this.loadRawData(this.container[this.useFloatingItems ? "floatingItems" : "items"].getRange());
            }, this.throttle, this);
            this.callParent(arguments);
            this.mon(this.container, {
                'add': loadFn,
                'remove': loadFn
            });
        }
        
    });
