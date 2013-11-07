using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
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

        public Task<bool> InitCmsPageContext(CmsPageContext cmsPageContext)
        {
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
                    }
                    if (templateTask != null && templateTask.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        cmsPageContext.Template.Document = templateTask.Result.ReadAsSync();
                        cmsPageContext.Template.Id = cmsPageContext.Template.Document.Id;
                    }
                    if (siteTemplateTask != null && siteTemplateTask.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        cmsPageContext.SiteTemplate.Document = siteTemplateTask.Result.ReadAsSync();
                        cmsPageContext.SiteTemplate.Id = cmsPageContext.SiteTemplate.Document.Id;
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
                            }
                        }
                    }

                    cmsPageContext.RuntimeData = new List<WidgetRuntimeData>();
                    cmsPageContext.RuntimeData2 = new List<ZoneRuntimeData>();
                    cmsPageContext.RuntimeData2.Add(new ZoneRuntimeData
                                                        {
                                                            Id = "testzone1",
                                                            Rows = new List<ZoneRowRuntimeData>
                                                                       {
                                                                           new ZoneRowRuntimeData
                                                                               {
                                                                                   Columns = new List<ZoneColumnsRuntimeData>
                                                                                                 {
                                                                                                     new ZoneColumnsRuntimeData
                                                                                                         {
                                                                                                             Span = 4,
                                                                                                             Widgets = new List<ZoneWidgetRuntimeData>
                                                                                                                           {
                                                                                                                               new ZoneWidgetRuntimeData
                                                                                                                                   {
                                                                                                                                       Id = Guid.NewGuid().ToString(),
                                                                                                                                       DefinitionId = "content",
                                                                                                                                       Config = JObject.Parse("{\"body\": \"<h1>Hold on to your butts</h1><p>The path of the righteous\nman is beset on all sides by the iniquities of the selfish and the tyranny of\nevil men. Blessed is he who, in the name of charity and good will, shepherds\nthe weak through the valley of darkness, for he is truly his brother's keeper\nand the finder of lost children. And I will strike down upon thee with great\nvengeance and furious anger those who would attempt to poison and destroy My\nbrothers. And you will know My name is the Lord when I lay My vengeance upon\nthee. </p>\"}")
                                                                                                                                   },
                                                                                                                               new ZoneWidgetRuntimeData
                                                                                                                                   {
                                                                                                                                       Id = Guid.NewGuid().ToString(),
                                                                                                                                       DefinitionId = "content",
                                                                                                                                       Config = JObject.Parse("{\"body\": \"<h1>Hold on to your shoes</h1><p>The path of the righteous\nman is beset on all sides by the iniquities of the selfish and the tyranny of\nevil men. Blessed is he who, in the name of charity and good will, shepherds\nthe weak through the valley of darkness, for he is truly his brother's keeper\nand the finder of lost children. And I will strike down upon thee with great\nvengeance and furious anger those who would attempt to poison and destroy My\nbrothers. And you will know My name is the Lord when I lay My vengeance upon\nthee. </p>\"}")
                                                                                                                                   }
                                                                                                                           }
                                                                                                         },
                                                                                                     new ZoneColumnsRuntimeData
                                                                                                         {
                                                                                                             Span = 8,
                                                                                                             Widgets = new List<ZoneWidgetRuntimeData>
                                                                                                                           {
                                                                                                                               new ZoneWidgetRuntimeData
                                                                                                                                   {
                                                                                                                                       Id = Guid.NewGuid().ToString(),
                                                                                                                                       DefinitionId = "content",
                                                                                                                                       Config = JObject.Parse("{\"body\": \"<h1>stuff</h1><p>The path of the righteous\nman is beset on all sides by the iniquities of the selfish and the tyranny of\nevil men. Blessed is he who, in the name of charity and good will, shepherds\nthe weak through the valley of darkness, for he is truly his brother's keeper\nand the finder of lost children. And I will strike down upon thee with great\nvengeance and furious anger those who would attempt to poison and destroy My\nbrothers. And you will know My name is the Lord when I lay My vengeance upon\nthee. </p>\"}")
                                                                                                                                   },
                                                                                                                               new ZoneWidgetRuntimeData
                                                                                                                                   {
                                                                                                                                       Id = Guid.NewGuid().ToString(),
                                                                                                                                       DefinitionId = "content",
                                                                                                                                       Config = JObject.Parse("{\"body\": \"<h1>thing</h1><p>The path of the righteous\nman is beset on all sides by the iniquities of the selfish and the tyranny of\nevil men. Blessed is he who, in the name of charity and good will, shepherds\nthe weak through the valley of darkness, for he is truly his brother's keeper\nand the finder of lost children. And I will strike down upon thee with great\nvengeance and furious anger those who would attempt to poison and destroy My\nbrothers. And you will know My name is the Lord when I lay My vengeance upon\nthee. </p>\"}")
                                                                                                                                   },
                                                                                                                                    new ZoneWidgetRuntimeData
                                                                                                                                   {
                                                                                                                                       Id = Guid.NewGuid().ToString(),
                                                                                                                                       DefinitionId = "image",
                                                                                                                                       Config = JObject.Parse("{\"image\":{\"src\":\"http://www.andrew.cmu.edu/user/cfperron/cats/images/cat7.jpg\",\"alt\":\"cat\",\"height\":200,\"width\":200}}")
                                                                                                                                   }
                                                                                                                           }
                                                                                                         }
                                                                                                 }
                                                                               },
                                                                               new ZoneRowRuntimeData
                                                                               {
                                                                                   Columns = new List<ZoneColumnsRuntimeData>
                                                                                                 {
                                                                                                     new ZoneColumnsRuntimeData
                                                                                                         {
                                                                                                             Span = 12,
                                                                                                             Widgets = new List<ZoneWidgetRuntimeData>
                                                                                                                           {
                                                                                                                               new ZoneWidgetRuntimeData
                                                                                                                                   {
                                                                                                                                       Id = Guid.NewGuid().ToString(),
                                                                                                                                       DefinitionId = "content",
                                                                                                                                       Config = JObject.Parse("{\"body\": \"<h1>Hold on to your fud</h1><p>The path of the righteous\nman is beset on all sides by the iniquities of the selfish and the tyranny of\nevil men. Blessed is he who, in the name of charity and good will, shepherds\nthe weak through the valley of darkness, for he is truly his brother's keeper\nand the finder of lost children. And I will strike down upon thee with great\nvengeance and furious anger those who would attempt to poison and destroy My\nbrothers. And you will know My name is the Lord when I lay My vengeance upon\nthee. </p>\"}")
                                                                                                                                   }
                                                                                                                              
                                                                                                                           }
                                                                                                         },
                                                                                                    
                                                                                                 }
                                                                               }
                                                                       },
                                                        });
                    if (cmsPageContext.Page.Document != null)
                    {
                        var widgetRaw = (string) cmsPageContext.Page.Document.Get(CmsConstants.Documents.widget_prop);
                        List<WidgetRuntimeData> existingWidgets = string.IsNullOrEmpty(widgetRaw) ? new List<WidgetRuntimeData>() : JsonConvert.DeserializeObject<List<WidgetRuntimeData>>(widgetRaw);
                        var src = new DocumentRequest
                                      {
                                          Id = cmsPageContext.Page.Document.Id,
                                          Collection = cmsPageContext.Page.Document.DocumentListName
                                      };
                        existingWidgets.ForEach(x => x.Source = src);
                        cmsPageContext.RuntimeData.AddRange(existingWidgets);


                        List<ZoneRuntimeData> zoneData = string.IsNullOrEmpty(widgetRaw) ? null : JsonConvert.DeserializeObject<List<ZoneRuntimeData>>(widgetRaw);
                        if (zoneData != null)
                        {
                            zoneData.ForEach(x => x.Source = src);
                            cmsPageContext.RuntimeData2.AddRange(zoneData);
                        }
                    }
                    if (cmsPageContext.Template.Document != null)
                    {
                        var widgetRaw = (string) cmsPageContext.Template.Document.Get(CmsConstants.Documents.widget_prop);
                        List<WidgetRuntimeData> existingWidgets = string.IsNullOrEmpty(widgetRaw) ? new List<WidgetRuntimeData>() : JsonConvert.DeserializeObject<List<WidgetRuntimeData>>(widgetRaw);
                        var src = new DocumentRequest
                                      {
                                          Id = cmsPageContext.Template.Document.Id,
                                          Collection = cmsPageContext.Template.Document.DocumentListName
                                      };
                        existingWidgets.ForEach(x => x.Source = src);
                        cmsPageContext.RuntimeData.AddRange(existingWidgets);

                        List<ZoneRuntimeData> zoneData = string.IsNullOrEmpty(widgetRaw) ? null : JsonConvert.DeserializeObject<List<ZoneRuntimeData>>(widgetRaw);
                        if (zoneData != null)
                        {
                            zoneData.ForEach(x => x.Source = src);
                            cmsPageContext.RuntimeData2.AddRange(zoneData);
                        }
                    }
                    if (cmsPageContext.SiteTemplate.Document != null)
                    {
                        var widgetRaw = (string) cmsPageContext.SiteTemplate.Document.Get(CmsConstants.Documents.widget_prop);
                        List<WidgetRuntimeData> existingWidgets = string.IsNullOrEmpty(widgetRaw) ? new List<WidgetRuntimeData>() : JsonConvert.DeserializeObject<List<WidgetRuntimeData>>(widgetRaw);
                        var src = new DocumentRequest
                                      {
                                          Id = cmsPageContext.SiteTemplate.Document.Id,
                                          Collection = cmsPageContext.SiteTemplate.Document.DocumentListName
                                      };
                        existingWidgets.ForEach(x => x.Source = src);
                        cmsPageContext.RuntimeData.AddRange(existingWidgets);

                        List<ZoneRuntimeData> zoneData = string.IsNullOrEmpty(widgetRaw) ? null : JsonConvert.DeserializeObject<List<ZoneRuntimeData>>(widgetRaw);
                        if (zoneData != null)
                        {
                            zoneData.ForEach(x => x.Source = src);
                            cmsPageContext.RuntimeData2.AddRange(zoneData);
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