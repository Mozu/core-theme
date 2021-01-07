define(["modules/jquery-mozu", 'modules/api', "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", 'modules/editable-view', "modules/models-customer", "modules/models-b2b-account", "modules/models-address"], function ($, api, _, Hypr, Backbone, HyprLiveContext, EditableView, CustomerModels, B2BAccountModels, AddressModels) {
    var InfoView = EditableView.extend({
        templateName: "modules/b2b-account/account-info/account-info",
        autoUpdate: [
            'firstName',
            'lastName',
            'emailAddress',
            'acceptsMarketing',
            'oldPassword',
            'password',
            'confirmPassword'
        ],
        initialize: function () {

          // If we don't make sure this editingContact field is populated with an address,
          // It breaks when we try to validate a password change.
          // This doesn't happen with the regular my account page, which is using
          // the same models and methods and everything. I just don't know any more.
          // I'm sorry. This is a hack.
          var self = this;
          var blankContact = new CustomerModels.Contact({
              userId: self.model.get('userId'),
              accountId: self.model.get('id'),
              address: new AddressModels.StreetAddress({})
          });
          this.model.set('editingContact', blankContact);
          var viewB2BAccount = self.model.get('viewB2BAccount');
          if (!viewB2BAccount) {
            return this.model.getAttributes().then(function (customer) {
                customer.get('attributes').each(function (attribute) {
                    attribute.set('attributeDefinitionId', attribute.get('id'));
                });
                return customer;
            });
          }
        },
        startEdit: function(e){
          e.preventDefault();
          this.model.set('editing', true);
          this.render();
        },
        cancelEdit: function() {
            this.model.set('editing', false);
            this.afterEdit();
        },
        finishEdit: function() {
            var self = this;
            var user = new B2BAccountModels.b2bUser(self.model.toJSON());
            user.apiUpdate().then(function() {
                self.model.set('editing', false);
            }).otherwise(function() {
                self.model.set('editing', true);
            }).ensure(function() {
                self.afterEdit();
            });
        },
        afterEdit: function() {
            var self = this;
            self.initialize().ensure(function() {
                self.render();
            });
        },
        startEditPassword: function() {
            this.model.set('editingPassword', true);
            this.render();
        },
        finishEditPassword: function() {
            var self = this;
            this.doModelAction('changePassword').then(function() {
                _.delay(function() {
                    self.$('[data-mz-validationmessage-for="passwordChanged"]').show().text(Hypr.getLabel('passwordChanged')).fadeOut(3000);
                }, 250);
            }, function() {
                self.model.set('editingPassword', true);
            });
            this.model.set('editingPassword', false);
        },
        cancelEditPassword: function() {
            this.model.set('editingPassword', false);
            this.render();
        },
        updateAttribute: function (e) {
            var self = this;
            var attributeFQN = e.currentTarget.getAttribute('data-mz-attribute');
            var attribute = this.model.get('attributes').findWhere({
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
        'InfoView': InfoView
    };
});
