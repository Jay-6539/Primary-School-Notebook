import { useState } from 'react'
import { migrateAllData } from '../lib/migrateToSupabase'
import './DataMigration.css'

const DataMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<string>('')
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message?: string } | null>(null)

  const handleMigration = async () => {
    if (!confirm('This will migrate all data from localStorage to Supabase. Continue?')) {
      return
    }

    setIsMigrating(true)
    setMigrationStatus('Starting migration...')
    setMigrationResult(null)

    try {
      const result = await migrateAllData()
      if (result.success) {
        setMigrationResult({ success: true, message: 'Migration completed successfully!' })
        setMigrationStatus('Migration completed!')
      } else {
        setMigrationResult({ success: false, message: 'Migration failed. Check console for details.' })
        setMigrationStatus('Migration failed!')
      }
    } catch (error) {
      console.error('Migration error:', error)
      setMigrationResult({ success: false, message: `Migration error: ${error}` })
      setMigrationStatus('Migration error!')
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="data-migration section-card">
      <div className="page-title">
        <h2>Data Migration</h2>
        <p>Migrate data from localStorage to Supabase</p>
      </div>

      <div className="migration-content">
        <div className="migration-info">
          <h3>What will be migrated:</h3>
          <ul>
            <li>English Words (Recognition & Spelling)</li>
            <li>Spelling History</li>
            <li>Recognition History</li>
            <li>Bank Entries</li>
            <li>Parent Feedback</li>
            <li>Pictures</li>
          </ul>
        </div>

        <div className="migration-actions">
          <button
            className="primary-btn"
            onClick={handleMigration}
            disabled={isMigrating}
          >
            {isMigrating ? 'Migrating...' : 'Start Migration'}
          </button>

          {migrationStatus && (
            <p className={`migration-status ${migrationResult?.success ? 'success' : 'error'}`}>
              {migrationStatus}
            </p>
          )}

          {migrationResult && (
            <div className={`migration-result ${migrationResult.success ? 'success' : 'error'}`}>
              <p>{migrationResult.message}</p>
              {migrationResult.success && (
                <p className="migration-note">
                  Data has been migrated to Supabase. The app will now use Supabase as the primary data source.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="migration-note-box">
          <h4>Note:</h4>
          <p>
            - Migration will only copy data, not delete from localStorage<br/>
            - Existing data in Supabase will be updated (upsert)<br/>
            - You can run migration multiple times safely<br/>
            - After migration, the app will automatically use Supabase
          </p>
        </div>
      </div>
    </div>
  )
}

export default DataMigration

