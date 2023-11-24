using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using MongoDB.Driver;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    
    public interface ICustomStartupMongoClient
    {
        IMongoClient MongoClient { get; }
    }
    public class CustomStartupMongoClient : ICustomStartupMongoClient
    {
        public IMongoClient MongoClient { get; }

        public CustomStartupMongoClient(ISettings settings)
        {
            if (settings != null)
            {
                var conString = settings.ConnectionStrings("MongoDB");
                MongoClient = new MongoClient(conString);
            }
        }
    }
    
    public class CustomStartupMiddleware : IMiddleware
    {
        private readonly HealthCheckService _healthCheckService;
        private readonly HealthCheckMiddleware _healthCheckMiddleware;
        private readonly IMongoClient _mongoClient;
        private const string DatabaseName = "MozuJobs";
        private const string CollectionName = "StartupUrls";
        private const string NameSpaceFileName = "/var/run/secrets/kubernetes.io/serviceaccount/namespace";
        private List<StartupUrl> _startupUrls;
        private readonly HttpClient _client;

        public  CustomStartupMiddleware(
            IOptions<HealthCheckOptions> healthCheckOptions,
            HealthCheckService healthCheckService,
            ICustomStartupMongoClient mongoClient,
            IHttpClientFactory httpClientFactory) 
        {
            _healthCheckMiddleware = new HealthCheckMiddleware(Empty, healthCheckOptions, healthCheckService);
            _mongoClient = mongoClient.MongoClient;
            _client = httpClientFactory.CreateClient("startup");
        }
        Task Empty( HttpContext context)
        {
            return Task.CompletedTask;
        }

        public class StartupUrl
        {
            public string Stem
            {
                get;
                set;
            }

            public string NameSpace
            {
                get;
                set;
            }
            
            public Dictionary<string,string> Headers
            {
                get;
                set;
            }

            public Guid Id
            {
                get;
                set;
            }
        }

        public async Task<List<StartupUrl>> GetUrls()
        {
            if (_startupUrls != null)
            {
                return _startupUrls;
            }

            if (!File.Exists(NameSpaceFileName))
            {
                return _startupUrls = new List<StartupUrl>();
            }

            var nameSpace = (await File.ReadAllTextAsync(NameSpaceFileName)).Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(nameSpace))
            {
                return _startupUrls = new List<StartupUrl>();
            }
            
            var collection = _mongoClient.GetDatabase(DatabaseName).GetCollection<StartupUrl>(CollectionName);
            
            var urls = await collection.Find(x => x.NameSpace == nameSpace).ToListAsync();
            return _startupUrls = urls;
            
        }
        
        public async System.Threading.Tasks.Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            await InvokeAsyncInternal(context);
            return;
        }
        
        public async Task<bool> InvokeAsyncInternal(HttpContext httpContext)
        {
            if (httpContext == null)
            {
                throw new ArgumentNullException(nameof(httpContext));
            }

            var urls = await GetUrls();
          

            foreach (var url in urls)
            {
                var uri = Uri.TryCreate(url.Stem, UriKind.RelativeOrAbsolute, out var uriResult)
                    ? uriResult
                    : null;
                if (uri == null)
                {
                    continue;
                }

                var urlStem = uri.IsAbsoluteUri ? uri.PathAndQuery : url.Stem;
                
                var urlToRequest = $"http://{httpContext.Request.Host}{urlStem}";
                var request = new HttpRequestMessage(HttpMethod.Get, urlToRequest);
                if ( url.Headers != null)
                {
                    foreach (var header in url.Headers)
                    {
                        request.Headers.TryAddWithoutValidation(header.Key, header.Value);
                    }
                }

                var resp = await _client.SendAsync(request);
                if (!resp.IsSuccessStatusCode)
                {
                    httpContext.Response.StatusCode = (int)resp.StatusCode;
                    return true;
                }
            }
            await _healthCheckMiddleware.InvokeAsync(httpContext);
            return true;
            
        }


       
    }

    public static class CustomStartupMiddlewareExtensions
    {
        public static IEndpointConventionBuilder MapStartupChecks(this IEndpointRouteBuilder endpoints,
            string pattern)
        {
            var  csm = endpoints.CreateApplicationBuilder().ApplicationServices.GetService<CustomStartupMiddleware>();
            
            var pipeline = endpoints.CreateApplicationBuilder()
                .UseMiddleware<CustomStartupMiddleware>()
                .Build();

            return endpoints.Map(pattern, pipeline).WithDisplayName("kibo startup checks");
        }
    }
}