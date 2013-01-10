using System;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public class ServiceClientMessageHandler2 : ServiceClientMessageHandler, Mozu.Core.Api.Contracts.Client.IServiceClientMessageHandler
    {
        private static Lazy<FileSystemSettings> g_settings = new Lazy<FileSystemSettings>(() => new FileSystemSettings());

        public ServiceClientMessageHandler2(IApiContext context) : base(context, g_settings.Value )
        {
        }
    }
}
