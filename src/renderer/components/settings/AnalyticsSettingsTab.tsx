import { useState } from 'react'
import {
  Database,
  Shield,
  TestTube,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { FieldRow } from '@/components/ui/FieldRow'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import type { LRSSettings } from '@/types/course'

const DEFAULT_LRS: LRSSettings = {
  endpointUrl: '',
  key: '',
  secret: '',
  statementMode: 'realtime',
  batchIntervalMinutes: 5,
  anonymization: true,
  queueOnFailure: true,
  enabled: false
}

interface AnalyticsSettingsTabProps {
  lrs: LRSSettings | null | undefined
  identifiedReportingEnabled: boolean
  onLRSChange: (lrs: LRSSettings | null) => void
  onIdentifiedReportingChange: (enabled: boolean) => void
  onClearData: () => void
}

export function AnalyticsSettingsTab({
  lrs,
  identifiedReportingEnabled,
  onLRSChange,
  onIdentifiedReportingChange,
  onClearData
}: AnalyticsSettingsTabProps): JSX.Element {
  const config = lrs ?? DEFAULT_LRS
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [showFerpaWarning, setShowFerpaWarning] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  function update(partial: Partial<LRSSettings>) {
    onLRSChange({ ...config, ...partial })
  }

  async function testConnection() {
    if (!config.endpointUrl) {
      setTestResult({ success: false, message: 'Enter an LRS endpoint URL first.' })
      return
    }
    setIsTesting(true)
    setTestResult(null)
    try {
      const url = config.endpointUrl.replace(/\/$/, '') + '/statements'
      const auth = 'Basic ' + btoa(config.key + ':' + config.secret)
      const response = await fetch(url + '?limit=1', {
        method: 'GET',
        headers: {
          Authorization: auth,
          'X-Experience-API-Version': '1.0.3',
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        setTestResult({ success: true, message: `Connected successfully (HTTP ${response.status}).` })
      } else {
        setTestResult({ success: false, message: `Connection failed: HTTP ${response.status} ${response.statusText}` })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`
      })
    } finally {
      setIsTesting(false)
    }
  }

  function handleIdentifiedToggle(enabled: boolean) {
    if (enabled) {
      setShowFerpaWarning(true)
    } else {
      onIdentifiedReportingChange(false)
    }
  }

  function confirmIdentifiedReporting() {
    setShowFerpaWarning(false)
    onIdentifiedReportingChange(true)
  }

  const inputClass =
    'w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]'
  const selectClass =
    'w-40 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]'

  return (
    <div className="space-y-6">
      {/* LRS Connection */}
      <SettingsCard title="Learning Record Store (LRS)" icon={Database}>
        <FieldRow label="Enable Remote LRS" description="Send xAPI statements to a remote LRS in addition to local storage">
          <ToggleSwitch checked={config.enabled} onChange={(v) => update({ enabled: v })} label="Enable LRS" />
        </FieldRow>

        <FieldRow label="LRS Endpoint URL" description="The xAPI endpoint (e.g., https://your-lrs.com/xapi/)">
          <input
            type="url"
            value={config.endpointUrl}
            onChange={(e) => update({ endpointUrl: e.target.value })}
            placeholder="https://your-lrs.com/xapi/"
            disabled={!config.enabled}
            className={inputClass + (config.enabled ? '' : ' opacity-50')}
          />
        </FieldRow>

        <FieldRow label="LRS Key" description="Basic auth username">
          <input
            type="text"
            value={config.key}
            onChange={(e) => update({ key: e.target.value })}
            placeholder="Key"
            disabled={!config.enabled}
            className={inputClass + (config.enabled ? '' : ' opacity-50')}
          />
        </FieldRow>

        <FieldRow label="LRS Secret" description="Basic auth password (stored securely)">
          <input
            type="password"
            value={config.secret}
            onChange={(e) => update({ secret: e.target.value })}
            placeholder="Secret"
            disabled={!config.enabled}
            className={inputClass + (config.enabled ? '' : ' opacity-50')}
          />
        </FieldRow>

        <FieldRow label="Statement Mode" description="Real-time sends each statement immediately; batch flushes at intervals">
          <select
            value={config.statementMode}
            onChange={(e) => update({ statementMode: e.target.value as 'realtime' | 'batch' })}
            disabled={!config.enabled}
            className={selectClass + (config.enabled ? '' : ' opacity-50')}
          >
            <option value="realtime">Real-time</option>
            <option value="batch">Batch</option>
          </select>
        </FieldRow>

        {config.statementMode === 'batch' && (
          <FieldRow label="Batch Interval" description="Minutes between batch flushes">
            <select
              value={config.batchIntervalMinutes}
              onChange={(e) => update({ batchIntervalMinutes: Number(e.target.value) })}
              disabled={!config.enabled}
              className={selectClass + (config.enabled ? '' : ' opacity-50')}
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </FieldRow>
        )}

        <FieldRow label="Anonymize Actors" description="Strip learner name and email before sending to LRS">
          <ToggleSwitch
            checked={config.anonymization}
            onChange={(v) => update({ anonymization: v })}
            label="Anonymize actors"
          />
        </FieldRow>

        <FieldRow label="Queue on Failure" description="Queue statements locally when LRS is unreachable">
          <ToggleSwitch
            checked={config.queueOnFailure}
            onChange={(v) => update({ queueOnFailure: v })}
            label="Queue on failure"
          />
        </FieldRow>

        {/* Test Connection */}
        {config.enabled && (
          <div className="pt-2 border-t border-[var(--border-default)]">
            <div className="flex items-center gap-3">
              <button
                onClick={testConnection}
                disabled={isTesting}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-[var(--font-weight-medium)] rounded-md bg-[var(--brand-magenta)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isTesting ? <Loader2 size={14} className="animate-spin" /> : <TestTube size={14} />}
                Test Connection
              </button>
              {testResult && (
                <div className={`flex items-center gap-1.5 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FERPA notice for non-anonymized LRS */}
        {config.enabled && !config.anonymization && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              Learner activity data will be transmitted to your LRS with identifiable information.
              Ensure your LRS provider has an executed Data Processing Agreement (DPA) with your institution.
            </span>
          </div>
        )}
      </SettingsCard>

      {/* Identified Learner Mode */}
      <SettingsCard title="Identified Learner Reporting" icon={Shield}>
        <FieldRow
          label="Enable Identified Mode"
          description="Show learner names in dashboards and reports instead of anonymized IDs"
        >
          <ToggleSwitch
            checked={identifiedReportingEnabled}
            onChange={handleIdentifiedToggle}
            label="Enable identified reporting"
          />
        </FieldRow>

        {identifiedReportingEnabled && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs">
            <Shield size={14} className="shrink-0 mt-0.5" />
            <span>
              Identified reporting is active. Learner names are stored alongside performance data.
              Ensure your institution&apos;s FERPA policy permits this and that your data storage practices comply.
            </span>
          </div>
        )}
      </SettingsCard>

      {/* FERPA Warning Modal */}
      {showFerpaWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-label="FERPA Warning">
          <div className="bg-[var(--bg-surface)] rounded-xl p-6 max-w-md w-[92%] shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-amber-500" />
              <h3 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                FERPA Compliance Notice
              </h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Enabling identified reporting stores learner names alongside performance data.
              Ensure your institution&apos;s FERPA policy permits this and that your data storage practices comply.
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              This setting affects all dashboards and exported reports for this course.
              You can disable it at any time to return to anonymized reporting.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFerpaWarning(false)}
                className="px-4 py-2 text-sm rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmIdentifiedReporting}
                className="px-4 py-2 text-sm rounded-md bg-amber-500 text-white font-[var(--font-weight-medium)] hover:bg-amber-600 cursor-pointer"
              >
                I Acknowledge &mdash; Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      <SettingsCard title="Data Management" icon={Database}>
        <FieldRow label="Local Storage" description="All xAPI statements are always stored locally. This cannot be disabled.">
          <span className="text-sm text-[var(--text-tertiary)]">Always on</span>
        </FieldRow>
        <FieldRow label="Clear Analytics Data" description="Permanently delete all local xAPI statements for this course">
          {showClearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Are you sure?</span>
              <button
                onClick={() => { onClearData(); setShowClearConfirm(false) }}
                className="px-3 py-1 text-xs rounded-md bg-red-600 text-white cursor-pointer"
              >
                Yes, clear all data
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 text-xs rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 size={14} />
              Clear Data
            </button>
          )}
        </FieldRow>
      </SettingsCard>
    </div>
  )
}
