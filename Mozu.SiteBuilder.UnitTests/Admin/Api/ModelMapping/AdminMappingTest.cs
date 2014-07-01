using System.Collections.Generic;
using System.IO;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Newtonsoft.Json;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping
{
    public class AdminMappingTest
    {
        [TestFixtureSetUp]
        public void FixtureSetup()
        {
            Mapper.Reset();
            Mapper.AddProfile<AttributeMapping>();
            Mapper.AddProfile<CapabilityMapping>();
            Mapper.AddProfile<CategoryMapping>();
            Mapper.AddProfile<CheckoutMapping>();
            Mapper.AddProfile<ContactMapping>();
            Mapper.AddProfile<CustomerContactMapping>();
            Mapper.AddProfile<CreditMapping>();
            Mapper.AddProfile<CustomerMapping>();
            Mapper.AddProfile<DiscountMapping>();
            Mapper.AddProfile<ExtensibleAttributeMapping>();
            Mapper.AddProfile<FacetMapping>();
            Mapper.AddProfile<FileManagementModelMapping>();
            Mapper.AddProfile<GeneralSettingsMapping>();
            
            Mapper.AddProfile<OrderMapping>();
            Mapper.AddProfile<ProductMapping>();
            Mapper.AddProfile<ReturnMapping>();
            Mapper.AddProfile<RuntimeProductMapping>();
            Mapper.AddProfile<ShippingMapping>();
            Mapper.AddProfile<TaxMapping>();
            Mapper.AddProfile<TenantMapping>();
            Mapper.AddProfile<UserMapping>();

            //replace with?
            //List<Type> types = _containerFactory.AssembliesToScan.SelectMany(assy => assy.GetTypes())
            //    .Where(x => x.IsSubclassOf(typeof(Profile))).ToList();

            //types.Each(t =>
            //{
            //    var profile = (Profile)Activator.CreateInstance(t);
            //    Mapper.AddProfile(profile);
            //});

        }

        [TestFixtureTearDown]
        public void FixtureTearDown()
        {
            Mapper.Reset();
        }

        [Test]
        public void AdminMappings_should_be_valid()
        {
            //try
            //{
            //    Mapper.AssertConfigurationIsValid();
            //}
            //catch (AutoMapperConfigurationException ex)
            //{
            // //   Assert.Inconclusive(ex.ToString());
            //}

            //var oc = new Mozu.CommerceRuntime.Contracts.Orders.OrderCollection();

            //var ocs = new List<Mozu.SiteBuilder.UX.Admin.Api.Models.Order.Order>();

            var res = new Response<List<Order>>();
            ;
            res.Total = 5;
           res.Items = new List<Order>();
      
            Newtonsoft.Json.JsonSerializer ser = new JsonSerializer();

            var ms = new MemoryStream();

            var sw = new StringWriter();
            var tw = new JsonTextWriter(sw);

            var bing = new BS();
            bing.Bing();


            System.Web.Http.GlobalConfiguration.Configuration.Formatters.JsonFormatter.WriteToStream(res.Items.GetType(), res.Items, ms, System.Text.Encoding.UTF8);

            System.Web.Http.GlobalConfiguration.Configuration.Formatters.JsonFormatter.WriteToStream(res.GetType(), res, ms, System.Text.Encoding.UTF8);
            var arr = ms.ToArray();

            var text = System.Text.Encoding.UTF8.GetString(arr);
            



        }

        public class BS : AbstractWebApiBootstrapper
        {
            public void Bing()
            {
                InitializeFormatters(System.Web.Http.GlobalConfiguration.Configuration);
            }
        }
    }
}