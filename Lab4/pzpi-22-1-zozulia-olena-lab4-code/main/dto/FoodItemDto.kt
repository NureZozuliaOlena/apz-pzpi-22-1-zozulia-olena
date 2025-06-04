package com.example.smart_lunch.dto

import java.util.UUID

data class FoodItemDto(
    val id: UUID,
    val name: String,
    val description: String?,
    val price: Double,
    val isAvailable: Boolean
)