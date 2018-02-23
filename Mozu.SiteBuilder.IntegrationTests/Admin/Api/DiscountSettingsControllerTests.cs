//using System;
//using AutoMapper;
//using Mozu.Core;
//using Mozu.Core.Api.Client;
//using Mozu.Core.Api.Client.Caching;
//using Mozu.Core.Api.Contracts;
//using Mozu.Core.Api.Contracts.Client;
//using Mozu.Core.Configuration;
//using Mozu.Core.Settings;
//using Mozu.ProductAdmin.Contracts.Clients;
//using Mozu.SiteBuilder.UX.Admin.Api;
//using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
//using NUnit.Framework;
//
//namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
//{
//    [TestFixture]
//    public class DiscountSettingsControllerTests
//    {
//        private IApiContext _apiContext;
//        private IClientCacheProvider _cacheProvider;
//
//        private ISettings _settings;
//        private DiscountSettingsController _SUT_discountSettingsController;
//
//        #region Setup
//
//        [SetUp]
//        public void SetUp()
//        {
//            try // ... try/catch makes debugging easier
//            {
//                var container = new AutofacContainerFactory()
//                    .UsingAssembly(typeof(ISettings).Assembly)
//                    .UsingAssembly(typeof(Mozu.ProductAdmin.Contracts.Clients.IDiscountSettingsWebApiClient).Assembly)
//                    .UsingAssembly(typeof(IServiceClientMessageHandler).Assembly) //same assembly
//                    .ShowDebugOutput(false)
//                    .CreateContainerBuilder();
//                container.Build();
//
//                _settings = MozuConfigurationManager.Settings;
//
//
//
//
//                //TODO: get values from config file
//
//                _apiContext = new ApiContext
//                {
//                    TenantId = 17194, // int.Parse(ConfigurationManager.AppSettings["TenantId"]),
//                    MasterCatalogId = 1, //int.Parse(ConfigurationManager.AppSettings["MasterCatalogId"]),
//                    CatalogId = 1, //int.Parse(ConfigurationManager.AppSettings["CatalogId"]),
//                    SiteId = 21227, //int.Parse(ConfigurationManager.AppSettings["SiteId"]),
//                    CurrencyCode = "USD", //ConfigurationManager.AppSettings["CurrencyCode"],
//                    LocaleCode = "en-US", // ConfigurationManager.AppSettings["LocaleCode"],
//                    //AppClaims = productAdminServiceAppClaims,
//                    InitiatingAppId = Guid.NewGuid().ToString(),
//                };
//
//                Mapper.AddProfile<DiscountSettingsMapping>();
//
//                _SUT_discountSettingsController = new DiscountSettingsController(new DiscountSettingsWebApiClient(new ServiceClientMessageHandler(_apiContext, _settings)));
//
//            }
//            catch
//                (Exception ex)
//            {
//                var msg = ex.Message;
//            }
//
//
//        }
//        #endregion Setup
//
//
//        [Test]
//        public void Should_get_new_Discount_Settings____UsingApi___move_to_catalog_Tests()
//        {
//            try // ... try/catch makes debugging easier
//            {
//                try
//                {
//                    var catalogId = 1;
//
//
//                    //TODO: this should be a Catalog integration test - create a test there.
//                    //TODO: this should be a Catalog integration test - create a test there.
//
//                    var fApi = new DiscountSettingsWebApiClient(new ServiceClientMessageHandler(_apiContext, _settings));
//
//                    {
//                        catalogId = 1;
//                        var discountSettings = fApi.GetDiscountSettings(catalogId, "", TargetContextLevelType.MasterCatalog).Result.ReadAsSync();
//                        Assert.IsNotNull(discountSettings?.StackingConfiguration);
//                        Assert.IsTrue(discountSettings.StackingConfiguration.ProductLineItemLayers >= 1);
//                        Assert.IsTrue(discountSettings.StackingConfiguration.ProductOrderLayers >= 1);
//                        Assert.IsTrue(discountSettings.StackingConfiguration.ShippingLineItemLayers >= 1);
//                        Assert.IsTrue(discountSettings.StackingConfiguration.ShippingOrderLayers >= 1);
//                    }
//
//                    {
//                        catalogId = 2;
//                        var discountSettings = fApi.GetDiscountSettings(catalogId, "", TargetContextLevelType.MasterCatalog).Result.ReadAsSync();
//                        Assert.IsNotNull(discountSettings?.StackingConfiguration);
//                        Assert.IsTrue(discountSettings.StackingConfiguration.ProductLineItemLayers >= 1);
//                        Assert.IsTrue(discountSettings.StackingConfiguration.ProductOrderLayers >= 1);
//                        Assert.IsTrue(discountSettings.StackingConfiguration.ShippingLineItemLayers >= 1);
//                        Assert.IsTrue(discountSettings.StackingConfiguration.ShippingOrderLayers >= 1);
//                    }
//
//
//                    try                     //   TODO: rip this out into its own test)
//                    {
//                        {
//                            catalogId = 999999;
//                            var discountSettings = fApi.GetDiscountSettings(catalogId, "", TargetContextLevelType.MasterCatalog).Result.ReadAsSync();
//                            Assert.IsNotNull(discountSettings?.StackingConfiguration);
//                            Assert.IsFalse(discountSettings.StackingConfiguration.StackingEnabled);
//                            Assert.IsTrue(discountSettings.StackingConfiguration.ProductLineItemLayers == 1);
//                            Assert.IsTrue(discountSettings.StackingConfiguration.ProductOrderLayers == 1);
//                            Assert.IsTrue(discountSettings.StackingConfiguration.ShippingLineItemLayers == 1);
//                            Assert.IsTrue(discountSettings.StackingConfiguration.ShippingOrderLayers == 1);
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                        //This is expected
//                        var msg = ex.Message;
//                    }
//
//
//
//                }
//                catch (Exception ex)
//                {
//                    var msg = ex.Message;
//                }
//
//
//            }
//            catch (Exception ex)
//            {
//                var msg = ex.Message;
//            }
//
//        }
//
//
//        [Test]
//        public void Should_get_new_Discount_Settings()
//        {
//
//            try // ... try/catch makes debugging easier
//            {
//                var catalogId = 1;
//
//                //TODO: this assumes you have catalog 1 and 2
//
//                Mapper.AddProfile<DiscountSettingsMapping>();
//
//                try
//                {
//                    {
//                        catalogId = 1;
//                        var discountSettings = _SUT_discountSettingsController.GetDiscountSettings(catalogId).Result;
//                        Assert.IsNotNull(discountSettings.Items?.StackingConfiguration?.ProductLineItemLayers);
//                        Assert.IsTrue(discountSettings.Items?.StackingConfiguration?.ProductLineItemLayers >= 1);
//                        Assert.IsTrue(discountSettings.Items?.StackingConfiguration?.ProductOrderLayers >= 1);
//                        Assert.IsTrue(discountSettings.Items?.StackingConfiguration?.ShippingLineItemLayers >= 1);
//                        Assert.IsTrue(discountSettings.Items?.StackingConfiguration?.ShippingOrderLayers >= 1);
//                    }
//
//                    // Valid catalog but doesn't have discount settings yet     
//                    {
//                        catalogId = 2;
//                        var discountSettings = _SUT_discountSettingsController.GetDiscountSettings(catalogId).Result;
//                        Assert.IsTrue(discountSettings != null);
//                        Assert.IsNotNull(discountSettings.Items?.StackingConfiguration?.ProductLineItemLayers);
//                        Assert.IsTrue(discountSettings.Items?.StackingConfiguration?.ProductLineItemLayers == 1);
//                        Assert.IsTrue(discountSettings.Items?.StackingConfiguration?.ProductOrderLayers == 1);
//                        Assert.IsTrue(discountSettings.Items?.StackingConfiguration?.ShippingLineItemLayers == 1);
//                        Assert.IsTrue(discountSettings.Items?.StackingConfiguration?.ShippingOrderLayers == 1);
//                    }
//
//                    try //   TODO: rip this out into its own test)
//                    {
//                        {
//                            catalogId = 999999;
//                            var discountSettings = _SUT_discountSettingsController.GetDiscountSettings(catalogId).Result;
//                        }
//                    }
//                    catch (Exception ex)
//                    {
//                        //This is expected
//                        var msg = ex.Message;
//                    }
//                }
//                catch (Exception ex)
//                {
//                    var msg = ex.Message;
//                }
//
//
//            }
//            catch (Exception ex)
//            {
//                var msg = ex.Message;
//            }
//
//        }
//
//
//        [Test]
//        public void Should_get_update_Discount_Settings()
//        {
//
//            try // ... try/catch makes debugging easier
//            {
//                var catalogId = 1;
//
//                //TODO: this assumes you have catalog 1 and 2
//
//                try
//                {
//                    var existingSettings = _SUT_discountSettingsController.GetDiscountSettings(catalogId).Result.Items;
//                    Assert.IsNotNull(existingSettings.StackingConfiguration?.ProductLineItemLayers);
//                    var previousLayerValue = existingSettings.StackingConfiguration.ProductLineItemLayers;
//
//
//                    // WHEN -------------------------------------------------------------------------------------------------------------
//
//                    // Change layer value
//                    existingSettings.StackingConfiguration.ProductLineItemLayers = previousLayerValue + 10;
//                    var updatedDiscountSettings = _SUT_discountSettingsController.UpdateDiscountSettings(existingSettings, catalogId);
//
//
//                    // THEN -------------------------------------------------------------------------------------------------------------
//
//                    Assert.IsNotNull(updatedDiscountSettings.Result?.Items?.StackingConfiguration);
//                    Assert.AreEqual(previousLayerValue + 10, updatedDiscountSettings.Result?.Items?.StackingConfiguration?.ProductLineItemLayers);
//
//                }
//                catch (Exception ex)
//                {
//                    //This is expected
//                    var msg = ex.Message;
//                }
//            }
//            catch (Exception ex)
//            {
//                var msg = ex.Message;
//            }
//
//        }
//
//    }
//
//
//    #region Might not need anymore
//
//    //ProductAdminClientMessageHandler.CreateApiClient<DiscountWebApiClient, IDiscountWebApiClient>( _adminServiceBaseUri + RoutePaths.DiscountController);
//
//    //var x = new ServiceClientMessageHandler(new ApiContext(), new Mozu.Core.Settings.ServiceSettings(), new ClientCacheProvider());
//
//    //            var appName = ConfigurationManager.AppSettings["AppName"];
//    //            var appId = ConfigurationManager.AppSettings["AppId"];
//    //
//    //            appName = "SiteBuilderTests";
//    //            appId = Guid.NewGuid().ToString();
//    //  var productAdminServiceAppClaims = LightweightAppClaims.CreateForSystemApp(AppKey.CreateForSystemApp(appName), appId);
//
//
//    //
//    //
//    //                ICookieProvider cookieProvider = Substitute.For<ICookieProvider>();
//    //
//    //                ISettings settings = Substitute.For<ISettings>();
//    //                settings.AppSettings(Arg.Is<string>("ReverseProxy")).Returns("true");
//    //                IAuthenticationHelper auth = Substitute.For<IAuthenticationHelper>();
//    //                var dvm = Substitute.For<IDataViewModeFinderOuter>();
//    //                dvm.GetDataViewMode(Arg.Any<Mozu.Core.LightweightUserClaims>()).Returns(Core.DataViewModeType.Pending);
//    //                var edit = Substitute.For<IEditModeFinderOuter>();
//    //                edit.IsEditMode().Returns(false);
//    //                HttpRequestMessage request = Substitute.For<HttpRequestMessage>();
//    //
//    //                request.RequestUri = new Uri("http://foo.com/?mz_now=2012-11-10");
//    //                var siteBuilderApiContext = new Mozu.SiteBuilder.Mvc.SiteBuilderApiContext(cookieProvider, settings, auth, request, dvm, edit);
//    //
//    //                var now = siteBuilderApiContext.PreviewDate.Value;
//    //
//    //                //_apiContext = siteBuilderApiContext;
//    //_cacheProvider = new ClientCacheProvider(_settings);
//    //var serviceClientMessageHandler = new Mozu.Core.Api.Client.ServiceClientMessageHandler<DiscountSettings>(_apiContext, _settings, _cacheProvider);
//
//
//
//
//
//    //CreateServiceClientMessageHandler(IApiContext apiContext, ISettings settings, IClientCacheProvider clientCacheProvider);
//
//
//    #endregion Might not need anymore
//
//}
//