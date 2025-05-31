import React, { useEffect, useState } from 'react'
import { deleteFoodItem, getFoodItems } from '../http/foodItemApi'
import { IFoodItem } from '../interfaces/IFoodItem'
import { FoodItemCreateModal } from '../components/Models/FoodItem/FoodItemCreateModal'
import { FoodItemEditModal } from '../components/Models/FoodItem/FoodItemEditModal'
import styles from '../styles/FoodItems.module.css'
import { useTranslation } from 'react-i18next';

export const FoodItems = () => {
  const { t } = useTranslation();
  const [foodItems, setFoodItems] = useState<IFoodItem[]>([])
  const [createModal, setCreateModal] = useState<boolean>(false)
  const [editModal, setEditModal] = useState<boolean>(false)
  const [editableData, setEditableData] = useState<IFoodItem>()

  const handleShowCreateModal = () => setCreateModal(true)
  const handleCloseCreateModal = () => setCreateModal(false)

  const handleShowEditModal = (data: IFoodItem) => {
    setEditableData(data)
    setEditModal(true)
  }

  const handleCloseEditModal = () => {
    setEditModal(false)
  }

  const fetchItems = async () => {
    try {
      const data = await getFoodItems()
      setFoodItems(data)
    } catch {
      alert(t('error'))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const remove = async (id: string) => {
    await deleteFoodItem(id)
    fetchItems()
  }

  return (
    <div className={styles.container}>
      <FoodItemCreateModal fetch={fetchItems} onHide={handleCloseCreateModal} show={createModal} />
      <FoodItemEditModal item={editableData} fetch={fetchItems} show={editModal} onHide={handleCloseEditModal} />

      <h1 className={styles.title}>{t('foodItems.title')}</h1>

      <p>
        <button className={styles.primaryButton} onClick={handleShowCreateModal}>
          {t('foodItems.createNew')}
        </button>
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('foodItems.tableHeaders.id')}</th>
            <th>{t('foodItems.tableHeaders.name')}</th>
            <th>{t('foodItems.tableHeaders.description')}</th>
            <th>{t('foodItems.tableHeaders.price')}</th>
            <th>{t('foodItems.tableHeaders.isAvailable')}</th>
            <th>{t('foodItems.tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {foodItems.map((foodItem) => (
            <tr key={foodItem.id}>
              <td>{foodItem.id}</td>
              <td>{foodItem.name}</td>
              <td>{foodItem.description}</td>
              <td>{foodItem.price}</td>
              <td>{foodItem.isAvailable ? '+' : '-'}</td>
              <td className={styles.actionCell}>
                <button className={styles.editButton} onClick={() => handleShowEditModal(foodItem)}>
                  {t('foodItems.edit')}
                </button>
                <button className={styles.deleteButton} onClick={() => remove(foodItem.id)}>
                  {t('foodItems.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
