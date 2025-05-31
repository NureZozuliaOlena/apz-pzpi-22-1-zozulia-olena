import { IFoodItem } from "./IFoodItem";
import { IFridge } from "./IFridge";

export interface IFridgeInventory {
    id: string,
    fridgeId: string,
    fridge: IFridge,
    foodItem: IFoodItem,
    foodItemId: string,
    quantity: number,
}