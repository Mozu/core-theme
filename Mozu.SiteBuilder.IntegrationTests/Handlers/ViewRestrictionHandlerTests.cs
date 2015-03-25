//using Mozu.SiteBuilder.UX.MessageHandlers;
//using NUnit.Framework;
//using Should;
//using System.Linq;
//using System.Web.Http;

//namespace Mozu.SiteBuilder.IntegrationTests.Handlers
//{
//    [TestFixture]
//    public class ViewRestrictionHandlerTests
//    {
//        [Test, Ignore]
//        public void handler_is_in_pipeline()
//        {
//            var config = new HttpConfiguration();
//            new Mozu.SiteBuilder.UX.Configuration.BootStrapperUX().Bootstrap(config);
//            config.MessageHandlers.Any(x => x.GetType() == typeof(ViewRestrictionHandler)).ShouldBeTrue();
//        }
//    }
//}
