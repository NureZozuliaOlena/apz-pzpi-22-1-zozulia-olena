import { $authhost } from ".";


export const getNotifications = async () => {
    const { data } = await $authhost.get('api/Notification')
    return data;
}