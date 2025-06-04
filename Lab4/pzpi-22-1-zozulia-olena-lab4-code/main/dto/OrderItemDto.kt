package com.example.smart_lunch.dto

import java.util.UUID

data class OrderItemDto(
    val id: String = UUID.randomUUID().toString(),
    val orderId: String? = null,
    val fridgeInventoryId: String,
    val quantity: Int,
    val price: Double
)