using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTO;
using Repositories;
using AutoMapper;
using Models;
using Service;
using Data;

namespace Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderItemController : ControllerBase
    {
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;
        private readonly IFridgeInventoryRepository _fridgeInventoryRepository;
        private readonly IFridgeRepository _fridgeRepository;
        private readonly SmartLunchDbContext _context;

        public OrderItemController(IOrderItemRepository orderItemRepository, 
            IOrderRepository orderRepository, 
            IMapper mapper, 
            IFridgeInventoryRepository fridgeInventoryRepository, 
            IFridgeRepository fridgeRepository,
            SmartLunchDbContext context)
        {
            _orderItemRepository = orderItemRepository;
            _orderRepository = orderRepository;
            _mapper = mapper;
            _fridgeInventoryRepository = fridgeInventoryRepository;
            _fridgeRepository = fridgeRepository;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orderItems = await _orderItemRepository.GetAllAsync();
            var orderItemDtos = _mapper.Map<List<OrderItemDto>>(orderItems);
            return Ok(orderItemDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var orderItem = await _orderItemRepository.GetByIdAsync(id);
            if (orderItem == null)
            {
                return NotFound();
            }

            var orderItemDto = _mapper.Map<OrderItemDto>(orderItem);
            return Ok(orderItemDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderItemDto orderItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var fridgeInventory = await _fridgeInventoryRepository.GetByIdAsync(orderItemDto.FridgeInventoryId);
            if (fridgeInventory == null)
            {
                return BadRequest($"Product with inventory ID {orderItemDto.FridgeInventoryId} does not exist.");
            }

            if (fridgeInventory.Quantity < orderItemDto.Quantity)
            {
                return BadRequest($"Not enough quantity for product with inventory ID {orderItemDto.FridgeInventoryId} in fridge.");
            }

            var orderItem = _mapper.Map<OrderItem>(orderItemDto);

            await _orderItemRepository.AddAsync(orderItem);

            fridgeInventory.Quantity -= orderItemDto.Quantity;
            await _fridgeInventoryRepository.UpdateAsync(fridgeInventory);

            var order = await _orderRepository.GetByIdAsync(orderItemDto.OrderId);
            if (order == null)
            {
                return BadRequest("Invalid OrderId. Order does not exist.");
            }

            var fridge = await _fridgeRepository.GetByIdAsync(fridgeInventory.FridgeId);
            if (fridge == null)
            {
                return BadRequest($"Fridge with ID {fridgeInventory.FridgeId} does not exist.");
            }

            //fridge.InventoryLevel = fridge.FridgeInventories.Sum(x => x.Quantity);
            await _fridgeRepository.UpdateAsync(fridge);

            var predictionService = new PredictionService(_context);
            predictionService.PredictAndNotify();

            var createdOrderItemDto = _mapper.Map<OrderItemDto>(orderItem);
            return CreatedAtAction(nameof(GetById), new { id = createdOrderItemDto.Id }, createdOrderItemDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrderItemDto orderItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingOrderItem = await _orderItemRepository.GetByIdAsync(id);
            if (existingOrderItem == null)
            {
                return NotFound("OrderItem not found.");
            }

            if (existingOrderItem.OrderId != orderItemDto.OrderId)
            {
                return BadRequest("OrderItem does not belong to the specified Order.");
            }

            _mapper.Map(orderItemDto, existingOrderItem); 

            await _orderItemRepository.UpdateAsync(existingOrderItem);

            var updatedOrderItemDto = _mapper.Map<OrderItemDto>(existingOrderItem); 
            return Ok(updatedOrderItemDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var orderItem = await _orderItemRepository.GetByIdAsync(id);
            if (orderItem == null)
            {
                return NotFound();
            }

            await _orderItemRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
