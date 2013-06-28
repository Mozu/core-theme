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
using Newtonsoft.Json.Linq;
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
            var  tasks = new List<Task>();
            Gateway gateWay = null;
            var currentGatewayRes = (await _checkoutSettingsWebApiClient.GetActiveGatewayForCountry("us"));
            if (currentGatewayRes.ResponseMessage.IsSuccessStatusCode)
            {
                gateWay = currentGatewayRes.ReadAsSync();
            }
            if (gateWay != null)
            {
                var posted = pSetting.Gateways.First();
                if (gateWay.GatewayAccount.GatewayDefinitionId == posted.GatewayAccount.GatewayDefinitionId)
                {
                    var res0 = (await _checkoutSettingsWebApiClient.UpdateGateway(gateWay.GatewayAccount.Id, posted));
                }
                else
                {
                    var res0 = (await _checkoutSettingsWebApiClient.CreateGateway(  posted));
                }
            }
            else
            {
                var posted = pSetting.Gateways.First();
                var res0 = (await _checkoutSettingsWebApiClient.CreateGateway(posted));
            }

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
            mapped.ForEach(x =>
                {
                    
                    if (x.SupportedCards == null || x.SupportedCards.Count == 0)
                    {
                        x.SupportedCards = new List<KeyValuePair<string, string>>()
                                               {
                                                   new KeyValuePair<string, string>("VISA", "VISA"),
                                                   new KeyValuePair<string, string>("AMEX", "American Express"),
                                                   new KeyValuePair<string, string>("MC", "MasterCard"),
                                                   new KeyValuePair<string, string>("DISCOVER", "Discover"),
                                               };
                    }
                });
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


            if (setting.Credentials != null && setting.Credentials.HasValues)
            {
                foreach (var credential in setting.Credentials)
                {
                    gatewayAccount.CredentialFields.Add(new GatewayCredentialFieldValue() {Name = credential.Key, Value = (string) credential.Value});
                }
            }
            
            var pSettings = new Mozu.SiteSettings.Order.Contracts.PaymentSettings
                                {
                                    Gateways = new List<Mozu.SiteSettings.Order.Contracts.Gateway>()
                                                   {

                                                       new Gateway()
                                                           {
                                                               GatewayAccount = gatewayAccount,
                                                               SupportedCards = setting.SupportedCards,
                                                               
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
            var gateWay = paymentSettings.Gateways != null && paymentSettings.Gateways.Count > 0 ? paymentSettings.Gateways.FirstOrDefault(x=> x.GatewayAccount != null && x.GatewayAccount.IsActive ) : null;

           
            if (gateWay != null)
            {
                
                ret.SupportedCards = gateWay.SupportedCards;
                if (gateWay.GatewayAccount != null)
                {
                    ret.GatewayDefinitionId = gateWay.GatewayAccount.GatewayDefinitionId;
                    ret.AreGatewayCredentialFieldsSet = gateWay.AreGatewayCredentialFieldsSet;
                }
                //if ( gateWay.GatewayAccount != null && gateWay.GatewayAccount.CredentialFields != null )
                //{
                 
                   
                //    ret.Credentials = new JObject();
                //    foreach (var field in gateWay.GatewayAccount.CredentialFields)
                //    {
                //        ret.Credentials.Add(field.Name, (JToken )field.Value );
                //    }
                    
                //}
            }

            return ret;
        }

        #endregion
    }
}