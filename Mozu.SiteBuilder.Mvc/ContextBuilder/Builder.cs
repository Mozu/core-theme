
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.Order.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Autofac;
using Autofac.Integration;
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
using Mozu.SiteBuilder.Mvc.Extensions;
using SBCategory = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category;
using Mozu.Core.EnsureThat;

namespace Mozu.SiteBuilder.Mvc.Context
{
    public interface ISitebuilderContextCacheRepository
    {
        Task<SiteBuilderContextData> GetAsync(ISiteBuilderApiContext apiContext );
        Task PutAsync(SiteBuilderContextData item, ISiteBuilderApiContext apiContext);
       // Task Invalidate(int tenantId, int masterCatalogId, int catalogId, int? siteId, DataViewModeType dataViewMode);
        Task Invalidate(int tenantId, int value1, int value2, int? siteId, string localeCode, string currencyCode, DataViewModeType dataViewModeType);
    }

    public class SitebuilderContextCacheRepository : ISitebuilderContextCacheRepository
    {
        Mozu.Core.Caching.ICacheProvider _cacheProvider;
        Core.Mongo.MongoDatabaseProvider _mdbProvider;
        bool _ensureIndexes = false;
        Task _ensureIndexTask;
        Timer _backgroundBuildTimer;
        Timer _backgroundJobCleanTimer;
        ISettings _settings;
        string _machineId;
        Autofac.ILifetimeScope _globalScope;
        const string CacheName = "Sitebuilder.ContextBuilder";
        const int TimerInterval = 15 * 1000;
        public const string CacheVersion = "1";
        const string EnableCleanJobConfigKey = "sitebuilder:context.enableCleanJob";
        const string BuildIntervalConfigKey = "sitebuilder:context.buildinterval";
        const string CleanJobIntervalConfigKey = "sitebuilder:context.cleaninterval";


        ILogger _logger;
        public SitebuilderContextCacheRepository(ICacheProvider cacheProvider, Mozu.Core.Settings.ISettings settings, ILifetimeScope globalScope)
        {
            _mdbProvider = new Core.Mongo.MongoDatabaseProvider("CacheDB", "Cache", settings);
            _ensureIndexTask = EnsureIndexes();
            _cacheProvider = cacheProvider;
            _machineId = System.Environment.MachineName + "-" + Guid.NewGuid().ToString();
            _settings = settings;
            _logger = LoggingService.LoggerFor<SitebuilderContextCacheRepository>();
            _backgroundBuildTimer = new Timer(BuildCallback, null, TimerInterval, Timeout.Infinite);
            bool isSandBox = _settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1;
            if ( _settings.AppSettingsAsNullableBool(EnableCleanJobConfigKey).GetValueOrDefault(isSandBox))
            {
                _backgroundJobCleanTimer = new Timer(CleanJobQueuCallback, null, GetNextCleanInterval(), Timeout.Infinite);
            }
            
            _globalScope = ((Autofac.Core.ISharingLifetimeScope)globalScope).RootLifetimeScope; 
        }
        TimeSpan GetNextBuildTime()
        {
            int intervalInMinutes = _settings.AppSettingsAsNullableInt(BuildIntervalConfigKey).GetValueOrDefault( 5);
            var now = DateTime.Now;
            var modMins = now.Minute % intervalInMinutes;
            if (modMins == 0)
            {
                modMins = intervalInMinutes;
            }

            var secs = DateTime.Now.Second % 60;
            return new TimeSpan(0, 0, modMins, now.Second % 60, now.Millisecond % 1000);
        }

        int GetNextCleanInterval()
        {
            return _settings.AppSettingsAsNullableInt(CleanJobIntervalConfigKey).GetValueOrDefault(120) * 60 * 1000;
        }




        void BuildCallback(object state)
        {
            try
            {
                Task.Run(() => DoBuilds()).Wait();
            }
            catch( Exception ex)
            {
                _logger.Error(ex);
            }
            _backgroundBuildTimer.Change(TimerInterval, Timeout.Infinite);

        }

