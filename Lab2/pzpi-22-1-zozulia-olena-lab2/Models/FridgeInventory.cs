using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class FridgeInventory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public Guid FridgeId { get; set; }
        public Fridge Fridge { get; set; }
        public Guid? FoodItemId { get; set; }
        public int Quantity { get; set; }
        public FoodItem? FoodItem { get; set; }
    }
}
