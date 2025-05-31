import React, { useEffect, useState } from 'react'
import { FridgeInventoryCreateModal } from '../components/Models/FridgeInventory/FridgeInventoryCreateModal'
import { FridgeInventoryEditModal } from '../components/Models/FridgeInventory/FridgeInventoryEditModal'
import { deleteFridgeInventory, getFridgeInventories } from '../http/fridgeInventoryApi'
import { IFridgeInventory } from '../interfaces/IFridgeInventory'
import styles from '../styles/FridgeInventory.module.css'
import { useTranslation } from 'react-i18next';

export const FridgeInventories = () => {
  const { t } = useTranslation();
  const [fridgeInventories, setFridgeInventories] = useState<IFridgeInventory[]>([])
  const [createModal, setCreateModal] = useState<boolean>(false)
  const [editModal, setEditModal] = useState<boolean>(false)
  const [editableData, setEditableData] = useState<IFridgeInventory>()

  const handleShowCreateModal = () => setCreateModal(true)
  const handleCloseCreateModal = () => setCreateModal(false)

  const handleShowEditModal = (data: IFridgeInventory) => {
    setEditableData(data)
    setEditModal(true)
  }

  const handleCloseEditModal = () => setEditModal(false)

  const fetchItems = async () => {
    try {
      const data = await getFridgeInventories()
      setFridgeInventories(data)
    } catch {
      alert(t('error'))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const remove = async (id: string) => {
    await deleteFridgeInventory(id)
    fetchItems()
  }

  return (
    <div className={styles.container}>
      <FridgeInventoryCreateModal fetch={fetchItems} onHide={handleCloseCreateModal} show={createModal} />
      <FridgeInventoryEditModal item={editableData} fetch={fetchItems} show={editModal} onHide={handleCloseEditModal} />

      <h1 className={styles.title}>{t('fridgeInventories.title')}</h1>

      <p>
        <button className={styles.primaryButton} onClick={handleShowCreateModal}>
          {t('fridgeInventories.createNew')}
        </button>
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('fridgeInventories.tableHeaders.id')}</th>
            <th>{t('fridgeInventories.tableHeaders.fridgeId')}</th>
            <th>{t('fridgeInventories.tableHeaders.foodItemId')}</th>
            <th>{t('fridgeInventories.tableHeaders.quantity')}</th>
            <th>{t('fridgeInventories.tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {fridgeInventories.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.fridgeId}</td>
              <td>{item.foodItemId}</td>
              <td>{item.quantity}</td>
              <td className={styles.actionCell}>
                <button className={styles.editButton} onClick={() => handleShowEditModal(item)}>
                  {t('fridgeInventories.edit')}
                </button>
                <button className={styles.deleteButton} onClick={() => remove(item.id)}>
                  {t('fridgeInventories.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
