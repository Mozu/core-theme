using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Caching;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Context;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.Tenant.Contracts.Clients;
using StackExchange.Redis;

namespace Mozu.SiteBuilder.UX.StartupTasks
{
    public class SiteBuilderContextWarmup : IStartupTask
    {
        private const string EnableSiteBuilderCacheWarmupConfigKey = "EnableSiteBuilderCacheWarmup";
        private const string NamespacePath = "/var/run/secrets/kubernetes.io/serviceaccount/namespace";
        private readonly ICacheProvider _cacheProvider;
        private readonly ILogger<SiteBuilderContextWarmup> _logger;
        private readonly IRedisProvider _redisProvider;
        private readonly IMozuSettings _settings;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private const string TenantRegexPattern = @"t=(?<tenant>\d+)&s=(?<site>\d+)";

        public SiteBuilderContextWarmup(
            IRedisProvider redisProvider,
            IMozuSettings settings,
            ISettings oldSettings,
            ICacheProvider cacheProvider,
            ILogger<SiteBuilderContextWarmup> logger
        )
        {
            _redisProvider = redisProvider;
            _settings = settings;
            _tenantsWebApiClient =
                new TenantsWebApiClient(new ServiceClientMessageHandler(new ApiContext(), oldSettings));
            _cacheProvider = cacheProvider;
            _logger = logger;
        }

