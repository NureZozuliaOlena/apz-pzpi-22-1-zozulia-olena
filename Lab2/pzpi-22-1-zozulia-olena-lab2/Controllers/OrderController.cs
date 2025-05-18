using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;

namespace Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUserRepository _userRepository;
        private readonly IFridgeInventoryRepository _fridgeInventoryRepository;
        private readonly IMapper _mapper;
        private readonly IFridgeRepository _fridgeRepository;

        public OrderController(
            IOrderRepository orderRepository,
            IUserRepository userRepository,
            IFridgeInventoryRepository fridgeInventoryRepository,
            IMapper mapper,
            IFridgeRepository fridgeRepository)
        {
            _orderRepository = orderRepository;
            _userRepository = userRepository;
            _fridgeInventoryRepository = fridgeInventoryRepository;
            _mapper = mapper;
            _fridgeRepository = fridgeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "SuperAdmin")
            {
                var allOrders = await _orderRepository.GetAllAsync();
                var allOrderDtos = _mapper.Map<List<OrderDto>>(allOrders);
                return Ok(allOrderDtos);
            }

            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid or missing CompanyId claim.");

                var allOrders = await _orderRepository.GetAllAsync();
                var filteredOrders = allOrders.Where(o => o.User?.CompanyId == companyId).ToList();

                var filteredOrderDtos = _mapper.Map<List<OrderDto>>(filteredOrders);
                return Ok(filteredOrderDtos);
            }

            return Forbid();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "SuperAdmin")
            {
                var orderDto = _mapper.Map<OrderDto>(order);
                return Ok(orderDto);
            }

            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid or missing CompanyId claim.");

                if (order.User?.CompanyId != companyId)
                    return Forbid("Access denied. Order does not belong to your company.");

                var orderDto = _mapper.Map<OrderDto>(order);
                return Ok(orderDto);
            }

            return Forbid();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDto orderDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userRepository.GetByIdAsync(orderDto.UserId ?? Guid.Empty);
            if (user == null)
                return BadRequest("Invalid UserId. User does not exist.");

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid or missing CompanyId claim.");

                if (user.CompanyId != companyId)
                    return Forbid("Cannot create order for a user from another company.");
            }

            var order = _mapper.Map<Order>(orderDto);

            foreach (var orderItemDto in orderDto.Items)
            {
                var fridgeInventory = await _fridgeInventoryRepository.GetByIdAsync(orderItemDto.FridgeInventoryId);
                if (fridgeInventory == null)
                    return BadRequest($"Product with inventory ID {orderItemDto.FridgeInventoryId} does not exist.");

                var fridge = await _fridgeRepository.GetByIdAsync(fridgeInventory.FridgeId);
                if (fridge == null)
                    return BadRequest($"Fridge with ID {fridgeInventory.FridgeId} does not exist.");

                if (fridgeInventory.Quantity < orderItemDto.Quantity)
                    return BadRequest($"Not enough quantity for product with inventory ID {orderItemDto.FridgeInventoryId}.");

                fridgeInventory.Quantity -= orderItemDto.Quantity;
                await _fridgeInventoryRepository.UpdateAsync(fridgeInventory);
            }

            await _orderRepository.AddAsync(order);
            user.Orders?.Add(order);
            await _userRepository.UpdateAsync(user);

            var createdOrderDto = _mapper.Map<OrderDto>(order);
            return CreatedAtAction(nameof(GetById), new { id = createdOrderDto.Id }, createdOrderDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromQuery] Guid userId, [FromBody] OrderDto orderDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            var existingOrder = await _orderRepository.GetByIdAsync(id);
            if (existingOrder == null)
                return NotFound("Order not found.");

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid or missing CompanyId claim.");

                if (existingOrder.User?.CompanyId != companyId || user.CompanyId != companyId)
                    return Forbid("You cannot update orders outside of your company.");
            }

            if (existingOrder.UserId != userId)
                return Forbid("Order does not belong to the specified user.");

            _mapper.Map(orderDto, existingOrder);
            await _orderRepository.UpdateAsync(existingOrder);

            var updatedOrderDto = _mapper.Map<OrderDto>(existingOrder);
            return Ok(updatedOrderDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
                return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid or missing CompanyId claim.");

                if (order.User?.CompanyId != companyId)
                    return Forbid("You cannot delete orders outside of your company.");
            }

            await _orderRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
