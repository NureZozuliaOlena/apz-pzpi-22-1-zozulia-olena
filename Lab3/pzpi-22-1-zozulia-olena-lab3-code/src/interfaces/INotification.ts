import { IFridge } from "./IFridge";
import { IUser } from "./IUser";

export interface INotification {
    id: string,
    title: string,
    text: string,
    dateTimeCreated: string,
    userId: string,
    user: IUser,
    fridgeId: string,
    fridge: IFridge
}