import React, { useEffect, useState } from 'react'
import { deleteOrder, getOrders } from '../http/orderApi'
import { IOrder } from '../interfaces/IOrder'
import { OrderCreateModal } from '../components/Models/Order/OrderCreateModal'
import { OrderEditModal } from '../components/Models/Order/OrderEditModal'
import styles from '../styles/Orders.module.css'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../utils/formatters';

export const Orders = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<IOrder[]>([])
  const [createModal, setCreateModal] = useState<boolean>(false)
  const [editModal, setEditModal] = useState<boolean>(false)
  const [editableData, setEditableData] = useState<IOrder>()

  const handleShowCreateModal = () => setCreateModal(true)
  const handleCloseCreateModal = () => setCreateModal(false)

  const handleShowEditModal = (data: IOrder) => {
    setEditableData(data)
    setEditModal(true)
  }

  const handleCloseEditModal = () => setEditModal(false)

  const fetchItems = async () => {
    try {
      const data = await getOrders()
      setOrders(data)
    } catch {
      alert(t('error'))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const remove = async (id: string) => {
    await deleteOrder(id)
    fetchItems()
  }

  return (
    <div className={styles.container}>
      <OrderCreateModal fetch={fetchItems} onHide={handleCloseCreateModal} show={createModal} />
      <OrderEditModal item={editableData} fetch={fetchItems} show={editModal} onHide={handleCloseEditModal} />

      <h1 className={styles.title}>{t('orders.title')}</h1>

      <p>
        <button className={styles.primaryButton} onClick={handleShowCreateModal}>
          {t('orders.createNew')}
        </button>
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('orders.tableHeaders.id')}</th>
            <th>{t('orders.tableHeaders.userEmail')}</th>
            <th>{t('orders.tableHeaders.fridgeId')}</th>
            <th>{t('orders.tableHeaders.totalAmount')}</th>
            <th>{t('orders.tableHeaders.paymentStatus')}</th>
            <th>{t('orders.tableHeaders.timestamp')}</th>
            <th>{t('orders.tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.user?.email}</td>
              <td>{order.fridgeId}</td>
              <td>{order.totalAmount}</td>
              <td>{order.paymentStatus}</td>
              <td>{formatDate(order.timestamp)}</td>
              <td className={styles.actionCell}>
                <button className={styles.editButton} onClick={() => handleShowEditModal(order)}>
                  {t('orders.edit')}
                </button>
                <button className={styles.deleteButton} onClick={() => remove(order.id)}>
                  {t('orders.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
