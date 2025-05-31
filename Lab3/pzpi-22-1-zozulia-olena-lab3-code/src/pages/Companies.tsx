import React, { useEffect, useState } from 'react'
import { CompanyCreateModal } from '../components/Models/Company/CompanyCreateModal'
import { CompanyEditModal } from '../components/Models/Company/CompanyEditModal'
import { deleteCompany, getCompanies } from '../http/companyApi'
import { ICompany } from '../interfaces/ICompany'
import styles from '../styles/Companies.module.css'
import { useTranslation } from 'react-i18next';

export const Companies = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<ICompany[]>([])
  const [createModal, setCreateModal] = useState<boolean>(false)
  const [editModal, setEditModal] = useState<boolean>(false)
  const [editableData, setEditableData] = useState<ICompany>()

  const handleShowCreateModal = () => setCreateModal(true)
  const handleCloseCreateModal = () => setCreateModal(false)

  const handleShowEditModal = (data: ICompany) => {
    setEditableData(data)
    setEditModal(true)
  }

  const handleCloseEditModal = () => {
    setEditModal(false)
  }

  const fetchItems = async () => {
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch {
      alert(t('error'))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const remove = async (id: string) => {
    await deleteCompany(id)
    fetchItems()
  }

  return (
    <div className={styles.container}>
      <CompanyCreateModal
        fetch={fetchItems}
        onHide={handleCloseCreateModal}
        show={createModal}
      />
      <CompanyEditModal
        item={editableData}
        fetch={fetchItems}
        show={editModal}
        onHide={handleCloseEditModal}
      />
      <h1 className={styles.title}>{t('companies.title')}</h1>

      <p>
        <button className={styles.primaryButton} onClick={handleShowCreateModal}>
          {t('companies.createNew')}
        </button>
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('companies.tableHeaders.id')}</th>
            <th>{t('companies.tableHeaders.name')}</th>
            <th>{t('companies.tableHeaders.address')}</th>
            <th>{t('companies.tableHeaders.admin')}</th>
            <th>{t('companies.tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>{company.id}</td>
              <td>{company.name}</td>
              <td>{company.address}</td>
              <td>{company.adminId}</td>
              <td className={styles.actionCell}>
                <button
                  className={styles.editButton}
                  onClick={() => handleShowEditModal(company)}
                >
                  {t('companies.edit')}
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => remove(company.id)}
                >
                  {t('companies.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}