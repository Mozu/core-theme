using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class GeneralSettingController : BaseController
    {
        private readonly IGeneralSettingWrapper _wrapper;

        public GeneralSettingController(IGeneralSettingWrapper wrapper)
        {
            _wrapper = wrapper;
        }

        [WebGet(UriTemplate = "/read")]
        public Task<Response<List<GeneralSettings>>> GetSettings()
        {
            var settings = _wrapper.ReadSettings();

            return List(settings);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/save")]
        public Task<Response<GeneralSettings>> Save(GeneralSettings settingsToSave)
        {
            var existingBlockIds = _wrapper.GetIPBlocks().Select(x => x.Id).ToList();
            var savedSettings = _wrapper.UpdateGeneralSettings(settingsToSave);

            if (settingsToSave.AllowAllIPs)
                _wrapper.DeleteAllIPBlocks(existingBlockIds);
            else
                _wrapper.UpdateIPBlockCollection(settingsToSave, existingBlockIds);

            return Single(Mapper.Map<GeneralSettings>(savedSettings));
        }

        [WebGet(UriTemplate = "/timezones/read")]
        public Task<Response<List<TimeZone>>> GetTimeZones(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var results = _wrapper.GetTimeZones().ToList();

            return List(results);
        }

        [WebGet(UriTemplate = "/ipranges/read")]
        public Task<Response<List<IPBlock>>> GetIpRanges(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var results = _wrapper.GetIPBlocks().ToList();

            return List(results);
        }
    }
}