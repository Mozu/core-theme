using Autofac;
using Autofac.Core.Registration;
using System.Net.Http;
using System.Web.Http.Dependencies;

namespace Mozu.SiteBuilder.UnitTests.Utils
{
    public static class HttpRequestMessageHelpers
    {
        public static HttpRequestMessage CreateWithResolver(IDependencyResolver resolver )
        {
            var message = new HttpRequestMessage();
            message.SetConfiguration(new System.Web.Http.HttpConfiguration() { DependencyResolver = resolver });
            return message;
        }

        public static HttpRequestMessage CreateFromContainer(ILifetimeScope container)
        {
            var resolver = new Autofac.Integration.WebApi.AutofacWebApiDependencyResolver(container);
            var message = CreateWithResolver(resolver);
            return message;
        }
    }
}