        void CleanJobQueuCallback(object state)
        {
            try
            {
                Task.Run(() => CleanOldJobs()).Wait();
            }
            catch (Exception ex)
            {
                _logger.Error(ex);
            }

            _backgroundJobCleanTimer.Change(GetNextCleanInterval(), Timeout.Infinite);
        }

       
        async Task DoBuilds ()
        {
            while ( true)
            {
                var work = await GetWork().ConfigureAwait(false);

                if ( work == null)
                {
                    return;
                }

                var apiContext = ToApiContext(work);
                
                var ctxData = await ProcessWork(work, apiContext).ConfigureAwait(false);

                await ((ISitebuilderContextCacheRepository)this).PutAsync(ctxData, apiContext).ConfigureAwait(false);
     
            }
        }
        SiteBuilderApiContext ToApiContext(SiteBuilderContextWorkItem work )
        {
            var newContext = SiteBuilderApiContext.Create();
            newContext.TenantId = work.TenantId;
            newContext.MasterCatalogId = work.MasterCatalogId;
            newContext.CatalogId = work.CatalogId;
            newContext.SiteId = work.SiteId;
            newContext.PriceListCode = work.PriceList;
            newContext.LocaleCode = work.LocaleCode;
            newContext.CurrencyCode = work.CurrencyCode;
            return newContext;
        }

        async Task<SiteBuilderContextData> ProcessWork ( SiteBuilderContextWorkItem work , SiteBuilderApiContext apiContext)
        {
            using (var lifetimeScope = _globalScope.BeginLifetimeScope(Autofac.Core.Lifetime.MatchingScopeLifetimeTags.RequestLifetimeScopeTag, cfg =>
            {
                apiContext.UserClaims = null;
                cfg.RegisterInstance(apiContext)
                .As<ISiteBuilderApiContext>()
                .As<Mozu.Core.IApiContext>().SingleInstance();
            }))
            {
                var serviceAggregator = lifetimeScope.Resolve<IContextServiceAggregator>();
                var existing = await ((ISitebuilderContextCacheRepository)this).GetAsync(apiContext).ConfigureAwait(false);
                return await serviceAggregator.Aggregate(existing).ConfigureAwait(false);
            }
        }

        async Task CleanOldJobs()
        {
            var fBuilder = Builders<SiteBuilderContextWorkItem>.Filter;
            var filter = fBuilder.Gt(x => x.TimeStamp, DateTime.UtcNow.AddHours(-2));
            var col = GetCollection();
            var cursor = await (col.FindAsync(filter).ConfigureAwait(false));
            var workItems = await cursor.ToListAsync().ConfigureAwait(false);

            filter = fBuilder.Or(workItems.Select(x => fBuilder.Eq(_ => _.Id, x.Id)));
            await col.DeleteManyAsync(filter).ConfigureAwait(false);
            var cache = _cacheProvider.GetCache(CacheName);
            workItems.ForEach(_ =>
            {
                var tags = GetTags(_.TenantId, _.MasterCatalogId, _.CatalogId, _.SiteId, DataViewModeType.Live);
                cache.InvalidateItemsByTags(tags, TagQueryType.Any);
            });
        }

