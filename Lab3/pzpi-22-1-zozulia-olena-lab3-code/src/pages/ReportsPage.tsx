import React from 'react'
import { getFridgesSummaryReport, getPopularProductsReport } from '../http/reportApi'
import styles from '../styles/ReportsPage.module.css'
import { useTranslation } from 'react-i18next';

const ReportsPage = () => {
  const { t } = useTranslation();

  const downloadFile = async (method: () => Promise<Blob>, filename = "report.pdf") => {
    try {
      const file = await method()
      const url = URL.createObjectURL(file)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('reports.title')}</h2>
      <button
        className={styles.button}
        onClick={() => downloadFile(getFridgesSummaryReport, "fridges_summary.pdf")}
      >
        {t('reports.fridgesSummary')}
      </button>
      <br />
      <button
        className={styles.button}
        onClick={() => downloadFile(getPopularProductsReport, "popular_products.pdf")}
      >
        {t('reports.popularProducts')}
      </button>
    </div>
  )
}

export default ReportsPage
