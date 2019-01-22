define(["modules/jquery-mozu", 'modules/api', "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", 'modules/editable-view', "modules/models-customer", "modules/models-b2b-account"], function ($, api, _, Hypr, Backbone, HyprLiveContext, EditableView, CustomerModels, B2BAccountModels) {

    var AccountAttributeDefs = Backbone.MozuModel.extend({
        mozuType: 'accountattributedefinitions'
    });
    var AccountAttributes = Backbone.MozuModel.extend({
        mozuType: 'accountattributes'
    });

    var CustomAttributesView = EditableView.extend({
        templateName: "modules/b2b-account/custom-attributes/custom-attributes",
        requiredBehaviors: [ 1004 ],
        initialize: function () {
          var self = this;
          return this.model.getAttributes().then(function(customer) {
              customer.get('attributes').each(function(attribute) {
                  attribute.set('attributeDefinitionId', attribute.get('id'));
              });
              var b2bAttributes = new AccountAttributes({accountId: self.model.get('id')});
              var b2bAttributeDefs = new AccountAttributeDefs({});

              return b2bAttributes.apiGet().then(function(attrs){
                  // Make sure there aren't any duplicates
                  var values = _.reduce(attrs.data.items, function (a, b) {
                      a[b.fullyQualifiedName] = {
                          values: b.values,
                          attributeDefinitionId: b.attributeDefinitionId
                      };
                      return a;
                  }, {});

                  return b2bAttributeDefs.apiGet().then(function(defs){
                      // Do some logic here to associate the definitions and attributes
                      _.each(defs.data.items, function (def) {
                          var fqn = def.attributeFQN;

                          if (values[fqn]) {
                              def.values = values[fqn].values;
                              def.attributeDefinitionId = values[fqn].attributeDefinitionId;
                          }
                      });
                      // sort attributes, putting checkboxes first
                      defs.data.items.sort(function (a, b) {
                          if (a.inputType === 'YesNo') return -1;
                          else if (b.inputType === 'YesNo') return 1;
                          else return 0;
                      });
                      // write fully-hydrated attributes to the model.
                      self.model.set('b2bAttributes', defs.data.items);
                      self.trigger('sync');
                  });
              });
          });
        },
        startEditAttrs: function(e){
            e.preventDefault();
            var isEditingAccountAttrs = (e.currentTarget.id === 'account-attrs-edit');
            this.model.set('editingAccountAttributes', isEditingAccountAttrs);
            this.model.set('editingCustomerAttributes', !isEditingAccountAttrs);
            this.render();
        },
        cancelEditAttrs: function(e) {
            this.model.set('editingAccountAttributes', false);
            this.model.set('editingCustomerAttributes', false);
            this.afterEditAttrs();
        },
        finishEditAttrs: function() {
            var self = this;
            if (this.model.get('editingAccountAttributes')){
                // Save b2b attributes only. found in self.model.get('b2battributes')
                var b2bAccountModel = new B2BAccountModels.b2bAccount(this.model.toJSON());
                b2bAccountModel.set('attributes', this.model.get('b2bAttributes'));
                b2bAccountModel.apiUpdate().then(function(){
                  self.model.set('editingAccountAttributes', false);
                }).otherwise(function() {
                    self.model.set('editingAccountAttributes', true);
                }).ensure(function(){
                    self.afterEditAttrs();
                });
            } else { // as opposed to (if this.model.get('editingCustomerAttributes'))
              // Save customer attributes only. found in self.model.get('attributes');
              this.doModelAction('apiUpdate').then(function() {
                  self.model.set('editingCustomerAttributes', false);
              }).otherwise(function() {
                  self.model.set('editingCustomerAttributes', true);
              }).ensure(function() {
                  self.afterEditAttrs();
              });
            }
        },
        afterEditAttrs: function() {
            var self = this;

            self.initialize().ensure(function() {
                self.render();
            });
        },
        updateAttribute: function (e) {
            var self = this;
            // Establish which kind of attribute we're dealing with.
            var editingAccountAttrs = self.model.get('editingAccountAttributes');
            var attrsToEdit = this.model.get('attributes');
            if (editingAccountAttrs) attrsToEdit = this.model.get('b2bAttributes');
            var attributeFQN = e.currentTarget.getAttribute('data-mz-attribute');
            var attribute = attrsToEdit.findWhere({
                attributeFQN: attributeFQN
            });
            var nextValue = attribute.get('inputType') === 'YesNo' ? $(e.currentTarget).prop('checked') : $(e.currentTarget).val();

            attribute.set('values', [nextValue]);
            attribute.validate('values', {
                valid: function (view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').removeClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text('');
                },
                invalid: function (view, attr, error) {
                    self.$('[data-mz-attribute="' + attributeFQN + '"]').addClass('is-invalid')
                        .next('[data-mz-validationmessage-for="' + attr + '"]').text(error);
                }
            });
        }
    });

    return {
        'CustomAttributesView': CustomAttributesView
    };
});
