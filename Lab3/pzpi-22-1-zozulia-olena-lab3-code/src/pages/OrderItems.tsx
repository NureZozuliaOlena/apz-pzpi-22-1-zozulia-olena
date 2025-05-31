import React, { useEffect, useState } from 'react'
import { deleteOrderitem, getOrderitems } from '../http/orderItemApi'
import { OrderitemEditModal } from '../components/Models/OrderItem/OrderItemEditModal'
import { OrderitemCreateModal } from '../components/Models/OrderItem/OrderitemCreateModal'
import { IOrderItem } from '../interfaces/IOrderItem'
import styles from '../styles/Orderitem.module.css'
import { useTranslation } from 'react-i18next';

export const Orderitems = () => {
  const { t } = useTranslation();
  const [orderitems, setOrderitems] = useState<IOrderItem[]>([])
  const [createModal, setCreateModal] = useState<boolean>(false)
  const [editModal, setEditModal] = useState<boolean>(false)
  const [editableData, setEditableData] = useState<IOrderItem>()

  const handleShowCreateModal = () => setCreateModal(true)
  const handleCloseCreateModal = () => setCreateModal(false)

  const handleShowEditModal = (data: IOrderItem) => {
    setEditableData(data)
    setEditModal(true)
  }

  const handleCloseEditModal = () => setEditModal(false)

  const fetchItems = async () => {
    try {
      const data = await getOrderitems()
      setOrderitems(data)
    } catch {
      alert(t('error'))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const remove = async (id: string) => {
    await deleteOrderitem(id)
    fetchItems()
  }

  return (
    <div className={styles.container}>
      <OrderitemCreateModal fetch={fetchItems} onHide={handleCloseCreateModal} show={createModal} />
      <OrderitemEditModal item={editableData} fetch={fetchItems} show={editModal} onHide={handleCloseEditModal} />

      <h1 className={styles.title}>{t('orderItems.title')}</h1>

      <p>
        <button className={styles.primaryButton} onClick={handleShowCreateModal}>
          {t('orderItems.createNew')}
        </button>
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('orderItems.tableHeaders.id')}</th>
            <th>{t('orderItems.tableHeaders.orderId')}</th>
            <th>{t('orderItems.tableHeaders.fridgeInventoryId')}</th>
            <th>{t('orderItems.tableHeaders.quantity')}</th>
            <th>{t('orderItems.tableHeaders.price')}</th>
            <th>{t('orderItems.tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {orderitems.map((orderitem) => (
            <tr key={orderitem.id}>
              <td>{orderitem.id}</td>
              <td>{orderitem.orderId}</td>
              <td>{orderitem.fridgeInventoryId}</td>
              <td>{orderitem.quantity}</td>
              <td>{orderitem.price}</td>
              <td className={styles.actionCell}>
                <button className={styles.editButton} onClick={() => handleShowEditModal(orderitem)}>
                  {t('orderItems.edit')}
                </button>
                <button className={styles.deleteButton} onClick={() => remove(orderitem.id)}>
                  {t('orderItems.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
