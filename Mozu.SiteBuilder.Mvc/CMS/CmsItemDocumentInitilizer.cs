using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web.UI;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Mongo.JobScheduler;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json;
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

        public bool ProcessDocumentRequest(DocumentRequest request, string defaultCollection, out Task<ServiceClientResponse<Document>> task)
        {
            task = null;
            if (request != null)
            {
                if (request.Id != null)
                {
                    task = _cmsServiceWrapper.Get2(request.ListFQN ?? defaultCollection, request.Id, request.IncludeInactiveDocument);
                }
                if (request.Path != null)
                {
                    task = _cmsServiceWrapper.GetByPath2(request.ListFQN ?? defaultCollection, request.Path, includeInactive: request.IncludeInactiveDocument);
                }
            }
            return task != null;
        }

        public async Task<bool> InitCmsPageContext(PageContext pageContext, SiteContext siteContext)
        {
            CmsPageContext cmsPageContext = pageContext.CmsContext;
            
            if (cmsPageContext == null)
            {
                return true;
            }

            Task<ServiceClientResponse<Document>> pageTask = null;
            Task<ServiceClientResponse<Document>> templateTask = null;
            Task<ServiceClientResponse<Document>> siteTemplateTask = null;
            var tasks = new List<Task<ServiceClientResponse<Document>>>();
            if (cmsPageContext.Page.Document == null && ProcessDocumentRequest(cmsPageContext.Page, "pages@mozu", out pageTask))
            {
                tasks.Add(pageTask);
            }
            if (cmsPageContext.SiteTemplate.Document == null && ProcessDocumentRequest(cmsPageContext.SiteTemplate, "pageTemplateContent@mozu", out siteTemplateTask))
            {
                tasks.Add(siteTemplateTask);
            }
            if (cmsPageContext.Template.Document == null && ProcessDocumentRequest(cmsPageContext.Template, "pageTemplateContent@mozu", out templateTask))
            {
                tasks.Add(templateTask);
            }

            await Task.WhenAll(tasks.ToArray()).ConfigureAwait(false);
           // Task<bool> task = .ContinueWith(u =>
           //     {
                    if (pageTask != null && pageTask.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        cmsPageContext.Page.Document = pageTask.Result.ReadAsSync();
                        cmsPageContext.Page.Id = cmsPageContext.Page.Document.Id;
                        cmsPageContext.Page.PublishState = cmsPageContext.Page.Document.PublishState;
                    }
                    if (templateTask != null && templateTask.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        cmsPageContext.Template.Document = templateTask.Result.ReadAsSync();
                        cmsPageContext.Template.Id = cmsPageContext.Template.Document.Id;
                        cmsPageContext.Template.PublishState = cmsPageContext.Template.Document.PublishState;
                    }
                    if (siteTemplateTask != null && siteTemplateTask.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        cmsPageContext.SiteTemplate.Document = siteTemplateTask.Result.ReadAsSync();
                        cmsPageContext.SiteTemplate.Id = cmsPageContext.SiteTemplate.Document.Id;
                        cmsPageContext.SiteTemplate.PublishState = cmsPageContext.SiteTemplate.Document.PublishState;
                    }

                   // tasks.Clear();

                    if (templateTask == null && cmsPageContext.Page.Document != null && cmsPageContext.Page.Document.Properties != null && cmsPageContext.Page.Document.Properties != null)
                    {
                        string templateName = cmsPageContext.Page.Document.Get<string>("template");
                        string pageTypeDefinitionKey = cmsPageContext.Page.Document.Get<string>("page_type_definition");
                        if (!string.IsNullOrWhiteSpace(pageTypeDefinitionKey))
                        {
                            var ptd  = siteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, pageTypeDefinitionKey, StringComparison.OrdinalIgnoreCase));
                            templateName = (ptd != null && !string.IsNullOrWhiteSpace(ptd.Template)) ? ptd.Template : templateName;
                        }

                        
                        if (!string.IsNullOrWhiteSpace(templateName ))
                        {

                            if (cmsPageContext.Template == null)
                            {
                                cmsPageContext.Template = new DocumentRequest
                                                              {
                                                                  Path = templateName,
                                                                  ListFQN = "pageTemplateContent@mozu"
                                                              };
                            }
                            templateTask = _cmsServiceWrapper.GetByPath2(cmsPageContext.Template.ListFQN, cmsPageContext.Template.Path );
                            //todo....
                            await templateTask.ConfigureAwait(false);
                           // tasks.Add(templateTask);
                            //var res = await templateTask;
                            ServiceClientResponse<Document> res = templateTask.Result;
                            if (templateTask.Result.ResponseMessage.IsSuccessStatusCode)
                            {
                                cmsPageContext.Template.Document = templateTask.Result.ReadAsSync();
                                cmsPageContext.Template.Id = cmsPageContext.Template.Document.Id;
                                cmsPageContext.Template.PublishState = cmsPageContext.Template.Document.PublishState;
                            }
                        }
                    }

               
                    cmsPageContext.RuntimeData = new List<ZoneRuntimeData>();
                   

                    
                   
                    AddRuntimeData(cmsPageContext.Page.Document, cmsPageContext, ZoneScope.Page);
                    AddRuntimeData(cmsPageContext.Template.Document, cmsPageContext, ZoneScope.Template);
                    AddRuntimeData(cmsPageContext.SiteTemplate.Document, cmsPageContext, ZoneScope.Site);
                    



                    cmsPageContext.Initialized = true;
                    return true;
           //     });

           
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
}