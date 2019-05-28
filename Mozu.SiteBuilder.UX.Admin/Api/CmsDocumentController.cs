using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Mapping;
using Mozu.Core.Api.Routing;
using Mozu.Core.Exceptions;
using Mozu.Core.Expressions;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Cms;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Core.Extensions;
using AVM = Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using CC = Mozu.Content.Contracts;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/cmsdocument", SuppressDescriptorGeneration = true)]
    public class CmsDocumentController : BaseController
    {
        private readonly ICmsServiceWrapper _cmsService;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private readonly Lazy<CmsPageRuleExpressionValidator> _pageRuleValidator;
        private readonly Lazy<IExpressionContextMetadataProvider<CmsPageRuleContext>> _cmsPageRuleMetadataProvider;
        private readonly ILogger _logger;

        public CmsDocumentController(
            ICmsServiceWrapper cmsService,
            IDocumentListWebApiClient documentListWebApiClient,
            Lazy<CmsPageRuleExpressionValidator> pageRuleValidator,
            Lazy<IExpressionContextMetadataProvider<CmsPageRuleContext>> cmsPageRuleMetadataProvider,
            ILogger logger
        )
        {
            _cmsService = cmsService;
            _documentListWebApiClient = documentListWebApiClient;
            _pageRuleValidator = pageRuleValidator;
            _cmsPageRuleMetadataProvider = cmsPageRuleMetadataProvider;
            _logger = logger;
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<CC.Document>>> Delete(List<CC.Document> docs)
        {
            var tasks = docs.Select(doc => _cmsService.Delete2(Mapper.Map<CC.Document>(doc))).ToList();
            await Task.WhenAll(tasks);
            var successes = tasks.Select(x => x.Result).Select(x => x.Item1 ? 1 : 0).Sum();

            return EmptyList2<CC.Document>();
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<CC.Document>>> Create(List<CC.Document> docs)
        {
            var createTasks = new List<Task<ServiceClientResponse<CC.Document>>>();

            SiteContext siteContext = null;
            if (SbApiContext.SiteId.HasValue)
            {
                siteContext = Request.Resolve<SiteContext>();
                await siteContext.Init();
            }

            foreach (var doc in docs)
            {
                PageTypeDefinition pageDef = null;
                if (siteContext != null)
                {
                    if (doc.TryGet("page_type_definition", out string temp))
                    {
                        pageDef = siteContext.Theme.PageTypes.FirstOrDefault(x => x.Id == temp);
                        if (pageDef == null)
                        {
                            throw new InvalidOperationException("invalid page type definition" + temp);
                        }
                    }

                    if (pageDef != null)
                    {
                        doc.DocumentTypeFQN = string.IsNullOrEmpty(doc.DocumentTypeFQN)
                            ? pageDef.DocumentTypeFQN
                            : doc.DocumentTypeFQN;
                        doc.ListFQN = string.IsNullOrEmpty(doc.ListFQN)
                            ? (string.IsNullOrEmpty(pageDef.ListFQN) ? "pages@mozu" : pageDef.ListFQN)
                            : doc.ListFQN;
                        if (pageDef.Zones != null)
                        {
                            doc.Set(CmsConstants.Documents.widget_prop, pageDef.Zones);
                        }
                    }
                }

                //todo rename stuff.
                createTasks.Add(_documentListWebApiClient.CreateDocument(doc.ListFQN, doc));
            }

            await Task.WhenAll(createTasks);
            return List2(createTasks.Select(x => x.Result.ReadAsSync()).ToList());
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<CC.Document>>> Update(List<CC.Document> docs)
        {
            var tasks = docs.Select(doc => _cmsService.Update2(doc)).ToList();
            await Task.WhenAll(tasks);
            var response = tasks.Select(x => x.Result.ReadAsSync()).Select(ConvertDocument).ToList();

            return List2(response);
        }

        public class UpdateWidgetDataMessage
        {
            public List<AVM.Chorizo.ZoneRuntimeData> zones;
            public DocumentRequest source { get; set; }
        }

        [HttpPostRoute(UriTemplate = "widgetdata/update")]
        public async Task<Response<List<AVM.Chorizo.ZoneRuntimeData>>> UpdateWidgetData(UpdateWidgetDataMessage message)
        {
            var source = message.source;
            message.zones = message.zones ?? new List<AVM.Chorizo.ZoneRuntimeData>();

            var docResult =
                (await _documentListWebApiClient.GetTreeDocument(documentListName: source.ListFQN,
                    documentName: source.Path));
            CC.Document doc;
            bool exitst = false;
            if (docResult.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                doc = new CC.Document()
                {
                    ListFQN = source.ListFQN,
                    Name = source.Path,
                    DocumentTypeFQN = source.DocumentTypeFQN
                };
            }
            else
            {
                exitst = true;
                doc = docResult.ReadAsSync();

                var existingZonesString = doc.Get<string>("widgets");
                if (!string.IsNullOrEmpty(existingZonesString))
                {
                    List<AVM.Chorizo.ZoneRuntimeData> existingZones = null;
                    try
                    {
                        existingZones =
                            Newtonsoft.Json.JsonConvert.DeserializeObject<List<AVM.Chorizo.ZoneRuntimeData>>(
                                existingZonesString);
                    }
                    catch (Exception ex)
                    {
                        _logger.Warn("error Deserializing existing widgets", ex);
                    }

                    if (existingZones != null)
                    {
                        foreach (var zoneRuntimeData in existingZones)
                        {
                            if (!message.zones.Any(x =>
                                string.Equals(zoneRuntimeData.Id, x.Id, StringComparison.OrdinalIgnoreCase)))
                            {
                                message.zones.Add(zoneRuntimeData);
                            }
                        }
                    }
                }
            }

            //  zoneSerilized
            doc.Set(CmsConstants.Documents.widget_prop, message.zones);

            doc = exitst
                ? (await _documentListWebApiClient.UpdateDocument(doc.ListFQN, doc.Id, doc)).ReadAsSync()
                : (await _documentListWebApiClient.CreateDocument(doc.ListFQN, doc)).ReadAsSync();

            message.zones = doc.Get<JArray>(CmsConstants.Documents.widget_prop)
                .ToObject<List<AVM.Chorizo.ZoneRuntimeData>>();
            return List2(message.zones);
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<CC.Document>>> ReadDocument([FromUri] PagingParamaters pagingParams,
            [FromUri] FilterCollection extFilter, string id = null,
            string listFQN = CmsConstants.Documents.default_collection_name)
        {
            CC.DocumentCollection results = null;
            if (id == null)
            {
                results = (await _cmsService.GetList2(contentCollection: listFQN, pageSize: int.MaxValue)).ReadAsSync();
            }
            else
            {
                results = new CC.DocumentCollection()
                {
                    Items = new List<CC.Document>()
                    {
                        (await _documentListWebApiClient.GetDocument(documentListName: listFQN, documentId: id))
                        .ReadAsSync()
                    },
                    TotalCount = 1,
                    PageSize = 12,
                    StartIndex = 0
                };
            }


            return List2(results.Items, results.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "pagerule/validate")]
        public async Task<Response<List<CmsPageRuleValidationResult>>> ValidatePageRule(
            [WebApiClientGenerateParameterForBody(typeof(JObject))]
            HttpRequestMessage item)
        {
            var rule = item.Content.ReadAsStringAsync().Result;
            if (rule == null) throw new ArgumentNullException(nameof(rule));

            var retVal = new CmsPageRuleValidationResult {ExpressionText = rule};

            try
            {
                var expression = JsonConvert.DeserializeObject<AbstractExpression>(rule);
                retVal.Expression = expression;
                retVal.ExpressionText = expression.ToString(); 

                var validator = new ExpressionEvaluatorImpl();
                var visitor = new ExpressionValidationVisitor<CmsPageRuleContext>(_pageRuleValidator.Value);
                await validator.Evaluate(expression, visitor);
                retVal.ValidationResult = visitor.Result;
            }
            catch (Exception e)
            {
                retVal.ValidationResult.Errors.Add(new ExpressionValidationError
                {
                    Message = e.Message
                });
            }

            return List2(retVal);
        }

        [HttpGetRoute(UriTemplate = "pagerule/metadata")]
        public async Task<Response<List<CmsPageRulePropertyDescriptor>>> GetPageRulesMetadata()
        {
            var descriptors = await _cmsPageRuleMetadataProvider.Value.GetPropertyDescriptors();
            var results =
                descriptors.Select(d => new CmsPageRulePropertyDescriptor
                {
                    DataType = $"{d.DataType:G}",
                    IsDynamic = d.IsDynamic,
                    AllowNull = d.PropertyValueCanBeNull,
                    PropertyName = d.PropertyName,
                    //We want to limit the date operations for RBP dates.
                    ValidOperators = 
                        d.DataType == RelationalExpression.DataType.dateTime || d.DataType == RelationalExpression.DataType.dateTimeArray ?
                            new[] {"le", "ge"} :
                            d.ValidOperators?.Select(o => o.ToString("G")).ToArray()
                }).ToList();
            
            return List2(results);
        }

        private static CC.Document ConvertDocument(CC.Document result)
        {
            return result ?? throw new ArgumentNullException(nameof(result));
        }

    }
}