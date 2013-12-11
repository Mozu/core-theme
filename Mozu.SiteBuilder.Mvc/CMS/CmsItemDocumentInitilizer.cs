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
                    task = _cmsServiceWrapper.Get2(request.Collection ?? defaultCollection, request.Id);
                }
                if (request.Path != null)
                {
                    task = _cmsServiceWrapper.GetByPath2(request.Collection ?? defaultCollection, request.Path);
                }
            }
            return task != null;
        }

        public Task<bool> InitCmsPageContext(PageContext  pageContext )
        {
            CmsPageContext cmsPageContext = pageContext.CmsContext;
            if (cmsPageContext == null)
            {
                return new TaskCompletionSource<bool>(true).Task;
            }

            Task<ServiceClientResponse<Document>> pageTask = null;
            Task<ServiceClientResponse<Document>> templateTask = null;
            Task<ServiceClientResponse<Document>> siteTemplateTask = null;
            var tasks = new List<Task<ServiceClientResponse<Document>>>();
            if (cmsPageContext.Page.Document == null && ProcessDocumentRequest(cmsPageContext.Page, "pages", out pageTask))
            {
                tasks.Add(pageTask);
            }
            if (cmsPageContext.SiteTemplate.Document == null && ProcessDocumentRequest(cmsPageContext.SiteTemplate, "templates", out siteTemplateTask))
            {
                tasks.Add(siteTemplateTask);
            }
            if (cmsPageContext.Template.Document == null && ProcessDocumentRequest(cmsPageContext.Template, "templates", out templateTask))
            {
                tasks.Add(templateTask);
            }


            Task<bool> task = Task.WhenAll(tasks.ToArray()).ContinueWith(u =>
                {
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

                    tasks.Clear();

                    if (templateTask == null && cmsPageContext.Page.Document != null && cmsPageContext.Page.Document.Properties != null && cmsPageContext.Page.Document.Properties != null)
                    {
                        string templateName = cmsPageContext.Page.Document.Properties.Where(x => x.PropertyType == "template").Select(x => (string) x.Value).FirstOrDefault();
                        if (templateName != null)
                        {
                            if (cmsPageContext.Template == null)
                            {
                                cmsPageContext.Template = new DocumentRequest
                                                              {
                                                                  Path = templateName,
                                                                  Collection = "templates"
                                                              };
                            }
                            templateTask = _cmsServiceWrapper.GetByPath2("templates", templateName);
                            //todo....

                            tasks.Add(templateTask);
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
                   

                    if (cmsPageContext.Page.Document != null)
                    {
                        var widgetRaw = (string) cmsPageContext.Page.Document.Get(CmsConstants.Documents.widget_prop);
                        
                        var src = new DocumentRequest
                                      {
                                          Id = cmsPageContext.Page.Document.Id,
                                          Collection = cmsPageContext.Page.Document.DocumentListName
                                      };
                        
                    


                        List<ZoneRuntimeData> zoneData = string.IsNullOrEmpty(widgetRaw) ? null : JsonConvert.DeserializeObject<List<ZoneRuntimeData>>(widgetRaw);
                        if (zoneData != null)
                        {
                            zoneData.ForEach(x => x.Source = src);
                            cmsPageContext.RuntimeData.AddRange(zoneData);
                        }
                    }
                    if (cmsPageContext.Template.Document != null)
                    {
                        var widgetRaw = (string) cmsPageContext.Template.Document.Get(CmsConstants.Documents.widget_prop);
                        
                        var src = new DocumentRequest
                                      {
                                          Id = cmsPageContext.Template.Document.Id,
                                          Collection = cmsPageContext.Template.Document.DocumentListName
                                      };
                        
                       

                        List<ZoneRuntimeData> zoneData = string.IsNullOrEmpty(widgetRaw) ? null : JsonConvert.DeserializeObject<List<ZoneRuntimeData>>(widgetRaw);
                        if (zoneData != null)
                        {
                            zoneData.ForEach(x => x.Source = src);
                            cmsPageContext.RuntimeData.AddRange(zoneData);
                        }
                    }
                    if (cmsPageContext.SiteTemplate.Document != null)
                    {
                        var widgetRaw = (string) cmsPageContext.SiteTemplate.Document.Get(CmsConstants.Documents.widget_prop);
                        
                        var src = new DocumentRequest
                                      {
                                          Id = cmsPageContext.SiteTemplate.Document.Id,
                                          Collection = cmsPageContext.SiteTemplate.Document.DocumentListName
                                      };
                        
                        

                        List<ZoneRuntimeData> zoneData = string.IsNullOrEmpty(widgetRaw) ? null : JsonConvert.DeserializeObject<List<ZoneRuntimeData>>(widgetRaw);
                        if (zoneData != null)
                        {
                            zoneData.ForEach(x => x.Source = src);
                            cmsPageContext.RuntimeData.AddRange(zoneData);
                        }
                    }



                    cmsPageContext.Initialized = true;
                    return true;
                });

            return task;
        }

        public void CreateTemplate(DocumentRequest req, out Task<ServiceClientResponse<Document>> task)
        {
            if (req.Path == null)
            {
                task = null;
                return;
            }

            task = _cmsServiceWrapper.RawCreate2(
                new Document
                    {
                        DocumentListName = "templates",
                        DocumentType = "page_template",
                        Name = Path.GetFileName(req.Path),
                        Path = Path.GetDirectoryName(req.Path)
                    });
            return;
        }
    }
}