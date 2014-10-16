using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.FileManagement;
using Mozu.SiteBuilder.UX.Admin.Helpers.FileManagerHelpers;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/filemanagement", SuppressDescriptorGeneration = true)]
    public class FileManagementController : BaseController
    {
        private const string MozuFilesDocList = "files@mozu";
        private readonly IDocumentListWebApiClient _documentWebApiClient;

        public FileManagementController(IDocumentListWebApiClient documentWebApiClient)
        {
            _documentWebApiClient = documentWebApiClient.CloneWithApiContext( x => { x.SiteId = null; });
        }

        [HttpGetRoute(UriTemplate = "file/list")]
        public async Task<Response<List<FileManagementFile>>> FileList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            List<FileManagementFile> vm = null;
            int totalCount = 0;
            string tmp;
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                
                var ret = (await _documentWebApiClient.GetDocument(
                    documentListName: MozuFilesDocList, 
                    documentId :pagingParams.id
                    )).ReadAsSync();
                vm = new List<FileManagementFile>() { Mapper.Map<FileManagementFile>(ret) };
                totalCount = 1;
            }
            else if (extFilter.TryGetValue("id", out tmp))
            {
                var tasks = extFilter.Where(x => x.field == "id").Select(extF => _documentWebApiClient.GetDocument(MozuFilesDocList, documentId: (string)extF.value)).ToArray();
                await Task.WhenAll(tasks);
                vm = tasks.Where(x => !x.Result.HasException).Select(x => x.Result.ReadAsSync()).Select(Mapper.Map<FileManagementFile>).ToList();
                totalCount = vm.Count;
            }
            else
            {
                var filter = extFilter.ToFilterString();
                string sortBy = pagingParams.sort.ToSortString();
                var ret = (await _documentWebApiClient.GetDocuments(documentListName: MozuFilesDocList, pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex, filter: filter, sortBy: sortBy)).ReadAsSync();
                vm = Mapper.Map<List<FileManagementFile>>(ret.Items);
                totalCount = ret.TotalCount;
            }
            return List2(vm, totalCount);
        }

        [HttpPostRoute(UriTemplate = "file/create")]
        public async Task<Response<List<FileManagementFile>>> CreateFile(List<FileManagementFile> files)
        {
            var vmList = new List<FileManagementFile>();
            foreach (var file in files)
            {
                string nameWoExt = Path.GetFileNameWithoutExtension(file.name);
                string ext = Path.GetExtension(file.name);

                var existingFiles = (await _documentWebApiClient.GetDocuments(documentListName: MozuFilesDocList, filter: string.Format("name sw \"{0}\"", nameWoExt.ToFilterSafeString()))).ReadAsSync().Items;
                if (existingFiles.Count > 0 || existingFiles.Any(x => x.Name.Equals(file.name, StringComparison.OrdinalIgnoreCase)))
                {
                    for (int i = 1; i < 200; i++)
                    {
                        file.name = nameWoExt + "_" + i + ext;
                        if (!existingFiles.Any(x => x.Name.Equals(file.name, StringComparison.OrdinalIgnoreCase)))
                        {
                            break;
                        }
                    }
                }
                var dm = new Content.Contracts.Document
                {
                    Name = file.name,
                    Id = file.id,
                    PublishState = CmsConstants.Documents.doc_state_active,
                    DocumentTypeFQN = "image@mozu",
                    //todo: file.fileType != null && file.fileType.IndexOf("im", StringComparison.OrdinalIgnoreCase) > -1 ? "image" : "document@mozu",
                    Properties = new JObject(
                        new JProperty("height", file.height),
                        new JProperty("width", file.width)
                        )
                };
                if (file.tags != null && file.tags.Length > 0)
                {
                    dm.Set("tags", file.tags);
                }

                dm = (await _documentWebApiClient.CreateDocument(MozuFilesDocList, dm)).ReadAsSync();
                var vm = Mapper.Map<FileManagementFile>(dm);
                vmList.Add(vm);
            }

            return List2(vmList);
        }

        [HttpPostRoute(UriTemplate = "file/delete")]
        public async Task<Response<FileManagementFile>> DeleteFile(List<FileManagementFile> files)
        {
            var b = true;
            foreach ( var file in files)
            {
                b = (await _documentWebApiClient.DeleteDocument(documentListName: MozuFilesDocList, documentId: file.id)).ResponseMessage.IsSuccessStatusCode;
            }

            return EmptySingle2<FileManagementFile>(b);
        }

        [HttpPostRoute(UriTemplate = "file/upload/{docid}")]
        public async Task<Response<string>> UploadContent(HttpRequestMessage request,string docid)
        {
            //todo add session id 
            var streamProvider = new MultipartFormDataStreamProvider(System.IO.Path.GetTempPath());
            await request.Content.ReadAsMultipartAsync(streamProvider);
            var fileinfo = new FileInfo(streamProvider.FileData.SingleOrDefault().LocalFileName);
            
            ServiceClientResponse<StreamContent> result;

            using(var fs = fileinfo.OpenRead())
            {
               var nvc = new NameValueCollection();
                nvc["Content-Type"] =  streamProvider.FileData.SingleOrDefault().Headers.ContentType.MediaType;

                var client = _documentWebApiClient.CloneWithConfigOptions(x => x.ContentType = streamProvider.FileData.SingleOrDefault().Headers.ContentType );
                result = (await client.UpdateDocumentContent(MozuFilesDocList, docid, fs));                
            }

            if (!result.ResponseMessage.IsSuccessStatusCode)
            {
                throw result.ReadException();
            }

            return Message3<string>(true, "File uploaded");
        }

        [HttpPostRoute(UriTemplate = "file/edit")]
        public async Task<Response<List<FileManagementFile>>> EditFile(FileManagementFile[] files)
        {
            var vms = new List<FileManagementFile>();
            foreach (var file in files)
            {
                var dm = (await _documentWebApiClient.GetDocument(documentListName: MozuFilesDocList, documentId: file.id)).ReadAsSync();
                dm.Name = file.name;

                dm.Set("tags", file.tags);
                var ret = (await _documentWebApiClient.UpdateDocument(MozuFilesDocList, dm.Id, dm)).ReadAsSync();

                var vm = Mapper.Map<FileManagementFile>(ret);
                vms.Add(vm);
            }

            return List2(vms);
        }
    }
}