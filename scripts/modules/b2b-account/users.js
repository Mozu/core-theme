define(["modules/mozu-utilities", "modules/jquery-mozu", 'modules/api', "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", 'modules/mozu-grid/mozugrid-view', 'modules/mozu-grid/mozugrid-pagedCollection', "modules/views-paging", "modules/models-product", "modules/models-b2b-account", "modules/search-autocomplete", "modules/models-cart", "modules/product-picker/product-picker-view", "modules/backbone-pane-switcher", "modules/models-dialog", "modules/views-modal-dialog", "modules/mozu-utilities", "modules/models-customer"], function (MozuUtils, $, api, _, Hypr, Backbone, HyprLiveContext, MozuGrid, MozuGridCollection, PagingViews, ProductModels, B2BAccountModels, SearchAutoComplete, CartModels, ProductPicker, PaneSwitcher, DialogModels, ModalDialogView, MozuUtilities, CustomerModels)
{
    var customerModel;
    var UsersEditModel = Backbone.MozuModel.extend({
        relations: {
            user: B2BAccountModels.b2bUser
        },
        defaults: {
            b2bAccountId: require.mozuData('user').accountId,
            editMode: false,
            userRoles: [
                {
                    name: 'Administrator',
                    role: 1
                },
                {
                    name: 'Purchaser',
                    role: 2
                },
                {
                    name: 'Non-Purchaser',
                    role: 3
                }
            ]
        },
        //Not Good... Rework
        saveUser: function(){
            var user = this.get('user');
            user.set('id', user.get('userId'));
            user.set('accountId', this.get('b2bAccountId'));
            user.set('localeCode', "en-US");
            user.set('acceptsMarketing', false);
            user.set('externalPassword', "");
            user.set('isImport', false);
            user.set('isRemoved', false);
            user.set('userName', user.get('emailAddress'));
            if (user.get('id')) {
                return user.apiUpdate().then(function(){
                    window.usersGridView.refreshGrid();
                    var role = user.get('originalRoles') || [];
                    if (role.length) {
                        user.apiRemoveUserRole({
                            id: user.get('id'),
                            accountId: user.get('accountId'),
                            roleId: role[0].roleId
                        }).then( function() {
                            return user.apiAddUserRole();
                        });
                    } else {
                        return user.apiAddUserRole();
                    }
                });
            }
            var createPayload = {
                b2bUser: this.get('user')
            };
            return user.apiCreate(createPayload).then(function () {
                user.apiAddUserRole();
                window.usersGridView.refreshGrid();
            });
        },
        setUser: function(user){
            this.get('user').clear();
            this.set('user', user);

        },
        removeUser: function(){
            return this.get('user').apiDelete.then(function () {

            });
        },
        getBehaviorIds: function () {
            return require.mozuData('user').behaviors || [];
        }
    });

    var UsersEditForm = Backbone.MozuView.extend({
        templateName: "modules/b2b-account/users/edit-user-form",
        defaults: {
            'user.isActive': true,
            'user.roleId': "3"
        },
        autoUpdate: [
            'user.firstName',
            'user.lastName',
            'user.emailAddress',
            'user.isActive'
        ],
        chooseUserRole: function(e){
            var roleId = $(e.currentTarget).prop('value');
            this.model.get('user').set('roleId', roleId);
        }
    });

    var UserModalModel = DialogModels.extend({});

    var UsersModalView = ModalDialogView.extend({
        templateName: "modules/b2b-account/users/users-modal",
        handleDialogOpen: function () {
            this.model.trigger('dialogOpen');
            this.bootstrapInstance.show();
        },
        handleDialogCancel: function () {
            var self = this;
            this.bootstrapInstance.hide();
        },
        handleDialogSave: function () {
            var self = this;
            if (self._userForm ) {
                self._userForm.model.saveUser();
            }
            this.bootstrapInstance.hide();
        },
        setInit: function () {
            var self = this;
            self.loadUserEditView();
            self.handleDialogOpen();
        },
        loadUserEditView: function (user) {
            var self = this;
            user = user || new B2BAccountModels.b2bUser({
                roleId: 3
            });

            function createUserEditForm(user, isEditMode) {
                var userEditForm = new UsersEditForm({
                    el: self.$el.find('.mz-user-modal-content'),
                    model: new UsersEditModel({
                        editMode: isEditMode,
                        user: user
                    })
                });

                self._userForm = userEditForm;
                userEditForm.render();
            }

            if (user.get('userId')){
                user.set('id', user.get('userId'));
                user.set('accountId', require.mozuData('user').accountId);

                user.apiGetUserRoles().then(function (resp) {
                    var role = resp.data.items[0];
                    if(role) {
                        user.set('originalRoles', resp.data.items);
                        user.set('roleId', role.roleId);
                    }
                    createUserEditForm(user, true);
                });
                return;
            }

            createUserEditForm(user);
        },
        render: function () {
            var self = this;
            self.setInit();
        }
    });

    var UsersGridCollectionModel = MozuGridCollection.extend({
        mozuType: 'b2busers',
        baseRequestParams: {
            accountId: require.mozuData('user').accountId
        },
        filter: "isRemoved eq false",
        autoload: true,
        columns: [
            {
                index: 'emailAddress',
                displayName: 'Email Address',
                sortable: true
            },
            {
                index: 'firstName',
                displayName: 'First Name',
                sortable: false
            },
            {
                index: 'lastName',
                displayName: 'Last Name',
                sortable: false
            },
            {
                index: 'isActive',
                displayName: 'User Status',
                displayTemplate: function(value){
                    value = (value) ? 'Active' : 'Inactive';
                    return '<span class="status-pill' + value + '">' + value + '<span>';
                },
                sortable: false
            }
        ],
        rowActions: [
            {
                displayName: 'Edit',
                action: 'editUser',
                isHidden: function(){
                    return !this.hasRequiredBehavior();
                }
            },
            {
                displayName: 'Delete',
                action: 'deleteUser',
                isHidden: function () {
                    return !this.hasRequiredBehavior();
                }
            }
        ],
        relations: {
            items: Backbone.Collection.extend({
                model: B2BAccountModels.b2bUser
            })
        },
        deleteUser: function (e, row) {
            var self = this;
            return row.apiRemove().then(function(){
                self.refreshGrid();
            });
        },
        editUser: function (e, row) {
            window.userModalView.loadUserEditView(row);
            window.userModalView.handleDialogOpen();
        }
    });

    var B2BUsersGridCollectionModel = MozuGridCollection.extend({
        mozuType: 'b2busers',
        baseRequestParams: {
            accountId: require.mozuData('user').accountId
        },
        filter: "isRemoved eq false",
        autoload: true,
        columns: [
            {
                index: 'emailAddress',
                displayName: 'Email Address',
                sortable: false
            },
            {
                index: 'firstName',
                displayName: 'First Name',
                sortable: true
            },
            {
                index: 'lastName',
                displayName: 'Last Name',
                sortable: true
            },
            {
                index: 'roles',
                displayName: 'User Role',
                displayTemplate: function (value) {
                    return (value.length > 0 ? value[0].roleName : '');
                },
                sortable: true
            },
            {
                index: 'isActive',
                displayName: 'User Status',
                displayTemplate: function (value) {
                    value = (value) ? 'Active' : 'Inactive';
                    return '<span class="status-pill' + value + '">' + value + '<span>';
                },
                sortable: true
            }
        ],
        relations: {
            items: Backbone.Collection.extend({
                model: B2BAccountModels.b2bUser
            })
        }
    });

    var UsersModel = Backbone.MozuModel.extend({
        requiredBehaviors: [
            MozuUtilities.Behaviors.Manage_Users
        ]
    });

    var UsersView = Backbone.MozuView.extend({
        templateName: "modules/b2b-account/users/users",
        addNewUser: function () {
            window.userModalView.loadUserEditView();
            window.userModalView.handleDialogOpen();
        },
        initialize: function () {
            if (!customerModel) {
                customerModel = CustomerModels.EditableCustomer.fromCurrent();
                this.model.set('viewB2BAccount', customerModel.attributes.viewB2BAccount);
            }
        },
        render: function () {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var self = this;
            var collection;
            var viewB2BAccount = self.model.attributes.viewB2BAccount;
            if (viewB2BAccount) {
                collection = new B2BUsersGridCollectionModel({});
            }
            else {
                collection = new UsersGridCollectionModel({});
            }
           

            var usersGrid = new MozuGrid({
                el: self.el.find('.mz-b2baccount-users'),
                model: collection,
                requiredBehaviors: [
                    MozuUtilities.Behaviors.Manage_Users
                ]
            });

            var usersModalView = new UsersModalView({
                el: self.el.find('.mz-b2baccount-users-modal'),
                model: new UserModalModel({})
            });

            window.userModalView = usersModalView;
            window.usersGridView = usersGrid;

            usersGrid.render();
        }
    });

    return {
        'UsersView': UsersView,
        'UsersModel': UsersModel,
        'UsersModalView': UsersModalView
    };
});
