using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
//using Mozu.SiteBuilder.UX.Models.Orders;
using Mozu.SiteBuilder.UX.Models.Orders;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Specifications;
using Mozu.SiteBuilder.UX.Models.Checkout;
using Mozu.SiteBuilder.UX.Models.Customers;

using Mozu.User.Contracts.Clients;
using OrderNote = Mozu.CommerceRuntime.Contracts.Orders.OrderNote;

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

      

        public List<KeyValuePair<string, string>> GetShippableCountries()
        {
            var result = _shippingSettingsWebApiClient.GetShippingRegions().Result.ReadAsAsync().Result;

            return result.Select(x => new KeyValuePair<string, string>(x.ISOCountryCode, x.ISOCountryCode)).ToList();
        }

        
    }
}