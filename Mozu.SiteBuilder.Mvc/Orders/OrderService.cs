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
       
        private readonly IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
       

        public OrderService( IShippingSettingsWebApiClient shippingSettingsWebApiClient)
        {

            _shippingSettingsWebApiClient = shippingSettingsWebApiClient.CloneWithoutUserClaims();

        }

      

        public List<KeyValuePair<string, string>> GetShippableCountries()
        {
            var result = _shippingSettingsWebApiClient.GetShippingRegions().Result.ReadAsAsync().Result;

            return result.Select(x => new KeyValuePair<string, string>(x.ISOCountryCode, x.ISOCountryCode)).ToList();
        }

        
    }
}