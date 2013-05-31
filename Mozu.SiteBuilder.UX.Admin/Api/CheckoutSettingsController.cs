using System;
using System.Collections.Generic;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
using System.Linq;
using Mozu.PaymentService.Contracts.Clients.Public;
using Mozu.Provisioning.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;
using CheckoutSettings = Mozu.SiteSettings.Order.Contracts.CheckoutSettings;
using GatewayCredentialFieldValue = Mozu.PaymentService.Contracts.GatewayCredentialFieldValue;
using PaymentSettings = Mozu.SiteSettings.Order.Contracts.PaymentSettings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class CheckoutSettingsController : BaseController
    {
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        //IProvisioningWebApiClient _provisioningWebApiClient;


        public CheckoutSettingsController(ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient)
        {
            if(checkoutSettingsWebApiClient == null)
            {
                throw new ArgumentNullException("checkoutSettingsWebApiClient");
            }
            //_provisioningWebApiClient = provisioningWebApiClient;
   
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient;
        }

        /// <summary>
        /// Returns the active checkout settings
        /// </summary>
        /// <returns></returns>
        [WebGet(UriTemplate = "read")]
        public async Task<Response<Setting>> GetSettings()
        {
            var res = await _checkoutSettingsWebApiClient.GetCheckoutSettings();
            //if (! res.ResponseMessage .IsSuccessStatusCode )
            //{
            //    var pRes=_provisioningWebApiClient.CreateSite(new Mozu.Core.Api.Contracts.SiteProvisionMessage()).Result;
            //    if ( pRes.HasException )
            //    {
            //        throw pRes.ReadException();
            //    }
            //    res = _checkoutSettingsWebApiClient.GetCheckoutSettings().Result;
            //}
            var setting = res.ReadAsSync();
            var ret = ConvertSetting(setting);
            return Single2(ret);
        } 

        /// <summary>
        /// Updates the active checkout settings
        /// </summary>
        /// <param name="setting">The checkout settings</param>
        /// <returns>The active checkout settings</returns>
        [WebInvoke(UriTemplate = "update")]
        public async Task<Response<Setting>> UpdateSettings(Setting settingReq)
        {
            var cSetting = ConvertToContract(settingReq);
            var ret = (await _checkoutSettingsWebApiClient.UpdateCheckoutSettings(cSetting)).ReadAsSync();
            return Single2(ConvertSetting(ret));
        }

        /// <summary>
        /// Returns the PCIaaS gateway definitions
        /// </summary>
        /// <returns>Array of gateway definitions</returns>
        [WebGet(UriTemplate = "definition/read")]
        public async Task<Response<List<GatewayDefinition>>> GetDefinitions()
        {
            var def = (await _checkoutSettingsWebApiClient.GetGatewayDefinitions()).ReadAsSync();

            var mapped = Mapper.Map<List<GatewayDefinition>>(def).OrderBy(x => x.Name).ToList();
            return List2(mapped);
        }

        #region Private methods

        private static CheckoutSettings ConvertToContract(Setting setting)
        {
            var gateway = new Mozu.PaymentService.Contracts.GatewayAccount
            {
                CountryCode = "US",
                GatewayDefinitionId = setting.GatewayDefinitionId,
                Id = setting.Id,
                IsActive = true,
                CredentialFields = new List<GatewayCredentialFieldValue>()
            };

            if (!string.IsNullOrEmpty(setting.GatewayFieldId1) && !string.IsNullOrEmpty(setting.GatewayFieldVal1)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId1, Value = setting.GatewayFieldVal1 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId2) && !string.IsNullOrEmpty(setting.GatewayFieldVal2)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId2, Value = setting.GatewayFieldVal2 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId3) && !string.IsNullOrEmpty(setting.GatewayFieldVal3)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId3, Value = setting.GatewayFieldVal3 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId4) && !string.IsNullOrEmpty(setting.GatewayFieldVal4)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId4, Value = setting.GatewayFieldVal4 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId5) && !string.IsNullOrEmpty(setting.GatewayFieldVal5)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId5, Value = setting.GatewayFieldVal5 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId6) && !string.IsNullOrEmpty(setting.GatewayFieldVal6)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId6, Value = setting.GatewayFieldVal6 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId7) && !string.IsNullOrEmpty(setting.GatewayFieldVal7)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId7, Value = setting.GatewayFieldVal7 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId8) && !string.IsNullOrEmpty(setting.GatewayFieldVal8)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId8, Value = setting.GatewayFieldVal8 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId9) && !string.IsNullOrEmpty(setting.GatewayFieldVal9)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId9, Value = setting.GatewayFieldVal9 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId10) && !string.IsNullOrEmpty(setting.GatewayFieldVal10)) { gateway.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId10, Value = setting.GatewayFieldVal10 }); }

            var cSetting = new CheckoutSettings
            {
                //todo:mozu rename PaymentServiceMerchantId = setting.PaymentServiceMerchantId,
                PaymentSettings = new PaymentSettings
                {
                    Gateway = gateway,
                    SupportedCards = setting.SupportedCards
                },

                CustomerCheckoutSettings = new Mozu.SiteSettings.Order.Contracts.CustomerCheckoutSettings
                {
                    CustomerCheckoutType =
                        setting.CustomerCheckoutType
                },

                OrderProcessingSettings = new Mozu.SiteSettings.Order.Contracts.OrderProcessingSettings
                {
                    PaymentProcessingFlowType = setting.PaymentProcessingFlowType ?? "AuthorizeAndCaptureOnOrderPlacement"
                }
            };

            return cSetting;
        }

        private static Setting ConvertSetting(CheckoutSettings setting)
        {
        
            var ret = new Setting
            {
                PaymentServiceMerchantId = "fart" , //todo:mozu rename setting.PaymentServiceMerchantId,
                CustomerCheckoutType = (setting.CustomerCheckoutSettings != null) ? setting.CustomerCheckoutSettings.CustomerCheckoutType : null,
                SupportedCards = (setting.PaymentSettings != null) ? setting.PaymentSettings.SupportedCards : null,
                GatewayDefinitionId = (setting.PaymentSettings != null && setting.PaymentSettings.Gateway != null) ? setting.PaymentSettings.Gateway.GatewayDefinitionId : null,
                PaymentProcessingFlowType = (setting.OrderProcessingSettings != null) ? setting.OrderProcessingSettings.PaymentProcessingFlowType : "AuthorizeAndCaptureOnOrderPlacement"
            };

            if(setting.PaymentSettings != null && setting.PaymentSettings.Gateway != null)
            {
                if(setting.PaymentSettings.Gateway.CredentialFields != null)
                {
                    var fields = setting.PaymentSettings.Gateway.CredentialFields;
                    var fieldCount = fields.Count;

                    ret.GatewayFieldId1 = (fieldCount > 0) ? fields[0].Name : null;
                    ret.GatewayFieldId2 = (fieldCount > 1) ? fields[1].Name : null;
                    ret.GatewayFieldId3 = (fieldCount > 2) ? fields[2].Name : null;
                    ret.GatewayFieldId4 = (fieldCount > 3) ? fields[3].Name : null;
                    ret.GatewayFieldId5 = (fieldCount > 4) ? fields[4].Name : null;
                    ret.GatewayFieldId6 = (fieldCount > 5) ? fields[5].Name : null;
                    ret.GatewayFieldId7 = (fieldCount > 6) ? fields[6].Name : null;
                    ret.GatewayFieldId8 = (fieldCount > 7) ? fields[7].Name : null;
                    ret.GatewayFieldId9 = (fieldCount > 8) ? fields[8].Name : null;
                    ret.GatewayFieldId10 = (fieldCount > 9) ? fields[9].Name : null;

                    ret.GatewayFieldVal1 = (fieldCount > 0) ? fields[0].Value : null;
                    ret.GatewayFieldVal2 = (fieldCount > 1) ? fields[1].Value : null;
                    ret.GatewayFieldVal3 = (fieldCount > 2) ? fields[2].Value : null;
                    ret.GatewayFieldVal4 = (fieldCount > 3) ? fields[3].Value : null;
                    ret.GatewayFieldVal5 = (fieldCount > 4) ? fields[4].Value : null;
                    ret.GatewayFieldVal6 = (fieldCount > 5) ? fields[5].Value : null;
                    ret.GatewayFieldVal7 = (fieldCount > 6) ? fields[6].Value : null;
                    ret.GatewayFieldVal8 = (fieldCount > 7) ? fields[7].Value : null;
                    ret.GatewayFieldVal9 = (fieldCount > 8) ? fields[8].Value : null;
                    ret.GatewayFieldVal10 = (fieldCount > 9) ? fields[9].Value : null;
                }
            }

            return ret;
        }

        #endregion
    }
}