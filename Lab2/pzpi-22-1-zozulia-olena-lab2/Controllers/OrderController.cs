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
            var orders = await _orderRepository.GetAllAsync();
            var orderDtos = _mapper.Map<List<OrderDto>>(orders);
            return Ok(orderDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            var orderDto = _mapper.Map<OrderDto>(order);
            return Ok(orderDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDto orderDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userRepository.GetByIdAsync(orderDto.UserId ?? Guid.Empty);
            if (user == null)
            {
                return BadRequest("Invalid UserId. User does not exist.");
            }

            var order = _mapper.Map<Order>(orderDto);

            foreach (var orderItemDto in orderDto.Items)
            {
                var fridgeInventory = await _fridgeInventoryRepository.GetByIdAsync(orderItemDto.FridgeInventoryId);
                if (fridgeInventory == null)
                {
                    return BadRequest($"Product with inventory ID {orderItemDto.FridgeInventoryId} does not exist.");
                }

                var fridge = await _fridgeRepository.GetByIdAsync(fridgeInventory.FridgeId);
                if (fridge == null)
                {
                    return BadRequest($"Fridge with ID {fridgeInventory.FridgeId} does not exist.");
                }

                if (fridgeInventory.Quantity < orderItemDto.Quantity)
                {
                    return BadRequest($"Not enough quantity for product with inventory ID {orderItemDto.FridgeInventoryId} in fridge.");
                }

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
            {
                return BadRequest(ModelState);
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var existingOrder = await _orderRepository.GetByIdAsync(id);
            if (existingOrder == null)
            {
                return NotFound("Order not found.");
            }

            if (existingOrder.UserId != userId)
            {
                return Forbid("Order does not belong to the specified user.");
            }

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
            {
                return NotFound();
            }

            await _orderRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
