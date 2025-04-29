using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;

namespace Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public NotificationController(
            INotificationRepository notificationRepository,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var notifications = await _notificationRepository.GetAllAsync();
            var notificationDtos = _mapper.Map<List<NotificationDto>>(notifications);
            return Ok(notificationDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            var notificationDto = _mapper.Map<NotificationDto>(notification);
            return Ok(notificationDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NotificationDto notificationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (notificationDto.UserId != Guid.Empty)
            {
                var user = await _userRepository.GetByIdAsync(notificationDto.UserId);
                if (user == null)
                {
                    return BadRequest("Invalid UserId. User does not exist.");
                }
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
            {
                return BadRequest(ModelState);
            }

            var existingNotification = await _notificationRepository.GetByIdAsync(id);
            if (existingNotification == null)
            {
                return NotFound("Notification not found.");
            }

            if (notificationDto.UserId != Guid.Empty)
            {
                var user = await _userRepository.GetByIdAsync(notificationDto.UserId);
                if (user == null)
                {
                    return BadRequest("Invalid UserId. User does not exist.");
                }
            }

            _mapper.Map(notificationDto, existingNotification);

            await _notificationRepository.UpdateAsync(existingNotification);

            var updatedNotificationDto = _mapper.Map<NotificationDto>(existingNotification);
            return Ok(updatedNotificationDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            await _notificationRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
