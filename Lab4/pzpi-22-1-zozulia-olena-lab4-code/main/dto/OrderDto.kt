package com.example.smart_lunch.dto

import java.text.SimpleDateFormat
import java.time.LocalDateTime
import java.util.Date
import java.util.Locale

data class OrderDto(
    val id: String? = null,
    val userId: String,
    val fridgeId: String,
    val totalAmount: Double,
    val paymentStatus: Int = 0,
    val timestamp: String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).format(
        Date()
    ),
    val items: List<OrderItemDto>
)