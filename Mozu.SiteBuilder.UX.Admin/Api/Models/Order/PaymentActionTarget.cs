using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.Core.Extensions;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class PaymentActionTarget
    {
        /// <summary>
        /// Specifies if the <see cref="TargetId"/> is a Checkout Id, Order Id, or Return Id.
        /// </summary>
        public string TargetType { get; set; }

        /// <summary>
        /// The Id of the Checkout/Order/Return to target.
        /// </summary>
        public string TargetId { get; set; }

        /// <summary>
        /// The number of the Checkout/Order/Return to target.
        /// </summary>
        public int? TargetNumber { get; set; }

    }

}