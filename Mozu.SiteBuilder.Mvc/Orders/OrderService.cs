using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using AutoMapper;
using Mozu.Cart.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Order;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.Order.Contracts;
using Mozu.Order.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Specifications;
using Mozu.SiteBuilder.UX.Models.Checkout;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.User.Contracts;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.Orders
{
    public class OrderService : IOrderService
    {
        public const string EmailAddressAlreadyExistsMessage = "There is already an account for the email address '{0}', please login with your email and password.";

        private IOrderWebApiClient _orderWebApiClient;
        private readonly IUserWebApiClient _userWebApiClient;
        private readonly IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
        private readonly ICartWebApiClient _cartWebApiClient;
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly IApiContext _apiContext;
        private readonly IAuthTicketWebApiClient _authTicketWebApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ICustomerRepository _customerRepository;
        private readonly ISettings _setting;

        public OrderService( IOrderWebApiClient orderWebApiClient, IUserWebApiClient userWebApiClient, IShippingSettingsWebApiClient shippingSettingsWebApiClient, ICartWebApiClient cartWebApiClient, ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, IApiContext apiContext, IAuthTicketWebApiClient authTicketWebApiClient, IAuthenticationHelper authenticationHelper, ICustomerRepository customerRepository, ISettings setting)
        {
            _orderWebApiClient = orderWebApiClient;
            _userWebApiClient = userWebApiClient;
            _shippingSettingsWebApiClient = shippingSettingsWebApiClient;
            _cartWebApiClient = cartWebApiClient;
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
            _apiContext = apiContext;
            _authTicketWebApiClient = authTicketWebApiClient;
            _authenticationHelper = authenticationHelper;
            _customerRepository = customerRepository;
            _setting = setting;
        }

        public OrderInformation GetOrder(string orderId)
        {
            if (string.IsNullOrWhiteSpace(orderId))
                return null;

            var response = _orderWebApiClient.GetOrder(orderId).Result;
            if (response.HasException)
                return null;

            var order = response.ReadAsAsync().Result;

            return Mapper.Map<OrderInformation>(order);
        }

        public AvailableShippingMethods GetAvailableShippingMethods(OrderInformation order)
        {
            var empty = new AvailableShippingMethods();

            if (order == null || string.IsNullOrWhiteSpace(order.Id))
                return empty;

            var specification = new CanCheckForAvailableShippingSpecification();
            if (!specification.IsSatisfiedBy(order.Shipment))
            {
                //empty.Message = specification.Message();
                return empty;
            }

            try
            {
                var shippingRates = _orderWebApiClient.GetAvailableShipmentMethods(order.Id).Result.ReadAsAsync().Result;
                var rates = shippingRates.Select(x => new ShippingMethodInformation { Name = x.ShippingMethodName, Price = x.Price, Id = x.ShippingMethodCode, OrderId = order.Id, IsValid = x.IsValid ?? false });
                return new AvailableShippingMethods(rates.Where(x => x.IsValid));
            }
            catch (AggregateException agex)
            {
                empty.Message = agex.UnwrapAgg().Message;
                return empty;
            }
        }

        public OrderInformation Submit(string orderId, OrderInformation orderInformation)
        {
            var orderActions = _orderWebApiClient.GetAvailableActions(orderId).Result.ReadAsAsync().Result;
            if (orderActions.Contains("submit", StringComparer.OrdinalIgnoreCase))
            {
                PerformPaymentActions(orderId);
                var order = _orderWebApiClient.PerformOrderAction(orderId, "submit").Result.ReadAsAsync().Result;
                if (order.OrderNumber > 0)
                {
                    _cartWebApiClient.DeleteCart(order.OriginalCartId).Result.ReadAsAsync();
                    return Mapper.Map<OrderInformation>(order);
                }
                return orderInformation;
            }
            return orderInformation;
        }

        public void PerformPaymentActions(string orderId)
        {
            var paymentActions = _orderWebApiClient.GetAvailablePaymentActions(orderId).Result.ReadAsAsync().Result;
            if (paymentActions.Contains("capture", StringComparer.OrdinalIgnoreCase))
            {
                var processingSettings = _checkoutSettingsWebApiClient.GetOrderProcessingSettings().Result.ReadAsAsync().Result;

                //FlowTypes.AuthorizeAndCaptureOnOrderPlacement
                //FlowTypes.AuthorizeOnOrderPlacementAndCaptureOnOrderShipment
                //FlowTypes.AuthorizeAndCaptureOnOrderShipment
                if (processingSettings.PaymentProcessingFlowType == OrderProcessingSettings.PaymentProcessingFlowTypes.AuthorizeAndCaptureOnOrderPlacement)
                    _orderWebApiClient.PerformPaymentAction(orderId, "capture", null).Result.ReadAsAsync();
            }
        }

        public List<KeyValuePair<string, string>> GetShippableCountries()
        {
            var result = _shippingSettingsWebApiClient.GetShippingRegions().Result.ReadAsAsync().Result;

            return result.Select(x => new KeyValuePair<string, string>(x.ISOCountryCode, x.ISOCountryCode)).ToList();
        }

        public void CreateAccount(SubmitInformation submitInformation, string orderId)
        {
            if (!submitInformation.CreateAccount)
                return;

            var response = _userWebApiClient.GetUserByEmail(submitInformation.Email).Result;
            var existingUser = response.ReadAsAsync().Result;
            if (response.ResponseMessage.StatusCode == HttpStatusCode.NotFound || existingUser == null)
            {
                try
                {
                    var billingContact = _orderWebApiClient.GetPayment(orderId).Result.ReadAsAsync().Result;
                    var contact = billingContact.Card.BillingAddress;

                    var newUser = new Core.Api.Contracts.User() { FirstName = contact.FirstName ?? "firstname", LastName = contact.LastNameOrSurname ?? "lastname", EmailAddress = submitInformation.Email, Password = submitInformation.Password, };
                    var user = _userWebApiClient.CreateUser(newUser).Result.ReadAsSync();
                    var ticket = _authTicketWebApiClient.CreateUserAuthTicket(new UserAuthInfo { EmailAddress = user.EmailAddress, Password = submitInformation.Password }).Result.ReadAsSync();

                    UpdateContextForUser(ticket);

                    _orderWebApiClient.ChangeOrderUserId(orderId).Result.ReadAsSync();
                }
                catch (AggregateException agEx)
                {
                    throw agEx.UnwrapAgg();
                }

                return;
            }

            throw new Exception(string.Format(EmailAddressAlreadyExistsMessage, submitInformation.Email));
        }

        private void UpdateContextForUser(UserAuthTicket ticket)
        {
            _authenticationHelper.SetCurrentUser(ticket);

            var apiContext = new ApiContext
            {
                UserClaims = _authenticationHelper.GetCurrentUser(),
                SiteId = _apiContext.SiteId,
                TenantId = _apiContext.TenantId,
                AppClaims = _apiContext.AppClaims,
                LocaleCode = _apiContext.LocaleCode,
            };

            _orderWebApiClient = new OrderWebApiClient(new ServiceClientMessageHandler(apiContext, _setting));
        }

        /*public string GetMerchantId()
        {
            var checkoutSettings = _checkoutSettingsWebApiClient.GetCheckoutSettings().Result.ReadAsAsync().Result;
            //todo:mozu rename return checkoutSettings.PaymentServiceMerchantId;

            return "fart";
        }*/

        public ContactInformation GetOrderContact(ProfileToken  profileToken)
        {
            if (profileToken == null)
                return null;

            var customerAccount = _customerRepository.GetByUserId(profileToken.UserId).Result;
            if (customerAccount == null)
                return GetContactInformationFromProfile(profileToken);

            var contactAccount = customerAccount.Contacts.FirstOrDefault(x => x.ContactType == CustomerContactType.BillingAndShipping || x.ContactType == CustomerContactType.Shipping);
            if (contactAccount == null)
                return GetContactInformationFromProfile(profileToken);

            var contact = contactAccount.Contact;
            var address = contact.Address ?? new UX.Models.Customers.Address();

            return new ContactInformation
            {
                FirstName = contact.FirstName,
                LastName = contact.LastName,
                Email = contact.Email,
                Address1 = address.Address1,
                Address2 = address.Address2,
                CityOrTown = address.CityOrTown,
                CountryCode = address.CountryCode,
                StateOrProvince = address.StateOrProvince,
                PostalOrZipCode = address.PostalOrZipCode,
            };
        }

        private static ContactInformation GetContactInformationFromProfile(ProfileToken profileToken)
        {
            return new ContactInformation
                {
                    FirstName = profileToken.FirstName,
                    LastName = profileToken.LastName,
                    Email = profileToken.EmailAddress,
                };
        }

        public void UpdateShippingMethod(ShippingMethodInformation shippingMethodInformation, string orderId)
        {
            var shipment = _orderWebApiClient.GetShipment(orderId).Result.ReadAsAsync().Result;

            shipment.ShippingMethodCode = shippingMethodInformation.Id;

            _orderWebApiClient.UpdateShipment(shipment, orderId).Result.ReadAsAsync();
        }

        public void UpdateShippingAddress(ShipmentInformation shipmentInformation, string orderId)
        {
            var shipment = _orderWebApiClient.GetShipment(orderId).Result.ReadAsAsync().Result;

            shipment.ShippingAddress = shipment.ShippingAddress ?? new Mozu.Core.Api.Contracts.Contact();

            shipment.ShippingAddress.CompanyOrOrganization = shipmentInformation.CompanyOrOrganization;
            shipment.ShippingAddress.FirstName = shipmentInformation.FirstName;
            shipment.ShippingAddress.LastNameOrSurname = shipmentInformation.LastName;
            shipment.ShippingAddress.Email = shipmentInformation.Email;

            shipment.ShippingAddress.Address = shipment.ShippingAddress.Address ?? new Mozu.Core.Api.Contracts.Address();

            shipment.ShippingAddress.Address.Address1 = shipmentInformation.Address1;
            shipment.ShippingAddress.Address.Address2 = shipmentInformation.Address2;
            shipment.ShippingAddress.Address.CityOrTown = shipmentInformation.CityOrTown;
            shipment.ShippingAddress.Address.StateOrProvince = shipmentInformation.StateOrProvince;
            shipment.ShippingAddress.Address.PostalOrZipCode = shipmentInformation.PostalOrZipCode;
            shipment.ShippingAddress.Address.CountryCode = shipmentInformation.CountryCode;

            _orderWebApiClient.UpdateShipment(shipment, orderId).Result.ReadAsAsync();
        }

        public void UpdatePayment(PaymentInformation paymentInformation, string orderId)
        {
            var reference = string.Equals(paymentInformation.PaymentType, "check", StringComparison.OrdinalIgnoreCase) ?
                GetCheckPaymentReference(paymentInformation) :
                GetCreditCardPaymentReference(paymentInformation);

            _orderWebApiClient.UpdatePayment(reference, orderId).Result.ReadAsAsync();
        }

        private static PaymentReference GetCheckPaymentReference(PaymentInformation paymentInformation)
        {
            return new PaymentReference
            {
                PaymentType = paymentInformation.PaymentType,
            };
        }

        private static PaymentReference GetCreditCardPaymentReference(PaymentInformation paymentInformation)
        {
            return new PaymentReference
            {
                Card = new PaymentCardReference
                {
                    CardNumberPartOrMask = paymentInformation.CardNumberPartOrMask,
                    IsSameBillingShippingAddress = paymentInformation.IsSameBillingShippingAddress,
                    PaymentOrCardType = paymentInformation.PaymentOrCardType ?? paymentInformation.CardType,
                    PaymentServiceCardId = paymentInformation.PaymentServiceCardId,
                    ExpireMonth = paymentInformation.CardExpireMonth.GetValueOrDefault(),
                    ExpireYear = paymentInformation.CardExpireYear.GetValueOrDefault(),
                    BillingAddress = new Mozu.Core.Api.Contracts.Contact
                    {
                        Email = paymentInformation.Email,
                        Address = new Mozu.Core.Api.Contracts.Address
                        {
                            Address1 = paymentInformation.Address1,
                            Address2 = paymentInformation.Address2,
                            CityOrTown = paymentInformation.CityOrTown,
                            CountryCode = paymentInformation.CountryCode,
                            PostalOrZipCode = paymentInformation.PostalOrZipCode,
                            StateOrProvince = paymentInformation.StateOrProvince
                        },
                        FirstName = paymentInformation.FirstName,
                        LastNameOrSurname = paymentInformation.LastName
                    },
                },
                PaymentType = paymentInformation.PaymentType,
            };
        }

        public void RemoveCoupon(string couponCode, string orderId)
        {
            //RemoveCoupon
            if (string.IsNullOrWhiteSpace(couponCode) || string.IsNullOrWhiteSpace(orderId))
                return;

            _orderWebApiClient.RemoveCoupon(orderId).Result.ReadAsAsync();
        }

        public void UpdateCoupon(string orderId, OrderInformation order)
        {
            if (string.IsNullOrWhiteSpace(orderId))
                return;

            if (!string.IsNullOrWhiteSpace(order.CouponCode))
                _orderWebApiClient.ApplyCoupon(orderId, order.CouponCode).Result.ReadAsAsync();
            else if (order.RemoveCoupon)
                _orderWebApiClient.RemoveCoupon(orderId).Result.ReadAsAsync();
        }

        public void UpdateComment(string text, string orderId)
        {
            if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(orderId))
                return;

            var notes = _orderWebApiClient.GetOrderNotes(orderId).Result.ReadAsAsync().Result;
            var note = notes.FirstOrDefault() ?? new OrderNote();

            note.Text = text;

            var orderNote = string.IsNullOrWhiteSpace(note.Id)
                                ? _orderWebApiClient.CreateOrderNote(note, orderId)
                                : _orderWebApiClient.UpdateOrderNote(orderId, note.Id, note);

            orderNote.Result.ReadAsAsync();
        }
    }
}