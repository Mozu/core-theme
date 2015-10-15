using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Users
{
    [DataContract]
    public class Role : ModelBase
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "behaviors")]
        public List<Behavior> Behaviors { get; set; }

        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "isEditable")]
        public bool IsSystemRole { get; set; }
    }

    [DataContract]
    public class RoleBehavior : ModelBase
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "roleId")]
        public int RoleId { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "children")]
        public List<int> Children { get; set; }

        [DataMember(Name = "checked")]
        public bool? IsGranted { get; set; }
    }

    [DataContract]
    public class Behavior : ModelBase
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        public int CategoryId { get; set; }

        public BehaviorCategory Category { get; set; }
    }

    [DataContract]
    public class BehaviorCategory : ModelBase
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set;   }

        public int ParentCategoryId { get; set; }

        public IEnumerable<BehaviorCategory> Categories { get; set; }

        public IEnumerable<Behavior> Behaviors { get; set; }
    }

    [DataContract]
    public class BehaviorCategoryBehavior : ModelBase
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "categoryId")]
        public string CategoryId { get; set; }

        [DataMember(Name = "categoryName")]
        public string CategoryName { get; set; }
    }

    [DataContract]
    public class BehaviorTree : ModelBase
    {
        private const string BehaviorCategoryCls = "behavior-category";
        private const string BehaviorCls = "behavior";


        public BehaviorTree(IEnumerable<BehaviorCategory> categories, IEnumerable<Behavior> behaviors)
        {

            Nodes = (from c in categories
                     let node = BuildNode(c, categories, behaviors)
                     select node).ToList();
        }

        public BehaviorTree(System.Threading.Tasks.Task<List<BehaviorCategory>> categories, System.Threading.Tasks.Task<List<Behavior>> behaviors)
        {
            // TODO: Complete member initialization
            var allCats = categories.Result;
            var allBehaviors = behaviors.Result;
            var cats = allCats.Where(x => allBehaviors.Any(_ => _.CategoryId == x.Id));

            Nodes = (from c in cats
                     let node = BuildNode(c, cats, allBehaviors)
                     select node).ToList();


        }

        private static BehaviorTreeNode BuildNode(BehaviorCategory category, IEnumerable<BehaviorCategory> categories, IEnumerable<Behavior> behaviors)
        {
            category.Behaviors = behaviors.Where(x => x.CategoryId == category.Id);
            category.Categories = categories.Where(x => x.ParentCategoryId == category.Id);

            return new BehaviorTreeNode
            {
                Id= "cat"+category.Id ,
                Name = category.Name,
                Cls = BehaviorCategoryCls,
                Children = behaviors.Where(x => x.CategoryId == category.Id).Select(CreateBehavior).ToList(),
            };
        }

        private static BehaviorTreeNode CreateBehavior(Behavior behavior)
        {
            return new BehaviorTreeNode
            {
                Id= behavior.Id.ToString(),
                Cls = BehaviorCls,
                Name = behavior.Name,
                BehaviorId = behavior.Id,
            };
        }

        [DataMember(Name = "nodes")]
        public List<BehaviorTreeNode> Nodes { get; set; }

        [DataContract]
        public class BehaviorTreeNode : ModelBase
        {
            public BehaviorTreeNode()
            {
                
             //   Id = Guid.NewGuid().ToString("n");
            }
            
            [DataMember(Name = "id")]
            public string Id { get;  set; }

            [DataMember(Name = "name")]
            public string Name { get; set; }

            [DataMember(Name = "cls")]
            public string Cls { get; set; }

            [DataMember(Name = "checked", EmitDefaultValue = false)]
            public bool? Selected { get; set; }

            [DataMember(Name = "items")]
            public List<BehaviorTreeNode> Children { get; set; }

            [DataMember(Name = "behaviorId", EmitDefaultValue = false)]
            public int? BehaviorId { get; set; }

            [DataMember(Name = "roleId", EmitDefaultValue = false)]
            public int? RoleId { get; set; }

            [DataMember(Name = "expanded", EmitDefaultValue = false)]
            public bool Expanded { get { return true; } }

            [DataMember(Name = "loaded", EmitDefaultValue = false)]
            public bool loaded { get { return true; } }
            

            [DataMember(Name = "leaf ", EmitDefaultValue = false)]
            public bool IsLeaf
            {
                get { return BehaviorId.GetValueOrDefault(-1) > 0; }
            }

        }

        public BehaviorTree Assign(RoleBehavior roleBehavior)
        {
            foreach (var node in Nodes)
            {
                TrySelectNode(node, roleBehavior.Children);
            }

            return this;
        }

        private static void TrySelectNode(BehaviorTreeNode node, ICollection<int> behaviors)
        {
            switch (node.Cls)
            {
                case BehaviorCategoryCls:
                {
                    foreach (var child in node.Children)
                    {
                        TrySelectNode(child, behaviors);
                    }
                    return;
                }
                case BehaviorCls:
                {
                    node.Selected = behaviors.Select(x => (int?)x).Contains(node.BehaviorId);
                    return;
                }
                default:
                {
                    throw new InvalidOperationException();
                }
            }
        }
    }
}