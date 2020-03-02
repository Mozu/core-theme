using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Mozu.Core.Configuration;
using RabbitMQ.Client.Impl;

namespace Mozu.SiteBuilder.UX
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(cfgBuilder =>
                {
                    cfgBuilder.AddCloudConfiguration();
                })
                .UseStartup<Startup>();
    }
}
