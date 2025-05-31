import React, { useEffect, useState } from 'react'
import { deleteUser, getUsers } from '../http/userApi'
import { IUser } from '../interfaces/IUser'
import { UserCreateModal } from '../components/Models/User/UserCreateModal'
import { UserEditModal } from '../components/Models/User/UserEditModal'
import styles from '../styles/Users.module.css'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../utils/formatters';

export const Users = () => {
  const { t } = useTranslation()
  const [users, setUsers] = useState<IUser[]>([])
  const [createModal, setCreateModal] = useState<boolean>(false)
  const [editModal, setEditModal] = useState<boolean>(false)
  const [editableData, setEditableData] = useState<IUser>()

  const handleShowCreateModal = () => setCreateModal(true)
  const handleCloseCreateModal = () => setCreateModal(false)

  const handleShowEditModal = (data: IUser) => {
    setEditableData(data)
    setEditModal(true)
  }

  const handleCloseEditModal = () => setEditModal(false)

  const fetchItems = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch {
      alert(t('error'))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const remove = async (id: string) => {
    await deleteUser(id)
    fetchItems()
  }

  return (
    <div className={styles.container}>
      <UserCreateModal fetch={fetchItems} onHide={handleCloseCreateModal} show={createModal} />
      <UserEditModal item={editableData} fetch={fetchItems} show={editModal} onHide={handleCloseEditModal} />

      <h1 className={styles.title}>{t('users.title')}</h1>

      <p>
        <button className={styles.primaryButton} onClick={handleShowCreateModal}>
          {t('users.createNew')}
        </button>
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('users.tableHeaders.id')}</th>
            <th>{t('users.tableHeaders.firstName')}</th>
            <th>{t('users.tableHeaders.lastName')}</th>
            <th>{t('users.tableHeaders.dateOfBirth')}</th>
            <th>{t('users.tableHeaders.phoneNumber')}</th>
            <th>{t('users.tableHeaders.email')}</th>
            <th>{t('users.tableHeaders.role')}</th>
            <th>{t('users.tableHeaders.companyId')}</th>
            <th>{t('users.tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{formatDate(user.dateOfBirth)}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.companyId}</td>
              <td className={styles.actionCell}>
                <button className={styles.editButton} onClick={() => handleShowEditModal(user)}>
                  {t('users.edit')}
                </button>
                <button className={styles.deleteButton} onClick={() => remove(user.id)}>
                  {t('users.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
