using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Enums;
using Models;
using Models.DTO;
using Repositories;
using System.Collections.Concurrent;

namespace Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class DeviceController : ControllerBase
    {
        private readonly IFridgeRepository _fridgeRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;

        private static readonly ConcurrentDictionary<Guid, List<TemperatureLogDto>> _temperatureLogs = new();

        public DeviceController(IFridgeRepository fridgeRepository,
            INotificationRepository notificationRepository,
            IMapper mapper,
            IOrderRepository orderRepository)
        {
            _fridgeRepository = fridgeRepository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _orderRepository = orderRepository;
        }

        private async Task<bool> IsAuthorizedFridge(Guid fridgeId)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "SuperAdmin")
                return true;

            var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
            if (string.IsNullOrEmpty(companyIdClaim) || !Guid.TryParse(companyIdClaim, out var companyId))
                return false;

            var fridge = await _fridgeRepository.GetByIdAsync(fridgeId);
            return fridge != null && fridge.CompanyId == companyId;
        }

        [HttpGet("fridge/{fridgeId}")]
        public async Task<IActionResult> GetFridgeStatus(Guid fridgeId)
        {
            if (!await IsAuthorizedFridge(fridgeId))
                return Forbid("Access denied. Fridge does not belong to your company.");

            var fridge = await _fridgeRepository.GetByIdAsync(fridgeId);
            if (fridge == null)
                return NotFound(new { message = "Fridge not found" });

            var fridgeDto = _mapper.Map<FridgeDto>(fridge);
            return Ok(fridgeDto);
        }

        [HttpPost("fridge/{fridgeId}/door-status")]
        public async Task<IActionResult> UpdateFridgeDoorStatus(Guid fridgeId, [FromBody] DoorStatusDto doorStatusDto)
        {
            if (!await IsAuthorizedFridge(fridgeId))
                return Forbid("Access denied. Fridge does not belong to your company.");

            var fridge = await _fridgeRepository.GetByIdAsync(fridgeId);
            if (fridge == null)
                return NotFound(new { message = "Fridge not found" });

            var order = await _orderRepository.GetByIdAsync(doorStatusDto.OrderId);
            if (order == null)
                return NotFound(new { message = "Order not found" });

            if (order.PaymentStatus != PaymentStatus.Completed)
            {
                var notification = new Notification
                {
                    Title = "Fridge Door Status",
                    Text = "Payment failed. The fridge door is not open.",
                    DateTimeCreated = DateTime.UtcNow,
                    FridgeId = fridge.Id
                };

                await _notificationRepository.AddAsync(notification);
                var notificationDto = _mapper.Map<NotificationDto>(notification);
                return BadRequest(notificationDto);
            }

            string message = doorStatusDto.IsDoorOpened ? "Fridge door opened" : "Fridge door closed";

            var doorStatusNotification = new Notification
            {
                Title = "Fridge Door Status",
                Text = message,
                DateTimeCreated = DateTime.UtcNow,
                FridgeId = fridge.Id
            };

            await _notificationRepository.AddAsync(doorStatusNotification);
            var doorStatusNotificationDto = _mapper.Map<NotificationDto>(doorStatusNotification);

            return Ok(doorStatusNotificationDto);
        }

        [HttpPost("fridge/{fridgeId}/status")]
        public async Task<IActionResult> UpdateFridgeStatus(Guid fridgeId, [FromBody] FridgeStatusDto fridgeStatus)
        {
            if (!await IsAuthorizedFridge(fridgeId))
                return Forbid("Access denied. Fridge does not belong to your company.");

            var fridge = await _fridgeRepository.GetByIdAsync(fridgeId);
            if (fridge == null)
                return NotFound(new { message = "Fridge not found" });

            if (fridgeStatus.CurrentTemperature < fridge.MinTemperature)
            {
                var tempAlert = new Notification
                {
                    Title = "Temperature Alert",
                    Text = $"Current temperature {fridgeStatus.CurrentTemperature} is too low, minimum is {fridge.MinTemperature}!",
                    DateTimeCreated = DateTime.UtcNow,
                    FridgeId = fridge.Id
                };
                await _notificationRepository.AddAsync(tempAlert);
            }

            if (fridgeStatus.InventoryLevel < fridge.MinInventoryLevel)
            {
                var inventoryAlert = new Notification
                {
                    Title = "Inventory Alert",
                    Text = $"Current inventory level {fridgeStatus.InventoryLevel} is too low, minimum is {fridge.MinInventoryLevel}!",
                    DateTimeCreated = DateTime.UtcNow,
                    FridgeId = fridge.Id
                };
                await _notificationRepository.AddAsync(inventoryAlert);
            }

            return Ok(new { message = "Fridge status updated and alerts checked" });
        }

        [HttpPost("fridge/{fridgeId}/temperature-log")]
        public async Task<IActionResult> AddTemperatureLog(Guid fridgeId, [FromBody] TemperatureLogDto logDto)
        {
            if (!await IsAuthorizedFridge(fridgeId))
                return Forbid("Access denied. Fridge does not belong to your company.");

            var log = new TemperatureLogDto
            {
                Id = Guid.NewGuid(),
                FridgeId = fridgeId,
                Timestamp = DateTime.UtcNow,
                Temperature = logDto.Temperature
            };

            _temperatureLogs.AddOrUpdate(fridgeId,
                new List<TemperatureLogDto> { log },
                (key, existingLogs) =>
                {
                    existingLogs.Add(log);
                    return existingLogs;
                });

            var existingLogs = _temperatureLogs[fridgeId];

            if (existingLogs.Count > 1)
            {
                double lastTemperature = existingLogs[^2].Temperature;
                double temperatureDifference = Math.Abs(lastTemperature - log.Temperature);

                const double fluctuationThreshold = 5.0;

                if (temperatureDifference > fluctuationThreshold)
                {
                    var notification = new Notification
                    {
                        Title = "Warning: High temperature fluctuation detected!",
                        Text = $"Temperature fluctuated by {temperatureDifference:F1}°C. Last: {lastTemperature:F1}°C, Current: {log.Temperature:F1}°C.",
                        DateTimeCreated = DateTime.UtcNow,
                        FridgeId = fridgeId
                    };

                    await _notificationRepository.AddAsync(notification);
                }
            }

            return Ok(new { message = "Temperature log added successfully" });
        }

    }
}
