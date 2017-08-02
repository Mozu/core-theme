using System;
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
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Newtonsoft.Json.Linq;
using TimeZone = Mozu.SiteBuilder.UX.Models.Settings.TimeZone;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteSettings.Order.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/generalsetting", SuppressDescriptorGeneration = true)]
    public class GeneralSettingController : BaseController
    {
        private readonly IGeneralSettingWrapper _wrapper;
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly Lazy<ICheckoutSettingsWebApiClient> _checkoutSettingsWebApiClient;
        private readonly IChannelWebApiClient _channelWebApiClient;

        public GeneralSettingController(IGeneralSettingWrapper wrapper, IChannelWebApiClient channelWebApiClient, IGeneralSettingsWebApiClient generalSettingsWebApiClient, Lazy<ICheckoutSettingsWebApiClient> checkoutSettingsWebApiClient)
        {
            _wrapper = wrapper;
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
            _channelWebApiClient = channelWebApiClient.CloneWithoutUserClaims();
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<GeneralSettings>>> GetSettings()
        {
            var settingsTask = _wrapper.ReadSettings();
            var channelsTask = _channelWebApiClient.GetChannels(pageSize: 200);
            await Task.WhenAll(settingsTask, channelsTask);
            var settings = settingsTask.Result;

            var orderProcessingSettings = (await _checkoutSettingsWebApiClient.Value.GetOrderProcessingSettings()).ReadAsSync();
            settings.IsMultiShipToEnabled = orderProcessingSettings.IsMultiShipToEnabled.GetValueOrDefault(false);

            var channels = channelsTask.Result.ReadAsSync().Items;
            settings.ChannelId = channels.Where(x => x.SiteIds != null && x.SiteIds.Contains(SbApiContext.SiteId.Value)).Select(x => x.Code).FirstOrDefault();
            settings.EmailTypes = (await GetEmailTypes(new PagingParamaters(), new FilterCollection())).Items;
            return List2(settings);
        }

        [HttpPostRoute(UriTemplate = "updateCacheKey")]
        public async Task<Response<GeneralSettings>> UpdateCacheKey(GeneralSettings settings)
        {
            var previousSettings = (await this.GetSettings()).Items.First();
            previousSettings.CdnCacheBustKey = settings.CdnCacheBustKey;

            var savedSettings = _wrapper.UpdateGeneralSettings(previousSettings);

            return Single2((await this.GetSettings()).Items.First());
        }

        [HttpPostRoute(UriTemplate = "save")]
        public async Task<Response<GeneralSettings>> Save(GeneralSettings settingsToSave)
        {
            var previousSettings = (await _wrapper.ReadSettings());
            var cdnCacheKey = previousSettings.CdnCacheBustKey;
            settingsToSave.CdnCacheBustKey = cdnCacheKey;

            var orderProcessingSettings = (await _checkoutSettingsWebApiClient.Value.GetOrderProcessingSettings()).ReadAsSync();
            if (orderProcessingSettings.IsMultiShipToEnabled != settingsToSave.IsMultiShipToEnabled)
            {
                orderProcessingSettings.IsMultiShipToEnabled = settingsToSave.IsMultiShipToEnabled;
                if (orderProcessingSettings.IsMultiShipToEnabled.GetValueOrDefault(false))
                    orderProcessingSettings.PaymentProcessingFlowType = "AuthorizeOnOrderPlacementAndCaptureOnOrderShipment";
                var result = (await _checkoutSettingsWebApiClient.Value.UpdateOrderProcessingSettings(orderProcessingSettings)).ReadAsSync();
            }

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
            await this.SaveEmailTypes(settingsToSave.EmailTypes);
            

            return Single2((await this.GetSettings()).Items.First());
        }

		[HttpGetRoute(UriTemplate = "timezones/read")]
        public Response<List<TimeZone>> GetTimeZones([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var results = _wrapper.GetTimeZones().ToList();

            return List2(results);
        }




        [HttpGetRoute(UriTemplate = "emailTypes/read")]
        public async Task< Response<List<EmailTypeSettingVM>>> GetEmailTypes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var results = (await _generalSettingsWebApiClient.GetGeneralSettings()).ReadAsSync();
            
            var emailTypes = ToEmailTypeSettingVms(results);

            return List2(emailTypes);
        }

        private static List< EmailTypeSettingVM> ToEmailTypeSettingVms(SiteSettings.General.Contracts.GeneralSettings results)
        {
            var convertedTypes = Mapper.Map<List<EmailTypeSettingVM>>(results.EmailTypes);
            var props = typeof (Mozu.SiteSettings.General.Contracts.EmailTransactionSettings).GetProperties();
            var dic = new Dictionary<string, EmailTypeSettingVM>(StringComparer.OrdinalIgnoreCase);
            foreach (string name in Enum.GetNames(typeof (EmailTypes)))
            {
                dic[name] = new EmailTypeSettingVM()
                {
                    Id = name,
                    Enabled = true
                };
            }
            if (results.EmailTypes != null)
            {
                foreach (var emailEntry in convertedTypes)
                {
                    var prop = props.FirstOrDefault(x => x.Name.Equals(emailEntry.Id));

                    var suppressed = (bool?) prop.GetValue(results.SupressedEmailTransactions);
                    emailEntry.Enabled = !suppressed.GetValueOrDefault(false);

                    var onlyOnApiRequest = (bool?)prop.GetValue(results.EmailTransactionsOnlyOnRequest);
                    emailEntry.OnlyOnApiRequest = onlyOnApiRequest.GetValueOrDefault(false);

                    dic[emailEntry.Id] = emailEntry;
                }
            }
            return dic.Values.ToList();
        }


        [HttpPostRoute(UriTemplate = "emailTypes/edit")]
        public async Task<Response<List<EmailTypeSettingVM>>> SaveEmailTypes(List<EmailTypeSettingVM> updates)
        {
            var existing = (await _generalSettingsWebApiClient.GetGeneralSettings()).ReadAsSync();
            AddEmailSettings(updates, existing);

            var res =await _generalSettingsWebApiClient.UpdateGeneralSettings(existing);
            if ( res.HasException)
            {
                throw res.ReadException();
            }

            return await GetEmailTypes(new PagingParamaters(), new FilterCollection());
        }

        private static void AddEmailSettings(List<EmailTypeSettingVM> updates, SiteSettings.General.Contracts.GeneralSettings existing)
        {
            var props = typeof (Mozu.SiteSettings.General.Contracts.EmailTransactionSettings).GetProperties();
            foreach (var update in updates)
            {
                existing.EmailTypes.Remove(
                    existing.EmailTypes.FirstOrDefault(x => x.Id.Equals(update.Id, StringComparison.OrdinalIgnoreCase)));
                existing.EmailTypes.Add(Mapper.Map<Mozu.SiteSettings.General.Contracts.EmailTypeSetting>(update));

                var prop = props.First(x => x.Name.Equals(update.Id, StringComparison.OrdinalIgnoreCase));
                prop.SetValue(existing.SupressedEmailTransactions, !update.Enabled.GetValueOrDefault(false));
                prop.SetValue(existing.EmailTransactionsOnlyOnRequest, update.OnlyOnApiRequest.GetValueOrDefault(false));
            }
        }
    }
}