using Microsoft.Extensions.Logging;
using Mozu.Content.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Expressions;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsHelper
    {
        
        private readonly ICmsServiceWrapper _cmsServiceWrapper;

        public CmsHelper(ICmsServiceWrapper cmsServiceWrapper)
        {
            _cmsServiceWrapper = cmsServiceWrapper;
        }

        public bool ProcessDocumentRequest(DocumentRequest request, string defaultCollection,
            out Task<ServiceClientResponse<DocumentWithListInfo>> task, bool isEditMode)
        {
            if (request.Document != null)
            {
                task = Task.FromResult(ServiceClientResponse.FromResult(request.Document, HttpStatusCode.OK));
                return false;
            }

            Task<ServiceClientResponse<Document>> init = null;
            task = null;
            if (request.Id != null)
                init = _cmsServiceWrapper.Get2(request.ListFQN ?? defaultCollection, request.Id,
                    request.IncludeInactiveDocument);
            if (request.Path != null)
                init = _cmsServiceWrapper.GetByPath2(request.ListFQN ?? defaultCollection, request.Path,
                    includeInactive: request.IncludeInactiveDocument);
            if (init == null)
            {
                task = null;
                return false;
            }

            var listTask = isEditMode
                ? _cmsServiceWrapper.GetList(request.ListFQN)
                    .ContinueWith(t => EnsureListHasAdrEnabled(t.Result.ReadAsSync())).Unwrap()
                : Task.FromResult(ServiceClientResponse.FromResult<DocumentList>(null, HttpStatusCode.OK));

            task = Task.WhenAll(init, listTask).ContinueWith(r => AugmentWithListInfo(init, listTask));

            return true;
        }

        //public void CreateTemplate_deleteme(DocumentRequest req, out Task<ServiceClientResponse<Document>> task)
        //{
        //    if (req.Path == null)
        //    {
        //        task = null;
        //        return;
        //    }

        //    task = _cmsServiceWrapper.RawCreate2(
        //        new Document
        //        {
        //            ListFQN = "pageTemplateContent@mozu",
        //            DocumentTypeFQN = "pageTemplateContent@mozu",
        //            Name = Path.GetFileName(req.Path)
        //            //  Path = Path.GetDirectoryName(req.Path)
        //        });
        //}

        public async Task InitCmsPageContext(IPageContext pageContext,
            ISiteContext siteContext,
            ISiteBuilderApiContext sbApiContext,
            Lazy<IExpressionEvaluator> expressionEvaluator = null,
            Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> pageRuleVisitor = null,
            ILogger<CmsHelper> logger = null)
        {
            PageContext pageCxt = (PageContext)pageContext;
            var cmsPageContext = pageCxt.CmsContext;

            if (cmsPageContext == null) return;

            var tasks = new List<Task>();
            if (ProcessDocumentRequest(cmsPageContext.Page, "pages@mozu", out var pageTask, pageCxt.IsEditMode))
                tasks.Add(pageTask);
            if (ProcessDocumentRequest(cmsPageContext.SiteTemplate, "pageTemplateContent@mozu", out var siteTemplateTask,
                pageCxt.IsEditMode)) tasks.Add(siteTemplateTask);
            if (ProcessDocumentRequest(cmsPageContext.Template, "pageTemplateContent@mozu", out var templateTask,
                pageCxt.IsEditMode)) tasks.Add(templateTask);

            await Task.WhenAll(tasks.ToArray()).ConfigureAwait(false);

            if (pageTask != null && pageTask.Result.ResponseMessage.IsSuccessStatusCode)
                cmsPageContext.Page = UpdateDocumentRequestFromTask(cmsPageContext.Page, pageTask);
            if (templateTask != null && templateTask.Result.ResponseMessage.IsSuccessStatusCode)
                cmsPageContext.Template = UpdateDocumentRequestFromTask(cmsPageContext.Template, templateTask);
            if (siteTemplateTask != null && siteTemplateTask.Result.ResponseMessage.IsSuccessStatusCode)
                cmsPageContext.SiteTemplate =
                    UpdateDocumentRequestFromTask(cmsPageContext.SiteTemplate, siteTemplateTask);

            if (templateTask == null && cmsPageContext.Page.Document?.Properties != null)
            {
                var templateName = cmsPageContext.Page.Document.Get<string>("template");
                var pageTypeDefinitionKey = cmsPageContext.Page.Document.Get<string>("page_type_definition");
                if (!string.IsNullOrWhiteSpace(pageTypeDefinitionKey))
                {
                    var ptd = siteContext.Theme.PageTypes.FirstOrDefault(x =>
                        string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
                    templateName = ptd != null && !string.IsNullOrWhiteSpace(ptd.Template)
                        ? ptd.Template
                        : templateName;
                }

                if (!string.IsNullOrWhiteSpace(templateName))
                {
                    if (cmsPageContext.Template?.Document == null)
                        cmsPageContext.Template = new DocumentRequest
                        {
                            Path = templateName,
                            ListFQN = "pageTemplateContent@mozu"
                        };
                    if (ProcessDocumentRequest(cmsPageContext.Template, "pageTemplateContent@mozu", out templateTask,
                        pageCxt.IsEditMode))
                    {
                        await templateTask.ConfigureAwait(false);
                        if (templateTask.Result.ResponseMessage.IsSuccessStatusCode)
                            cmsPageContext.Template =
                                UpdateDocumentRequestFromTask(cmsPageContext.Template, templateTask);
                    }
                }
            }

            

            if (pageRuleVisitor != null && expressionEvaluator != null && String.IsNullOrEmpty(pageCxt.VariationId) && !pageCxt.IsEditMode && sbApiContext.DataViewMode != Core.DataViewModeType.Pending)
            {
                try
                {
                    await expressionEvaluator.Value.EvaluatePageRules(pageCxt, pageRuleVisitor.Value);
                }
                catch(Exception e)
                {
                    logger?.LogWarning(e, e.Message);
                }
            }


            if (sbApiContext.DataViewMode == Core.DataViewModeType.Pending && cmsPageContext.Page.Document != null)
            {
                var currentVariationId = "";

                if (!string.IsNullOrEmpty(pageCxt.VariationId))
                {
                    currentVariationId = pageCxt.VariationId;
                }

               
                var variations = cmsPageContext.Page.Document.Properties.GetOrDefault("variations", new JArray()).ToJArray();
                var foundVariationIdx = -1;
                if (variations.Any())
                {
                    var count = 0;
                    var variationArray = new JArray();
                    foreach (var variation in variations)
                    {
                        var j = new JObject
                        {
                            ["id"] = variation.Value<string>("id"), 
                            ["name"] = variation.Value<string>("name")
                        };
                        variationArray.Add(j);

                        if (variation.Value<string>("id") == currentVariationId)
                        {
                            foundVariationIdx = count;
                        }
                        count++;
                    }
                    pageCxt.Variations = variationArray;

                    if (foundVariationIdx > -1 && 
                        !string.IsNullOrEmpty(currentVariationId) && 
                        currentVariationId != "base")
                    {
                        var foundVariation = variations[foundVariationIdx].ToJObject();
                        foundVariation.TryGetValue("properties", StringComparison.OrdinalIgnoreCase, out var retValue);
                        pageCxt.CmsContext.Page.Document.Properties = retValue.ToJObject();
                    }
                }
            }

            cmsPageContext.RuntimeData = new List<Chorizo.ZoneRuntimeData>();
            cmsPageContext.CalienteRuntimeData = new List<Caliente.ZoneRuntimeData>();

            AddRuntimeData(cmsPageContext.Page.Document, cmsPageContext, ZoneScope.Page);
            AddRuntimeData(cmsPageContext.Template.Document, cmsPageContext, ZoneScope.Template);
            AddRuntimeData(cmsPageContext.SiteTemplate.Document, cmsPageContext, ZoneScope.Site);

            cmsPageContext.Initialized = true;
        }

        private Task<ServiceClientResponse<DocumentList>> EnsureListHasAdrEnabled(DocumentList list)
        {
            if (list == null)
                return Task.FromResult(ServiceClientResponse.FromResult<DocumentList>(null, HttpStatusCode.OK));

            if (!list.SupportsActiveDateRanges.GetValueOrDefault(false) ||
                list.EnableActiveDateRanges.GetValueOrDefault(false))
                return Task.FromResult(ServiceClientResponse.FromResult(list, HttpStatusCode.OK));

            list.EnableActiveDateRanges = true;
            return _cmsServiceWrapper.UpdateList(list);
        }

        private static ServiceClientResponse<DocumentWithListInfo> AugmentWithListInfo(
            Task<ServiceClientResponse<Document>> documentTask, Task<ServiceClientResponse<DocumentList>> listTask)
        {
            if (!documentTask.IsCompleted) throw documentTask.GetException();

            var doc = documentTask.Result.ReadAsSync();
            if (doc == null) return ServiceClientResponse.FromResult<DocumentWithListInfo>(null, HttpStatusCode.OK);

            var augmented = doc.Map<DocumentWithListInfo>();
            var list = listTask.Result.ReadAsSync();
            var result = ServiceClientResponse.FromResult(augmented, HttpStatusCode.OK);
            if (list == null) return result;

            augmented.ListFlags = new DocListFlags
            {
                EnableActiveDateRange = list.EnableActiveDateRanges.GetValueOrDefault(false),
                EnablePublishing = list.EnablePublishing.GetValueOrDefault(false),
                SupportsActiveDateRange = list.SupportsActiveDateRanges.GetValueOrDefault(false),
                SupportsPublishing = list.SupportsPublishing.GetValueOrDefault(false)
            };

            return result;
        }

        private static DocumentRequest UpdateDocumentRequestFromTask(DocumentRequest docRequest,
            Task<ServiceClientResponse<DocumentWithListInfo>> docTask)
        {
            docRequest.Document = docTask.Result.ReadAsSync();
            if (docRequest.Document == null) return docRequest;

            docRequest.Id = docRequest.Document.Id;
            docRequest.PublishState = docRequest.Document.PublishState;

            return docRequest;
        }

        private static void AddRuntimeData(Document document, CmsPageContext cmsPageContext, ZoneScope scope)
        {
            var widgetRawArray = document?.Get<JArray>(CmsConstants.Documents.widget_prop);

            if (widgetRawArray == null) return;

            // get build prop
            // check for existence
            // switch between caliente and chorizo based on value.

            var src = new DocumentRequest
            {
                Id = document.Id,
                ListFQN = document.ListFQN
            };

            foreach (var jToken in widgetRawArray)
            {
                var item = jToken as JObject;
                var property = item?["build"];
                var buildType =
                    property?.Value<string>()
                        .EqualsIgnoreCase(CmsPageContext.LayoutTypeConstants.Chorizo) == true
                        ? CmsPageContext.LayoutTypeConstants.Chorizo
                        : CmsPageContext.LayoutTypeConstants.Caliente;

                switch (buildType.ToUpperInvariant())
                {
                    case "CHORIZO":
                    {
                        var chorizoItem = item?.ToObject<Chorizo.ZoneRuntimeData>();
                        if (chorizoItem == null) continue;

                        chorizoItem.Source = src;
                        chorizoItem.Scope = scope;
                        cmsPageContext.RuntimeData.Add(chorizoItem);
                        break;
                    }
                    case "CALIENTE":
                    {
                        var calienteItem = new Caliente.ZoneRuntimeData
                        {
                            Source = src,
                            Scope = scope,
                            Json = item?.GetValue("rows", StringComparison.OrdinalIgnoreCase) as JArray,
                            Id = (string) item?.GetValue("id", StringComparison.OrdinalIgnoreCase),
                            Build = "CALIENTE"
                        };

                        if (!string.IsNullOrEmpty(calienteItem.Id))
                            cmsPageContext.CalienteRuntimeData.Add(calienteItem);
                        break;
                    }
                }
            }
        }
    }

    public static class ServiceClientResponse
    {
        public static ServiceClientResponse<T> FromResult<T>(T item, HttpStatusCode desiredCode,
            Exception desiredException = null)
        {
            return new ServiceClientResponse<T>
            {
                HasException = desiredException == null,
                ReadAsAsync = () => Task.FromResult(item),
                ReadAsSync = () => item,
                ReadException = () => desiredException,
                ResponseMessage = new HttpResponseMessage(desiredCode)
            };
        }
    }
}