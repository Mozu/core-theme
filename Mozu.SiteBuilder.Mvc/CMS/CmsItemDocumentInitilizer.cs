using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Document = Mozu.Content.Contracts.Document;
using Mozu.SiteBuilder.Mvc.Cms;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsHelper
    {
        private readonly ICmsServiceWrapper _cmsServiceWrapper;

        public CmsHelper(ICmsServiceWrapper cmsServiceWrapper )
        {
            _cmsServiceWrapper = cmsServiceWrapper;
        }

        public bool ProcessDocumentRequest(DocumentRequest request, out Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> task)
        {
            task = null;
            if (request != null)
            {
                if (request.Id != null)
                {
                    task = _cmsServiceWrapper.Get(request.Collection, request.Id);

                }
                if (request.Path != null)
                {
                    task = _cmsServiceWrapper.GetByPath(request.Collection, request.Path);
                }
            }
            return task != null;
        }

        public async Task<bool> InitCmsPageContext(CmsPageContext cmsPageContext)
        {

            if (cmsPageContext == null)
            {
                return false;
            }
            Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> pageTask = null;
            Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> templateTask = null;
            Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> siteTemplateTask = null;
            var tasks = new List<Task<ServiceClientResponse<Document>>>();
            if (cmsPageContext.Page == null && ProcessDocumentRequest(cmsPageContext.PageReq, out pageTask))
            {
                tasks.Add(pageTask);
            }
            if (cmsPageContext.SiteTemplate == null && ProcessDocumentRequest(cmsPageContext.SiteTemplateReq, out siteTemplateTask))
            {
                tasks.Add(siteTemplateTask);
            }
            if (cmsPageContext.Template == null && ProcessDocumentRequest(cmsPageContext.TemplateReq, out templateTask))
            {
                tasks.Add(templateTask);
            }


            await Task.WhenAll(tasks.ToArray());
            if (pageTask != null && pageTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                cmsPageContext.Page = pageTask.Result.ReadAsSync();
                cmsPageContext.PageReq.Id = cmsPageContext.Page.Id;
            }
            if (templateTask != null && templateTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                cmsPageContext.Template = templateTask.Result.ReadAsSync();
                cmsPageContext.Template.Id = cmsPageContext.Template.Id;
            }
            if (siteTemplateTask != null && siteTemplateTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                cmsPageContext.SiteTemplate = siteTemplateTask.Result.ReadAsSync();
                cmsPageContext.SiteTemplate.Id = cmsPageContext.SiteTemplate.Id;
            }

            tasks.Clear();

            if (templateTask == null && cmsPageContext.Page != null && cmsPageContext.Page.Properties != null && cmsPageContext.Page.Properties != null)
            {
                string templateName = cmsPageContext.Page.Properties.Where(x => x.PropertyType == "template").Select(x => (string)x.Value).FirstOrDefault();
                if (templateName != null)
                {
                    if (cmsPageContext.TemplateReq == null)
                    {
                        cmsPageContext.TemplateReq = new DocumentRequest()
                                                         {
                                                             Path = templateName ,
                                                             Collection="templates"
                                                         };
                    }
                    templateTask = _cmsServiceWrapper.GetByPath("templates", templateName);
                    tasks.Add(templateTask);
                    var res = await templateTask;
                    if (templateTask.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        
                        cmsPageContext.Template = templateTask.Result.ReadAsSync();
                        cmsPageContext.TemplateReq.Id = cmsPageContext.Template.Id;
                    }
                }

            }

            cmsPageContext.RuntimeData = new List<WidgetRuntimeData>();
            if (cmsPageContext.Page != null)
            {
                var widgetRaw = (string)cmsPageContext.Page.Get(CmsServiceWrapper.WIDGETPROPNAME);
                var existingWidgets = string.IsNullOrEmpty(widgetRaw) ? new List<WidgetRuntimeData>() : Newtonsoft.Json.JsonConvert.DeserializeObject<List<WidgetRuntimeData>>(widgetRaw);
                cmsPageContext.RuntimeData.AddRange(existingWidgets);

            }
            if (cmsPageContext.Template  != null)
            {
                var widgetRaw = (string)cmsPageContext.Template.Get(CmsServiceWrapper.WIDGETPROPNAME);
                var existingWidgets = string.IsNullOrEmpty(widgetRaw) ? new List<WidgetRuntimeData>() : Newtonsoft.Json.JsonConvert.DeserializeObject<List<WidgetRuntimeData>>(widgetRaw);
                cmsPageContext.RuntimeData.AddRange(existingWidgets);

            }
            if (cmsPageContext.SiteTemplate  != null)
            {
                var widgetRaw = (string)cmsPageContext.SiteTemplate.Get(CmsServiceWrapper.WIDGETPROPNAME);
                var existingWidgets = string.IsNullOrEmpty(widgetRaw) ? new List<WidgetRuntimeData>() : Newtonsoft.Json.JsonConvert.DeserializeObject<List<WidgetRuntimeData>>(widgetRaw);
                cmsPageContext.RuntimeData.AddRange(existingWidgets);

            }
            cmsPageContext.Initialized = true;
            return true;


        }

        public void CreateTemplate(DocumentRequest req, out Task<ServiceClientResponse<Document>> task)
        {
            if (req.Path == null)
            {
                task = null;
                return;
            }

            task = _cmsServiceWrapper.RawCreate(
                new Document()
                    {
                        DocumentListName = "templates",
                        DocumentType = "page_template",
                        Name = System.IO.Path.GetFileName(req.Path),
                        Path = System.IO.Path.GetDirectoryName(req.Path)
                    });
            return;
        }
    }
}
