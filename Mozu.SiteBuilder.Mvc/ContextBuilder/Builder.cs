
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.Order.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api.Client;
using Mozu.Core;
using System.Threading;
using Mozu.Core.Api.Contracts.Client;
using System.Net.Http;
using System.IO;
using Newtonsoft.Json;
using Mozu.Core.Logging;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;
using Mozu.SiteBuilder.Mvc.Themes;
using System.Text.RegularExpressions;
using Mozu.Core.Caching;
using Mozu.Location.Contracts;
using MongoDB.Driver;
using Mozu.Core.Settings;
using System.Security.Cryptography;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Extensions;
using SBCategory = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category;
using Mozu.Core.EnsureThat;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.ProductRuntime.Contracts;
using Microsoft.AspNetCore.Http;

namespace Mozu.SiteBuilder.Mvc.Context
{
    public interface ISitebuilderContextCacheRepository
    {
        Task<List<RedirectEntry>> GetRedirectsAsync(ISiteBuilderContextData ctxData, IApiContext apiContext);
        Task PutAsync(List<RedirectEntry> redirects, ISiteBuilderContextData ctxData, IApiContext apiContext);
        Task<ISiteBuilderContextData> GetAsync(IApiContext apiContext );
        Task PutAsync(ISiteBuilderContextData item, IApiContext apiContext);
       // Task Invalidate(int tenantId, int masterCatalogId, int catalogId, int? siteId, DataViewModeType dataViewMode);
        Task Invalidate(int tenantId, int value1, int value2, int? siteId, string localeCode, string currencyCode, DataViewModeType dataViewModeType);
        Task<List<SBCategory>> GetCategoryAsync(IApiContext _context);
        Task PutCategoryAsync(List<SBCategory> catTree, IApiContext _context);
    }
    public class SitebuilderContextCacheRepository : ISitebuilderContextCacheRepository
    {
        private readonly Mozu.Core.Caching.ICacheProvider _cacheProvider;
        private readonly Core.Mongo.MongoDatabaseProvider _mdbProvider;
        private bool _ensureIndexes = false;
        private Task _ensureIndexTask;
        private readonly Timer _backgroundBuildTimer;
        private readonly Timer _backgroundJobCleanTimer;
        private readonly ISettings _settings;
        private readonly string _machineId;
        private readonly IServiceProvider _globalScope;
        public const string CacheName = "Sitebuilder.ContextBuilder.Compressed";
        public const string RedirectCacheName = "Sitebuilder.Redirects.Compressed";
        private const int TimerInterval = 15 * 1000;
        public const string CacheVersion = "c10";
        private const string EnableCleanJobConfigKey = "sitebuilder:context.enableCleanJob";
        private const string BuildIntervalConfigKey = "sitebuilder:context.buildinterval";
        private const string CleanJobIntervalConfigKey = "sitebuilder:context.cleaninterval";
        private readonly System.Collections.Concurrent.ConcurrentDictionary<int, DateTime> _requestedSites = new System.Collections.Concurrent.ConcurrentDictionary<int, DateTime>();
        private readonly ILogger _logger;
        public SitebuilderContextCacheRepository(ICacheProvider cacheProvider, Mozu.Core.Settings.ISettings settings, IServiceProvider globalScope)
        {
            _mdbProvider = new Core.Mongo.MongoDatabaseProvider("CacheDB", "Cache", settings);
            _ensureIndexTask = EnsureIndexes();
            _cacheProvider = cacheProvider;
            _machineId = System.Environment.MachineName + "-" + Guid.NewGuid().ToString();
            _settings = settings;
            _logger = LoggingService.LoggerFor<SitebuilderContextCacheRepository>();

          
            if( settings.AppSettingsAsNullableBool("sitebuilder.enableContextCacheBackgroundBuilds").GetValueOrDefault(true))
            {
                _backgroundBuildTimer = new Timer(BuildCallback, null, TimerInterval, Timeout.Infinite);
            }
            
            bool isSandBox = _settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1;
            if ( _settings.AppSettingsAsNullableBool(EnableCleanJobConfigKey).GetValueOrDefault(isSandBox))
            {
                _backgroundJobCleanTimer = new Timer(CleanJobQueuCallback, null, GetNextCleanInterval(), Timeout.Infinite);
            }
            
            _globalScope = globalScope; 
        }

        private TimeSpan GetNextBuildTime()
        {
            int intervalInMinutes = _settings.AppSettingsAsNullableInt(BuildIntervalConfigKey).GetValueOrDefault(10);
            var now = DateTime.Now;
            var modMins = now.Minute % intervalInMinutes;
            if (modMins == 0)
            {
                modMins = intervalInMinutes;
            }

            var secs = DateTime.Now.Second % 60;
            return new TimeSpan(0, 0, modMins, now.Second % 60, now.Millisecond % 1000);
        }

        private int GetNextCleanInterval()
        {
            return _settings.AppSettingsAsNullableInt(CleanJobIntervalConfigKey).GetValueOrDefault(120) * 60 * 1000;
        }


        private void BuildCallback(object state)
        {
            try
            {
                Task.Run(DoBuilds).Wait();
            }
            catch( Exception ex)
            {
                _logger.Error(ex);
            }
            _backgroundBuildTimer.Change(TimerInterval, Timeout.Infinite);

        }

        private void CleanJobQueuCallback(object state)
        {
            try
            {
                Task.Run(CleanOldJobs).Wait();
            }
            catch (Exception ex)
            {
                _logger.Error(ex);
            }

            _backgroundJobCleanTimer.Change(GetNextCleanInterval(), Timeout.Infinite);
        }


        private async Task DoBuilds ()
        {
            var lastWorkId = default(string);
            while ( true)
            {
                var work = await GetWork().ConfigureAwait(false);

                if (work == null || work.Id == lastWorkId)
                {
                    return;
                }                

                var apiContext = ToApiContext(work);

                if (work.CategoriesOnly)
                {
                    var catList = await ProcessCategoryListWork(work, apiContext).ConfigureAwait(false);
                    await ((ISitebuilderContextCacheRepository)this).PutCategoryAsync(catList, apiContext).ConfigureAwait(false);
                }
                else
                {
                    var ctxData = await ProcessCtxWork(work, apiContext).ConfigureAwait(false);
                    await ((ISitebuilderContextCacheRepository)this).PutAsync(ctxData, apiContext).ConfigureAwait(false);
                }
                lastWorkId = work.Id;
            }
        }

        private SiteBuilderApiContext ToApiContext(SiteBuilderContextWorkItem work)
        {
            var newContext = new SiteBuilderApiContext();
            newContext.TenantId = work.TenantId;
            newContext.MasterCatalogId = work.MasterCatalogId;
            newContext.CatalogId = work.CatalogId;
            newContext.MozuInstanceId = work.InstanceId;
            newContext.SiteId = work.SiteId;
            newContext.PriceListCode = work.PriceList;
            newContext.LocaleCode = work.LocaleCode;
            newContext.CurrencyCode = work.CurrencyCode;
            newContext.DataViewMode = DataViewModeType.Live;
            return newContext;
        }

        private async Task<ISiteBuilderContextData> ProcessCtxWork ( SiteBuilderContextWorkItem work , SiteBuilderApiContext apiContext)
        {
            using (var scope = _globalScope.CreateScope())
            {
                apiContext.UserClaims = null;
                var httpContext = new DefaultHttpContext();
                httpContext.Request.Scheme = "http";
                httpContext.Request.Host = new HostString("localhost");
                httpContext.Request.PathBase = "";
                httpContext.Request.Path = "/";

                scope.ServiceProvider.Resolve<IHttpContextAccessor>().HttpContext = httpContext;
                scope.ServiceProvider.Resolve<IApiContextAccessor>().ApiContext = apiContext;
                var serviceAggregator = scope.ServiceProvider.Resolve<IContextServiceAggregator>();
                var existing = await ((ISitebuilderContextCacheRepository)this).GetAsync(apiContext).ConfigureAwait(false);
                return await serviceAggregator.Aggregate(existing).ConfigureAwait(false);
            }
        }

