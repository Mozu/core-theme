/**
 * @class Taco.core.ux.form.field.MultiSelect
 * @author Jimmy Sanford
 * Extends Ext.ux.form.MultiSelect.
 */
Ext.define('Taco.core.ux.form.field.MultiSelect', {
    extend: 'Ext.ux.form.MultiSelect',
    alias: 'widget.taco.field.multiselect',

    initComponent: function () {
        this.callParent(arguments);
    },

    afterRender: function() {
        var me = this,
            records;
        
        me.callParent();
        if (me.selectOnRender) {
            records = me.getRecordsForValue(me.value);
            if (records.length) {
                ++me.ignoreSelectChange;
                me.boundList.getSelectionModel().select(records);
                --me.ignoreSelectChange;
            }
            delete me.toSelect;
        }    
        
        if (me.ddReorder && !me.dragGroup && !me.dropGroup){
            me.dragGroup = me.dropGroup = 'MultiselectDD-' + Ext.id();
        }

        if (me.draggable || me.dragGroup){
            me.dragZone = Ext.create('Ext.view.DragZone', {
                view: me.boundList,
                ddGroup: me.dragGroup,
                dragText: '{0} Item{1}',
                validHandleClass: 'x-boundlist-item-drag',
                onInitDrag: function (x, y) {
                    var me = this,
                        data = me.dragData,
                        view = data.view,
                        selectionModel = view.getSelectionModel(),
                        record = view.getRecord(data.item),
                        e = data.event;

                    if (!selectionModel.isSelected(record)) {
                        selectionModel.select(record, (selectionModel.getSelectionMode === 'SIMPLE'));
                    }
                    data.records = selectionModel.getSelection();

                    me.ddel.update(me.getDragText());
                    me.proxy.update(me.ddel.dom);
                    me.onStartDrag(x, y);
                    return true;
                },
                isValidHandleChild: function (node) {
                    var valid = true,
                        nodeName,
                        i, len;

                    try {
                        nodeName = node.nodeName.toUpperCase();
                    } catch(e) {
                        nodeName = node.nodeName;
                    }
                    valid = valid && !this.invalidHandleTypes[nodeName];
                    valid = valid && !this.invalidHandleIds[node.id];

                    for (i=0, len=this.invalidHandleClasses.length; valid && i<len; ++i) {
                        valid = !Ext.fly(node).hasCls(this.invalidHandleClasses[i]);
                    }
                    if (!Ext.isEmpty(this.validHandleClass)) {
                        valid = Ext.fly(node).hasCls(this.validHandleClass);
                    }

                    return valid;
                }
            });
        }
        if (me.droppable || me.dropGroup){
            me.dropZone = Ext.create('Ext.view.DropZone', {
                view: me.boundList,
                ddGroup: me.dropGroup,
                handleNodeDrop: function(data, dropRecord, position) {
                    var view = this.view,
                        store = view.getStore(),
                        records = data.records,
                        index;

                    // remove the Models from the source Store
                    data.view.store.remove(records);

                    index = store.indexOf(dropRecord);
                    if (position === 'after') {
                        index++;
                    }
                    store.insert(index, records);
                    view.getSelectionModel().select(records);
                    me.fireEvent('drop', me, records);
                }
            });
        }
    },

    setReadOnly: function () {},

    setValue: function(value){
        var me = this,
            selModel = me.boundList.getSelectionModel(),
            store = me.store;

        // Store not loaded yet - we cannot set the value
        if (!store.data || !store.getCount()) {
            store.on({
                load: Ext.Function.bind(me.setValue, me, [value]),
                single: true
            });
            return;
        }

        value = me.setupValue(value);
        me.mixins.field.setValue.call(me, value);
        
        if (me.rendered) {
            ++me.ignoreSelectChange;
            selModel.deselectAll();
            selModel.select(me.getRecordsForValue(value));
            --me.ignoreSelectChange;
        } else {
            me.selectOnRender = true;
        }
    }
});