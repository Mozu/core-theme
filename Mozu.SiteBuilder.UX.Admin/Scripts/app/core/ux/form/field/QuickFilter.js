/**
 * @class Taco.core.ux.form.field.QuickFilter
 * @author Jimmy Sanford
 *
 * The base class for a quick filter textfield, a trigger field with two triggers:
 *
 * - A search trigger, which executes the search just as ENTER does;
 * - A clear trigger, which empties the field.
 */

Ext.define('Taco.core.ux.form.field.QuickFilter', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.taco-quickfilter',

    /**
     * @cfg {Object} scope
     * The scope (**this** reference) in which the `{@link #handler}` is executed.
     * Defaults to this field.
     */

    /**
     * @cfg {Function} handler
     * A function called when the Enter key is pressed or the search trigger is clicked.
     * @cfg {Taco.core.ux.form.field.QuickFilter} handler.field This field.
     * @cfg {Ext.EventObject} handler.e The click or specialkey event.
     */
    handler: Ext.emptyFn,

    hideTrigger: true,

    triggerCls: 'x-form-search-trigger',
    trigger2Cls: 'x-form-clear-trigger',

    initComponent: function () {
        this.callParent(arguments);

        this.on({
            specialkey: {
                scope: this,
                fn: 'handleSpecialkey'
            }
        });
    },

    /**
     * An event handler that passes a specialkey event through to the trigger's click handler.
     *
     * @private
     * @param  {Ext.form.field.Text} field The field.
     * @param  {[type]} e The specialkey event.
     */
    handleSpecialkey: function (field, e) {
        if (e.getKey() === e.ENTER) {
            this.onTriggerClick(e);
        }
    },

    /**
     * Shows or hides the triggers when the field's value changes.
     *
     * @private
     * @param  {String} nextValue The new value.
     * @param  {String} previousValue The old value.
     */
    onChange: function (nextValue, previousValue) {
        this.callParent(arguments);

        this.setHideTrigger(Ext.isEmpty(nextValue));
    },

    /**
     * Calls the provided handler in the provided scope.
     * 
     * @param  {Ext.EventObject} e The click or specialkey event.
     */
    onTriggerClick: function (e) {
        this.handler.call(this.scope || this, this, e);
    },

    /**
     * Empties the field's value, then calls the first trigger's handler.
     * 
     * @param  {Ext.EventObject} e The click event.
     */
    onTrigger2Click: function (e) {
        this.setValue(null).onTriggerClick(e);
    }
});
