using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.UX.StartupTasks;
using Microsoft.Extensions.DependencyInjection;
namespace Mozu.SiteBuilder.UX
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var host = CreateWebHostBuilder(args).Build();
            await host.RunStartupTasks();
            await host.RunAsync();
                
        }

        static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(cfgBuilder =>
                {
                    cfgBuilder.AddCloudConfiguration();
                })
                .UseStartup<Startup>();
    }
}
