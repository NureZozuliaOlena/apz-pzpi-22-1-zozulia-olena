import { IFridge } from "./IFridge";
import { IFridgeInventory } from "./IFridgeInventory";
import { IUser } from "./IUser";

export interface IOrderItem {
    id: string,
    order: IUser,
    orderId: string,
    fridgeInventory: IFridgeInventory,
    fridgeInventoryId: string,
    quantity: number,
    price: number,
}