package com.example.smart_lunch.dto

import java.util.*

data class FridgeDto(
    val id: UUID,
    val companyId: UUID,
    val minTemperature: Double,
    val minInventoryLevel: Int,
    val lastRestocked: String
)
