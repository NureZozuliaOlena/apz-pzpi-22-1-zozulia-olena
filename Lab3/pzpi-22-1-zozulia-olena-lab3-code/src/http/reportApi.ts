import { $authhost } from ".";

export const getFridgesSummaryReport = async () => {
    const response = await $authhost.get('api/Report/fridges-summary', {
    responseType: 'blob',
  })
    return response.data;
}

export const getPopularProductsReport = async () => {
    const { data } = await $authhost.get('api/Report/popular-products', {
    responseType: 'blob',
  })
    return data;
}

export const createBackup = async (path: string) => {
    const { data } = await $authhost.get(`api/Backup/create-backup?folderPath=${path}`)
    return data;
}

export const restoreDb = async (formdata: FormData, path: string) => {
  const { data } = await $authhost.post(`api/Backup/restore-database?folderPath=${path}`, formdata, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};