        private async Task<List<SBCategory>> ProcessCategoryListWork(SiteBuilderContextWorkItem work, SiteBuilderApiContext apiContext)
        {
            using var scope = _globalScope.CreateScope();
            apiContext.UserClaims = null;
            scope.ServiceProvider.Resolve<IApiContextAccessor>().ApiContext = apiContext;
            var serviceAggregator = scope.ServiceProvider.Resolve<IContextServiceAggregator>();
            return await serviceAggregator.BuildCategoryTree().ConfigureAwait(false);
        }

        private async Task CleanOldJobs()
        {
            var fBuilder = Builders<SiteBuilderContextWorkItem>.Filter;
            var filter = fBuilder.Gt(x => x.TimeStamp, DateTime.UtcNow.AddHours(-2));
            var col = GetCollection();
            var cursor = await (col.FindAsync(filter).ConfigureAwait(false));
            var workItems = await cursor.ToListAsync().ConfigureAwait(false);

            filter = fBuilder.Or(workItems.Select(x => fBuilder.Eq(_ => _.Id, x.Id)));
            await col.DeleteManyAsync(filter).ConfigureAwait(false);
        
            foreach ( var work in workItems)
            {
                var cache = _cacheProvider.GetCache(CacheName, this.ToApiContext(work));
                var tags = GetTags(work.TenantId, work.MasterCatalogId, work.CatalogId, work.SiteId, DataViewModeType.Live);
                await cache.InvalidateItemsByTagsAsync(tags, tagQueryType:TagQueryType.Any).ConfigureAwait(false);
            }
        }

        private Task<SiteBuilderContextWorkItem> GetWork()
        {
            var fiveMinsAgo = DateTime.Now.AddMinutes(-10);
            var sites = _requestedSites.Where(_ => _.Value > fiveMinsAgo).Select(_ => _.Key).ToArray();
            var fBuilder = Builders<SiteBuilderContextWorkItem>.Filter;
            var uBuilder = Builders<SiteBuilderContextWorkItem>.Update;
            var sBuilder = Builders<SiteBuilderContextWorkItem>.Sort;

            var newWork = fBuilder.And(
                fBuilder.Lt(x => x.SchedualedBuildTime, DateTime.UtcNow),
                 fBuilder.Eq(x => x.Worker, null),
                 fBuilder.In(x => x.SiteId, sites),
                 fBuilder.Eq(x => x.Version, SitebuilderContextCacheRepository.CacheVersion));

            var erroredWork = fBuilder.And(
                fBuilder.Lt(x => x.WorkStarted, DateTime.UtcNow.AddMinutes(-4)),
                fBuilder.In(x => x.SiteId, sites)
                );

            var filter = fBuilder.Or(
              newWork, erroredWork
                );

            var sort = sBuilder.Descending(x => x.TimeStamp);

            var update = uBuilder.Set(x => x.Worker, _machineId)
                .Set(x => x.WorkStarted, DateTime.UtcNow);

            var col = GetCollection();
            
            return col.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<SiteBuilderContextWorkItem, SiteBuilderContextWorkItem>()
                {
                    ReturnDocument = ReturnDocument.Before,
                    Sort= sort,
                    IsUpsert = false
                });
        }

        private async Task EnsureIndexes()
        {
            if (!_ensureIndexes)
            {
                var colleciton = GetCollection();
                const string newWorkIdxName = "newWork_withVer_Idx";
                const string newWorkIdxName2 = "newWork_withVer_site_Idx";
                const string oldWorkIxdName = "oldWork_Ixd";
                var builder = Builders<SiteBuilderContextWorkItem>.IndexKeys;
                using (var cursor = await colleciton.Indexes.ListAsync().ConfigureAwait(false))
                {
                    var indexes = await cursor.ToListAsync().ConfigureAwait(false);
                    await EnsureIndex(colleciton, indexes, newWorkIdxName2,
                        builder.Ascending(x => x.Version)
                        .Ascending(x => x.SchedualedBuildTime)
                        .Ascending(x => x.Worker)
                        .Ascending(x => x.SiteId));
                    await EnsureIndex(colleciton, indexes, newWorkIdxName, builder.Ascending(x => x.Version).Ascending(x => x.SchedualedBuildTime).Ascending(x => x.Worker));
                    await EnsureIndex(colleciton, indexes, oldWorkIxdName, builder.Ascending(x => x.TimeStamp));
                }
                _ensureIndexes = true;
            }
        }

        private async Task EnsureIndex(IMongoCollection<SiteBuilderContextWorkItem> colleciton,  
            List<MongoDB.Bson.BsonDocument> indexes , 
            string indexName ,
            IndexKeysDefinition<SiteBuilderContextWorkItem> keys)
        {
            if (indexes.All(index => index["name"] != indexName))
            {
                try
                {
                    var model = new CreateIndexModel<SiteBuilderContextWorkItem>(keys, new CreateIndexOptions()
                    {
                        Background = true,
                        Name = indexName,
                    });
                    _ = await colleciton.Indexes.CreateOneAsync(model).ConfigureAwait(false);
                }
                catch (Exception e)
                {
                    _logger.Warn(e.ToString());
                }
            }
        }

        private string GetContextCacheKey(IApiContext apiContext)
        {
            var dvm = apiContext.DataViewMode == DataViewModeType.Pending ? 
                DataViewModeType.Pending : 
                DataViewModeType.Live;
            return $"t={apiContext.TenantId}&s={apiContext.SiteId}&l={apiContext.LocaleCode}&c={apiContext.CurrencyCode}&dvm={dvm}&v={CacheVersion}";
        }

        private string GetPlCategoryListCacheKey(IApiContext apiContext)
        {
            var dvm = apiContext.DataViewMode == DataViewModeType.Pending ?
                DataViewModeType.Pending :
                DataViewModeType.Live;
            return $"categories&t={apiContext.TenantId}&s={apiContext.SiteId}&l={apiContext.LocaleCode}&c={apiContext.CurrencyCode}&pl={apiContext.PriceListCode}&dvm={dvm}&v={CacheVersion}";
            
        }


        private IMongoCollection<SiteBuilderContextWorkItem> GetCollection()
        {
            return _mdbProvider.MongoDataBase.GetCollection<SiteBuilderContextWorkItem>("SiteBuilderContextWorkItems");
        }
        async Task<ISiteBuilderContextData> ISitebuilderContextCacheRepository.GetAsync(IApiContext apiContext)
        {
            RecordVisit(apiContext);
            var cacheKey = this.GetContextCacheKey(apiContext);
            var sbc = await _cacheProvider.GetCache(CacheName, apiContext)
                .GetAsync<SiteBuilderContextData>(cacheKey)
                .ContinueWith(x => x.Result?.Item)
                .ConfigureAwait(false);

            if (sbc?.RedirectUpdateDate != null && sbc.RuntimeRedirects == null)
            {
                sbc.Redirects = await GetRedirectsAsync(sbc, apiContext).ConfigureAwait(false);
            }
            
            return sbc;
        }

        private void RecordVisit (IApiContext apicontext)
        {
            _requestedSites[apicontext.SiteId.GetValueOrDefault(-1)] = DateTime.Now;
        }

        async Task ISitebuilderContextCacheRepository.Invalidate(int tenantId, int masterCatalogId, int catalogId, int? siteId, string localeCode, string currencyCode, DataViewModeType dataViewMode)
        {
            //clear staging...
            var tags = GetTags(tenantId, masterCatalogId, catalogId, siteId, DataViewModeType.Pending).ToList();
            var apiContext = new Mozu.Core.ApiContext() {
                TenantId = tenantId,
                MasterCatalogId = masterCatalogId,
                CatalogId = catalogId,
                SiteId = siteId
            };
            await _cacheProvider.GetCache(CacheName, apiContext).InvalidateItemsByTagsAsync(tags, tagQueryType:TagQueryType.Any).ConfigureAwait(false);
            if ( dataViewMode == DataViewModeType.Pending)
            {
                return;
            }
            var fBuilder = Builders<SiteBuilderContextWorkItem>.Filter;
            var uBuilder = Builders<SiteBuilderContextWorkItem>.Update;
            var filterParts = new List<FilterDefinition<SiteBuilderContextWorkItem>>{
                fBuilder.Eq(x=> x.TenantId, tenantId ),
                fBuilder.Eq(x=> x.MasterCatalogId , masterCatalogId),
                fBuilder.Eq(x => x.CatalogId, catalogId),
                fBuilder.Eq(x => x.Worker, null),
                fBuilder.Ne (x=> x.SchedualedBuildTime  , DateTime.MinValue )

            };
            if (siteId.HasValue)
            {
                filterParts.Add(fBuilder.Eq(x => x.SiteId, siteId.Value));
            }
            var filter = fBuilder.And(filterParts);


            var update = uBuilder.Set(x => x.SchedualedBuildTime, DateTime.MinValue);

            var col = GetCollection();

            var res = await col.UpdateManyAsync(filter, update, new UpdateOptions() { IsUpsert = false }).ConfigureAwait(false);
            
        }

