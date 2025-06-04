package com.example.smart_lunch.dto

import java.util.*

data class FridgeInventoryDto(
    val id: UUID,
    val fridgeId: UUID,
    val foodItemId: UUID?,
    val foodItemName: String?,
    val quantity: Int
)
