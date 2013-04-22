require(['shim!vendor/jquery-colorbox[modules/jquery-plus=jQuery]>jQuery', 'modules/knockout-plus', 'modules/animatemodals', 'modules/models-myaccount'], function ($, ko, animateModals, MyAccountModels) {

    //function ShippingAddressDataContract() {
    //    return {
    //        id: null,
    //        contact: {
    //            id: null,
    //            firstName: null,
    //            middleName: null,
    //            lastName: null,
    //            email: null,
    //            companyOrOrganization: null,
    //            phoneNumbers: {
    //                home: null,
    //                work: null,
    //                mobile: null
    //            },
    //            address: {
    //                addressId: null,
    //                address1: null,
    //                address2: null,
    //                address3: null,
    //                cityOrTown: null,
    //                stateOrProvince: null,
    //                postalOrZipCode: null,
    //                countryCode: null
    //            },
    //            isPrimary: false
    //        },
    //        isPrimary: false,
    //        contactType: 1
    //    };
    //}

    /**
     *
     *
     * @param {Object} contract
     * @param {DOM} form
     * @param {Boolean} reverseBinding  Reverse the direction of the bind (form values to contract object)
     * @return {Object}
     */
    //function bindContractToForm( contract, form, reverseBinding ) {
    //    var i,
    //        isRealForm = form.nodeName === "FORM";
    //    for( i in contract ) {
    //        // console.log("contract["+i+"]", contract[i]);
    //        if( contract[i] !== null && typeof contract[i] === 'object' )
    //            bindContractToForm( contract[i], form, reverseBinding );
    //        else if( form[i] ) {
    //            if( reverseBinding )
    //                contract[i] = (isRealForm ? form[i].value : form[i]) || null; // *** Works for <forms> and plain objects
    //            else
    //                form[i].value = contract[i];
    //        }
    //    }
    //    return contract;
    //}


    $(document).ready(function () {

        var $myAccountView = $('#mz-my-account'),
            customerData = $myAccountView.mozuData('myaccount'),
            userData = $myAccountView.mozuData('user'),
            ordersData = $myAccountView.mozuData('orders'),

            myAccountViewModel = new MyAccountModels.AccountModel({
                Customer: customerData,
                User: userData,
                Orders: ordersData
            });

        ko.applyBindings(myAccountViewModel, $myAccountView[0]);

        // prepare view
        var $editEmail = $('#edit-email').css('display', 'none'),
            $displayEmail = $('#display-email'),
            showEmailEditor = function () {
                $displayEmail.fadeOut('normal', $.proxy($editEmail.fadeIn, $editEmail));
            },
            hideEmailEditor =  function () {
                $editEmail.fadeOut('normal', $.proxy($displayEmail.fadeIn, $displayEmail));
            };
        $("#change-email").on('click', showEmailEditor);
        $("#cancel-change-email").on('click', hideEmailEditor);
        myAccountViewModel.on('emailupdated', hideEmailEditor);

        // preparations complete, show view
        $myAccountView.noFlickerFadeIn();

        var shippingAddressModal = $("#shipping-address-modal");


        // *** Event handler to show/hide shipping addresses
        $("#toggle-shipping-addresses a").on('click', function () {
            $("#shipping-addresses").slideToggle();
            $(this).find("span").toggle(); // *** Change link text
        });

        $("#add-new-shipping-address a").on("click", function () {
            shippingAddressModal.removeClass('edit-mode').find('form').trigger('reset');
        });


        // *** Add modal animation
        animateModals({ jqSelector: "#add-new-shipping-address a" });
        animateModals({ jqSelector: "#shipping-addresses", delegatedSelector: ".actions .edit" });
        //animateModals({ jqSelector: "#change-password" });


        // *** Bind to-be-edited data to modal form fields
        $("#shipping-addresses").on('click', '.actions .edit', function () {
            var parent = $(this).closest('.shipping-address');
            shippingAddressModal.addClass('edit-mode').data('activeEdit', parent);

            bindContractToForm(parent.data('shipping-address-json'), shippingAddressModal.find('form')[0]);
        })


        /**
         * AJAX handler for deleting shipping address
         */
            .on('click', '.actions .delete', function () {
                // console.log("Delete this shipping address!");

                var shippingAddress = $(this).closest('.shipping-address'),
                    json = shippingAddress.data('shipping-address-json');

                console.log("Delete this shipping address!", json);

                $.ajax(
                    '/myaccount/deletecustomercontact',
                    {
                        type: 'POST',
                        data: JSON.stringify( undefined ),
                        // data: $(this).closest('.shipping-address').attr('data-shipping-address-json'),
                        contentType: 'application/json',
                        dataType: 'json'
                    }
                ).done(function (response) {
                    console.log('delete attempt response:', response, response === true);
                    if( response === true )
                        shippingAddress.remove();
                });
            })
        ;


        /**
         * AJAX handler for adding new shipping address
         */
        shippingAddressModal.find(":submit.create").on('click', function () {
            // console.log('Attempting to add shipping address');

            var form = $(this).closest('form')[0],
                json = bindContractToForm( new ShippingAddressDataContract(), form, true );

            // console.log('json', json);

            $.ajax(
                '/myaccount/addcustomercontact',
                {
                    type: 'POST',
                    data: JSON.stringify( json ),
                    contentType: 'application/json',
                    dataType: 'json'
                }
            ).done(function (response) {
                console.log('Add address response:', response);

                // *** Close modal + mask
                $(document.body).trigger('click.close-animated-modal');

                // *** Replace nulls with empty string
                response = transmuteNulls( response );

                // *** Create template
                var contact = response.contact,
                    address = contact.address,
                    template =
                    "<div class='shipping-address' data-shipping-address-json='" + JSON.stringify( response ) + "'>" +
                    //'<div class="shipping-address" data-shipping-address-json="' + JSON.stringify( response ) + '">' +
                        '<h4>Shipping Address</h4>' +
                        '<div class="actions">'+
                            '<span class="edit" data-modal-container="#shipping-addresses">E</span>' +
                            '<span class="delete">D</span>' +
                        '</div>'+
                        "<div>" + [contact.firstName, contact.middleName, contact.lastName].join(" ") + "</div>" +
                        "<div>" + address.address1 + "</div>" +
                        "<div>" + address.address2 + "</div>" +
                        "<div>" + [address.cityOrTown + ",", address.stateOrProvince, address.postalOrZipCode].join(" ") + "</div>" +
                        "<div>" + address.countryCode + "</div>" +
                    "</div>";

                    // *** Insert template into DOM
                    $("#add-new-shipping-address").before( template );
            });

            return false; // *** Prevent <form> submit
        });


        /**
         * AJAX handler for editing shipping address
         */
        // TODO combine the common portions of ADD and EDIT
        shippingAddressModal.find(":submit.edit").on('click', function () {
            console.log("Attempting to edit shipping address");

            var form = $(this).closest('form'),
                json;

            json = bindContractToForm( new ShippingAddressDataContract(), form[0], true );

            $.ajax(
                '/myaccount/updatecustomercontact',
                {
                    type: 'POST',
                    data: JSON.stringify( json ),
                    contentType: 'application/json',
                    dataType: 'json'
                }
            ).done(function (response) {
                console.log('Edit address response:', response);

                // *** Close modal + mask
                $(document.body).trigger('click.close-animated-modal');

                // *** Replace nulls with empty string
                response = transmuteNulls( response );

                // *** Create template
                var contact = response.contact,
                    address = contact.address,
                    template =
                        "<div class='shipping-address' data-shipping-address-json='" + JSON.stringify( response ) + "'>" +
                            '<h4>Shipping Address</h4>' +
                            '<div class="actions">'+
                                '<span class="edit" data-modal-container="#shipping-addresses">E</span>' +
                                '<span class="delete">D</span>' +
                            '</div>'+
                            "<div>" + [contact.firstName, contact.middleName, contact.lastName].join(" ") + "</div>" +
                            "<div>" + address.address1 + "</div>" +
                            "<div>" + address.address2 + "</div>" +
                            "<div>" + [address.cityOrTown + ",", address.stateOrProvince, address.postalOrZipCode].join(" ") + "</div>" +
                            "<div>" + address.countryCode + "</div>" +
                        "</div>";

                // *** Insert updated template into DOM, and remove old record
                shippingAddressModal.data('activeEdit').before( template ).remove();
            });

            return false;
        });


        /**
         * AJAX handler for changing a password
         */
        var pwModal = $("#change-password-modal").find("button").on('click', function () {
            var form = pwModal.find('form')[0],
                oldPW = form.oldPassword.value,
                newPW = form.newPassword.value,
                confirmPW = form.confirmPassword.value;

            if( newPW !== confirmPW ) {
                alert("New passwords do not match!");
            } else {
                $.ajax(
                    '/myaccount/changepassword',
                    {
                        type: 'POST',
                        data: JSON.stringify({ oldPassword: oldPW, newPassword: newPW }),
                        dataType: 'json',
                        contentType: 'application/json'
                    }
                ).done(function (response) {
                    $(document.body).trigger('click.close-animated-modal');
                    form.reset();

                    console.log("Update password:", response);

                    alert("Password has been updated.");
                });
            }

            return false;
        }).end();



        //$("#edit-email :submit").on('click', function () {
        //    var form = $(this).closest('form')[0],
        //        oldEmail = form.oldEmail.value,
        //        newEmail = form.newEmail.value;

        //    if( oldEmail === newEmail ) {
        //        alert("Email addresses are identical, not attempting to change.");
        //    } else {
        //        $.ajax(
        //            '/myaccount/updateemail',
        //            {
        //                type: 'POST',
        //                data: JSON.stringify({ email: newEmail }),
        //                dataType: 'json',
        //                contentType: 'application/json'
        //            }
        //        ).done(function (response) {
        //            $("#edit-email, #display-email").toggle();
        //            console.log("Email updated response:", response);
        //        });
        //    }

        //    return false;
        //});
    });
});