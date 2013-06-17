using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    /// <summary>
    /// Contains a summary of payment data.
    /// This class is a convenience class for the UI.
    /// </summary>
    [DataContract]
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

        /// <summary>
        /// amount eligible to be captured
        /// </summary>
        public decimal CaptureAmount { get; set; }

        /// <summary>
        ///  auth ready is when you have an authorized card with id
        /// </summary>
        public bool AuthReady { get; set; }

        /// <summary>
        /// canCapture is when you are authReady and you have a capture amount that is greater then 0
        /// </summary>
        public bool CanCapture { get; set; }

        /// <summary>
        /// shortcut to an authorized payment to capture
        /// </summary>
        public OrderPayment CaptureData { get; set; }
    }
}
