import { $authhost } from ".";
import { IFoodItemCreateData } from "../components/Models/FoodItem/FoodItemCreateModal";
import { IFoodItemEditData } from "../components/Models/FoodItem/FoodItemEditModal";
export const getFoodItems = async () => {
    const { data } = await $authhost.get('api/FoodItem')
    return data;
}

export const createFoodItem = async (formData: IFoodItemCreateData) => {
    const { data } = await $authhost.post('api/FoodItem', formData)
    return data;
}

export const editFoodItem = async (id: string, formData: IFoodItemEditData) => {
    const { data } = await $authhost.put(`api/FoodItem/${id}`, formData)
    return data;
}

export const deleteFoodItem = async (id: string) => {
    const { data } = await $authhost.delete(`api/FoodItem/${id}`)
    return data;
}
