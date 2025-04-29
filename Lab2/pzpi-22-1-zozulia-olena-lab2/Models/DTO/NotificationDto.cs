using System.Text.Json.Serialization;

namespace Models.DTO
{
    public class NotificationDto
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public DateTime DateTimeCreated { get; set; } = DateTime.UtcNow;
        public Guid UserId { get; set; }
        public Guid FridgeId { get; set; }
    }
}
