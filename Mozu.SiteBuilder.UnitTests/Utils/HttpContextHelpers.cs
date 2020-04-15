using System;
using Autofac;
using Autofac.Core.Registration;
using Microsoft.AspNetCore.Http;

namespace Mozu.SiteBuilder.UnitTests.Utils
{
    public static class HttpContextHelpers
    {
        public static HttpContext CreateWithResolver(IServiceProvider resolver)
        {
            var ctx = new DefaultHttpContext()
            {
                RequestServices = resolver
            };
            return ctx;
        }

        public static HttpContext CreateFromContainer(ILifetimeScope container)
        {
            var resolver = new LifetimeScopeProxy(container);
            var message = CreateWithResolver(resolver);
            return message;
        }
    }

    public class LifetimeScopeProxy : IServiceProvider
    {
        private readonly ILifetimeScope _resolver;

        public LifetimeScopeProxy(ILifetimeScope resolver)
        {
            _resolver = resolver;
        }

        public object GetService(Type serviceType)
        {
            return _resolver.Resolve(serviceType);
        }
    }
}
