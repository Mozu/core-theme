using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Autofac;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.ShippingRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.UX.Controllers
{
    public static class ActionFilterConstants
    {
        public const string GlobalPageBeforeAction = "storefront.pages.global.beforeRequest";
        public const string GlobalPageAfterAction = "storefront.pages.global.afterRequest";
        public const string SearchIndexBeforeAction = "storefront.pages.search.before";
        public const string SearchIndexAfterAction = "storefront.pages.search.after";
        public const string ProductDetailsBeforeAction = "storefront.pages.productDetails.before";
        public const string ProductDetailsAfterAction = "storefront.pages.productDetails.after";
        public const string CategoryBeforeAction = "storefront.pages.category.before";
        public const string CategoryAfterAction = "storefront.pages.category.after";
        public const string CartBeforeAction = "storefront.pages.cart.before";
        public const string CartAfterAction = "storefront.pages.cart.after";
        public const string CheckoutBeforeAction = "storefront.pages.checkout.before";
        public const string CheckoutAfterAction = "storefront.pages.checkout.after";
        public const string OrderConfirmationBeforeAction = "storefront.pages.orderConfirmation.before";
        public const string OrderConfirmationAfterAction = "storefront.pages.orderConfirmation.after";
        public const string MyAccountBeforeAction = "storefront.pages.myAccount.before";
        public const string MyAccountAfterAction = "storefront.pages.myAccount.after";
        public const string NotFoundBeforeAction = "storefront.pages.404.before";
        public const string NotFoundAfterAction = "storefront.pages.404.after";
    }

    [RefreshStoreFrontUserAuthTicketFilter]
    [RequiresSiteContextRedirectFilter]
    public class BaseApiController : ApiControllerBase
    {


        public async Task<List<KeyValuePair<string, string>>> GetShippableCountries()
        {
            var shippingWebApiClient = this.Request.Resolve<IShippingWebApiClient>().CloneWithoutUserClaims();

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
            var refClient = this.Request.Resolve<Mozu.Reference.Contracts.Clients.IReferenceDataWebApiClient >().CloneWithoutUserClaims();

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
            var refClient = this.Request.Resolve<Mozu.Reference.Contracts.Clients.IReferenceDataWebApiClient>().CloneWithoutUserClaims();

            var response = (await refClient.GetCountriesWithStates()).ReadAsSync();
            var states = response.Items.Where(c => c.Code.EqualsIgnoreCase("US"))
                .SelectMany(c => c.States)
                .OrderBy(s => s.Name)
                .Select(s => new KeyValuePair<string, string>(s.Code, s.Name)).ToList();

            return states;
        }

        public async Task<List<KeyValuePair<string, string>>> GetUSShippingStates()
        {
            var shippingWebApiClient = this.Request.Resolve<IShippingWebApiClient>();

            var result = (await shippingWebApiClient.GetShippableStates().ConfigureAwait(false)).ReadAsSync();
            var states = result.Where(c => c.Code.EqualsIgnoreCase("US"))
                .SelectMany(c => c.States)
                .OrderBy(s => s.Name)
                .Select(s => new KeyValuePair<string, string>(s.Code, s.Name)).ToList();
            return states;
        }
    }
}
