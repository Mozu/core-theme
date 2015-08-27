using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/generalsetting", SuppressDescriptorGeneration = true)]
    public class GeneralSettingController : BaseController
    {
        private readonly IGeneralSettingWrapper _wrapper;
        private readonly IChannelWebApiClient _channelWebApiClient;

        public GeneralSettingController(IGeneralSettingWrapper wrapper, Mozu.CommerceRuntime.Contracts.Clients.IChannelWebApiClient channelWebApiClient)
        {
            _wrapper = wrapper;
            _channelWebApiClient = channelWebApiClient.CloneWithoutUserClaims();
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<GeneralSettings>>> GetSettings()
        {
            var settingsTask = _wrapper.ReadSettings();
            var channelsTask = _channelWebApiClient.GetChannels(pageSize: 200);
            await Task.WhenAll(settingsTask, channelsTask);
            var settings = settingsTask.Result;
            var channels = channelsTask.Result.ReadAsSync().Items;
            settings.ChannelId = channels.Where(x => x.SiteIds != null && x.SiteIds.Contains(SbApiContext.SiteId.Value)).Select(x => x.Code).FirstOrDefault();
            
            return List2(settings);
        }

		[HttpPostRoute(UriTemplate = "save")]
        public Response<GeneralSettings> Save(GeneralSettings settingsToSave)
        {
            
            var savedSettings = _wrapper.UpdateGeneralSettings(settingsToSave);
            if (settingsToSave.ChannelId != null)
            {
                var channel = _channelWebApiClient.GetChannel(settingsToSave.ChannelId).Result.ReadAsSync();
                if (channel.SiteIds == null)
                {
                    channel.SiteIds = new List<int>();
                }
                if (!channel.SiteIds.Contains(this.SbApiContext.SiteId.Value))
                {
                    channel.SiteIds.Add(this.SbApiContext.SiteId.Value);
                    _channelWebApiClient.UpdateChannel(settingsToSave.ChannelId, channel).Wait();
                }
            }

            //if (settingsToSave.AllowAllIPs)
            //    _wrapper.DeleteAllIPBlocks(existingBlockIds);
            //else
            //    _wrapper.UpdateIPBlockCollection(settingsToSave, existingBlockIds);

            return Single2(Mapper.Map<GeneralSettings>(savedSettings));
        }

		[HttpGetRoute(UriTemplate = "timezones/read")]
        public Response<List<TimeZone>> GetTimeZones([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var results = _wrapper.GetTimeZones().ToList();

            return List2(results);
        }

        //[HttpGetRoute(UriTemplate = "ipranges/read")]
        //public Response<List<IPBlock>> GetIpRanges([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        //{
        //    var results = _wrapper.GetIPBlocks().ToList();

        //    return List2(results);
        //}
    }
}