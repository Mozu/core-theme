using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class OrderInternalNotesArgs
        {
            public string OrderId { get; set; }
            public string NoteId { get; set; }
            public string Text { get; set; }
        }


        /// <summary>
        /// Creates a new internal note.
        /// </summary>
        [HttpPostRoute(UriTemplate = "internalnotes/create")]
        public async Task<Response<OrderNote>> CreateInternalNote(OrderInternalNotesArgs args) {
            var dcNote = (await _orderWebApiClient.CreateOrderNote(args.OrderId, new DC.OrderNote { Text = args.Text })).ReadAsSync();

            return Single2(dcNote.Map<OrderNote>());
        }

        /// <summary>
        /// Deletes a note.
        /// </summary>
        [HttpPostRoute(UriTemplate = "internalnotes/delete")]
        public async Task<Response<OrderNote>> DeleteInternalNote(OrderInternalNotesArgs args)
        {
            (await _orderWebApiClient.DeleteOrderNote(args.OrderId, args.NoteId)).ReadAsSync();

            return SuccessWithTotal2<OrderNote>(1);
        }

        /// <summary>
        /// Edits a note.
        /// </summary>
        [HttpPostRoute(UriTemplate = "internalnotes/edit")]
        public async Task<Response<OrderNote>> EditInternalNote(OrderInternalNotesArgs args)
        {
            var dcNote = (await _orderWebApiClient.GetOrderNote(args.OrderId, args.NoteId)).ReadAsSync();
            dcNote.Text = args.Text;
            dcNote = (await _orderWebApiClient.UpdateOrderNote(args.OrderId, args.NoteId, dcNote)).ReadAsSync();

            return Single2(dcNote.Map<OrderNote>());
        }
    }
}
