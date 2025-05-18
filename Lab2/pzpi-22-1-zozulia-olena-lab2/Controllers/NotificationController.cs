using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;

namespace Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin,Contractor")]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly SmartLunchDbContext _context;

        public NotificationController(
            INotificationRepository notificationRepository,
            IUserRepository userRepository,
            IMapper mapper, SmartLunchDbContext context)
        {
            _notificationRepository = notificationRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _context = context;
        }

        private (string Role, Guid CompanyId, Guid UserId) GetCurrentUserClaims()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;
            Guid.TryParse(companyIdClaim, out var companyId);
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid.TryParse(userIdClaim, out var userId);

            return (role, companyId, userId);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var (role, companyId, userId) = GetCurrentUserClaims();

            var notifications = await _notificationRepository.GetAllAsync();

            IEnumerable<Notification> filteredNotifications = role switch
            {
                "SuperAdmin" => notifications,

                "Admin" => notifications
                    .Where(n => n.Fridge != null && n.Fridge.CompanyId == companyId),

                "Contractor" => notifications
                    .Where(n => n.UserId == userId),

                _ => Enumerable.Empty<Notification>()
            };

            var notificationDtos = _mapper.Map<List<NotificationDto>>(filteredNotifications);
            return Ok(notificationDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var (role, companyId, userId) = GetCurrentUserClaims();

            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
                return NotFound();

            bool hasAccess = role switch
            {
                "SuperAdmin" => true,
                "Admin" => notification.Fridge != null && notification.Fridge.CompanyId == companyId,
                "Contractor" => notification.UserId == userId,
                _ => false
            };

            if (!hasAccess)
                return Forbid();

            var notificationDto = _mapper.Map<NotificationDto>(notification);
            return Ok(notificationDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NotificationDto notificationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (role, companyId, userId) = GetCurrentUserClaims();

            if (notificationDto.UserId != Guid.Empty)
            {
                var user = await _userRepository.GetByIdAsync(notificationDto.UserId);
                if (user == null)
                    return BadRequest("Invalid UserId. User does not exist.");
            }

            if (notificationDto.FridgeId != null && notificationDto.FridgeId != Guid.Empty)
            {
                var fridge = await _context.Fridges.FindAsync(notificationDto.FridgeId);
                if (fridge == null)
                    return BadRequest("Invalid FridgeId. Fridge does not exist.");

                if (role == "Admin" && fridge.CompanyId != companyId)
                    return Forbid("Admins can create notifications only for their company fridges.");
            }

            if (role == "Contractor")
            {
                if (notificationDto.UserId != userId)
                    return Forbid("Contractors can create notifications only for themselves.");
            }

            var notification = _mapper.Map<Notification>(notificationDto);
            notification.DateTimeCreated = DateTime.UtcNow;

            await _notificationRepository.AddAsync(notification);

            var createdNotificationDto = _mapper.Map<NotificationDto>(notification);
            return CreatedAtAction(nameof(GetById), new { id = createdNotificationDto.Id }, createdNotificationDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] NotificationDto notificationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (role, companyId, userId) = GetCurrentUserClaims();

            var existingNotification = await _notificationRepository.GetByIdAsync(id);
            if (existingNotification == null)
                return NotFound("Notification not found.");

            bool canEdit = role switch
            {
                "SuperAdmin" => true,
                "Admin" => existingNotification.Fridge != null && existingNotification.Fridge.CompanyId == companyId,
                "Contractor" => existingNotification.UserId == userId,
                _ => false
            };

            if (!canEdit)
                return Forbid();

            if (notificationDto.UserId != Guid.Empty)
            {
                var user = await _userRepository.GetByIdAsync(notificationDto.UserId);
                if (user == null)
                    return BadRequest("Invalid UserId. User does not exist.");
            }

            if (notificationDto.FridgeId != null && notificationDto.FridgeId != Guid.Empty)
            {
                var fridge = await _context.Fridges.FindAsync(notificationDto.FridgeId);
                if (fridge == null)
                    return BadRequest("Invalid FridgeId. Fridge does not exist.");

                if (role == "Admin" && fridge.CompanyId != companyId)
                    return Forbid("Admins can update notifications only for their company fridges.");
            }

            if (role == "Contractor" && notificationDto.UserId != userId)
                return Forbid("Contractors can update only their own notifications.");

            _mapper.Map(notificationDto, existingNotification);

            await _notificationRepository.UpdateAsync(existingNotification);

            var updatedNotificationDto = _mapper.Map<NotificationDto>(existingNotification);
            return Ok(updatedNotificationDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var (role, companyId, userId) = GetCurrentUserClaims();

            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
                return NotFound();

            bool canDelete = role switch
            {
                "SuperAdmin" => true,
                "Admin" => notification.Fridge != null && notification.Fridge.CompanyId == companyId,
                "Contractor" => notification.UserId == userId,
                _ => false
            };

            if (!canDelete)
                return Forbid();

            await _notificationRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