        Task<SiteBuilderContextWorkItem> GetWork()
        {
            var fBuilder = Builders<SiteBuilderContextWorkItem>.Filter;
            var uBuilder = Builders<SiteBuilderContextWorkItem>.Update;
            var sBuilder = Builders<SiteBuilderContextWorkItem>.Sort;

            var newWork = fBuilder.And(
                fBuilder.Lt(x => x.SchedualedBuildTime, DateTime.UtcNow),
                 fBuilder.Eq(x => x.Worker, null));

            var erroredWork = fBuilder.Lt(x => x.WorkStarted, DateTime.UtcNow.AddMinutes(-4));

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
      
        async Task EnsureIndexes()
        {
            if (!_ensureIndexes)
            {
                var colleciton = GetCollection();
                var newWorkIdxName = "newWork_Idx";
                var oldWorkIxdName = "oldWork_Ixd";
                var builder = Builders<SiteBuilderContextWorkItem>.IndexKeys;
                using (var cursor = await colleciton.Indexes.ListAsync().ConfigureAwait(false))
                {
                    var indexes = await cursor.ToListAsync().ConfigureAwait(false);
                    await EnsureIndex(colleciton,  indexes , newWorkIdxName, builder.Ascending(x => x.SchedualedBuildTime).Ascending(x => x.Worker));
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
            if (!indexes.Any(index => index["name"] == indexName))
            {
                try
                {
                    await colleciton.Indexes.CreateOneAsync(keys,
                        new CreateIndexOptions()
                        {
                            Background = true,
                            Name = indexName,
                        }).ConfigureAwait(false);
                }
                catch (Exception e)
                {
                    _logger.Warn(e);
                }
            }
        }

        string GetCacheKey(ISiteBuilderApiContext apiContext)
        {
            
            var dvm = apiContext.DataViewMode == DataViewModeType.Pending ? 
                DataViewModeType.Pending : 
                DataViewModeType.Live;
            return $"t={apiContext.TenantId}&s={apiContext.SiteId}&l={apiContext.LocaleCode}&c={apiContext.CurrencyCode}&pl={apiContext.PriceListCode}&dvm={dvm}&v={CacheVersion}";
        }
        IMongoCollection<SiteBuilderContextWorkItem> GetCollection()
        {
            return _mdbProvider.MongoDataBase.GetCollection<SiteBuilderContextWorkItem>("SiteBuilderContextWorkItems");
        }
        Task<SiteBuilderContextData> ISitebuilderContextCacheRepository.GetAsync(ISiteBuilderApiContext apiContext)
        {
            var cacheKey = this.GetCacheKey(apiContext);
            return _cacheProvider.GetCache(CacheName)
                .GetAsync<SiteBuilderContextData>(cacheKey)
                .ContinueWith(x => x.Result?.Item);
        }

        async Task ISitebuilderContextCacheRepository.Invalidate(int tenantId, int masterCatalogId, int catalogId, int? siteId, string localeCode, string currencyCode, DataViewModeType dataViewMode)
        {
            //clear staging...
            var tags = GetTags(tenantId, masterCatalogId, catalogId, siteId, DataViewModeType.Pending);
            _cacheProvider.GetCache(CacheName).InvalidateItemsByTags(tags, TagQueryType.Any);
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

        async Task ISitebuilderContextCacheRepository.PutAsync(SiteBuilderContextData item, ISiteBuilderApiContext apiContext)
        {
            var cacheKey = GetCacheKey(apiContext);
            var tags = GetTags(apiContext.TenantId, apiContext.MasterCatalogId.GetValueOrDefault(-1), apiContext.CatalogId.GetValueOrDefault(-1), apiContext.SiteId, apiContext.DataViewMode);
            var isSb =_settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1;
            var policy = new CachePolicy()
            {
                AbsoluteExpiration = isSb ? DateTimeOffset.UtcNow.AddMinutes(5) : DateTimeOffset.UtcNow.AddDays(2)
            };

            await _cacheProvider.GetCache(CacheName).PutAsync(item, cacheKey, tags, policy).ConfigureAwait(false);
            await UpsertWorkQueue(apiContext).ConfigureAwait(false);
        }

        List<string> GetTags ( int tenantId, int masterCatalogId, int catalogId, int? siteId, DataViewModeType dvm )
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
        async Task UpsertWorkQueue (ISiteBuilderApiContext apiContext)
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
    }
    public class SiteBuilderContextWorkItem
    {
        [MongoDB.Bson.Serialization.Attributes.BsonId]
        public string Id
        {
            get { return $"{TenantId}&{SiteId}&{PriceList}&{LocaleCode}&{CurrencyCode}&v={SitebuilderContextCacheRepository.CacheVersion}"; }
            set {;}
        }
        public int TenantId { get; set; }
        public int MasterCatalogId { get; set; }
        public int CatalogId { get; set; }

        public int SiteId { get; set; }

        public string PriceList { get; set; }

        public DateTime? WorkStarted { get; set; }
        public DateTime TimeStamp { get; set; }
        public DateTime SchedualedBuildTime { get; set; }
        public string Worker { get; set; }
        public string CurrencyCode { get;  set; }
        public string LocaleCode { get;  set; }
        
    }
    public interface ISiteBuilderContextDataRepository
    {
        Task<SiteBuilderContextData> GetContextData();

        Task<SiteBuilderContextData> BuildContextData(SiteBuilderContextData existing);
    }

    public class SiteBuilderContextDataRepository : ISiteBuilderContextDataRepository
    {
       
        ISiteBuilderApiContext _context;
        ISitebuilderContextCacheRepository _sitebuilderContextCacheRepository;
        Lazy<IContextServiceAggregator> _contextServiceAggregator;

        public SiteBuilderContextDataRepository(
            ISitebuilderContextCacheRepository sitebuilderContextCacheRepository,
            ISiteBuilderApiContext context,
            Lazy<IContextServiceAggregator> contextServiceAggregator)
        {
            _sitebuilderContextCacheRepository = sitebuilderContextCacheRepository;
            _context = context;
            _contextServiceAggregator = contextServiceAggregator;
        }
        
        

        public async Task<SiteBuilderContextData> GetContextData()
        {
            var ctxData = await _sitebuilderContextCacheRepository.GetAsync(_context).ConfigureAwait(false);
          
            if ( ctxData != null )
            {
                return ctxData;
            }
            var data = await BuildContextData(ctxData).ConfigureAwait(false);
            await _sitebuilderContextCacheRepository.PutAsync(data, _context).ConfigureAwait(false);
            return data;
        }



        public  Task<SiteBuilderContextData> BuildContextData(SiteBuilderContextData existing)
        {
            return _contextServiceAggregator.Value.Aggregate(existing);
        }
        
    }


    public interface ISiteBuilderContextProvider
    {
        Task<SiteBuilderContextData> GetContextData();
    }

    public class SiteBuilderContextProvider : ISiteBuilderContextProvider
    {
        ISiteBuilderContextDataRepository _repo;
        Task<SiteBuilderContextData> _data;
        public SiteBuilderContextProvider(ISiteBuilderContextDataRepository repo)
        {
            _repo = repo;
        }
        // Mozu.SiteBuilder.Mvc.Contexts.ISiteContext _siteContext;
        public Task<SiteBuilderContextData> GetContextData()
        {
            return _data = _data ?? _repo.GetContextData();
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
        Task<SiteBuilderContextData> Aggregate(SiteBuilderContextData existing);
    }

    public class ContextServiceAggregator : IContextServiceAggregator
    {
        Mozu.Content.Contracts.Clients.IDocumentListWebApiClient _documentListWebApiClient;
        Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient _entityListsWebApiClient;
        Mozu.ProductRuntime.Contracts.Clients.IProductCategoryRuntimeWebApiClient _productCategoryRuntimeWebApiClient;
        Mozu.SiteSettings.General.Contracts.Clients.IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient _tenantsWebApiClient;
        Mozu.ProductRuntime.Contracts.Clients.IProductSearchWebApiClient _productSearchWebApiClient;
        Mozu.Location.Contracts.Clients.ILocationSettingsWebApiClient _locationSettingsWebApiClient;
        IThemeRepository _themeRepository;
        INavigationRepository _navigationRepository;
        Mozu.Core.IApiContext _apiContext;
        ILogger _logger;

        public ContextServiceAggregator(
            Mozu.Core.IApiContext apiContext,
            Mozu.Content.Contracts.Clients.IDocumentListWebApiClient documentListWebApiClient,
            Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient entityListsWebApiClient,
            Mozu.ProductRuntime.Contracts.Clients.IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient,
            Mozu.ProductRuntime.Contracts.Clients.IProductSearchWebApiClient productSearchWebApiClient,
            Mozu.SiteSettings.General.Contracts.Clients.IGeneralSettingsWebApiClient generalSettingsWebApiClient,
            Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient,
            Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient,
            Mozu.Location.Contracts.Clients.ILocationSettingsWebApiClient locationSettingsWebApiClient,
            INavigationRepository navigationRepository,
            IThemeRepository themeRepository,
            ILogger logger

            )
        {
            _apiContext = apiContext;
            int defaultTimeout = 30000;
            _documentListWebApiClient = documentListWebApiClient.WithTimeout(defaultTimeout);
            _entityListsWebApiClient = entityListsWebApiClient.WithTimeout(defaultTimeout);
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient.WithTimeout(defaultTimeout);
            _generalSettingsWebApiClient = generalSettingsWebApiClient.WithTimeout(defaultTimeout);
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient.WithTimeout(defaultTimeout);
            _tenantsWebApiClient = tenantsWebApiClient.WithTimeout(defaultTimeout);
            _productSearchWebApiClient = productSearchWebApiClient.WithTimeout(defaultTimeout);
            _locationSettingsWebApiClient = locationSettingsWebApiClient.WithTimeout(defaultTimeout);
            _themeRepository = themeRepository;
            _navigationRepository = navigationRepository;
            _logger = logger;

        }
        public async Task<SiteBuilderContextData> Aggregate(SiteBuilderContextData existing)
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

            tasks.Add(_locationSettingsWebApiClient.GetLocationUsages()
                .ContinueWith(GenericServiceContinuation)
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
            tasks.Add(_documentListWebApiClient.GetTreeDocumentContent("siteSettings@mozu", "redirects.1.1")
                .ContinueWith(RedirectDocumentContinuation)
                .ContinueWith(x => ret.Redirects = x.Result ?? existing?.Redirects, TaskContinuationOptions.OnlyOnRanToCompletion)
                );



            tasks.Add(_documentListWebApiClient.GetDocuments(documentListName: "pages@mozu", pageSize: 2000, includeInactive: false, responseFields: "items(id, name, listFQN, properties( link_title ) )")
                 .ContinueWith(GenericServiceContinuation)
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
                _logger.Warn(ex);
            }


            tasks.Clear();
            tasks.AddRange(GetRouteTasks(ret));
            ProcessTheme(ret, tasks, ret.GeneralSettings?.Theme, existing );
            ProcessTheme(ret, tasks, ret.GeneralSettings?.MobileTheme, existing);
            ProcessTheme(ret, tasks, ret.GeneralSettings?.TabletTheme, existing);

           
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
                    _logger.Warn(ex);
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
            
            return ret;

        }

        private void ProcessTheme(SiteBuilderContextData ret, List<Task> tasks, string themeId, SiteBuilderContextData existing)
        {
            if (!string.IsNullOrEmpty(themeId))
            {
                var tid = ToThemeSelection(themeId);
                if (!ret.Themes.ContainsKey(tid.Id))
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

        private string Hash (SiteBuilderContextData data )
        {
            using (var md5 = MD5.Create())
            using (var stream = new MemoryStream())
            using ( var w = new BinaryWriter(stream))
            {
                data.GetFlatCategoryList()?.ForEach(_ =>
                {
                    w.Write(_.CategoryId);
                    w.Write(_.Sequence.GetValueOrDefault(-1));
                    w.Write(_.ParentCategoryId.GetValueOrDefault(-1));
                });
                w.Write(data.CheckoutSettings?.CustomerCheckoutSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                w.Write(data.CheckoutSettings?.OrderProcessingSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                w.Write(data.CheckoutSettings?.PaymentSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0 );
                w.Write(data.GeneralSettings?.AuditInfo?.UpdateDate?.Ticks ?? 0);
                data.LocationUsages?.Items?.ForEach(_ =>
                {
                    w.Write(_.LocationUsageTypeCode??string.Empty);
                    w.Write((_.AuditInfo?.UpdateDate ?? DateTime.MinValue).Ticks);
                });
                data.NavWebPages?.Items?.ForEach(_ =>
                {
                    w.Write(_.Id);
                    w.Write(((_.UpdateDate ?? _.InsertDate) ?? DateTime.MinValue).Ticks);
                });
                data.RouteMapperData?.ToList().ForEach(_ =>
                {
                    w.Write(_.Key);
                    _.Value?.All(entry =>
                    {
                        w.Write(entry.Key);
                        w.Write(entry.Value?.ToString());
                        return true;
                    });
                });

                w.Write(data.NavigationSet?.TimeStamp?.Ticks ?? 0);

                data.RouteValidatorData?.ToList().ForEach(_ =>
                {
                    w.Write(_.Key);
                    _.Value?.All(entry =>
                    {
                        w.Write(entry.Key);
                        w.Write(entry.Value?.ToString());
                        return true;
                    });
                });

                data.Themes?.Keys?.All(_ =>
                {
                    var tup = data.Themes[_];
                    w.Write(tup.Item1?.Id ?? string.Empty);
                    w.Write(tup.Item1?.Hash ?? string.Empty);
                    w.Write(tup.Item2?.TimeStamp.Ticks ??  0);
                    return true;
                });
                
                w.Write(data.TenantInfo?.UpdateDate.Ticks??0);
                w.Flush();
                w.Flush();
                stream.Position = 0;
                var hash = md5.ComputeHash(stream);
                return hash.ToHexString();
}
            
        }

        private Task<Tuple<Theme, ThemeRuntimeSettingsCollection>> GetThemeSettings(Task<Theme> themeTask)
        {
            if (themeTask.IsFaulted)
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

        private List<Task> GetRouteTasks(SiteBuilderContextData contextData)
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
                                var mapper = new MZDBMap(_entityListsWebApiClient, map.Value);
                                tasks.Add(mapper.Initialize().ContinueWith(t =>
                                {
                                    lock (contextData.RouteMapperData)
                                    {
                                        contextData.RouteMapperData[map.Key] = mapper.Mappings;
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
                                var doer = new ProductAttributeRouteConstraint(null, _productSearchWebApiClient, _apiContext, validator.Value.attributeFQN);
                                tasks.Add(doer.Initialize().ContinueWith(t =>
                                {
                                    lock (contextData.RouteValidatorData)
                                    {
                                        contextData.RouteValidatorData[validator.Key] = doer.Values;
                                    }
                                }, TaskContinuationOptions.OnlyOnRanToCompletion));

                                break;
                            }
                        case ConstraintFactory.SearchFacetConstraintType:
                            {
                                var doer = new ProductAttributeRouteConstraint(null, _productSearchWebApiClient, _apiContext, validator.Value.attributeFQN);
                                tasks.Add(doer.Initialize().ContinueWith(t =>
                                {
                                    lock (contextData.RouteValidatorData)
                                    {
                                        contextData.RouteValidatorData[validator.Key] = doer.Values;
                                    }
                                }, TaskContinuationOptions.OnlyOnRanToCompletion));

                                break;

                            }

                        case Mozu.SiteSettings.General.Contracts.General.Routing.Validator.TypeConst.mzdb:
                            {
                                var doer = new MzdbRouteConstraint(_entityListsWebApiClient, validator.Value.listFqn, validator.Value.docId, validator.Value.field);

                                tasks.Add(doer.Initialize().ContinueWith(t =>
                                {
                                    lock (contextData.RouteValidatorData)
                                    {
                                        contextData.RouteValidatorData[validator.Key] = doer.Values;
                                    }
                                }, TaskContinuationOptions.OnlyOnRanToCompletion));
                                break;
                            }

                    }
                });
            }

            return tasks;
        }

        List<SBCategory> ProcessCategories(Task<List<Mozu.ProductRuntime.Contracts.Category>> task)
        {
            var list = AutoMapper.Mapper.Map<List<SBCategory>>(task.Result);
            return list;
        }


        T GenericServiceContinuation<T>(Task<ServiceClientResponse<T>> responseTask)
        {
            if (responseTask.IsFaulted || !responseTask.IsCompleted)
            {
                if ( responseTask.Exception != null)
                {
                    if (_apiContext.DataViewMode == DataViewModeType.Pending)
                    {
                        throw responseTask.Exception;
                    }
                    _logger.Warn(responseTask.Exception);
                }
                return default(T);
            }
            var response = responseTask.Result;
            if (response.HasException)
            {
                if (_apiContext.DataViewMode == DataViewModeType.Pending)
                {
                    throw response.ReadException();
                }
                _logger.Warn(response.ReadException());
                return default(T);
            }
            return response.ReadAsSync();

        }

        static Regex isBase64 = new Regex("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$");
        static UX.Models.Settings.ThemeSelection ToThemeSelection(string val)
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



        List<RedirectEntry> RedirectDocumentContinuation(Task<ServiceClientResponse<StreamContent>> documentContentResponse)
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
    
    //navigation
    public class SiteBuilderContextData
    {
        public DocumentCollection NavWebPages { get; set; }
      
        public GeneralSettings GeneralSettings { get; set; }
        public CheckoutSettings CheckoutSettings { get; set; }
        public Mozu.Tenant.Contracts.Tenant TenantInfo { get; set; }

             
        public List<SBCategory> RootCategoryTree
        { get; set; }

       

        public List<RedirectEntry> Redirects { get;  set; }


        public int? SiteId { get; set; }
        public LocationUsageCollection LocationUsages { get;  set; }
        public Dictionary<string, Tuple<Theme, ThemeRuntimeSettingsCollection>> Themes { get; set; }


       
        [JsonIgnore]
        public RuntimeRedirects RuntimeRedirects { get;  set; }
        [JsonIgnore]
        public CustomRouteRepository.HttpRouteCollectionContainer RouteCollection { get; set; }
        [JsonConverter(typeof(NavigationSetJsonConverter))]
        public NavigationSet NavigationSet { get;  set; }
        public Dictionary<string, Dictionary<string, object>> RouteValidatorData { get;  set; }
        public Dictionary<string, Dictionary<string, object>> RouteMapperData { get;  set; }
        public DateTime BuildDate { get;  set; }
        public string Hash { get;  set; }

        Mozu.SiteBuilder.UX.Models.Settings.GeneralSettings _mappedGenSettings;
        public Mozu.SiteBuilder.UX.Models.Settings.GeneralSettings GetMappedGeneralSettings()
        {
            return _mappedGenSettings = _mappedGenSettings ?? Mapper.Map<Mozu.SiteBuilder.UX.Models.Settings.GeneralSettings>(GeneralSettings);
        }

        Mozu.SiteBuilder.UX.Models.Settings.CheckoutSettings _mappedCheckoutSettings;
        public Mozu.SiteBuilder.UX.Models.Settings.CheckoutSettings GetMappedCheckoutSettings()
        {
            return _mappedCheckoutSettings = _mappedCheckoutSettings ?? Mapper.Map<Mozu.SiteBuilder.UX.Models.Settings.CheckoutSettings>(CheckoutSettings, opt => opt.Items["countryCode"] = this.TenantInfo.Sites.First(x => x.Id == SiteId).CountryCode);
        }
        List<Mozu.SiteBuilder.UX.Models.Settings.SiteDomain> _mappedSiteDomains;
        public List<Mozu.SiteBuilder.UX.Models.Settings.SiteDomain> GetMappedSiteDomains()
        {
            if (_mappedSiteDomains == null)
            {
                var data = this.TenantInfo;


                var siteDc = this.TenantInfo.Sites?.First(x => x.Id == SiteId);

                _mappedSiteDomains = Mapper.Map<List<Mozu.SiteBuilder.UX.Models.Settings.SiteDomain>>(siteDc.Domains);

            }
            return _mappedSiteDomains;
        }

        public List<SBCategory> GetFlatCategoryList()
        {
            ProcessCategoryTree();
            return _flatCategories;
        }
        public List<SBCategory> GetCategoryTree()
        {
            ProcessCategoryTree();
            return _flatCategories;
        }
        List<SBCategory> _flatCategories;
        public void ProcessCategoryTree()
        {
            if (_flatCategories != null || this.RootCategoryTree == null )
            {
                return ;
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

                if ( category.ChildrenCategories?.Count> 0)
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
