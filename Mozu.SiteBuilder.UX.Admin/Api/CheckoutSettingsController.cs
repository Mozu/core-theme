using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using DC = Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core.Extensions;
using Mozu.PaymentService.Contracts;
using GatewayDefinition = Mozu.PaymentService.Contracts.GatewayDefinition;
using SupportedCard = Mozu.PaymentService.Contracts.SupportedCard;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/checkoutsettings", SuppressDescriptorGeneration = true)]
    public class CheckoutSettingsController : BaseController
    {
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly Lazy<IGeneralSettingWrapper> _generalSettingWrapper;
        private readonly IApiContext _context;
        private readonly ITenantsWebApiClient _tenantClient;
        private readonly ITenantAdminSettingsContext _tenantAdminSettingsContext;
        private readonly IAggregateSiteSettingsWebApiClient _aggregateSiteSettingsWebApiClient;
        /// <summary>
        /// Constructor.
        /// </summary>
        public CheckoutSettingsController(ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient
            , Lazy<IGeneralSettingWrapper> generalSettingWrapper
            , ITenantsWebApiClient tenantClient
            , IApiContext context
            , ITenantAdminSettingsContext tenantAdminSettingsContext
            , IAggregateSiteSettingsWebApiClient aggregateSiteSettingsWebApiClient
            )
        {
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient.CloneWithConfigOptions(config => config.EnableDirtyCacheRead = false);
            _generalSettingWrapper = generalSettingWrapper;
            _context = context;
            _tenantClient = tenantClient.CloneWithoutUserClaims();
            _aggregateSiteSettingsWebApiClient = aggregateSiteSettingsWebApiClient.CloneWithoutUserClaims();
            _tenantAdminSettingsContext = tenantAdminSettingsContext;
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<CheckoutSettings>> GetSettings()
        {
            var dcSettings = (await _checkoutSettingsWebApiClient.GetCheckoutSettings()).ReadAsSync();
            var definitions = (await _checkoutSettingsWebApiClient.GetGatewayDefinitions()).ReadAsSync() ?? new List<GatewayDefinition>();
            var gateways = (await _checkoutSettingsWebApiClient.GetGateways()).ReadAsSync();

            var ret = Mapper.Map<CheckoutSettings>(dcSettings);
            ret.CardGatewayMap = AppendUnmappedGateways(gateways, definitions, dcSettings);

            return Single2(ret);
        }

        private List<CardGateway> AppendUnmappedGateways(List<DC.TenantGateway> gateways, List<GatewayDefinition> definitions, DC.CheckoutSettings checkoutSettings)
        {
            var configuredGatewayIds = new HashSet<string>(gateways.Select(x => x.GatewayAccount.GatewayDefinitionId));

            var possiblySupportedCards = definitions
                .Where(x => configuredGatewayIds.Contains(x.Id))
                .SelectMany(x => x.SupportedCards)
                .Distinct(CGComp.Default)
                .ToList();

            if (!possiblySupportedCards.Any(x => x.PaymentType.Equals("gc", StringComparison.OrdinalIgnoreCase)))
            {
                possiblySupportedCards.Add(new SupportedCard
                {
                    Type = "GIFTCARD",
                    PaymentType = "GC",
                    FriendlyName = "GiftCard"
                });
            }

            return possiblySupportedCards
                .Select(card =>
                    {
                        var associatedGatewayAccount = checkoutSettings.PaymentSettings.Gateways
                            .FirstOrDefault(x => x.SiteGatewaySupportedCards.Any(c => c.CardTypeId.EqualsIgnoreCase(card.Type)));

                        return new CardGateway
                        {
                            GatewayId = associatedGatewayAccount?.GatewayAccount.Id,
                            GatewayName = associatedGatewayAccount?.GatewayAccount.Name,
                            CardDisplay = card.FriendlyName,
                            CardType = card.Type,
                            PaymentType = card.PaymentType,
                            IsEnabled = associatedGatewayAccount != null,
                            ProcessingGatewayId = associatedGatewayAccount?.SiteGatewaySupportedCards.FirstOrDefault(x => x.CardTypeId == card.Type)?.ProcessingGatewayAccountId
                        };
                    }
                )
                .OrderBy(x => x.CardDisplay)
                .ToList();
        }

        class CGComp : IEqualityComparer<Mozu.PaymentService.Contracts.SupportedCard>
        {
            public static readonly IEqualityComparer<Mozu.PaymentService.Contracts.SupportedCard> Default = new CGComp();

            public int GetHashCode(Mozu.PaymentService.Contracts.SupportedCard obj)
            {
                return StringComparer.OrdinalIgnoreCase.GetHashCode(obj?.Type);
            }

            bool IEqualityComparer<Mozu.PaymentService.Contracts.SupportedCard>.Equals(Mozu.PaymentService.Contracts.SupportedCard x, Mozu.PaymentService.Contracts.SupportedCard y)
            {
                return StringComparer.OrdinalIgnoreCase.Equals(x?.Type, y?.Type);
            }
        }

        [HttpGetRoute(UriTemplate = "paymentSettings")]
        public async Task<Response<DC.PaymentSettings>> GetPaymentSettings()
        {

            var paymentSettings = (await _checkoutSettingsWebApiClient.GetPaymentSettings()).ReadAsSync();
          
            return  Single2(paymentSettings);
        }

        [HttpPutRoute(UriTemplate = "paymentSettings")]
        public async Task<Response<DC.PaymentSettings>> UpdatePaymentSettings(DC.PaymentSettings paymentSettings)
        {

            var currentPaymentSettings = (await _checkoutSettingsWebApiClient.GetPaymentSettings()).ReadAsSync();

            //Job Settings are set on general Setting and not checkout settings. This is to preserve these settings.
            paymentSettings.JobSettings = currentPaymentSettings.JobSettings;
            paymentSettings.PaymentRanking = currentPaymentSettings.PaymentRanking;

            var result = (await _checkoutSettingsWebApiClient.UpdatePaymentSettings(paymentSettings)).ReadAsSync();
          
            return Single2(result);
        }


        [HttpGetRoute(UriTemplate = "read/paymentTerms/all")]
        public async Task<Response<List<SitePaymentTerm>>> GetPaymentTerms()
        {

            var poSettings = (await _aggregateSiteSettingsWebApiClient.GetPurchaseOrderSettings()).ReadAsSync();

            var ret = poSettings.Select(x => new SitePaymentTerm()
            {
                siteId = x.Key,
                isPoEnabled = x.Value.IsEnabled,
                paymentTerms = x.Value.PaymentTerms ?? new List<DC.PurchaseOrderPaymentTerm>()
            }).ToList();

            return List2(ret);
        }

        public class SitePaymentTerm
        {
            public int siteId { get; set; }
            public bool isPoEnabled { get; set; }
            public List<DC.PurchaseOrderPaymentTerm> paymentTerms { get; set; }
        }

        [HttpGetRoute(UriTemplate = "read/paymentTerms/site")]
        public async Task<Response<List<DC.PurchaseOrderPaymentTerm>>> GetSitePaymentTerms()
        {
            var dcSettings = (await _checkoutSettingsWebApiClient.GetPaymentSettings()).ReadAsSync();
            return List2(dcSettings.PurchaseOrder?.PaymentTerms ?? new List<DC.PurchaseOrderPaymentTerm>());
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "gateways/read")]
        public async Task<Response<List<Gateway>>> GetGateways()
        {
            var gateways = await (await _checkoutSettingsWebApiClient.GetGateways()).ReadAsAsync();

            var ret = Mapper.Map<List<Gateway>>(gateways);
            return List2(ret);
        }

        [HttpGetRoute(UriTemplate = "gateway/{id}/read")]
        public async Task<Response<Gateway>> GetGateway(string id)
        {
            var resp = await (await _checkoutSettingsWebApiClient.GetTenantGateway(id)).ReadAsAsync();

            var ret = Mapper.Map<Gateway>(resp);
            return Single2(ret);
        }


        [HttpPostRoute(UriTemplate = "gateways/create")]
        public async Task<Response<Gateway>> CreateGateway(Gateway gateway)
        {
            var dcGateway = Mapper.Map<DC.TenantGateway>(gateway);
            var resp = await (await _checkoutSettingsWebApiClient.CreateTenantGateway(dcGateway)).ReadAsAsync();

            var ret = Mapper.Map<Gateway>(resp);
            return Single2(ret);
        }


        [HttpPostRoute(UriTemplate = "gateways/update")]
        public async Task<Response<Gateway>> UpdateGateway(Gateway gateway)
        {
            var dcGateway = Mapper.Map<DC.TenantGateway>(gateway);
            var resp = await (await _checkoutSettingsWebApiClient.UpdateTenantGateway(gateway.Id, dcGateway)).ReadAsAsync();

            var ret = Mapper.Map<Gateway>(resp);
            return Single2(ret);
        }


        [HttpPostRoute(UriTemplate = "gateways/delete")]
        public async Task<Response<Gateway>> DeleteGateway(Gateway gateway)
        {
            await (await _checkoutSettingsWebApiClient.DeleteTenantGateway(gateway.Id)).ReadAsAsync();
            return EmptySingle2<Gateway>();
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "cards/list")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetCards()
        {
            //Rakesh 5/11/2018: Removing this logic as payment service doesn't support GetGatewayForCountry anymore.
            /*if (!_tenantAdminSettingsContext.EnableBetaAdmin)
            {
                var currCountryCode = await GetCountryCodeForSite();
                var dcGateway = (await _checkoutSettingsWebApiClient.CloneWithoutUserClaims().GetActiveGatewayForCountry(currCountryCode)).ReadAsSync();
                var old = dcGateway.SupportedCards.Select(x => new KeyValuePair<string, string>(x, x)).ToList();
                return List2(old);
            }*/

            var settings = await (await _checkoutSettingsWebApiClient.CloneWithoutUserClaims().GetCheckoutSettings()).ReadAsAsync();
            var cards = settings.PaymentSettings.Gateways.SelectMany(g => g.SiteGatewaySupportedCards).ToList();

            var ret = cards.Where(x=> x.PaymentType=="CC").Select(x => new KeyValuePair<string, string>(x.CardTypeId, x.CardTypeId)).ToList();
            return List2(ret);
        }

        // TODO: remove .. used by old admin.
        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [HttpGetRoute(UriTemplate = "cardtype/list")]
        public async Task<Response<List<KeyValuePair<string, string>>>> GetCardTypes()
        {
            var ret = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("VISA", "VISA"),
                        new KeyValuePair<string, string>("AMEX", "American Express"),
                        new KeyValuePair<string, string>("MC", "MasterCard"),
                        new KeyValuePair<string, string>("DISCOVER", "Discover"),
                        new KeyValuePair<string, string>("JCB", "JCB"),
                    };
            return List2(ret);
        }

        /// <summary>
        /// Updates the active checkout settings
        /// </summary>
        /// <param name="settingReq">The checkout settings</param>
        /// <returns>The active checkout settings</returns>
        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<CheckoutSettings>> UpdateSettings(CheckoutSettings settingReq)
        {
            var dcPaymentSettings = Mapper.Map<DC.PaymentSettings>(settingReq);
            var dcCheckoutSettings = Mapper.Map<DC.CustomerCheckoutSettings>(settingReq);
            var dcOrderProcessingSettings = Mapper.Map<DC.OrderProcessingSettings>(settingReq);

            //TODO: remove - to keep old admin working.
            //Rakesh 5/11/2018: Removing this logic as payment service doesn't support GetGatewayForCountry anymore.
            /* if (!_tenantAdminSettingsContext.EnableBetaAdmin)
             {
                 var currCountryCode = await GetCountryCodeForSite();
                 var gateway = await GetGatewayForCountry(currCountryCode);

                 var posted = dcPaymentSettings.Gateways.First();
                 posted.GatewayAccount.CountryCode = currCountryCode; // 2014-10-7 chusk: according to Wallis, we are fine with locking down gateways to Site Country codes

                 await UpdateSettings(gateway, posted, dcPaymentSettings, dcOrderProcessingSettings, dcCheckoutSettings);
                 var result = await GetSettings();
                 return result;
             }*/
            await UpdateSettings(null, null, dcPaymentSettings, dcOrderProcessingSettings, dcCheckoutSettings);

            var newSettings = await GetSettings();
            return newSettings;
        }

        private async Task UpdateSettings(DC.Gateway gateway, DC.Gateway posted, DC.PaymentSettings dcPaymentSettings, DC.OrderProcessingSettings dcOrderProcessingSettings, DC.CustomerCheckoutSettings dcCheckoutSettings)
        {

            //TODO: remove - to keep old admin working.
            if (!_tenantAdminSettingsContext.EnableBetaAdmin)
            {
                if (gateway != null && gateway.GatewayAccount.GatewayDefinitionId == posted.GatewayAccount.GatewayDefinitionId)
                {
                    await (await _checkoutSettingsWebApiClient.UpdateGateway(gateway.GatewayAccount.Id, posted)).ReadAsAsync();
                }
                else
                {
                    await (await _checkoutSettingsWebApiClient.CreateGateway(posted)).ReadAsAsync();
                }
            }


            var currentPaymentSettings = (await _checkoutSettingsWebApiClient.GetPaymentSettings()).ReadAsSync();

            //Job Settings are set on general Setting and not checkout settings. This is to preserve these settings.
            dcPaymentSettings.JobSettings = currentPaymentSettings.JobSettings;
            dcPaymentSettings.PaymentRanking = currentPaymentSettings.PaymentRanking;

            var tasks = new List<Task>();

            tasks.Add(_checkoutSettingsWebApiClient.UpdatePaymentSettings(dcPaymentSettings));
            tasks.Add(_checkoutSettingsWebApiClient.UpdateOrderProcessingSettings(dcOrderProcessingSettings));
            tasks.Add(_checkoutSettingsWebApiClient.UpdateCustomerCheckoutSettings(dcCheckoutSettings));
            await Task.WhenAll(tasks);

            tasks.ForEach(x =>
            {
                var y = (dynamic)x;


                var serviceClientResponse = y.Result;


                if (serviceClientResponse.HasException)
                {
                    throw (Exception)serviceClientResponse.ReadException();
                }
            });
        }

        private async Task<string> GetCountryCodeForSite()
        {
            var currsite =
                (await _tenantClient.GetSite(_context.TenantId, _context.SiteId, false, string.Empty)).ReadAsSync();
            var currCountryCode = currsite.CountryCode;
            return currCountryCode;
        }

        //TODO: remove after we remove old admin.
        //Rakesh 5/11/2018: Removing this logic as payment service doesn't support GetGatewayForCountry anymore.
        /*  private async Task<DC.Gateway> GetGatewayForCountry(string currCountryCode)
          {
              DC.Gateway gateway = null;

              var currentGatewayRes = (await _checkoutSettingsWebApiClient.GetActiveGatewayForCountry(currCountryCode));
              if (currentGatewayRes.ResponseMessage.IsSuccessStatusCode)
              {
                  gateway = currentGatewayRes.ReadAsSync();
              }
              return gateway;
              return null;
          }*/


        /// <summary>
        /// Returns the PCIaaS gateway definitions
        /// </summary>
        /// <returns>Array of gateway definitions</returns>
        [HttpGetRoute(UriTemplate = "gatewaydefinitions/read")]
        public async Task<Response<List<Models.Checkout.GatewayDefinition>>> GetGatewayDefinitions()
        {
            var gateways = (await _checkoutSettingsWebApiClient.GetGatewayDefinitions()).ReadAsSync();

            var mapped = Mapper.Map<List<Models.Checkout.GatewayDefinition>>(gateways).OrderBy(x => x.Name).ToList();

            //TODO: remove after we remove old admin.
            mapped.ForEach(x =>
            {

                if (x.SupportedCards == null || x.SupportedCards.Count == 0)
                {
                    x.SupportedCards = new List<Models.Checkout.SupportedCard>
                    {
                        new Models.Checkout.SupportedCard() {Type = "VISA", FriendlyName = "VISA"},
                        new Models.Checkout.SupportedCard() {Type = "AMEX", FriendlyName = "American Express"},
                        new Models.Checkout.SupportedCard() {Type = "MC", FriendlyName = "MasterCard"},
                        new Models.Checkout.SupportedCard() {Type = "DISCOVER", FriendlyName = "Discover"},
                        new Models.Checkout.SupportedCard() {Type = "JCB", FriendlyName = "JCB"}
                    };
                }
            });

            return List2(mapped);
        }

        /// <summary>
        /// Returns the other definitions
        /// </summary>
        /// <returns>Array of gateway definitions</returns>
        [HttpGetRoute(UriTemplate = "externaldefinitions/read")]
        public async Task<Response<List<DC.ExternalPaymentWorkflowDefinition>>> GetExternalDefinitions()
        {
            var workflows = (await _checkoutSettingsWebApiClient.GetThirdPartyPaymentWorkflows()).ReadAsSync();

            return List2(workflows);
        }

        [HttpPutRoute(UriTemplate = "gateway/{id}/binmatches/update")]
        public async Task<Response<Gateway>> UpdateGatewayBinMatches(string id, List<string> binPatterns)
        {
            var resp = await (await _checkoutSettingsWebApiClient.UpdateGatewayBinMatches(id, binPatterns)).ReadAsAsync();

            var ret = Mapper.Map<Gateway>(resp);
            return Single2(ret);
        }
    }
}