        async Task ISitebuilderContextCacheRepository.PutAsync(ISiteBuilderContextData item, IApiContext apiContext)
        {
            var cacheKey = GetContextCacheKey(apiContext);
            var existing = await ((ISitebuilderContextCacheRepository)this).GetAsync(apiContext).ConfigureAwait(false);
            if (existing?.Hash != item.Hash)
            {
                var tags = GetTags(apiContext.TenantId, apiContext.MasterCatalogId.GetValueOrDefault(-1), apiContext.CatalogId.GetValueOrDefault(-1), apiContext.SiteId, apiContext.DataViewMode);
                var isSb = _settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1;
                var policy = new CachePolicy()
                {
                    AbsoluteExpiration = isSb ? DateTimeOffset.UtcNow.AddMinutes(5) : DateTimeOffset.UtcNow.AddDays(2)
                };

                await _cacheProvider.GetCache(CacheName, apiContext).PutAsync(
                    item: (SiteBuilderContextData)item, 
                    key: cacheKey , 
                    tags: tags,
                    policy:policy,
                    eTag: item.Hash.ToLower()
                    ).ConfigureAwait(false);
            }
            await UpsertWorkQueue(apiContext, includePriceList:false).ConfigureAwait(false);
        }

        private List<string> GetTags ( int tenantId, int masterCatalogId, int catalogId, int? siteId, DataViewModeType dvm )
        {
            var isPending = dvm == DataViewModeType.Pending;
            var ret= new List<string>()
            {
                $"t:{tenantId}&mc={masterCatalogId}&c={catalogId}&isPending={isPending}&v={CacheVersion}"
            };
            if ( siteId.HasValue)
            {
                ret.Add($"t:{tenantId}&mc={masterCatalogId}&c={catalogId}&s={siteId}&isPending={isPending}&v={CacheVersion}");
            }
            return ret;
        }

        private async Task UpsertWorkQueue (IApiContext apiContext, bool includePriceList)
        {
            
            if (apiContext.DataViewMode  == DataViewModeType.Pending )
            {
                return;
            }

            var schedualedBuildTime = DateTime.Now.Add(GetNextBuildTime());
            var fBuilder = Builders<SiteBuilderContextWorkItem>.Filter;
            var uBuilder = Builders<SiteBuilderContextWorkItem>.Update;
            var workItem = new SiteBuilderContextWorkItem()
            {
                TenantId = apiContext.TenantId,
                MasterCatalogId = apiContext.MasterCatalogId.Value,
                CatalogId = apiContext.CatalogId.Value,
                InstanceId = apiContext.MozuInstanceId ,
                SiteId = apiContext.SiteId.Value,
                LocaleCode = apiContext.LocaleCode,
                CurrencyCode = apiContext.CurrencyCode,
                PriceList = apiContext.PriceListCode,
                SchedualedBuildTime = schedualedBuildTime,
                TimeStamp = DateTime.UtcNow
            };

            var filter = fBuilder.Eq(x => x.Id, workItem.Id);
            
            var col = GetCollection();
            await col.ReplaceOneAsync(filter, workItem, new UpdateOptions() { IsUpsert = true }).ConfigureAwait(false);
            

        }

        private string GetRedirectsCacheKey(IApiContext apiContext )
        {
            return apiContext.TenantId + "|" + apiContext.SiteId + (apiContext.DataViewMode == DataViewModeType.Pending ? "p" : "l");
        }
        public  Task<List<RedirectEntry>> GetRedirectsAsync(ISiteBuilderContextData ctxData, IApiContext apiContext)
        {
            var cacheKey = GetRedirectsCacheKey(apiContext);
            return _cacheProvider.GetCache(RedirectCacheName, apiContext)
                .GetAsync<List<RedirectEntry>>(cacheKey,
                    new eTagConstraint()
                    {
                        Condition = eTagConstraint.eTagCondition.GetIfMatch,
                        eTag = ctxData.RedirectUpdateDate.Value.ToString("o").ToLower()
                    }).
                    ContinueWith(x => x.Result?.Item);
                
        }

        public Task PutAsync(List<RedirectEntry> redirects, ISiteBuilderContextData ctxData, IApiContext apiContext)
        {
            var cacheKey = GetRedirectsCacheKey(apiContext);
            var isSb = _settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1;

            var policy = new CachePolicy()
            {
                AbsoluteExpiration = isSb ? DateTimeOffset.UtcNow.AddMinutes(5) : DateTimeOffset.UtcNow.AddDays(2)
            };

            return _cacheProvider.GetCache(RedirectCacheName, apiContext)
                .PutAsync(
                    item:redirects,
                    key: cacheKey ,
                    tags:new List<string>(),
                    policy:policy,
                    eTag:ctxData.RedirectUpdateDate.Value.ToString("o").ToLower()
                    );
        }

        

        async Task<List<SBCategory>> ISitebuilderContextCacheRepository.GetCategoryAsync(IApiContext apiContext)
        {
            var cacheKey = this.GetPlCategoryListCacheKey(apiContext) ;
            return await _cacheProvider.GetCache(CacheName, apiContext)
                .GetAsync<List<SBCategory>>(cacheKey)
                .ContinueWith(x => x.Result?.Item)
                .ConfigureAwait(false);
           
        }
        async Task ISitebuilderContextCacheRepository.PutCategoryAsync(List<SBCategory> catTree, IApiContext apiContext)
        {
            var cacheKey = GetPlCategoryListCacheKey(apiContext);
            var existing = await ((ISitebuilderContextCacheRepository)this).GetCategoryAsync(apiContext).ConfigureAwait(false);
            var existingHash = CatagoryTreeHasher.ComputerHash(existing);
            var newHash = CatagoryTreeHasher.ComputerHash(catTree);

            if (existingHash != newHash)
            {
                var tags = GetTags(apiContext.TenantId, apiContext.MasterCatalogId.GetValueOrDefault(-1), apiContext.CatalogId.GetValueOrDefault(-1), apiContext.SiteId, apiContext.DataViewMode);
                var isSb = _settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1;
                var policy = new CachePolicy()
                {
                    AbsoluteExpiration = isSb ? DateTimeOffset.UtcNow.AddMinutes(5) : DateTimeOffset.UtcNow.AddDays(2)
                };

                await _cacheProvider.GetCache(CacheName, apiContext).PutAsync(
                    item: catTree,
                    key: cacheKey,
                    tags: tags,
                    policy: policy,
                    eTag: newHash.ToLower()
                    ).ConfigureAwait(false);
            }
            await UpsertWorkQueue(apiContext, includePriceList: true)
                .ConfigureAwait(false);
        }

