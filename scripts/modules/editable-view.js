/**
 * Simple extension to Backbone.MozuView that adds an `editing` object in the
 * template evaluation context. Update this `editing` object to indicate which
 * model is in mid-edit.
 */

define(['modules/backbone-mozu'], function(Backbone) {

  var EditableView = Backbone.MozuView.extend({
    constructor: function EditableMozuView() {
        Backbone.MozuView.apply(this, arguments);
        this.editing = {};
    },
    getRenderContext: function () {
        var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
        c.editing = this.editing;
        return c;
    },
    doModelAction: function (action, payload) {
        var self = this,
            renderAlways = function () {
                self.render();
            };
        var operation = this.model[action](payload);
        if (operation && operation.then) {
            operation.then(renderAlways, renderAlways);
            return operation;
        }
    },
    handleLoadingChange: function(isLoading) {
        Backbone.MozuView.prototype.handleLoadingChange.apply(this, arguments);
        var allInputElements = this.$('input,select,button,textarea');
        if (!this.alreadyDisabled && isLoading) {
            this.alreadyDisabled = allInputElements.filter(':disabled');
            allInputElements.prop('disabled',true);
        } else {
            if (this.alreadyDisabled) {
                allInputElements.not(this.alreadyDisabled).removeProp('disabled');
                this.alreadyDisabled = false;
            } else {
                allInputElements.removeProp('disabled');
            }
        }
    }
  });

  return EditableView;

});
