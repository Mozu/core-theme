using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    /// <summary>
    /// Contains a summary of payment data.
    /// This class is a convenience class for the UI.
    /// </summary>
    
    public class OrderAuthorizationInfo
    {
        /// <summary>
        ///  total order amount
        /// </summary>
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// amount collected so far
        /// </summary>
        public decimal AmountCollected { get; set; }
    }
}
