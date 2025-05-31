import { IFridge } from "./IFridge";
import { IUser } from "./IUser";

export interface IOrder {
    id: string,
    user: IUser,
    userId: string,
    fridge: IFridge,
    fridgeId: string,
    totalAmount: number,
    paymentStatus: number,
    timestamp: string,
}