        public async Task ExecuteAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                ExecuteAsyncImpl(cancellationToken);
            }
            catch (Exception e)
            {
                _logger.Error(e);
            }
        }

        private async Task<ClusterConfiguration> GetClusterConfiguration(IConnectionMultiplexer con)
        {
            var endPoints = con.GetEndPoints().ToArray();
            var endpointTypes = endPoints.GroupBy(g => g.GetType()).ToArray();

            //if both DNS and IP endpoints return, then assume the DNS entries are duplicates of the IP endpoints (TBD if this is always true)
            if (endpointTypes.Length > 1)
                endPoints = endpointTypes.First(e => e.Key == typeof(IPEndPoint)).ToArray();

            var server = endPoints.Select(x => con.GetServer(x))
                .FirstOrDefault(x => x.IsConnected);
            var info = await server.InfoAsync();

            if (
                info.FirstOrDefault(x => x.Key == "Server")
                    .FirstOrDefault(x => x.Key == "redis_mode").Value == "standalone" ||
                info.FirstOrDefault(x => x.Key == "Cluster")
                    .FirstOrDefault(x => x.Key == "cluster_enabled").Value == "0")
                return null;
            return await server
                .ClusterNodesAsync();
        }

        private IEnumerable<IServer> GetRedisNodes(IConnectionMultiplexer connection, bool masterOnly = true)
        {
            var endPoints = connection.GetEndPoints().ToArray();
            var endpointTypes = endPoints.GroupBy(g => g.GetType()).ToArray();

            //if both DNS and IP endpoints return, then assume the DNS entries are duplicates of the IP endpoints (TBD if this is always true)
            if (endpointTypes.Length > 1)
                endPoints = endpointTypes.First(e => e.Key == typeof(IPEndPoint)).ToArray();

            return endPoints.Select(e => connection.GetServer(e))
                .Where(s => s.IsConnected && (!masterOnly || !s.IsReplica));
        }

        private async Task<List<IServer>> GetReadNodes(IConnectionMultiplexer connection)
        {
            var endPoints = connection.GetEndPoints().ToArray();
            var endpointTypes = endPoints.GroupBy(g => g.GetType()).ToArray();

            //if both DNS and IP endpoints return, then assume the DNS entries are duplicates of the IP endpoints (TBD if this is always true)
            if (endpointTypes.Length > 1)
                endPoints = endpointTypes.First(e => e.Key == typeof(IPEndPoint)).ToArray();

            var server = endPoints.Select(e => connection.GetServer(e)).FirstOrDefault(s => s.IsConnected);

            var nodes = await GetClusterConfiguration(connection);
            List<EndPoint> readNodes = null;
            if (nodes == null)
            {
                var allServers = GetRedisNodes(connection, false).ToList();
                readNodes = allServers.Where(x => x.IsReplica)
                    .Select(x => x.EndPoint).ToList();
                if (readNodes.Count == 0) readNodes = allServers.Select(x => x.EndPoint).ToList();
            }
            else
            {
                readNodes = (from node in nodes.Nodes.Where(x => x.Parent == null)
                    let rep = node.Children?.FirstOrDefault()
                    select rep?.EndPoint ?? node.EndPoint).ToList();
            }

            return readNodes.Select(ep => connection.GetServer(ep)).ToList();
        }

        public virtual string GetCurrentNameSpace()
        {
            var file = new FileInfo(NamespacePath);
            if (file.Exists) return File.ReadAllText(NamespacePath).Trim();

            return null;
        }

        public virtual async Task<List<Tenant.Contracts.Tenant>> GetNamespaceTenants()
        {
            var ns = GetCurrentNameSpace();
            if (ns == null) return null;

            var sc = _settings.CoreSettings.ScaleUnitId;
            var resp = (await _tenantsWebApiClient.GetTenants(
                    pageSize: 200,
                    filter: $"scaleunit eq {sc} and status eq active and isdevtenant eq false"))
                .ReadAsSync();

            if (resp.Items == null) return null;

            var items = resp.Items.Where(x => string.Equals(x.KubeNamespace, ns, StringComparison.OrdinalIgnoreCase))
                .ToList();

            //returning null if > 10 as the namespace contains too many tenants.  Doesnt make sense to load all into memory  
            return items.Count > 10 ? null : items;
        }

        public async Task ExecuteAsyncImpl(CancellationToken cancellationToken = default)
        {
            var enabled = _settings.AppSettings.GetValue(EnableSiteBuilderCacheWarmupConfigKey, true);
            if (!enabled)
            {
                _logger.Info("Skipping SiteBuilderContextWarmup: Disabled");
                return;
            }

            var tenants = await GetNamespaceTenants();
            if (tenants == null || tenants.Count == 0)
            {
                _logger.Info("Skipping SiteBuilderContextWarmup: No tenants found to warm");
                return;
            }

            var con = _redisProvider.Get();

            var cacheKeys = await GetCacheKeysToFetch(cancellationToken, con, tenants);

            if (cacheKeys.Count == 0)
            {
                _logger.Info("Skipping SiteBuilderContextWarmup: No Cache Keys found to warm");
                return;
            }

            foreach (var cacheKey in cacheKeys)
            {
                var m = Regex.Match(cacheKey, TenantRegexPattern);
                if (!m.Success) continue;
                if (!int.TryParse(m.Groups["tenant"].Value, out var tenantId)) continue;
                if (!int.TryParse(m.Groups["site"].Value, out var site)) continue;

                var apiContext = new ApiContext
                    { TenantId = tenantId, SiteId = site, DataViewMode = DataViewModeType.Live };
                var redirectCacheKey = SitebuilderContextCacheRepository.GetRedirectsCacheKey(apiContext);
                var siteBuilderContextCache =
                    _cacheProvider.GetCache(SitebuilderContextCacheRepository.CacheName, apiContext);
                var redirectCache =
                    _cacheProvider.GetCache(SitebuilderContextCacheRepository.RedirectCacheName, apiContext);
                var subCacheKey = cacheKey.Substring(cacheKey.IndexOf("}") + 1);
                var siteBuilderContext =
                    (await siteBuilderContextCache.GetAsync<SiteBuilderContextData>(subCacheKey,
                        token: cancellationToken))?.Item;
                if (siteBuilderContext == null) continue;

                var redirects =
                    (await redirectCache.GetAsync<List<RedirectEntry>>(redirectCacheKey,
                        token: cancellationToken))?.Item;
                siteBuilderContext.Redirects = redirects;
                _logger.Info($"warmed cache item  {cacheKey}");
            }
        }

        private async Task<List<string>> GetCacheKeysToFetch(CancellationToken cancellationToken,
            IConnectionMultiplexer con, List<Tenant.Contracts.Tenant> tenants)
        {
            var regex = new Regex(string.Join("|", tenants.Select(_ => $"t={_.Id}&")));
            var nodes = await GetReadNodes(con);
            var prefix = SitebuilderContextCacheRepository.PrimaryCacheKeyPrefix;
            var cacheKeys = new List<string>();
            foreach (var node in nodes)
            await foreach (var key in node.KeysAsync(pattern: prefix + "*").WithCancellation(cancellationToken))
            {
                //skip the category tree keys for now.  may add back in later rev
                if (key.ToString().Contains("categories")) continue;

                if (regex.IsMatch(key)) cacheKeys.Add(key);
            }

            return cacheKeys;
        }
    }

    public static class StartupExtensions
    {
        public static async Task<IWebHost> RunStartupTasks(this IWebHost host)
        {
            var startupTasks = host.Services.GetService<IEnumerable<IStartupTask>>();
            if (startupTasks == null) return host;
            var cancelAfter = new CancellationTokenSource(60000).Token;
            foreach (var startupTask in startupTasks) await startupTask.ExecuteAsync(cancelAfter);

            return host;
        }

        public static IServiceCollection AddSiteBuilderContextWarmup(this IServiceCollection services)
        {
            return services.AddTransient<IStartupTask, SiteBuilderContextWarmup>();
        }
    }


    public interface IStartupTask
    {
        Task ExecuteAsync(CancellationToken cancellationToken = default);
    }
}