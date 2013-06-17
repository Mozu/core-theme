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
        [DataMember(Name="totalAmount")]
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// amount collected so far
        /// </summary>
        [DataMember(Name = "amountCollected")]
        public decimal AmountCollected { get; set; }

        /// <summary>
        /// amount eligible to be captured
        /// </summary>
        [DataMember(Name = "captureAmount")]
        public decimal CaptureAmount { get; set; }

        /// <summary>
        ///  auth ready is when you have an authorized card with id
        /// </summary>
        [DataMember(Name = "authReady")]
        public bool AuthReady { get; set; }

        /// <summary>
        /// canCapture is when you are authReady and you have a capture amount that is greater then 0
        /// </summary>
        [DataMember(Name = "canCapture")]
        public bool CanCapture { get; set; }

        /// <summary>
        /// shortcut to an authorized payment to capture
        /// </summary>
        [DataMember(Name = "captureData")]
        public OrderPayment CaptureData { get; set; }
    }
}
