using System.Collections.Generic;
using System.Diagnostics;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DebuggerDisplay("{Status}")]
    public class StepStatus
    {
        /// <summary>
        /// This section hasn't been touched yet.
        /// </summary>
        public static StepStatus New = new StepStatus("new");

        /// <summary>
        /// This section is missing data and needs more values added to it.
        /// </summary>
        public static StepStatus Incomplete = new StepStatus("incomplete");

        /// <summary>
        /// This section is deemed "ready for submission".
        /// </summary>
        public static StepStatus Complete = new StepStatus("complete");

        /// <summary>
        /// There are problems or errors with this section.
        /// </summary>
        public static StepStatus Invalid = new StepStatus("invalid");

        private StepStatus(string status)
        {
            Status = status;
            Messages = new List<string>();
        }

        public string Status { get; set; }

        public List<string> Messages { get; set; }

        public override string ToString()
        {
            return Status;
        }
    }
}