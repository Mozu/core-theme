using System.Collections.Generic;
using System.Web.Http;
using AutoMapper;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class ReturnController
    {
        public class ReturnInternalNotesArgs
        {
            public string ReturnId { get; set; }
            public string NoteId { get; set; }
            public string Text { get; set; }
        }

        /// <summary>
        /// Creates a new internal note.
        /// </summary>
        [HttpPostRoute(UriTemplate = "internalnotes/create")]
        public async Task<Response<List<OrderNote>>> CreateInternalNote(List<ReturnInternalNotesArgs> args)
        {
            var ret = new List<OrderNote>();

            foreach (var arg in args)
            {
                var dcNote =
                    (await _returnWebApiClient.CreateReturnNote(arg.ReturnId, new DC.OrderNote {Text = arg.Text}))
                        .ReadAsSync();

                ret.Add(dcNote.Map<OrderNote>());
            }
            return List2(ret);
        }

        /// <summary>
        /// Deletes a note.
        /// </summary>
        [HttpPostRoute(UriTemplate = "internalnotes/delete")]
        public async Task<Response<OrderNote>> DeleteInternalNote(List<ReturnInternalNotesArgs> args)
        {
            foreach (var arg in args)
            {
                var resp = await _returnWebApiClient.DeleteReturnNote(arg.ReturnId, arg.NoteId);
                if (resp.HasException)
                {
                    throw resp.ReadException();
                }
                //todo check for error;
            }

            return SuccessWithTotal2<OrderNote>(1);
        }

        /// <summary>
        /// Edits a note.
        /// </summary>
        [HttpPostRoute(UriTemplate = "internalnotes/edit")]
        public async Task<Response<List<OrderNote>>> EditInternalNote(List<ReturnInternalNotesArgs> args)
        {
            var ret = new List<OrderNote>();
            foreach (var arg in args)
            {
                var dcNote = (await _returnWebApiClient.GetReturnNote(arg.ReturnId, arg.NoteId)).ReadAsSync();
                dcNote.Text = arg.Text;
                dcNote = (await _returnWebApiClient.UpdateReturnNote(arg.ReturnId, arg.NoteId, dcNote)).ReadAsSync();

                ret.Add(dcNote.Map<OrderNote>());
            }
            return List2(ret);
        }
    }
}
