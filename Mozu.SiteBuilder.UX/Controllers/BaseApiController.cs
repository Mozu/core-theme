using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.ShippingRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Extensible.Contracts;
using System;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Middleware;

namespace Mozu.SiteBuilder.UX.Controllers
{
    public static class ActionFilterConstants
    {
        public const string GlobalPageBeforeAction = "http.storefront.pages.global.request.before";
        public const int GlobalPageBeforePriority = 1;
        public const string GlobalPageAfterAction = "http.storefront.pages.global.request.after";
        public const int GlobalPageAfterPriority = 100;
        public const string SearchIndexBeforeAction = "http.storefront.pages.search.request.before";
        public const string SearchIndexAfterAction = "http.storefront.pages.search.request.after";
        public const string ProductDetailsBeforeAction = "http.storefront.pages.productDetails.request.before";
        public const string ProductDetailsAfterAction = "http.storefront.pages.productDetails.request.after";
        public const string CategoryBeforeAction = "http.storefront.pages.category.request.before";
        public const string CategoryAfterAction = "http.storefront.pages.category.request.after";
        public const string CartBeforeAction = "http.storefront.pages.cart.request.before";
        public const string CartAfterAction = "http.storefront.pages.cart.request.after";
        public const string CmsPageBeforeAction = "http.storefront.pages.cmspage.request.before";
        public const string CmsPageAfterAction = "http.storefront.pages.cmspage.request.after";
        public const string CheckoutBeforeAction = "http.storefront.pages.checkout.request.before";
        public const string CheckoutAfterAction = "http.storefront.pages.checkout.request.after";
        public const string OrderConfirmationBeforeAction = "http.storefront.pages.orderConfirmation.request.before";
        public const string OrderConfirmationAfterAction = "http.storefront.pages.orderConfirmation.request.after";
        public const string MyAccountBeforeAction = "http.storefront.pages.myAccount.request.before";
        public const string MyAccountAfterAction = "http.storefront.pages.myAccount.request.after";
        public const string NotFoundBeforeAction = "http.storefront.pages.404.request.before";
        public const string NotFoundAfterAction = "http.storefront.pages.404.request.after";
        public const string QuoteCheckoutBeforeAction = "http.storefront.pages.quotecheckout.request.before";
        public const string QuoteCheckoutAfterAction = "http.storefront.pages.quotecheckout.request.after";
        public const string EmailRenderBeforeAction = "embedded.commerce.email.render.before";
    }
 
    [RefreshStoreFrontUserAuthTicketFilter]
    [RequiresSiteContextRedirectFilter]
    [FourHundredHandlerFilter]
    public class BaseApiController : ApiControllerBase
    {


        public async Task<List<KeyValuePair<string, string>>> GetShippableCountries()
        {
            var shippingWebApiClient = Request.HttpContext.RequestServices.Resolve<IShippingWebApiClient>().CloneWithoutUserClaims();

            var result = (await (await shippingWebApiClient.GetShippableCountries().ConfigureAwait(false)).ReadAsAsync().ConfigureAwait(false)).Items;

            var res = result.Select(x => new KeyValuePair<string, string>(x.Name, x.Code)).ToList();
            if (res.Count == 0)
            {
                res.Add(new KeyValuePair<string, string>("us", "us"));
            }
            return res;
        }


        public async Task<List<KeyValuePair<string, string>>> GetBillingCountries()
        {
            var refClient = Request.HttpContext.RequestServices.Resolve<Mozu.Reference.Contracts.Clients.IReferenceDataWebApiClient >().CloneWithoutUserClaims();

            var result = (await refClient.GetCountries()).ReadAsSync().Items;

            var res = result.Select(x => new KeyValuePair<string, string>(x.Name, x.Code)).ToList();
            if (res.Count == 0)
            {
                res.Add(new KeyValuePair<string, string>("us", "us"));
            }
            return res;
        }

        public async Task<List<KeyValuePair<string, string>>> GetUSBillingStates()
        {
            var refClient = Request.HttpContext.RequestServices.Resolve<Mozu.Reference.Contracts.Clients.IReferenceDataWebApiClient>().CloneWithoutUserClaims();

            var response = (await refClient.GetCountriesWithStates()).ReadAsSync();
            var states = response.Items.Where(c => c.Code.EqualsIgnoreCase("US"))
                .SelectMany(c => c.States)
                .OrderBy(s => s.Name)
                .Select(s => new KeyValuePair<string, string>(s.Code, s.Name)).ToList();

            return states;
        }

        public async Task<List<KeyValuePair<string, string>>> GetUSShippingStates()
        {
            var shippingWebApiClient = Request.HttpContext.RequestServices.Resolve<IShippingWebApiClient>();

            var result = (await shippingWebApiClient.GetShippableStates().ConfigureAwait(false)).ReadAsSync();
            var states = result.Where(c => c.Code.EqualsIgnoreCase("US"))
                .SelectMany(c => c.States)
                .OrderBy(s => s.Name)
                .Select(s => new KeyValuePair<string, string>(s.Code, s.Name)).ToList();
            return states;
        }


        public async Task<List<Core.Extensible.Contracts.Attribute>> GetShopperOrderAttributes()
        {
            var attributes = await GetAllOrderAttributes();
            var result = attributes.Where(a => a.IsActive == true).ToList();
            return result;
        }

        // the attribute defintions are cached if we don't send in a fitler.. so get all of them then filter.. there shouldn't be that many.
        private async Task<List<Core.Extensible.Contracts.Attribute>> GetAllOrderAttributes()
        {
            var orderAttributeWebApiClient = Request.HttpContext.RequestServices.Resolve<IOrderAttributeWebApiClient>();

            var startIndex = 0;
            var pageSize = 100;

            var targetCollection = new List<Core.Extensible.Contracts.Attribute>();
            AttributeCollection interimCollection = null;

            while (true)
            {
                try
                {
                    interimCollection = await (await orderAttributeWebApiClient.GetAttributes(startIndex, pageSize).ConfigureAwait(false)).ReadAsAsync();
                }
                catch
                {
                    // ignored
                }

                if (interimCollection?.Items == null || interimCollection.Items.Count == 0)
                    break;

                targetCollection.AddRange(interimCollection.Items.ToList());

                if (interimCollection.PageSize < pageSize)
                    pageSize = interimCollection.PageSize;

                if (interimCollection.TotalCount <= pageSize)
                    break;

                startIndex += pageSize;

                if (startIndex > interimCollection.TotalCount)
                    break;
            }

            return targetCollection;

        }
    }
}
