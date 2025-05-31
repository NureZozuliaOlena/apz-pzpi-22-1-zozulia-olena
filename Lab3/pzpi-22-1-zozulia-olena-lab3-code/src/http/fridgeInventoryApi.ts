import { $authhost } from ".";
import { IFridgeInventoryCreateData } from "../components/Models/FridgeInventory/FridgeInventoryCreateModal";
import { IFridgeInventoryEditData } from "../components/Models/FridgeInventory/FridgeInventoryEditModal";
export const getFridgeInventories = async () => {
    const { data } = await $authhost.get('api/FridgeInventory')
    return data;
}

export const createFridgeInventory = async (formData: IFridgeInventoryCreateData) => {
    const { data } = await $authhost.post('api/FridgeInventory', formData)
    return data;
}

export const editFridgeInventory = async (id: string, formData: IFridgeInventoryEditData) => {
    const { data } = await $authhost.put(`api/FridgeInventory/${id}`, formData)
    return data;
}

export const deleteFridgeInventory = async (id: string) => {
    const { data } = await $authhost.delete(`api/FridgeInventory/${id}`)
    return data;
}
