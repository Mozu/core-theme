using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json.Linq;
using Document = Mozu.Content.Contracts.Document;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsHelper
    {
        private readonly ICmsServiceWrapper _cmsServiceWrapper;

        public CmsHelper(ICmsServiceWrapper cmsServiceWrapper)
        {
            _cmsServiceWrapper = cmsServiceWrapper;
        }

        public bool ProcessDocumentRequest(DocumentRequest request, string defaultCollection, out Task<ServiceClientResponse<DocumentWithListInfo>> task, bool isEditMode)
        {
            if (request.Document != null) {
                task = Task.FromResult(ServiceClientResponse.FromResult(request.Document, System.Net.HttpStatusCode.OK));
                return false;
            }

            Task<ServiceClientResponse<Document>> init = null;
            task = null;
            if (request != null)
            {
                if (request.Id != null)
                {
                    init = _cmsServiceWrapper.Get2(request.ListFQN ?? defaultCollection, request.Id, request.IncludeInactiveDocument);
                }
                if (request.Path != null)
                {
                    init = _cmsServiceWrapper.GetByPath2(request.ListFQN ?? defaultCollection, request.Path, includeInactive: request.IncludeInactiveDocument);
                }
                if (init == null)
                {
                    task = null;
                    return false;
                }

                var listTask = isEditMode
                    ? _cmsServiceWrapper.GetList(request.ListFQN).ContinueWith(t => EnsureListHasADREnabled(t.Result.ReadAsSync())).Unwrap()
                    : Task.FromResult(ServiceClientResponse.FromResult<Content.Contracts.DocumentList>(null, System.Net.HttpStatusCode.OK));

                task = Task.WhenAll(init, listTask).ContinueWith(r => AugmentWithListInfo(init, listTask));
            }
            return task != null;
        }

        private Task<ServiceClientResponse<Content.Contracts.DocumentList>> EnsureListHasADREnabled(Content.Contracts.DocumentList list)
        {
            if (list == null) return Task.FromResult(ServiceClientResponse.FromResult<Content.Contracts.DocumentList>(null, System.Net.HttpStatusCode.OK));

            if (!list.SupportsActiveDateRanges.GetValueOrDefault(false) || list.EnableActiveDateRanges.GetValueOrDefault(false))
                return Task.FromResult(ServiceClientResponse.FromResult(list, System.Net.HttpStatusCode.OK));

            list.EnableActiveDateRanges = true;
            return _cmsServiceWrapper.UpdateList(list);
        }

        private static ServiceClientResponse<DocumentWithListInfo> AugmentWithListInfo(Task<ServiceClientResponse<Document>> documentTask, Task<ServiceClientResponse<Content.Contracts.DocumentList>> listTask)
        {
            if (!documentTask.IsCompleted) throw documentTask.GetException();

            var doc = documentTask.Result.ReadAsSync();
            if (doc == null) return ServiceClientResponse.FromResult<DocumentWithListInfo>(null, System.Net.HttpStatusCode.OK);

            var augmented = doc.Map<DocumentWithListInfo>();
            var list = listTask.Result.ReadAsSync();
            var result = ServiceClientResponse.FromResult(augmented, System.Net.HttpStatusCode.OK);
            if (list == null) return result;

            augmented.ListFlags = new DocListFlags
            {
                EnableActiveDateRange = list.EnableActiveDateRanges.GetValueOrDefault(false),
                EnablePublishing = list.EnablePublishing.GetValueOrDefault(false),
                SupportsActiveDateRange = list.SupportsActiveDateRanges.GetValueOrDefault(false),
                SupportsPublishing = list.SupportsPublishing.GetValueOrDefault(false),
            };

            return result;
        }

        public async Task<bool> InitCmsPageContext(PageContext pageContext, SiteContext siteContext)
        {
            CmsPageContext cmsPageContext = pageContext.CmsContext;

            if (cmsPageContext == null) return true;

            Task<ServiceClientResponse<DocumentWithListInfo>> pageTask = null;
            Task<ServiceClientResponse<DocumentWithListInfo>> templateTask = null;
            Task<ServiceClientResponse<DocumentWithListInfo>> siteTemplateTask = null;
            var tasks = new List<Task<ServiceClientResponse<DocumentWithListInfo>>>();
            if (ProcessDocumentRequest(cmsPageContext.Page, "pages@mozu", out pageTask, pageContext.IsEditMode))
            {
                tasks.Add(pageTask);
            }
            if (ProcessDocumentRequest(cmsPageContext.SiteTemplate, "pageTemplateContent@mozu", out siteTemplateTask, pageContext.IsEditMode))
            {
                tasks.Add(siteTemplateTask);
            }
            if (ProcessDocumentRequest(cmsPageContext.Template, "pageTemplateContent@mozu", out templateTask, pageContext.IsEditMode))
            {
                tasks.Add(templateTask);
            }

            await Task.WhenAll(tasks.ToArray()).ConfigureAwait(false);
            if (pageTask != null && pageTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                cmsPageContext.Page = UpdateDocumentRequestFromTask(cmsPageContext.Page, pageTask);
            }
            if (templateTask != null && templateTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                cmsPageContext.Template = UpdateDocumentRequestFromTask(cmsPageContext.Template, templateTask);
            }
            if (siteTemplateTask != null && siteTemplateTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                cmsPageContext.SiteTemplate = UpdateDocumentRequestFromTask(cmsPageContext.SiteTemplate, siteTemplateTask);
            }   

            if (templateTask == null && cmsPageContext.Page.Document != null && cmsPageContext.Page.Document.Properties != null)
            {
                string templateName = cmsPageContext.Page.Document.Get<string>("template");
                string pageTypeDefinitionKey = cmsPageContext.Page.Document.Get<string>("page_type_definition");
                if (!string.IsNullOrWhiteSpace(pageTypeDefinitionKey))
                {
                    var ptd = siteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
                    templateName = (ptd != null && !string.IsNullOrWhiteSpace(ptd.Template)) ? ptd.Template : templateName;
                }

                if (!string.IsNullOrWhiteSpace(templateName))
                {

                    if (cmsPageContext.Template == null || cmsPageContext.Template.Document == null)
                    {
                        cmsPageContext.Template = new DocumentRequest
                        {
                            Path = templateName,
                            ListFQN = "pageTemplateContent@mozu"
                        };
                    }
                    if (ProcessDocumentRequest(cmsPageContext.Template, "pageTemplateContent@mozu", out templateTask, pageContext.IsEditMode))
                    {
                        await templateTask.ConfigureAwait(false);
                        if (templateTask.Result.ResponseMessage.IsSuccessStatusCode)
                        {
                            cmsPageContext.Template = UpdateDocumentRequestFromTask(cmsPageContext.Template, templateTask);
                        }
                    }
                }
            }

            cmsPageContext.RuntimeData = new List<ZoneRuntimeData>();
            AddRuntimeData(cmsPageContext.Page.Document, cmsPageContext, ZoneScope.Page);
            AddRuntimeData(cmsPageContext.Template.Document, cmsPageContext, ZoneScope.Template);
            AddRuntimeData(cmsPageContext.SiteTemplate.Document, cmsPageContext, ZoneScope.Site);
            cmsPageContext.Initialized = true;

            return true;
        }

        static DocumentRequest UpdateDocumentRequestFromTask(DocumentRequest docRequest, Task<ServiceClientResponse<DocumentWithListInfo>> docTask)
        {
            docRequest.Document = docTask.Result.ReadAsSync();
            if (docRequest.Document != null)
            {
                docRequest.Id = docRequest.Document.Id;
                docRequest.PublishState = docRequest.Document.PublishState;
            }
            return docRequest;
        }

        private void AddRuntimeData(Mozu.Content.Contracts.Document document, CmsPageContext cmsPageContext, ZoneScope scope)
        {
            if (document == null)
                return;
            var widgetRawArray = document.Get<JArray>(CmsConstants.Documents.widget_prop);
            List<ZoneRuntimeData> zoneData = widgetRawArray == null ? null : widgetRawArray.ToObject<List<ZoneRuntimeData>>();
            

            var src = new DocumentRequest
                      {
                          Id = document.Id,
                          ListFQN = document.ListFQN
                      };





            if (zoneData != null)
            {
                zoneData.ForEach(x =>
                {
                    x.Source = src;
                    x.Scope = scope;
                });
                cmsPageContext.RuntimeData.AddRange(zoneData);
            }
        }

        public void CreateTemplate_deleteme(DocumentRequest req, out Task<ServiceClientResponse<Document>> task)
        {
            if (req.Path == null)
            {
                task = null;
                return;
            }

            task = _cmsServiceWrapper.RawCreate2(
                new Document
                    {
                        ListFQN = "pageTemplateContent@mozu",
                        DocumentTypeFQN = "pageTemplateContent@mozu",
                        Name = Path.GetFileName(req.Path),
                      //  Path = Path.GetDirectoryName(req.Path)
                    });
            return;
        }
    }

    public static class ServiceClientResponse
    {
        public static ServiceClientResponse<T> FromResult<T>(T item, System.Net.HttpStatusCode desiredCode, Exception desiredException = null)
        {
            return new ServiceClientResponse<T>
            {
                HasException = desiredException == null,
                ReadAsAsync = () => Task.FromResult(item),
                ReadAsSync = () => item,
                ReadException = () => desiredException,
                ResponseMessage = new System.Net.Http.HttpResponseMessage(desiredCode)
            };
        }
    }
}