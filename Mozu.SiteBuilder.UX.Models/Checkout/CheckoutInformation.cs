using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public abstract class CheckoutInformation : ModelBase
    {
        protected CheckoutInformation()
        {
            StepStatus = StepStatus.New;
        }

        [DataMember(Name = "orderId", EmitDefaultValue = false)]
        public string OrderId { get; set; }

        [DataMember(Name = "stepStatus", EmitDefaultValue = false)]
        public virtual string StepStatusText
        {
            get { return StepStatus.Status; }
        }

        public StepStatus StepStatus { get; protected set; }

        public void SetStepStatus(StepStatus stepStatus)
        {
            StepStatus = stepStatus;
        }
    }
}