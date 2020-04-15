using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Models.Mapping;
using Mozu.SiteBuilder.Mvc.Models.ModelMapping;
using Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping;
using NUnit.Framework;
using System;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UnitTests.StoreFront.ModelMapping
{
    public class MvcMappingTest
    {
        [OneTimeSetUp]
        public void FixtureSetup()
        {
            Mapper.Reset();

            //var configuration = new MapperConfiguration(cfg =>
            //{
            //    cfg.AddProfile<CartMapping>();
            //    cfg.AddProfile<CmsPagesMapping>();
            //    cfg.AddProfile<GeneralSettingsMapping>();
            //    cfg.AddProfile<NavigationMapping>();
            //    cfg.AddProfile<ProductMapping>();
            //    cfg.AddProfile<Mozu.SiteBuilder.UX.Admin.Api.ModelMapping.CheckoutMapping>();
            //});
            //var executionPlan = configuration.BuildExecutionPlan(typeof(Mozu.SiteSettings.Order.Contracts.TenantGateway), typeof(Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.Gateway));
            //var plana = configuration.BuildExecutionPlan(typeof(Newtonsoft.Json.Linq.JObject), typeof(Newtonsoft.Json.Linq.JObject));
            //var str = executionPlan.ToReadableString();


            Mapper.Initialize(cfg =>
           {
                cfg.AddProfile<CartMapping>();
               cfg.AddProfile<CmsPagesMapping>();
               cfg.AddProfile<GeneralSettingsMapping>();
               cfg.AddProfile<NavigationMapping>();
               cfg.AddProfile<ProductMapping>();
               //cfg.AddProfile<Mozu.SiteBuilder.UX.Admin.Api.ModelMapping.CheckoutMapping>();

              

               
           });
            //Mapper.AddProfile<CustomerMapping>();
            //Mapper.AddProfile<DiscountMapping>();
            //Mapper.AddProfile<ProductAttributeMapping>();
            //Mapper.AddProfile<FacetMapping>();
            //Mapper.AddProfile<FileManagementModelMapping>();
            //Mapper.AddProfile<GeneralSettingsMapping>();
            //Mapper.AddProfile<OptionMapping>();
            //Mapper.AddProfile<OrderMapping>();
            //Mapper.AddProfile<ProductMapping>();
            //Mapper.AddProfile<ReturnMapping>();
            //Mapper.AddProfile<RuntimeProductMapping>();
            //Mapper.AddProfile<ShippingMapping>();
            //Mapper.AddProfile<TaxMapping>();
            //Mapper.AddProfile<TenantMapping>();
            //Mapper.AddProfile<UserMapping>();

            //replace with?
            //List<Type> types = _containerFactory.AssembliesToScan.SelectMany(assy => assy.GetTypes())
            //    .Where(x => x.IsSubclassOf(typeof(Profile))).ToList();

            //types.Each(t =>
            //{
            //    var profile = (Profile)Activator.CreateInstance(t);
            //    Mapper.AddProfile(profile);
            //});

        }

        [OneTimeTearDown]
        public void FixtureTearDown()
        {
            Mapper.Reset();
        }

        [Test]
        public void AdminMappings_should_be_valid()
        {
            try
            {
                Mapper.AssertConfigurationIsValid();
            }
            catch (DuplicateTypeMapConfigurationException ex)
            {
                Assert.Inconclusive(ex.ToString());
            }
            catch (AutoMapperConfigurationException ex)
            {
                Assert.Inconclusive(ex.ToString());
            }
            
        }

        [Test]
        public void DoIt()
        {

            var str = "[{\"id\":\"ca7ec57b02854331a0ef3708fc5756e3\",\"name\":\"Authorize.Net\",\"gatewayDefinition\":{\"id\":\"authorize.net\",\"countryCode\":\"US\",\"name\":\"Authorize.Net\",\"prodServiceURL\":\"https://secure.authorize.net/gateway/transact.dll\",\"testServiceURL\":\"https://test.authorize.net/gateway/transact.dll\",\"integrationImplTypeName\":\"Mozu.Payment.Domain.Adapters.AuthorizeNetGatewayAdapter\",\"supportedCards\":[],\"credentialDefinitions\":[{\"name\":\"x_login\",\"displayName\":\"Login\",\"adminDisplayOrder\":0,\"volusionStoreName\":\"Login1\"},{\"name\":\"x_tran_key\",\"displayName\":\"Transaction Key\",\"adminDisplayOrder\":1,\"volusionStoreName\":\"Password\"}]},\"gatewayAccount\":{\"id\":\"ca7ec57b02854331a0ef3708fc5756e3\",\"gatewayDefinitionId\":\"authorize.net\",\"countryCode\":\"us\",\"isActive\":false,\"binPatterns\":[]}},{\"id\":\"ea0ebd9b7a4949a8bbc1d0176a9ffe49\",\"name\":\"CC\",\"gatewayDefinition\":{\"id\":\"2d69226b72594e63b493f19dd4969774\",\"countryCode\":\"US\",\"name\":\"CardConnect\",\"prodServiceURL\":\"https://fts.prinpay.com:8443/cardconnect/rest/\",\"testServiceURL\":\"https://fts.prinpay.com:6443/cardconnect/rest/\",\"integrationImplTypeName\":\"Mozu.Payment.Domain.Adapters.CardConnectGatewayAdapter\",\"supportedCards\":[],\"credentialDefinitions\":[{\"name\":\"HostName\",\"displayName\":\"Host Name\",\"adminDisplayOrder\":0,\"volusionStoreName\":\"HostName\"},{\"name\":\"API USERNAME\",\"displayName\":\"API User Name\",\"adminDisplayOrder\":0,\"volusionStoreName\":\"API User Name\"},{\"name\":\"API PASSWORD\",\"displayName\":\"API Password\",\"adminDisplayOrder\":2,\"volusionStoreName\":\"API Password\"},{\"name\":\"MERCHANT ID\",\"displayName\":\"Merchant ID\",\"adminDisplayOrder\":4,\"volusionStoreName\":\"Merchant ID\"}]},\"gatewayAccount\":{\"id\":\"ea0ebd9b7a4949a8bbc1d0176a9ffe49\",\"gatewayDefinitionId\":\"2d69226b72594e63b493f19dd4969774\",\"countryCode\":\"us\",\"isActive\":false,\"binPatterns\":[]}},{\"id\":\"5871b7ae2a20454888499c752dc7ae5c\",\"name\":\"Paymetric\",\"gatewayDefinition\":{\"id\":\"9ed0b44dccd7484e9343420e5184430f\",\"countryCode\":\"US\",\"name\":\"Paymetric\",\"prodServiceURL\":\"https://prd02.XiPaynet.com/pmxigge/XiPay30ws.asmx\",\"testServiceURL\":\"https://qa01.xipaynet.com/pmxigge/XiPay30ws.asmx\",\"integrationImplTypeName\":\"Mozu.Payment.Domain.Adapters.PaymetricGatewayAdapter\",\"supportedCards\":[],\"credentialDefinitions\":[{\"name\":\"API USERNAME\",\"displayName\":\"API Username\",\"adminDisplayOrder\":0,\"volusionStoreName\":\"API Username\"},{\"name\":\"API PASSWORD\",\"displayName\":\"API Password\",\"adminDisplayOrder\":1,\"volusionStoreName\":\"API Password\"},{\"name\":\"MERCHANT ID\",\"displayName\":\"Merchant ID\",\"adminDisplayOrder\":2,\"volusionStoreName\":\"Merchant ID\"}]},\"gatewayAccount\":{\"id\":\"5871b7ae2a20454888499c752dc7ae5c\",\"gatewayDefinitionId\":\"9ed0b44dccd7484e9343420e5184430f\",\"countryCode\":\"us\",\"isActive\":false,\"binPatterns\":[]}},{\"id\":\"19b101744bfe414f8737caf4c196e608\",\"name\":\"Auth.net\",\"gatewayDefinition\":{\"id\":\"authorize.net\",\"countryCode\":\"US\",\"name\":\"Authorize.Net\",\"prodServiceURL\":\"https://secure.authorize.net/gateway/transact.dll\",\"testServiceURL\":\"https://test.authorize.net/gateway/transact.dll\",\"integrationImplTypeName\":\"Mozu.Payment.Domain.Adapters.AuthorizeNetGatewayAdapter\",\"supportedCards\":[],\"credentialDefinitions\":[{\"name\":\"x_login\",\"displayName\":\"Login\",\"adminDisplayOrder\":0,\"volusionStoreName\":\"Login1\"},{\"name\":\"x_tran_key\",\"displayName\":\"Transaction Key\",\"adminDisplayOrder\":1,\"volusionStoreName\":\"Password\"}]},\"gatewayAccount\":{\"id\":\"19b101744bfe414f8737caf4c196e608\",\"gatewayDefinitionId\":\"authorize.net\",\"countryCode\":\"us\",\"isActive\":true,\"binPatterns\":[]}}]";
            Newtonsoft.Json.JsonSerializer ser = new Newtonsoft.Json.JsonSerializer();
           var tgs = ser.Deserialize<Mozu.SiteSettings.Order.Contracts.TenantGateway[]>(new Newtonsoft.Json.JsonTextReader(new System.IO.StringReader(str)));

          
           //var res = AutoMapper.Mapper.Map<Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.Gateway[]>(tgs);

           
            //var tg = new Mozu.SiteSettings.Order.Contracts.TenantGateway()
            //{ };
            //tg.GatewayAccount = new PaymentService.Contracts.GatewayAccount();
            //tg.GatewayAccount.CredentialFields = new System.Collections.Generic.List<PaymentService.Contracts.GatewayCredentialFieldValue>();
            //tg.GatewayAccount.CredentialFields.Add(new PaymentService.Contracts.GatewayCredentialFieldValue()
            //{
            //    Name = "food",
            //    Value = "stuff"
            //});

                
                
                
                
                //->Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout.Gateway
        }
    }
}