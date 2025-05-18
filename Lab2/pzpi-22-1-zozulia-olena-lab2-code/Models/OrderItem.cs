using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class OrderItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Order Order { get; set; }
        public Guid FridgeInventoryId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public FridgeInventory FridgeInventory { get; set; }
    }
}
