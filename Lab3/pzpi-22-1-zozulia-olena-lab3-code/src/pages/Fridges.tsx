import React, { useEffect, useState } from 'react'
import { deleteFridge, getFridges } from '../http/fridgeApi'
import { IFridge } from '../interfaces/IFridge'
import { FridgeCreateModal } from '../components/Models/Fridge/FridgeCreateModal'
import { FridgeEditModal } from '../components/Models/Fridge/FridgeEditModal'
import styles from '../styles/Fridge.module.css'
import { useTranslation } from 'react-i18next';
import { formatDate, formatTemperature } from '../utils/formatters';

export const Fridges = () => {
  const { t } = useTranslation();
  const [fridges, setFridges] = useState<IFridge[]>([])
  const [createModal, setCreateModal] = useState<boolean>(false)
  const [editModal, setEditModal] = useState<boolean>(false)
  const [editableData, setEditableData] = useState<IFridge>()

  const handleShowCreateModal = () => setCreateModal(true)
  const handleCloseCreateModal = () => setCreateModal(false)

  const handleShowEditModal = (data: IFridge) => {
    setEditableData(data)
    setEditModal(true)
  }

  const handleCloseEditModal = () => setEditModal(false)

  const fetchItems = async () => {
    try {
      const data = await getFridges()
      setFridges(data)
    } catch {
      alert(t('error'))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const remove = async (id: string) => {
    await deleteFridge(id)
    fetchItems()
  }

  return (
    <div className={styles.container}>
      <FridgeCreateModal fetch={fetchItems} onHide={handleCloseCreateModal} show={createModal} />
      <FridgeEditModal item={editableData} fetch={fetchItems} show={editModal} onHide={handleCloseEditModal} />

      <h1 className={styles.title}>{t('fridges.title')}</h1>

      <p>
        <button className={styles.primaryButton} onClick={handleShowCreateModal}>
          {t('fridges.createNew')}
        </button>
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('fridges.tableHeaders.id')}</th>
            <th>{t('fridges.tableHeaders.company')}</th>
            <th>{t('fridges.tableHeaders.minTemperature')}</th>
            <th>{t('fridges.tableHeaders.minInventoryLevel')}</th>
            <th>{t('fridges.tableHeaders.lastRestocked')}</th>
            <th>{t('fridges.tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody>
  {fridges.map((fridge) => (
    <tr key={fridge.id}>
      <td>{fridge.id}</td>
      <td>{fridge.company?.name}</td>
<td>{formatTemperature(fridge.minTemperature)}</td>
      <td>{fridge.minInventoryLevel}</td>
<td>{formatDate(fridge.lastRestocked)}</td>
      <td className={styles.actionCell}>
        <button className={styles.editButton} onClick={() => handleShowEditModal(fridge)}>
          {t('fridges.edit')}
        </button>
        <button className={styles.deleteButton} onClick={() => remove(fridge.id)}>
          {t('fridges.delete')}
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  )
}
