using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/generalsetting", SuppressDescriptorGeneration = true)]
    public class GeneralSettingController : BaseController
    {
        private readonly IGeneralSettingWrapper _wrapper;

        public GeneralSettingController(IGeneralSettingWrapper wrapper)
        {
            _wrapper = wrapper;
        }

		[HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<GeneralSettings>>> GetSettings()
        {
            var settings = await _wrapper.ReadSettings();

            return List2(settings);
        }

		[HttpPostRoute(UriTemplate = "save")]
        public Response<GeneralSettings> Save(GeneralSettings settingsToSave)
        {
            var existingBlockIds = _wrapper.GetIPBlocks().Select(x => x.Id).ToList();
            var savedSettings = _wrapper.UpdateGeneralSettings(settingsToSave);

            if (settingsToSave.AllowAllIPs)
                _wrapper.DeleteAllIPBlocks(existingBlockIds);
            else
                _wrapper.UpdateIPBlockCollection(settingsToSave, existingBlockIds);

            return Single2(Mapper.Map<GeneralSettings>(savedSettings));
        }

		[HttpGetRoute(UriTemplate = "timezones/read")]
        public Response<List<TimeZone>> GetTimeZones([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var results = _wrapper.GetTimeZones().ToList();

            return List2(results);
        }

		[HttpGetRoute(UriTemplate = "ipranges/read")]
        public Response<List<IPBlock>> GetIpRanges([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var results = _wrapper.GetIPBlocks().ToList();

            return List2(results);
        }
    }
}