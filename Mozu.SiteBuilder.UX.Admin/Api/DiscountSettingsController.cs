using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.Core.EnsureThat;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using D = Mozu.SiteBuilder.UX.Admin.Api.Models.DiscountSettings;
using C = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/discountsettings", SuppressDescriptorGeneration = true)]
    public class DiscountSettingsController : BaseController
    {
        private readonly IDiscountSettingsWebApiClient _discountSettingsWebApiClient;

        public DiscountSettingsController(IDiscountSettingsWebApiClient discountSettingsClient)
        {
            _discountSettingsWebApiClient = discountSettingsClient;
        }

        [HttpGetRoute(UriTemplate = "read/{catalogId}")]
        public async Task<Response<D.DiscountSettings>> GetDiscountSettings([FromUri] int catalogId)
        {
            var discountSettingsResult = (await _discountSettingsWebApiClient
                .GetDiscountSettings(catalogId)).ReadAsSync();

            var discountSettingsOut = Mapper.Map<D.DiscountSettings>(discountSettingsResult);
            return Single2<D.DiscountSettings>(discountSettingsOut);
        }

        [HttpPostRoute(UriTemplate = "update/{catalogId}")]
        public async Task<Response<D.DiscountSettings>> UpdateDiscountSettings([FromUri] int catalogId, [FromBody] D.DiscountSettings discountSettings)
        {
            Ensure.That(discountSettings).IsNotNull();
            Ensure.That(catalogId).IsGt(0);

            var cDiscountSettings = Mapper.Map<C.DiscountSettings>(discountSettings);
            var result = (await _discountSettingsWebApiClient.UpdateDiscountSettings(cDiscountSettings, catalogId)).ReadAsSync();

            var discountSettingsOut = Mapper.Map<D.DiscountSettings>(result);
            return Single2(discountSettingsOut);
        }

    }
}