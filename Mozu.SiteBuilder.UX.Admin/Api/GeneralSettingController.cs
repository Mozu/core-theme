using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.ShippingAdmin.Contracts;
using Mozu.ShippingAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.SiteSettings.Shipping.Contracts;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Constants = Mozu.ShippingAdmin.Contracts.Constants;
using Mozu.Core.Exceptions;
using System.Net;
using System.Net.Http;
using Mozu.ProductAdmin.Contracts.Clients;
using DC = Mozu.SiteSettings.Order.Contracts;
using TimeZone = Mozu.SiteBuilder.UX.Models.Settings.TimeZone;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/generalsetting", SuppressDescriptorGeneration = true)]
    public class GeneralSettingController : BaseController
    {
        private readonly IGeneralSettingWrapper _wrapper;
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly Lazy<ICheckoutSettingsWebApiClient> _checkoutSettingsWebApiClient;
        private readonly IChannelWebApiClient _channelWebApiClient;
        private readonly IFulfillmentSettingsWebApiClient _fulfillmentSettingsWebApiClient;
        private readonly IReturnSettingsWebApiClient _returnSettingsWebApiClient;
        private readonly IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
        private readonly IFulfillmentProxyWebApiClient _fulfillmentProxyClient;
        private readonly ISearchWebApiClient _searchWebApiClient;
        public GeneralSettingController(IGeneralSettingWrapper wrapper, IChannelWebApiClient channelWebApiClient, IGeneralSettingsWebApiClient generalSettingsWebApiClient, Lazy<ICheckoutSettingsWebApiClient> checkoutSettingsWebApiClient, IFulfillmentSettingsWebApiClient fulfillmentSettingsWebApiClient, IReturnSettingsWebApiClient returnSettingsWebApiClient,
            IShippingSettingsWebApiClient shippingSettingsWebApiClient,
            IFulfillmentProxyWebApiClient fulfillmentProxyClient, ISearchWebApiClient searchWebApiClient)
        {
            _wrapper = wrapper;
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
            _channelWebApiClient = channelWebApiClient.CloneWithoutUserClaims();
            _fulfillmentSettingsWebApiClient = fulfillmentSettingsWebApiClient;
            _returnSettingsWebApiClient = returnSettingsWebApiClient;
            _shippingSettingsWebApiClient = shippingSettingsWebApiClient;
            _fulfillmentProxyClient = fulfillmentProxyClient;
            _searchWebApiClient = searchWebApiClient;
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
            settings.EmailTypes = (await GetEmailTypes(new PagingParamaters(), new FilterCollection())).Items;
            settings.SmsTypes = (await GetSMSTypes(new PagingParamaters(), new FilterCollection())).Items;
            
            settings.SliceSearchByDefault = await GetSliceSearchSettings();

            return List2(settings);
        }

        [HttpPostRoute(UriTemplate = "updateCacheKey")]
        public async Task<Response<GeneralSettings>> UpdateCacheKey(GeneralSettings settings)
        {
            var previousSettings = (await GetSettings()).Items.First();
            previousSettings.CdnCacheBustKey = settings.CdnCacheBustKey;

            var savedSettings = _wrapper.UpdateGeneralSettings(previousSettings);

            return Single2((await GetSettings()).Items.First());
        }

        [HttpPostRoute(UriTemplate = "save")]
        public async Task<Response<GeneralSettings>> Save(GeneralSettings settingsToSave)
        {
            var previousSettings = (await _wrapper.ReadSettings());
            var cdnCacheKey = previousSettings.CdnCacheBustKey;
            var paymentProcessingFlowType = string.Empty;
            settingsToSave.CdnCacheBustKey = cdnCacheKey;

            if (!previousSettings.IsMultishipEnabled.GetValueOrDefault() && settingsToSave.IsMultishipEnabled.GetValueOrDefault())
            {
                paymentProcessingFlowType = OrderProcessingSettings.PaymentProcessingFlowTypes.AuthorizeOnOrderPlacementAndCaptureOnOrderShipment;
            }

            var orderProcessingSettings = (await _checkoutSettingsWebApiClient.Value.GetOrderProcessingSettings()).ReadAsSync();
            if (!string.IsNullOrWhiteSpace(paymentProcessingFlowType))
            {
                orderProcessingSettings.PaymentProcessingFlowType = OrderProcessingSettings.PaymentProcessingFlowTypes.AuthorizeOnOrderPlacementAndCaptureOnOrderShipment;
            }

            var result = (await _checkoutSettingsWebApiClient.Value.UpdateOrderProcessingSettings(orderProcessingSettings)).ReadAsSync();




            var savedSettings = _wrapper.UpdateGeneralSettings(settingsToSave);
            if (settingsToSave.ChannelId != null)
            {
                var channel = _channelWebApiClient.GetChannel(settingsToSave.ChannelId).Result.ReadAsSync();
                if (channel.SiteIds == null)
                {
                    channel.SiteIds = new List<int>();
                }
                if (!channel.SiteIds.Contains(SbApiContext.SiteId.Value))
                {
                    channel.SiteIds.Add(SbApiContext.SiteId.Value);
                    _channelWebApiClient.UpdateChannel(settingsToSave.ChannelId, channel).Wait();
                }
            }
            await SaveEmailTypes(settingsToSave.EmailTypes);
            await SaveSMSTypes(settingsToSave.SmsTypes);
            
            await SaveSliceSearchSettings(settingsToSave.SliceSearchByDefault);
            return Single2((await GetSettings()).Items.First());
        }

        [HttpPostRoute(UriTemplate = "updatePaymentSettings")]
        public async Task<Response<DC.PaymentSettings>> UpdatePaymentSettings(DC.PaymentSettings paymentSettings)
        {
            if ((!string.IsNullOrWhiteSpace(paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.STHFlow?.CaptureBy) && paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.STHFlow?.CaptureOn.Count <= 0)
                || !string.IsNullOrWhiteSpace(paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.BOPISFlow?.CaptureBy) && paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.BOPISFlow?.CaptureOn.Count <= 0)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var currentPaymentSettings = (await _checkoutSettingsWebApiClient.Value.GetPaymentSettings()).ReadAsSync();

            currentPaymentSettings.JobSettings = new DC.JobSettings
            {
                AutoCaptureJob = new DC.AutoCaptureJob
                {
                    IsEnabled = paymentSettings.JobSettings?.AutoCaptureJob?.IsEnabled ?? false,
                    Interval = paymentSettings.JobSettings?.AutoCaptureJob?.Interval ?? 0,
                    FlexibleCapture = new FlexibleCapture()
                    {
                        BOPISFlow = !string.IsNullOrWhiteSpace(paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.BOPISFlow?.CaptureBy) ?
                                paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.BOPISFlow : null,
                        STHFlow = !string.IsNullOrWhiteSpace(paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.STHFlow?.CaptureBy) ?
                                paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.STHFlow : null,
                        IsEnabled = paymentSettings.JobSettings?.AutoCaptureJob?.FlexibleCapture?.IsEnabled ?? false
                    }
                },
                ForceCaptureJob = new DC.ForceCaptureJob
                {
                    IsEnabled = paymentSettings.JobSettings?.ForceCaptureJob?.IsEnabled ?? false,
                    CaptureAfterDays = paymentSettings.JobSettings?.ForceCaptureJob?.CaptureAfterDays ?? 0,
                    Interval = paymentSettings.JobSettings?.ForceCaptureJob?.Interval ?? 0,
                }
            };

            currentPaymentSettings.PaymentRanking = paymentSettings.PaymentRanking;

            var result = (await _checkoutSettingsWebApiClient.Value.UpdatePaymentSettings(currentPaymentSettings)).ReadAsSync();

            return Single2(result);
        }

        [HttpPostRoute(UriTemplate = "updateFulfillmentSettings")]
        public async Task<Response<DC.Fulfillment.FulfillmentSettings>> UpdateFulfillmentSettings(DC.Fulfillment.FulfillmentSettings fulfillmentSettings)
        {
            var currentFulfillmentSettings = (await _fulfillmentSettingsWebApiClient.GetFulfillmentSettings()).ReadAsSync();

            currentFulfillmentSettings.DefaultBackOrderDays = fulfillmentSettings.DefaultBackOrderDays;
            currentFulfillmentSettings.BpmConfiguration = new DC.Fulfillment.BPMConfiguration
            {
                ContainerId = fulfillmentSettings?.BpmConfiguration?.ContainerId ?? null,
                ProcessId = fulfillmentSettings?.BpmConfiguration?.ProcessId ?? null
            };
            currentFulfillmentSettings.FulfillmentJobSettings = new DC.Fulfillment.JobSettings()
            {
                PickupReminderJob = fulfillmentSettings?.FulfillmentJobSettings?.PickupReminderJob,
                ReleaseBackorderJob = fulfillmentSettings?.FulfillmentJobSettings?.ReleaseBackorderJob
            };

            var stsDefaultShippingMethod = GetDefaultServiceTypes().Items.Where(x => x.Code == fulfillmentSettings?.ShipToStore?.ShippingMethod?.Code).FirstOrDefault();

            currentFulfillmentSettings.ShipToStore = new DC.Fulfillment.ShipToStore
            {
                IsEnabled = fulfillmentSettings?.ShipToStore?.IsEnabled ?? false,
                AlwaysCreateTransferShipments = fulfillmentSettings?.ShipToStore?.AlwaysCreateTransferShipments ?? false,
                ShippingMethod = new DC.Fulfillment.ShippingMethod() { Code = stsDefaultShippingMethod?.Code, Name = stsDefaultShippingMethod?.DeliveryDuration },
                Cancellation = fulfillmentSettings?.ShipToStore?.Cancellation
            };

            currentFulfillmentSettings.FulfillerSettings = new DC.Fulfillment.FulfillerSettings()
            {
                EditShipment = fulfillmentSettings?.FulfillerSettings?.EditShipment ?? false
            };

            currentFulfillmentSettings.ActionOnBOPISReject = fulfillmentSettings.ActionOnBOPISReject;

            var itemOut = (await _fulfillmentSettingsWebApiClient.UpdateFulfillmentSettings(currentFulfillmentSettings)).ReadAsSync();
            return Single2(itemOut);

        }

        [HttpPostRoute(UriTemplate = "updateReturnSettings")]
        public async Task<Response<DC.Returns.ReturnSettings>> UpdateReturnSettings(DC.Returns.ReturnSettings returnSettings)
        {

            var currentReturnSettings = (await _returnSettingsWebApiClient.GetReturnSettings()).ReadAsSync();

            currentReturnSettings.CreateLabelOnFulfillment = returnSettings.CreateLabelOnFulfillment;
            currentReturnSettings.DefaultProcessingFee = returnSettings.DefaultProcessingFee;
            currentReturnSettings.DefaultShippingLocation = returnSettings.DefaultShippingLocation;

            var itemOut = (await _returnSettingsWebApiClient.UpdateReturnSettings(currentReturnSettings)).ReadAsSync();
            return Single2(itemOut);

        }

        [HttpPostRoute(UriTemplate = "updateShippingSettings")]
        public async Task<Response<SiteShippingSettings>> UpdateShippingSettings(SiteShippingSettings shippingSettings)
        {

            var currentShippingSettings = (await _shippingSettingsWebApiClient.GetSiteShippingSettings()).ReadAsSync();

            currentShippingSettings.RefreshTax = shippingSettings.RefreshTax;
            currentShippingSettings.RefreshShipping = shippingSettings.RefreshShipping;

            var itemOut = (await _shippingSettingsWebApiClient.UpdateSiteShippingSettings(currentShippingSettings)).ReadAsSync();
            return Single2(currentShippingSettings);

        }

        [HttpGetRoute(UriTemplate = "timezones/read")]
        public Response<List<TimeZone>> GetTimeZones([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var results = _wrapper.GetTimeZones().ToList();

            return List2(results);
        }

        [HttpGetRoute(UriTemplate = "emailTypes/read")]
        public async Task<Response<List<EmailTypeSettingVM>>> GetEmailTypes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var results = (await _generalSettingsWebApiClient.GetGeneralSettings()).ReadAsSync();

            var emailTypes = ToEmailTypeSettingVms(results);

            return List2(emailTypes);
        }

        private static List<EmailTypeSettingVM> ToEmailTypeSettingVms(SiteSettings.General.Contracts.GeneralSettings results)
        {
            var convertedTypes = Mapper.Map<List<EmailTypeSettingVM>>(results.EmailTypes);
            var props = typeof(Mozu.SiteSettings.General.Contracts.EmailTransactionSettings).GetProperties();
            var dic = new Dictionary<string, EmailTypeSettingVM>(StringComparer.OrdinalIgnoreCase);
            foreach (string name in Enum.GetNames(typeof(EmailTypes)))
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

                    var suppressed = (bool?)prop.GetValue(results.SupressedEmailTransactions);
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

            var res = await _generalSettingsWebApiClient.UpdateGeneralSettings(existing);
            if (res.HasException)
            {
                throw res.ReadException();
            }

            return await GetEmailTypes(new PagingParamaters(), new FilterCollection());
        }

        [HttpGetRoute(UriTemplate = "smsTypes/read")]
        public async Task<Response<List<SMSTypeSettingVM>>> GetSMSTypes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var results = (await _generalSettingsWebApiClient.GetGeneralSettings()).ReadAsSync();

            var smsTypes = ToSMSTypeSettingVms(results);

            return List2(smsTypes);
        }

        private static List<SMSTypeSettingVM> ToSMSTypeSettingVms(SiteSettings.General.Contracts.GeneralSettings results)
        {
            var convertedTypes = Mapper.Map<List<SMSTypeSettingVM>>(results.SmsTypes);
            var props = typeof(Mozu.SiteSettings.General.Contracts.SMSTransactionSettings).GetProperties();
            var dic = new Dictionary<string, SMSTypeSettingVM>(StringComparer.OrdinalIgnoreCase);
            foreach (string name in Enum.GetNames(typeof(SMSTypes)))
            {
                dic[name] = new SMSTypeSettingVM()
                {
                    Id = name,
                    Enabled = false
                };
            }
            if (results.SmsTypes != null)
            {
                foreach (var smsEntry in convertedTypes)
                {
                    var prop = props.FirstOrDefault(x => x.Name.Equals(smsEntry.Id));

                    var smsTransactions = (bool?)prop.GetValue(results.SmsTransactions);
                    smsEntry.Enabled = smsTransactions.GetValueOrDefault(false);                 

                    dic[smsEntry.Id] = smsEntry;
                }
            }
            return dic.Values.ToList();
        }

        [HttpPostRoute(UriTemplate = "smsTypes/edit")]
        public async Task<Response<List<SMSTypeSettingVM>>> SaveSMSTypes(List<SMSTypeSettingVM> updates)
        {
            var existing = (await _generalSettingsWebApiClient.GetGeneralSettings()).ReadAsSync();
            AddSMSSettings(updates, existing);

            var res = await _generalSettingsWebApiClient.UpdateGeneralSettings(existing);
            if (res.HasException)
            {
                throw res.ReadException();
            }

            return await GetSMSTypes(new PagingParamaters(), new FilterCollection());
        }

        [HttpGetRoute(UriTemplate = "serviceTypes/read")]
        public Response<List<ServiceType>> GetDefaultServiceTypes()
        {
            var serviceTypes = new List<ServiceType>
            {
                new ServiceType() { Code = Constants.ServiceTypes.KiboStandardServiceTypeCode, DeliveryDuration = "Standard" },
                new ServiceType() { Code = Constants.ServiceTypes.KiboOneDayServiceTypeCode, DeliveryDuration = "1 day" },
                new ServiceType() { Code = Constants.ServiceTypes.KiboTwoDayServiceTypeCode, DeliveryDuration = "2 day" },
                new ServiceType() { Code = Constants.ServiceTypes.KiboThreeDayServiceTypeCode, DeliveryDuration = "3 day" }
            };
            return List2<ServiceType>(serviceTypes);
        }

        [HttpGetRoute(UriTemplate = "shipmentBpmSteps/{shipmentType}")]
        public async Task<Response<List<FulfillmentListView>>> GetShipmentBpmSteps(string shipmentType)
        {
            var workflowProcesses = (await _fulfillmentProxyClient.GetWorkflowProcesses()).ReadAsSync();
            var tasks = workflowProcesses.Embedded["processes"].Where(x => x.Id.ToLower().Contains(shipmentType.ToLower())).FirstOrDefault()?.Tasks;

            return List2(tasks.Select(x => new FulfillmentListView()
            {
                Text = x.Name,
                Value = x.Name
            }).ToList());
        }

        [HttpGetRoute(UriTemplate = "shipmentStatus")]
        public Response<List<FulfillmentListView>> GetShipmentStatus()
        {
            var results = new List<FulfillmentListView>() {
                new FulfillmentListView(){Text="Ready",Value="READY" },
                new FulfillmentListView(){Text="Reassigned",Value="REASSIGNED" },
                new FulfillmentListView(){Text="Backorder",Value="BACKORDER" },
                new FulfillmentListView(){Text="Canceled",Value="CANCELED" },
                new FulfillmentListView(){Text="Fulfilled",Value="FULFILLED" },
                new FulfillmentListView(){Text="Customer Care",Value="CUSTOMER_CARE" }
            };

            return List2(results);
        }

        private static void AddEmailSettings(List<EmailTypeSettingVM> updates, SiteSettings.General.Contracts.GeneralSettings existing)
        {
            var props = typeof(Mozu.SiteSettings.General.Contracts.EmailTransactionSettings).GetProperties();
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

        private static void AddSMSSettings(List<SMSTypeSettingVM> updates, SiteSettings.General.Contracts.GeneralSettings existing)
        {
            var props = typeof(Mozu.SiteSettings.General.Contracts.SMSTransactionSettings).GetProperties();
            foreach (var update in updates)
            {
                existing.SmsTypes.Remove(
                    existing.SmsTypes.FirstOrDefault(x => x.Id.Equals(update.Id, StringComparison.OrdinalIgnoreCase)));
                existing.SmsTypes.Add(Mapper.Map<Mozu.SiteSettings.General.Contracts.SMSTypeSetting>(update));

                var prop = props.First(x => x.Name.Equals(update.Id, StringComparison.OrdinalIgnoreCase));
                prop.SetValue(existing.SmsTransactions, update.Enabled.GetValueOrDefault(false));
            }
        }

        private async Task<bool> GetSliceSearchSettings()
        {
            var searchsettings = await (await _searchWebApiClient.GetSettings()).ReadAsAsync();

            if (searchsettings?.SiteSearchSettings == null)
            {
                return false;
            }

            var shouldSlice = searchsettings.SiteSearchSettings.Any(sss => sss.SliceSearchByDefault);

            return shouldSlice;
        }


        private async Task SaveSliceSearchSettings( bool? newValue)
        {
            var searchsettings = await (await _searchWebApiClient.GetSettings()).ReadAsAsync();

            var previous = searchsettings?.SiteSearchSettings?.Any(sss => sss.SliceSearchByDefault) ?? false;

            //don't save if they havent changed
            //coalesce null to false
            if (previous == (newValue ?? false))
            {
                return;
            }

           

            if (newValue ?? false)
            {
                if (searchsettings.SiteSearchSettings == null)
                {
                    searchsettings.SiteSearchSettings = new List<ProductAdmin.Contracts.SiteSearchSettings>();
                }
                if (!searchsettings.SiteSearchSettings.Any())
                {
                    searchsettings.SiteSearchSettings.Add(new ProductAdmin.Contracts.SiteSearchSettings() { SliceSearchByDefault = true });
                }
                else
                {
                    foreach (var setting in searchsettings.SiteSearchSettings)
                    {
                        setting.SliceSearchByDefault = true;
                    }
                }

            }
            else
            {
                foreach (var setting in searchsettings.SiteSearchSettings)
                {
                    setting.SliceSearchByDefault = false;
                }
            }


            await _searchWebApiClient.UpdateSettings(searchsettings);
        }
    }
}