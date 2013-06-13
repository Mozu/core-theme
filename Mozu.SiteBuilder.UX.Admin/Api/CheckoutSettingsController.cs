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
using Mozu.SiteSettings.Order.Contracts;
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
            var setting = res.ReadAsSync();
            var ret = ConvertSetting(setting.PaymentSettings );
            ret.PaymentProcessingFlowType = setting.OrderProcessingSettings  != null ? setting.OrderProcessingSettings.PaymentProcessingFlowType : null;
            ret.CustomerCheckoutType  = setting.CustomerCheckoutSettings   != null ? setting.CustomerCheckoutSettings.CustomerCheckoutType  : null;


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
            var pSetting = ConvertToContract(settingReq);
            var ret = (await _checkoutSettingsWebApiClient.UpdatePaymentSettings(pSetting)).ReadAsSync();
            var ret1 = (await _checkoutSettingsWebApiClient.UpdateCustomerCheckoutSettings( new Mozu.SiteSettings.Order.Contracts.CustomerCheckoutSettings()
                                                                                                {
                                                                                                   CustomerCheckoutType = settingReq.CustomerCheckoutType  
                                                                                                })).ReadAsSync();
            var ret2 = (await _checkoutSettingsWebApiClient.UpdateOrderProcessingSettings( new Mozu.SiteSettings.Order.Contracts.OrderProcessingSettings()  
            {
                 PaymentProcessingFlowType = settingReq.PaymentProcessingFlowType 
            })).ReadAsSync();

            var getRes = await GetSettings();
            return getRes;
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

        private static Mozu.SiteSettings.Order.Contracts.PaymentSettings ConvertToContract(Setting setting)
        {

            var gatewayAccount = new Mozu.PaymentService.Contracts.GatewayAccount
            {
                CountryCode = "US",
                GatewayDefinitionId = setting.GatewayDefinitionId,
                Id = setting.Id,
                IsActive = true,
                CredentialFields = new List<GatewayCredentialFieldValue>()
            };

            if (!string.IsNullOrEmpty(setting.GatewayFieldId1) && !string.IsNullOrEmpty(setting.GatewayFieldVal1)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId1, Value = setting.GatewayFieldVal1 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId2) && !string.IsNullOrEmpty(setting.GatewayFieldVal2)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId2, Value = setting.GatewayFieldVal2 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId3) && !string.IsNullOrEmpty(setting.GatewayFieldVal3)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId3, Value = setting.GatewayFieldVal3 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId4) && !string.IsNullOrEmpty(setting.GatewayFieldVal4)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId4, Value = setting.GatewayFieldVal4 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId5) && !string.IsNullOrEmpty(setting.GatewayFieldVal5)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId5, Value = setting.GatewayFieldVal5 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId6) && !string.IsNullOrEmpty(setting.GatewayFieldVal6)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId6, Value = setting.GatewayFieldVal6 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId7) && !string.IsNullOrEmpty(setting.GatewayFieldVal7)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId7, Value = setting.GatewayFieldVal7 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId8) && !string.IsNullOrEmpty(setting.GatewayFieldVal8)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId8, Value = setting.GatewayFieldVal8 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId9) && !string.IsNullOrEmpty(setting.GatewayFieldVal9)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId9, Value = setting.GatewayFieldVal9 }); }
            if (!string.IsNullOrEmpty(setting.GatewayFieldId10) && !string.IsNullOrEmpty(setting.GatewayFieldVal10)) { gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue { Name = setting.GatewayFieldId10, Value = setting.GatewayFieldVal10 }); }

            var pSettings = new Mozu.SiteSettings.Order.Contracts.PaymentSettings
                                {
                                    Gateways = new List<Mozu.SiteSettings.Order.Contracts.Gateway>()
                                                   {

                                                       new Gateway()
                                                           {
                                                               GatewayAccount = gatewayAccount,
                                                               SupportedCards = setting.SupportedCards
                                                           }

                                                   },
                                    PayByMail = setting.PayByMail.GetValueOrDefault(false)
                                };
            return pSettings;
        }

        private static Setting ConvertSetting(PaymentSettings  paymentSettings)
        {
            var ret = new Setting();
            if (paymentSettings == null)
            {
                return ret;
            }

            ret.PayByMail = paymentSettings.PayByMail;
            var gateWay = paymentSettings.Gateways != null && paymentSettings.Gateways.Count > 0 ? paymentSettings.Gateways.First() : null;

           
            if (gateWay != null)
            {
                
                ret.SupportedCards = gateWay.SupportedCards;
                if ( gateWay.GatewayAccount != null && gateWay.GatewayAccount.CredentialFields != null )
                {
                    var fields = gateWay.GatewayAccount.CredentialFields;
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