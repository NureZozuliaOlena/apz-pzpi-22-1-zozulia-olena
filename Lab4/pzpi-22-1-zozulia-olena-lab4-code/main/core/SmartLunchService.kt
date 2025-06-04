package com.example.smart_lunch.core

import com.example.smart_lunch.dto.FoodItemDto
import com.example.smart_lunch.dto.FridgeDto
import com.example.smart_lunch.dto.FridgeInventoryDto
import com.example.smart_lunch.dto.LoginDto
import com.example.smart_lunch.dto.LoginResponseDto
import com.example.smart_lunch.dto.OrderDto
import okhttp3.MultipartBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

interface SmartLunchService {
    @POST("api/auth/login")
    suspend fun login(@Body loginDto: LoginDto): Response<LoginResponseDto>

    @GET("api/Fridge")
    suspend fun getFridges(): Response<List<FridgeDto>>

    @GET("api/FridgeInventory")
    suspend fun getFridgeInventories(): Response<List<FridgeInventoryDto>>

    @GET("api/FoodItem")
    suspend fun getFoodItems(): Response<List<FoodItemDto>>

    @POST("api/Order")
    suspend fun createOrder(@Body orderDto: OrderDto): Response<OrderDto>

    @GET("api/Order/user/{userId}")
    suspend fun getOrdersByUserId(@Path("userId") userId: String): Response<List<OrderDto>>

    @GET("api/Order")
    suspend fun getAllOrders(): Response<List<OrderDto>>

    @GET("api/Backup/create-backup")
    suspend fun createBackup(): Response<ResponseBody>

    @Multipart
    @POST("api/Backup/restore-database")
    suspend fun restoreBackup(
        @Part backupFile: MultipartBody.Part
    ): Response<Void>

    @DELETE("orders/{id}")
    suspend fun deleteOrderById(@Path("id") id: Int): Response<Unit>
}