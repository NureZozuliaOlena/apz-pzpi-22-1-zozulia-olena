import { $authhost } from ".";
import { IOrderCreateData } from "../components/Models/Order/OrderCreateModal";
import { IOrderEditData } from "../components/Models/Order/OrderEditModal";

export const getOrders = async () => {
    const { data } = await $authhost.get('api/Order')
    return data;
}

export const createOrder = async (formData: IOrderCreateData) => {
    const { data } = await $authhost.post('api/Order', formData)
    return data;
}

export const editOrder = async (id: string, formData: IOrderEditData) => {
    const { data } = await $authhost.put(`api/Order/${id}?userId=${formData.userId}`, formData)
    return data;
}

export const deleteOrder = async (id: string) => {
    const { data } = await $authhost.delete(`api/Order/${id}`)
    return data;
}