        private static class CatagoryTreeHasher
        {
            private static HashSet<SBCategory> FlattenCatTree(List<SBCategory> root)
            {
                var categories = new HashSet<SBCategory>();
                var treeStack =  new Stack<SBCategory>(root);

                while (treeStack.Any())
                {
                    var category = treeStack.Pop();
                    if (category == null)
                    {
                        continue;
                    }
                    categories.Add(category);
                    if (category.ChildrenCategories?.Count > 0)
                    {
                        category.ChildrenCategories.ForEach(_ =>
                        {
                            _.ParentCategory = category;
                            treeStack.Push(_);
                        });
                    }

                }

                return categories;

            }
            public static string ComputerHash(List<SBCategory> root)
            {
                if (root == null)
                {
                    return string.Empty;
                }
                using (var md5 = MD5.Create())
                using (var stream = new MemoryStream())
                using (var w = new BinaryWriter(stream))
                {

                    FlattenCatTree(root).OrderBy(_ => _.CategoryId).ToList()?.ForEach(_ =>
                    {
                        w.Write(_.CategoryId);
                        w.Write(_.IsDisplayed);
                        w.Write(_.Sequence.GetValueOrDefault(-1));
                        w.Write(_.ParentCategoryId.GetValueOrDefault(-1));
                        w.Write(_.Count > 0 ? 1 : 0);
                    });

                    w.Flush();
                    stream.Position = 0;
                    var hash = md5.ComputeHash(stream);
                    return hash.ToHexString();
                }

            }
        }
        
    }
    public class SiteBuilderContextWorkItem
    {
        [MongoDB.Bson.Serialization.Attributes.BsonId]
        public string Id
        {
            get => $"{TenantId}&{SiteId}&{PriceList}&{LocaleCode}&{CurrencyCode}&v={SitebuilderContextCacheRepository.CacheVersion}";
            set {;}
        }
        public int TenantId { get; set; }
        public int MasterCatalogId { get; set; }
        public int CatalogId { get; set; }

        public string InstanceId { get; set; }

        public int SiteId { get; set; }

        public string PriceList { get; set; }

        public DateTime? WorkStarted { get; set; }
        public DateTime TimeStamp { get; set; }
        public DateTime SchedualedBuildTime { get; set; }
        public string Worker { get; set; }
        public string CurrencyCode { get;  set; }
        public string LocaleCode { get;  set; }

        public string  Version
        {
            get => SitebuilderContextCacheRepository.CacheVersion;
            set { }
        }

        public bool CategoriesOnly => !string.IsNullOrEmpty(this.PriceList);
    }
    public interface ISiteBuilderContextDataRepository
    {
        Task<ISiteBuilderContextData> GetContextData();
        //   Task<ISiteBuilderContextData> GetCategoryTree(ISiteBuilderContextData existing);
        Task<ISiteBuilderContextData> BuildContextData(ISiteBuilderContextData existing);
    }

    public class SiteBuilderContextDataRepository : ISiteBuilderContextDataRepository
    {
        private readonly IApiContext _context;
        private readonly ISitebuilderContextCacheRepository _sitebuilderContextCacheRepository;
        private readonly Lazy<IContextServiceAggregator> _contextServiceAggregator;

        public SiteBuilderContextDataRepository(
            ISitebuilderContextCacheRepository sitebuilderContextCacheRepository,
            IApiContext context,
            Lazy<IContextServiceAggregator> contextServiceAggregator)
        {
            _sitebuilderContextCacheRepository = sitebuilderContextCacheRepository;
            _context = context;
            _contextServiceAggregator = contextServiceAggregator;
        }
        
        

        public async Task<ISiteBuilderContextData> GetContextData()
        {
            var ctxData = await _sitebuilderContextCacheRepository.GetAsync(_context).ConfigureAwait(false);
          //pants

            if ( ctxData != null )
            {
                if (ctxData != null && ctxData.RedirectUpdateDate.HasValue && ctxData.RuntimeRedirects == null)
                {
                    ctxData.Redirects = await _contextServiceAggregator.Value.ProcessRedirets(ctxData).ConfigureAwait(false);
                }
                return await AppendCategoryData(ctxData);
            }
            var data = await BuildContextData(ctxData).ConfigureAwait(false);
            await _sitebuilderContextCacheRepository.PutAsync((SiteBuilderContextData)data, _context).ConfigureAwait(false);
            return await AppendCategoryData(data);
        }

        private async Task<ISiteBuilderContextData> AppendCategoryData(ISiteBuilderContextData data)
        {
            if (string.IsNullOrEmpty(this._context.PriceListCode))
            {
                return data;
            }
            try
            {
                var catTree = await _sitebuilderContextCacheRepository
                    .GetCategoryAsync(_context)
                    .ConfigureAwait(false);
                if (catTree == null)
                {
                    catTree = await BuildCategoryTree()
                        .ConfigureAwait(false);
                    await _sitebuilderContextCacheRepository
                        .PutCategoryAsync(catTree, _context)
                        .ConfigureAwait(false);
                }
                
                return new PriceListSpecificSiteBuilderContextDataProxy(data, catTree);
            }
            catch
            {
                //todo consider logging...
            }
            return data;

        }

        
        public  Task<ISiteBuilderContextData> BuildContextData(ISiteBuilderContextData existing)
        {
            return _contextServiceAggregator.Value.Aggregate(existing);
        }

        private Task<List<SBCategory>> BuildCategoryTree( )
        {
            return _contextServiceAggregator.Value.BuildCategoryTree();
        }
        
    }


    public interface ISiteBuilderContextProvider
    {
        ISiteBuilderContextData GetContextData();
  

        Task<ISiteBuilderContextData> GetContextDataAsync();
    }

    public class SiteBuilderContextProvider : ISiteBuilderContextProvider
    {
        private readonly ISiteBuilderContextDataRepository _repo;
        private Task<ISiteBuilderContextData> _dataTask;
        private ISiteBuilderContextData _data;
        private Exception _ex;
        public SiteBuilderContextProvider(ISiteBuilderContextDataRepository repo)
        {
            _repo = repo;
        }

        // Mozu.SiteBuilder.Mvc.Contexts.ISiteContext _siteContext;
        public ISiteBuilderContextData GetContextData()
        {
            if (_ex != null)
            {
                throw _ex;
            }
            return _data;
        }

        public Task<ISiteBuilderContextData> GetContextDataAsync()
        {
            return _dataTask ??= _repo.GetContextData().ContinueWith(_ =>
            {
                if (_.IsFaulted)
                {
                    _ex = _.Exception;
                }
                _data = _.Result;
                return _data;
            }) ;
        }

    }

    public static class CBExtentions
    {
        public static T WithTimeout<T>(this IServiceClientBase<T> client, int timeout = 30000) where T : IServiceClientBase<T>
        {
            try
            {
                return (T)client.CloneWithApiContext(_ => _.UserClaims = null).CloneWithConfigOptions(x =>
                {
                    x.EnableDirtyCacheRead = false;
                    x.TimeoutMilliseconds = timeout;
                });
            }
            catch
            {
                return (T)client;
            }
        }
    }

    public interface IContextServiceAggregator
    {
        Task<ISiteBuilderContextData> Aggregate(ISiteBuilderContextData existing);
        Task<List<SBCategory>> BuildCategoryTree();
        Task<List<RedirectEntry>> ProcessRedirets(ISiteBuilderContextData existing);
    }

    public class ContextServiceAggregator : IContextServiceAggregator
    {
        private readonly Mozu.Content.Contracts.Clients.IDocumentListWebApiClient _documentListWebApiClient;
        private readonly Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient _entityListsWebApiClient;
        private readonly Mozu.ProductRuntime.Contracts.Clients.IProductCategoryRuntimeWebApiClient _productCategoryRuntimeWebApiClient;
        private readonly Mozu.SiteSettings.General.Contracts.Clients.IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient _tenantsWebApiClient;
        private readonly Mozu.ProductRuntime.Contracts.Clients.ICurrencyRuntimeWebApiClient _currencyRuntimeWebApiClient;
        private readonly Mozu.ProductRuntime.Contracts.Clients.IProductSearchWebApiClient _productSearchWebApiClient;
        private readonly Mozu.Location.Contracts.Clients.ILocationSettingsWebApiClient _locationSettingsWebApiClient;
        private readonly IThemeRepository _themeRepository;
        private readonly INavigationRepository _navigationRepository;
        private readonly IApiContext _apiContext;
        private readonly ILogger _logger;
        private readonly ISitebuilderContextCacheRepository _cacheRepo;
        public ContextServiceAggregator(
            Mozu.Content.Contracts.Clients.IDocumentListWebApiClient documentListWebApiClient,
            Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient entityListsWebApiClient,
            Mozu.ProductRuntime.Contracts.Clients.IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient,
            Mozu.ProductRuntime.Contracts.Clients.IProductSearchWebApiClient productSearchWebApiClient,
            Mozu.SiteSettings.General.Contracts.Clients.IGeneralSettingsWebApiClient generalSettingsWebApiClient,
            Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient,
            Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient,
            Mozu.ProductRuntime.Contracts.Clients.ICurrencyRuntimeWebApiClient currencyRuntimeWebApiClient,
            Mozu.Location.Contracts.Clients.ILocationSettingsWebApiClient locationSettingsWebApiClient,
            INavigationRepository navigationRepository,
            IThemeRepository themeRepository,
            ISitebuilderContextCacheRepository cacheRepo,
            ILogger logger,
            IApiContext apiContext2 ,
            IApiContextAccessor apiContextAccessor

            )
        {
            _apiContext = apiContextAccessor.ApiContext;
            int defaultTimeout = 30000;
            _documentListWebApiClient = documentListWebApiClient.WithTimeout(defaultTimeout);
            _entityListsWebApiClient = entityListsWebApiClient.WithTimeout(defaultTimeout);
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient.WithTimeout(defaultTimeout);
            _generalSettingsWebApiClient = generalSettingsWebApiClient.WithTimeout(defaultTimeout);
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient.WithTimeout(defaultTimeout);
            _tenantsWebApiClient = tenantsWebApiClient.WithTimeout(defaultTimeout);
            _productSearchWebApiClient = productSearchWebApiClient.WithTimeout(defaultTimeout);
            _currencyRuntimeWebApiClient = currencyRuntimeWebApiClient.WithTimeout(defaultTimeout);
            _locationSettingsWebApiClient = locationSettingsWebApiClient.WithTimeout(defaultTimeout);
            _themeRepository = themeRepository;
            _navigationRepository = navigationRepository;
            _logger = logger;
            _cacheRepo = cacheRepo;

        }
        public async Task<ISiteBuilderContextData> Aggregate(ISiteBuilderContextData existing)
        {
            var ret = new SiteBuilderContextData()
            {
                SiteId = _apiContext.SiteId,
                Themes = new Dictionary<string, Tuple<Theme, ThemeRuntimeSettingsCollection>>(StringComparer.OrdinalIgnoreCase),
                RouteValidatorData = new Dictionary<string, Dictionary<string, object>>(StringComparer.OrdinalIgnoreCase),
                RouteMapperData = new Dictionary<string, Dictionary<string, object>>(StringComparer.OrdinalIgnoreCase),
                BuildDate = DateTime.UtcNow
            };
            

            var tasks = new List<System.Threading.Tasks.Task>();

            tasks.Add(_tenantsWebApiClient.GetTenantInternal(_apiContext.TenantId)
                .ContinueWith(GenericServiceContinuation)
                .ContinueWith(x => ret.TenantInfo = x.Result ?? existing?.TenantInfo, TaskContinuationOptions.OnlyOnRanToCompletion)
            );
            tasks.Add(_currencyRuntimeWebApiClient.GetCurrencyExchangeRates()
                .ContinueWith(GenericServiceContinuationAllow404)
                .ContinueWith(x => ret.CurrencyExchangeRates = x.Result ?? existing?.CurrencyExchangeRates, TaskContinuationOptions.OnlyOnRanToCompletion)
            );
            tasks.Add(_locationSettingsWebApiClient.GetLocationUsages()
                .ContinueWith(GenericServiceContinuationAllow404)
                .ContinueWith(x => ret.LocationUsages = x.Result ?? existing?.LocationUsages, TaskContinuationOptions.OnlyOnRanToCompletion)
            );

            tasks.Add(_productCategoryRuntimeWebApiClient.GetCategoryTree()
                .ContinueWith(GenericServiceContinuation)
                .ContinueWith(x => x.Result?.Items)
                //  .ContinueWith(MapperContinuation<List<Mozu.ProductRuntime.Contracts.Category>, List<SBCategory>>)
                .ContinueWith(ProcessCategories)
                .ContinueWith(x => ret.RootCategoryTree = x.Result ?? existing?.RootCategoryTree, TaskContinuationOptions.OnlyOnRanToCompletion)
            );

            tasks.Add(_generalSettingsWebApiClient.GetGeneralSettings()
                .ContinueWith(GenericServiceContinuation)
                .ContinueWith(x => ret.GeneralSettings = x.Result ?? existing?.GeneralSettings, TaskContinuationOptions.OnlyOnRanToCompletion)
                );

            tasks.Add(_checkoutSettingsWebApiClient.GetCheckoutSettings()
                .ContinueWith(GenericServiceContinuation)
                .ContinueWith(x => ret.CheckoutSettings = x.Result ?? existing?.CheckoutSettings, TaskContinuationOptions.OnlyOnRanToCompletion)
                );

            //tasks.Add(_documentListWebApiClient.GetTreeDocumentContent("siteSettings@mozu", "redirects.1.1")
            //   .ContinueWith(RedirectDocumentContinuation)
            //   .ContinueWith(x => ret.Redirects = x.Result ?? existing?.Redirects, TaskContinuationOptions.OnlyOnRanToCompletion)
            //   );


            tasks.Add(_documentListWebApiClient.GetTreeDocument("siteSettings@mozu", "redirects.1.1")
                .ContinueWith(GenericServiceContinuationAllow404)
                .ContinueWith(x => ret.RedirectUpdateDate  = x.Result?.ContentUpdateDate ?? x.Result?.ContentUpdateDate, TaskContinuationOptions.OnlyOnRanToCompletion)
                );



            tasks.Add(_documentListWebApiClient.GetDocuments(documentListName: "pages@mozu", 
                pageSize: 2000, 
                includeInactive: false, 
                responseFields: "items(id, name, listFQN, properties( link_title ) )",
                filter: "properties.hidden ne true"


                )
                 .ContinueWith(GenericServiceContinuationAllow404)
                 .ContinueWith(x => ret.NavWebPages = x.Result ?? existing?.NavWebPages, TaskContinuationOptions.OnlyOnRanToCompletion)
                 );

            tasks.Add(_navigationRepository.GetNavigationSetAsync()
                .ContinueWith(x => ret.NavigationSet = x.Result ?? existing?.NavigationSet, TaskContinuationOptions.OnlyOnRanToCompletion)
                );


            
            try
            {
                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                if ( _apiContext.DataViewMode == DataViewModeType.Pending )
                {
                    throw ex;
                }
                _logger.Warn(ex.ToString());
            }


            tasks.Clear();
            tasks.AddRange(GetRouteTasks(ret));
            ProcessTheme(ret, tasks, ret.GeneralSettings?.Theme, existing );
            ProcessTheme(ret, tasks, ret.GeneralSettings?.MobileTheme, existing);
            ProcessTheme(ret, tasks, ret.GeneralSettings?.TabletTheme, existing);

            await ProcessRedirets(ret, tasks).ConfigureAwait(false);

           
            if (tasks.Count > 0)
            {
                try
                {
                    await Task.WhenAll(tasks);
                }
                catch (Exception ex)
                {
                    if (_apiContext.DataViewMode == DataViewModeType.Pending)
                    {
                        throw ex;
                    }
                    _logger.Warn(ex.ToString());
                }

            }
            if (_apiContext.SiteId.HasValue)
            {
                Ensure.That(ret.CheckoutSettings, "CheckoutSettings").IsNotNull();
                Ensure.That(ret.GeneralSettings, "GeneralSettings").IsNotNull();
                Ensure.That(ret.RootCategoryTree, "CategoryTree").IsNotNull();
                Ensure.That(ret.TenantInfo, "TenantInfo").IsNotNull();
            }

            ret.Hash = Hash(ret);
            ret.ThemeHash = ThemeHash(ret);
            return ret;

        }

     

       public  async Task<List<SBCategory>> BuildCategoryTree()
        {
            return await _productCategoryRuntimeWebApiClient.GetCategoryTree()
                 .ContinueWith(GenericServiceContinuation)
                 .ContinueWith(x => x.Result?.Items)
                 .ContinueWith(ProcessCategories);
        }

       private async Task<ISiteBuilderContextData> ProcessRedirets(ISiteBuilderContextData data, List<Task> tasks)
        {
           
            if (data.RedirectUpdateDate.HasValue)
            {
                data.Redirects = await _cacheRepo.GetRedirectsAsync(data, _apiContext).ConfigureAwait(false);
                if (data.Redirects == null)
                {
                    tasks.Add(_documentListWebApiClient.GetTreeDocumentContent("siteSettings@mozu", "redirects.1.1")
                      .ContinueWith(RedirectDocumentContinuation)
                      .ContinueWith(x =>
                      {
                          data.Redirects = x.Result ?? data?.Redirects;
                          return _cacheRepo.PutAsync(data.Redirects, data, _apiContext);
                      }, TaskContinuationOptions.OnlyOnRanToCompletion)
                      .Unwrap()
                       );
                }


            }
            return data;
        }

        public async Task<List<RedirectEntry>> ProcessRedirets(ISiteBuilderContextData data )
        {
            List<Task> tasks = new List<Task>();
            await ProcessRedirets(data, tasks).ConfigureAwait(false);
            if (tasks.Count > 0)
            {
                await Task.WhenAll(tasks).ConfigureAwait(false);
            }
            return data.Redirects;
        }
        
        private void ProcessTheme(ISiteBuilderContextData ret, List<Task> tasks, string themeId, ISiteBuilderContextData existing)
        {
            if (!string.IsNullOrEmpty(themeId))
            {
                var tid = ToThemeSelection(themeId);
                if (!string.IsNullOrEmpty(tid?.Id) && !ret.Themes.ContainsKey(tid.Id))
                {
                    ret.Themes[tid.Id]  = existing?.Themes?.ContainsKey(tid.Id) == true ? existing?.Themes?[tid.Id] : new Tuple<Theme, ThemeRuntimeSettingsCollection>(null, null);
                    tasks.Add(Task.Run(() => _themeRepository.GetTheme(tid))
                    .ContinueWith(GetThemeSettings)
                    .Unwrap()
                    .ContinueWith(x => ret.Themes[tid.Id] = x.Result, TaskContinuationOptions.OnlyOnRanToCompletion)
                    );

                }
            }
        }
        public static string ThemeHash (ISiteBuilderContextData data)
        {
            using (var md5 = MD5.Create())
            using (var stream = new MemoryStream())
            using (var w = new BinaryWriter(stream))
            {
                
                w.Write(data.CheckoutSettings?.CustomerCheckoutSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                w.Write(data.CheckoutSettings?.OrderProcessingSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                w.Write(data.CheckoutSettings?.PaymentSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                w.Write(data.GeneralSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                data.LocationUsages?.Items?.OrderBy(x => x.LocationUsageTypeCode)?.ToList().ForEach(_ =>
                {
                    w.Write(_.LocationUsageTypeCode ?? string.Empty);
                    w.Write((_.AuditInfo?.UpdateDate ?? DateTime.MinValue).Ticks);
                });
               
                

                data.Themes?.Keys?.OrderBy(_ => _)?.All(_ =>
                {
                    var tup = data.Themes[_];
                    w.Write(tup.Item1?.Id ?? string.Empty);
                    w.Write(tup.Item1?.Hash ?? string.Empty);
                    w.Write(tup.Item2?.TimeStamp.Ticks ?? 0);
                    return true;
                });

                w.Write(data.TenantInfo?.UpdateDate.Ticks ?? 0);
                w.Flush();
                w.Flush();
                stream.Position = 0;
                var hash = md5.ComputeHash(stream);
                return hash.ToHexString();
            }
        }
        public static string Hash (ISiteBuilderContextData data )
        {
            using (var md5 = MD5.Create())
            using (var stream = new MemoryStream())
            using ( var w = new BinaryWriter(stream))
            {
                data.GetFlatCategoryList()?.OrderBy(_ => _.CategoryId).ToList()?.ForEach(_ =>
                {
                    w.Write(_.CategoryId);
                    w.Write(_.IsDisplayed);
                    w.Write(_.Sequence.GetValueOrDefault(-1));
                    w.Write(_.ParentCategoryId.GetValueOrDefault(-1));
                });

                w.Write(data.CheckoutSettings?.CustomerCheckoutSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                w.Write(data.CheckoutSettings?.OrderProcessingSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                w.Write(data.CheckoutSettings?.PaymentSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0 );
                w.Write(data.GeneralSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                data.LocationUsages?.Items?.OrderBy(x=> x.LocationUsageTypeCode )?.ToList().ForEach(_ =>
                {
                    w.Write(_.LocationUsageTypeCode??string.Empty);
                    w.Write((_.AuditInfo?.UpdateDate ?? DateTime.MinValue).Ticks);
                });
                data.NavWebPages?.Items?.OrderBy(_=> _.Id)?.ToList()?.ForEach(_ =>
                {
                    w.Write(_.Id);
                    w.Write(((_.UpdateDate ?? _.InsertDate) ?? DateTime.MinValue).Ticks);
                });
                data.RouteMapperData?.OrderBy(_ => _.Key)?.ToList().ForEach(_ =>
                {
                    w.Write(_.Key);
                    _.Value?.OrderBy(x=>x.Key)?.All(entry =>
                    {
                        w.Write(entry.Key);
                        w.Write(entry.Value?.ToString());
                        return true;
                    });
                });

                w.Write(data.NavigationSet?.TimeStamp?.Ticks ?? 0);

                w.Write(data.RedirectUpdateDate?.Ticks ?? 0);

                data.RouteValidatorData?.OrderBy(_ => _.Key)?.ToList().ForEach(_ =>
                {
                    w.Write(_.Key);
                    _.Value?.OrderBy(x => x.Key)?.All(entry =>
                    {
                        w.Write(entry.Key);
                        w.Write(entry.Value?.ToString());
                        return true;
                    });
                });

                data.Themes?.Keys?.OrderBy(_ => _)?.All(_ =>
                {
                    var tup = data.Themes[_];
                    w.Write(tup.Item1?.Id ?? string.Empty);
                    w.Write(tup.Item1?.Hash ?? string.Empty);
                    w.Write(tup.Item2?.TimeStamp.Ticks ??  0);
                    return true;
                });
                
                w.Write(data.TenantInfo?.UpdateDate.Ticks??0);
                

                data.CurrencyExchangeRates?.OrderBy(_ => _.FromCurrencyCode).All(_ =>
                {
                    w.Write(_.FromCurrencyCode ?? string.Empty);
                    w.Write(_.DecimalPlaces.GetValueOrDefault(0) );
                    w.Write(_.Rate.GetValueOrDefault(0));
                    return true;
                });
                w.Flush();
                w.Flush();
                stream.Position = 0;
                var hash = md5.ComputeHash(stream);
                return hash.ToHexString();
            }
            
        }

        private Task<Tuple<Theme, ThemeRuntimeSettingsCollection>> GetThemeSettings(Task<Theme> themeTask)
        {
            if (themeTask.IsFaulted || themeTask.Result == null )
            {
                return Task<Tuple<Theme, ThemeRuntimeSettingsCollection>>.FromResult(new Tuple<Theme, ThemeRuntimeSettingsCollection>(null, null));
            }
            var theme = themeTask.Result;
            return Mozu.SiteBuilder.Mvc.Settings.ThemeSettingsRepository.CreateForContextBuilder(theme, _documentListWebApiClient)
                .ContinueWith(themeSettingsTask =>
                {
                    return new Tuple<Theme, ThemeRuntimeSettingsCollection>(theme, themeSettingsTask.Result);
                });
        }

        private List<Task> GetRouteTasks(ISiteBuilderContextData contextData)
        {
            List<Task> tasks = new List<Task>();

            var routeData = contextData.GeneralSettings?.CustomRoutes;

            if (routeData == null)
            {
                return tasks;
            }

            if (routeData.Mappings != null)
            {
                routeData.Mappings.ToList().ForEach(map =>
                {
                    switch (map.Value.type?.ToLowerInvariant())
                    {
                        case Mozu.SiteSettings.General.Contracts.General.Routing.Mapping.TypeConst.mzdb:
                            {
                                tasks.Add(MZDBMap.BuildContextData(_entityListsWebApiClient, map.Value).ContinueWith(t =>
                                {
                                    lock (contextData.RouteMapperData)
                                    {
                                        contextData.RouteMapperData[map.Key] = t.Result;
                                    }
                                }, TaskContinuationOptions.OnlyOnRanToCompletion)
                                );
                                break;
                            }
                    }
                });
            }

            if (routeData.Validators != null)
            {
                CustomRouteRepository.ImplicitConfigurationHandler.ConcatImplicitValidators(routeData).ToList().ForEach(validator =>
                {
                    switch (validator.Value.type?.ToLowerInvariant())
                    {
                        case Mozu.SiteSettings.General.Contracts.General.Routing.Validator.TypeConst.attribute:
                            {
                               
                                tasks.Add(ProductAttributeRouteConstraint.BuildContextData(null, _productSearchWebApiClient, _apiContext, validator.Value.attributeFQN).ContinueWith(t =>
                                {
                                    lock (contextData.RouteValidatorData)
                                    {
                                        contextData.RouteValidatorData[validator.Key] = t.Result;
                                    }
                                }, TaskContinuationOptions.OnlyOnRanToCompletion));

                                break;
                            }
                        case ConstraintFactory.SearchFacetConstraintType:
                            {
                                tasks.Add(ProductAttributeRouteConstraint.BuildContextData(null, _productSearchWebApiClient, _apiContext, validator.Value.attributeFQN)
                                    .ContinueWith(t =>
                                {
                                    lock (contextData.RouteValidatorData)
                                    {
                                        contextData.RouteValidatorData[validator.Key] = t.Result;
                                    }
                                }, TaskContinuationOptions.OnlyOnRanToCompletion));

                                break;

                            }

                        case Mozu.SiteSettings.General.Contracts.General.Routing.Validator.TypeConst.mzdb:
                            {
                                tasks.Add(MzdbRouteConstraint.BuildContextData(_entityListsWebApiClient, validator.Value.listFqn, validator.Value.docId, validator.Value.field).ContinueWith(t =>
                                {
                                    lock (contextData.RouteValidatorData)
                                    {
                                        contextData.RouteValidatorData[validator.Key] = t.Result;
                                    }
                                }, TaskContinuationOptions.OnlyOnRanToCompletion));
                                break;
                            }

                    }
                });
            }

            return tasks;
        }

        private List<SBCategory> ProcessCategories(Task<List<Mozu.ProductRuntime.Contracts.Category>> task)
        {
            var list = AutoMapper.Mapper.Map<List<SBCategory>>(task.Result);
            return list;
        }

        private T GenericServiceContinuation<T>(Task<ServiceClientResponse<T>> responseTask)
        {
            return GenericServiceContinuatioImpl(responseTask, false);
        }

        private T GenericServiceContinuationAllow404<T>(Task<ServiceClientResponse<T>> responseTask)
        {
            return GenericServiceContinuatioImpl(responseTask, true);
        }

        private T GenericServiceContinuatioImpl<T>(Task<ServiceClientResponse<T>> responseTask, bool allow404)
        {
            if (responseTask.IsFaulted || !responseTask.IsCompleted)
            {
                if ( responseTask.Exception != null)
                {
                    if (_apiContext.DataViewMode == DataViewModeType.Pending)
                    {
                        throw responseTask.Exception;
                    }
                    _logger.Warn(responseTask.Exception.ToString());
                }
                return default(T);
            }
            var response = responseTask.Result;
            if (response.HasException)
            {
                if ( allow404 && (int)response.ResponseMessage.StatusCode < 500)
                {
                    return default(T);
                }
                if (_apiContext.DataViewMode == DataViewModeType.Pending)
                {
                    throw response.ReadException();
                }
                _logger.Warn(response.ReadException().ToString());
                return default(T);
            }
            return response.ReadAsSync();

        }

        private static readonly Regex isBase64 = new Regex("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$");

        private static UX.Models.Settings.ThemeSelection ToThemeSelection(string val)
        {
            if (string.IsNullOrEmpty(val))
            {
                return null;
            }
            if (isBase64.IsMatch(val))
            {
                try
                {
                    var bytes = Convert.FromBase64String(val);
                    var ms = new MemoryStream(bytes);
                    var serializer = JsonSerializer.CreateDefault();

                    var jtr = new JsonTextReader(new StreamReader(ms));

                    return serializer.Deserialize<UX.Models.Settings.ThemeSelection>(jtr);
                }
                catch
                {

                }
            }
            return new UX.Models.Settings.ThemeSelection() { Id = val };




        }


        private List<RedirectEntry> RedirectDocumentContinuation(Task<ServiceClientResponse<StreamContent>> documentContentResponse)
        {
            if (documentContentResponse.IsFaulted || !documentContentResponse.IsCompleted)
            {
                return new List<RedirectEntry>();
            }
            var resp = documentContentResponse.Result;
            if (!resp.ResponseMessage.IsSuccessStatusCode)
            {
                return new List<RedirectEntry>();
            }

            using (var stream = resp.ResponseMessage.Content.ReadAsStreamAsync().Result)
            using (var tr = new StreamReader(stream))
            using (var jr = new JsonTextReader(tr))
            {
                try
                {
                    var ser = JsonSerializer.CreateDefault();
                    if (jr.Read())
                    {
                        if (jr.TokenType == JsonToken.StartArray)
                        {
                            var entries = ser.Deserialize<List<RedirectEntry>>(jr);
                            return entries.Select(e => { e.IsEnabled = e.IsEnabled.GetValueOrDefault(true); return e; }).ToList();
                        }
                        else if (jr.TokenType == JsonToken.StartObject)
                        {
                            var list = new List<RedirectEntry>();
                            while (jr.Read())
                            {
                                if (jr.TokenType == JsonToken.PropertyName)
                                {
                                    var source = (string)jr.Value;
                                    jr.Read();
                                    var redirect = ser.Deserialize<RedirectEntry>(jr);
                                    redirect.Source = source;
                                    redirect.IsEnabled = redirect.IsEnabled.GetValueOrDefault(true);
                                    list.Add(redirect);
                                }
                            }
                            return list;
                        }
                        else
                        {
                            throw new InvalidOperationException("bad format");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.Error(ex);
                }
                return new List<RedirectEntry>();
            }

        }
    }

    public class PriceListSpecificSiteBuilderContextDataProxy : AbstractContextData, ISiteBuilderContextData
    {
        private readonly ISiteBuilderContextData _inner;

        public PriceListSpecificSiteBuilderContextDataProxy(ISiteBuilderContextData inner, List<SBCategory> rootCatTree)
        {
            _inner = inner;
            this.RootCategoryTree = rootCatTree;
        }
        
        public DateTime BuildDate
        {
            get => _inner.BuildDate;

            set => _inner.BuildDate = value;
        }

        public SiteSettings.Order.Contracts.CheckoutSettings CheckoutSettings
        {
            get => _inner.CheckoutSettings;

            set => _inner.CheckoutSettings = value;
        }

        public SiteSettings.General.Contracts.GeneralSettings GeneralSettings
        {
            get => _inner.GeneralSettings;

            set => _inner.GeneralSettings = value;
        }

        public string Hash
        {
            get => _inner.Hash;

            set => _inner.Hash = value;
        }

        public LocationUsageCollection LocationUsages
        {
            get => _inner.LocationUsages;

            set => _inner.LocationUsages = value;
        }

        public NavigationSet NavigationSet
        {
            get => _inner.NavigationSet;

            set => _inner.NavigationSet = value;
        }

        public DocumentCollection NavWebPages
        {
            get => _inner.NavWebPages;

            set => _inner.NavWebPages = value;
        }

        public List<RedirectEntry> Redirects
        {
            get => _inner.Redirects;

            set => _inner.Redirects = value;
        }

        public DateTime? RedirectUpdateDate
        {
            get => _inner.RedirectUpdateDate;

            set => _inner.RedirectUpdateDate = value;
        }

      
        public CustomRouteRepository.HttpRouteCollectionContainer RouteCollection
        {
            get => _inner.RouteCollection;

            set => _inner.RouteCollection = value;
        }

        public Dictionary<string, Dictionary<string, object>> RouteMapperData
        {
            get => _inner.RouteMapperData;

            set => _inner.RouteMapperData = value;
        }

        public Dictionary<string, Dictionary<string, object>> RouteValidatorData
        {
            get => _inner.RouteValidatorData;

            set => _inner.RouteValidatorData = value;
        }

        public RuntimeRedirects RuntimeRedirects
        {
            get => _inner.RuntimeRedirects;

            set => _inner.RuntimeRedirects = value;
        }

        public int? SiteId
        {
            get => _inner.SiteId;

            set => _inner.SiteId = value;
        }

        public Tenant.Contracts.Tenant TenantInfo
        {
            get => _inner.TenantInfo;

            set => _inner.TenantInfo = value;
        }

        public Dictionary<string, Tuple<Theme, ThemeRuntimeSettingsCollection>> Themes
        {
            get => _inner.Themes;

            set => _inner.Themes = value;
        }

        public string ThemeHash
        {
            get => _inner.ThemeHash;
            set => _inner.ThemeHash = value;
        }

        public List<CurrencyExchangeRate> CurrencyExchangeRates
        {
            get => _inner.CurrencyExchangeRates;
            set => _inner.CurrencyExchangeRates = value;
        }

        public UX.Models.Settings.CheckoutSettings GetMappedCheckoutSettings()
        {
            return _inner.GetMappedCheckoutSettings();
        }

        public UX.Models.Settings.GeneralSettings GetMappedGeneralSettings()
        {
            return _inner.GetMappedGeneralSettings();
        }

        public List<Mozu.SiteBuilder.UX.Models.Settings.SiteDomain> GetMappedSiteDomains()
        {
            return _inner.GetMappedSiteDomains();
        }

        public string GetSiteSubDirectory()
        {
            return _inner.GetSiteSubDirectory();
        }

      
    }
    
    //navigation
    public class SiteBuilderContextData : AbstractContextData, ISiteBuilderContextData
    {
        private const string SubDirRewriteAttributeName = "mozu.reverseproxy.subdirectoryrewrites";
        public DocumentCollection NavWebPages { get; set; }
      
        public GeneralSettings GeneralSettings { get; set; }
        public CheckoutSettings CheckoutSettings { get; set; }
        public Mozu.Tenant.Contracts.Tenant TenantInfo { get; set; }

             
      

        
        public DateTime? RedirectUpdateDate { get; set; }
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public List<RedirectEntry> Redirects { get; set; }
        public int? SiteId { get; set; }
        public LocationUsageCollection LocationUsages { get;  set; }
        public Dictionary<string, Tuple<Theme, ThemeRuntimeSettingsCollection>> Themes { get; set; }



        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public RuntimeRedirects RuntimeRedirects { get;  set; }
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public CustomRouteRepository.HttpRouteCollectionContainer RouteCollection { get; set; }
        [JsonConverter(typeof(NavigationSetJsonConverter))]
        public NavigationSet NavigationSet { get;  set; }
        public Dictionary<string, Dictionary<string, object>> RouteValidatorData { get;  set; }
        public Dictionary<string, Dictionary<string, object>> RouteMapperData { get;  set; }
        public DateTime BuildDate { get;  set; }
        public string Hash { get;  set; }

        public string ThemeHash { get; set; }
        public List<CurrencyExchangeRate> CurrencyExchangeRates { get; set; }

        private UX.Models.Settings.GeneralSettings _mappedGenSettings;
        public UX.Models.Settings.GeneralSettings GetMappedGeneralSettings()
        {
            return _mappedGenSettings ??= Mapper.Map<UX.Models.Settings.GeneralSettings>(GeneralSettings);
        }

        private UX.Models.Settings.CheckoutSettings _mappedCheckoutSettings;
        public UX.Models.Settings.CheckoutSettings GetMappedCheckoutSettings()
        {
            return _mappedCheckoutSettings ??= Mapper.Map<UX.Models.Settings.CheckoutSettings>(CheckoutSettings, opt => opt.Items["countryCode"] = this.TenantInfo.Sites.First(x => x.Id == SiteId).CountryCode);
        }

        private List<UX.Models.Settings.SiteDomain> _mappedSiteDomains;

        private string _siteSubDirectory = null;
        public List<UX.Models.Settings.SiteDomain> GetMappedSiteDomains()
        {
            if (_mappedSiteDomains == null)
            {
                PostProcessSiteInfo();
            }
            return _mappedSiteDomains;
        }
        public string GetSiteSubDirectory ()
        {
            if (_siteSubDirectory == null )
            {
                PostProcessSiteInfo();
            }
            return _siteSubDirectory;
        }

        private void PostProcessSiteInfo()
        {
            if (_mappedSiteDomains != null)
            {
                return;
            }
            var siteDc = this.TenantInfo.Sites?.First(x => x.Id == SiteId);

            var mappedSubDomains = Mapper.Map<List<UX.Models.Settings.SiteDomain>>(siteDc.Domains);
            mappedSubDomains.ForEach(_ => _.SiteId = SiteId.GetValueOrDefault(-1));

            //process siteSubDir
            foreach (var site in TenantInfo.Sites ?? Enumerable.Empty<Mozu.Tenant.Contracts.Site>())
            {
                var attVal = site.Attributes?.Where(x => string.Equals(x.Name, SubDirRewriteAttributeName)).Select(x => x.Value).FirstOrDefault() as string;
                if (attVal == null) continue;

                var nvc = System.Web.HttpUtility.ParseQueryString(attVal);
                foreach (var subdirSlug in nvc.AllKeys)
                {
                    var siteIdString = nvc[subdirSlug];
                    if (string.Equals(siteIdString, this.SiteId.ToString()))
                    {
                        _siteSubDirectory = subdirSlug.StartsWith("/") ? subdirSlug : ("/" + subdirSlug);

                        var subDirPrimary = site.Domains.Where(x => x.IsPrimary && !x.IsSystemAssigned && !x.IsInfrastructureRecord)
                            .Select(Mapper.Map<UX.Models.Settings.SiteDomain>)
                            .FirstOrDefault();
                        if (subDirPrimary != null)
                        {
                            subDirPrimary.SiteId = site.Id;
                            mappedSubDomains.Where(x => x.IsSystemAssigned).ToList().ForEach(x => x.IsPrimary = false);
                            mappedSubDomains.Insert(0, subDirPrimary);
                        }
                    }
                }
            }
            _mappedSiteDomains = mappedSubDomains;

        }
    }
    public abstract class AbstractContextData
    {
        public List<SBCategory> RootCategoryTree
        { get; set; }
        public List<SBCategory> GetFlatCategoryList()
        {
            ProcessCategoryTree();
            return _flatCategories;
        }

        private List<SBCategory> _flatCategories;
        public void ProcessCategoryTree()
        {
            if (_flatCategories != null || this.RootCategoryTree == null)
            {
                return;
            }

            var categories = new List<SBCategory>();
            //var dic = new Dictionary<int, SBCategory>();



            var treeStack =
                new Stack<SBCategory>(RootCategoryTree);

            while (treeStack.Any())
            {
                var category = treeStack.Pop();
                if (category == null)
                {
                    // _logger.Error("Unexpected null returned from productCategoryRuntimeWebApiClient.GetCategoryTree().");
                    continue;
                }

                categories.Add(category);

                if (category.ChildrenCategories?.Count > 0)
                {
                    category.ChildrenCategories.ForEach(_ =>
                    {
                        _.ParentCategory = category;
                        treeStack.Push(_);
                    });

                }

            }

            _flatCategories = categories;

        }
    }

    
    public class NavigationSetJsonConverter : Newtonsoft.Json.JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(NavigationSet);
        }

        public override object ReadJson(Newtonsoft.Json.JsonReader reader, Type objectType, object existingValue, Newtonsoft.Json.JsonSerializer serializer)
        {
            var val = serializer.Deserialize<DAO>(reader);
            var nset= new NavigationSet();
            val?.Nodes.ForEach(nset.Add);
            nset.TimeStamp = val.TimeStamp;
            return nset;
        }

        public override void WriteJson(Newtonsoft.Json.JsonWriter writer, object value, Newtonsoft.Json.JsonSerializer serializer)
        {
            var set = value as NavigationSet;

            var dao = new DAO()
            {
                TimeStamp = set.TimeStamp,
                Nodes = set.Select(_ =>
                {
                    var snn = _ as SimpleTreeNavigationNode;
                    if (snn == null)
                    {
                        snn = new SimpleTreeNavigationNode()
                        {
                            Id = _.Id,
                            Index = _.Index,
                            Name = _.Name,
                            NodeType = _.NodeType,
                            OpenInNewWindow = _.OpenInNewWindow,
                            OriginalCollection = _.OriginalCollection,
                            OriginalDocumentListName = _.OriginalDocumentListName,
                            OriginalId = _.OriginalId,
                            ParentId = _.ParentId,
                            Url = _.Url

                        };
                    }
                    return snn;
                }
                ).ToList()
            };
            serializer.Serialize(writer, dao);

           
        }
        public class DAO
        {
            public DateTime? TimeStamp { get; set; }
            public List<SimpleTreeNavigationNode> Nodes { get; set; }
        }
    }
   
}
