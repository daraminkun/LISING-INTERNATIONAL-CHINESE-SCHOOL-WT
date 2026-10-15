import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  FileSpreadsheet, 
  Code2, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Smartphone,
  QrCode as QrCodeIcon,
  Share2,
  Send,
  Sparkles
} from 'lucide-react';
import { AppScriptConfig, ConnectionStatus, Language } from '../types';
import { translations } from '../translations';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../services/appsScriptService';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppScriptConfig;
  onSaveConfig: (newConfig: AppScriptConfig) => void;
  connectionStatus: ConnectionStatus;
  onTestConnection: (url: string) => Promise<boolean>;
  onPullFromSheets: () => Promise<void>;
  onPushToSheets: () => Promise<void>;
  studentCount: number;
  language: Language;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  connectionStatus,
  onTestConnection,
  onPullFromSheets,
  onPushToSheets,
  studentCount,
  language,
}) => {
  const t = translations[language];

  const [url, setUrl] = useState(config.webAppUrl);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'instructions' | 'code' | 'mobile'>('settings');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedQuickLink, setCopiedQuickLink] = useState(false);
  const [copiedManualUrl, setCopiedManualUrl] = useState(false);

  // Compute Quick Connect URL for Mobile
  const quickConnectUrl = url?.trim()
    ? `${window.location.origin}${window.location.pathname}?sheetUrl=${encodeURIComponent(url.trim())}&autoSync=true`
    : `${window.location.origin}${window.location.pathname}`;

  // Generate QR Code whenever URL or activeTab changes
  useEffect(() => {
    if (quickConnectUrl) {
      QRCode.toDataURL(quickConnectUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        }
      })
      .then(dataUri => setQrCodeUrl(dataUri))
      .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [quickConnectUrl]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleTest = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid Google Apps Script Web App URL.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await onTestConnection(url.trim());
      if (ok) {
        setTestResult({ success: true, message: t.connectionSuccess });
        onSaveConfig({ ...config, webAppUrl: url.trim() });
      } else {
        setTestResult({ success: false, message: t.connectionFailed });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || t.connectionFailed });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({ ...config, webAppUrl: url.trim() });
    onClose();
  };

  const handlePull = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await onPullFromSheets();
      setSyncFeedback(t.syncedWithSheets);
    } catch (err: any) {
      setSyncFeedback(err.message || 'Error pulling data from Sheets');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePush = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await onPushToSheets();
      setSyncFeedback(t.syncedWithSheets);
    } catch (err: any) {
      setSyncFeedback(err.message || 'Error pushing data to Sheets');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {t.setupScriptTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.setupScriptDesc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'km' ? 'ការតភ្ជាប់ (Connection)' : 'Connection Settings'}
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'instructions'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'km' ? 'ការណែនាំដំឡើង (Instructions)' : 'Setup Guide'}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code.gs Script</span>
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'mobile'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs rounded-t-lg font-bold'
                : 'border-transparent text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>📱 ភ្ជាប់ទូរស័ព្ទ (Mobile Sync)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* TAB 1: CONNECTION SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              
              {/* Connection Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {connectionStatus === 'connected' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {connectionStatus === 'connected' ? t.connected : t.disconnected}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    {connectionStatus === 'connected'
                      ? (language === 'km' ? 'ប្រព័ន្ធបានភ្ជាប់ជាមួយ Google Sheets ដោយជោគជ័យ។ រាល់ការបន្ថែម កែប្រែ ឬលុប នឹងសមកាលកម្មដោយស្វ័យប្រវត្តិ។' : 'Connected to Google Sheets Web App. All CRUD actions will sync automatically.')
                      : (language === 'km' ? 'បច្ចុប្បន្នកំពុងដំណើរការក្នុងរបៀប Local Storage។ សូមបញ្ចូល Web App URL ខាងក្រោមដើម្បីភ្ជាប់ជាមួយ Google Sheets ផ្ទាល់ខ្លួនរបស់អ្នក។' : 'Running in Local Storage demo mode. Paste your Apps Script Web App URL below to connect to your live Google Sheet.')}
                  </p>
                </div>
              </div>

              {/* Web App URL Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 block">
                  {t.webAppUrlLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder={t.webAppUrlPlaceholder}
                    className="flex-1 px-3.5 py-2 font-mono text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    disabled={isTesting || !url.trim()}
                    onClick={handleTest}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.testing}</span>
                      </>
                    ) : (
                      <span>{t.testConnection}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Sync Actions (Pull / Push) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {language === 'km' ? 'សកម្មភាពសមកាលកម្មដោយដៃ (Manual Sync)' : 'Manual Synchronization'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'km' 
                    ? `ចំនួនសិស្សក្នុងប្រព័ន្ធបច្ចុប្បន្ន៖ ${studentCount} នាក់`
                    : `Currently ${studentCount} students in app storage.`}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isSyncing || !url.trim()}
                    onClick={handlePull}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <DownloadCloud className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'km' ? 'ទាញយកពី Google Sheets' : 'Pull from Google Sheets'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSyncing || !url.trim()}
                    onClick={handlePush}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{language === 'km' ? 'បញ្ជូនទាំងអស់ទៅ Sheets' : 'Push All to Google Sheets'}</span>
                  </button>
                </div>

                {syncFeedback && (
                  <div className="text-xs font-medium text-indigo-700 bg-indigo-50 p-2 rounded border border-indigo-100 mt-2">
                    {syncFeedback}
                  </div>
                )}
              </div>

              {/* Vercel Environment Variable Tip */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{language === 'km' ? '⚡ គន្លឹះសំរាប់ Hosting Vercel (Auto-Sync គ្រប់ឧបករណ៍)' : '⚡ Vercel Hosting Auto-Sync'}</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  {language === 'km'
                    ? 'ដើម្បីកុំឱ្យពិបាក Copy/Paste URL នេះនៅលើកុំព្យូទ័រ ឬទូរស័ព្ទផ្សេងៗទៀត លោកអ្នកគ្រាន់តែចូលទៅកាន់ Vercel > Settings > Environment Variables រួចបន្ថែមឈ្មោះ VITE_APPS_SCRIPT_URL ដោយដាក់តម្លៃជា Web App URL នេះ។ នោះគ្រប់ឧបករណ៍ទាំងអស់ដែលបើក Link នឹងភ្ជាប់មក Google Sheets នេះដោយស្វ័យប្រវត្តិតែម្ដង!'
                    : 'To automatically connect all devices without manual setup, add VITE_APPS_SCRIPT_URL in your Vercel Project Settings > Environment Variables with this Web App URL.'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                <h4 className="font-bold flex items-center gap-2 text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>{t.instructionsTitle}</span>
                </h4>
                <p className="text-indigo-800">
                  {language === 'km' 
                    ? 'Google Apps Script គឺជា Backend ឥតគិតថ្លៃ ១០០% របស់ Google ដែលអនុញ្ញាតឱ្យ React App អាចអាន និងសរសេរចូល Google Sheets ដោយផ្ទាល់។'
                    : 'Google Apps Script is Google\'s official serverless backend that allows your web app to read and write directly to Google Sheets for free.'}
                </p>
              </div>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-700 list-none">
                <li className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="font-semibold block text-slate-900">{t.step1}</span>
                    <a 
                      href="https://sheets.new" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1 text-xs mt-1"
                    >
                      <span>Open sheets.new</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </li>

                <li className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span className="font-semibold block text-slate-900">{t.step2}</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'km' ? 'ផ្ទាំង Google Apps Script Editor នឹងបើកឡើងក្នុង tab ថ្មី។' : 'The Apps Script code editor will open in a new browser tab.'}
                    </p>
                  </div>
                </li>

                <li className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span className="font-semibold block text-slate-900">{t.step3}</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('code')}
                      className="text-indigo-600 hover:underline text-xs mt-1 font-semibold flex items-center gap-1"
                    >
                      <span>{language === 'km' ? 'មើល និងចម្លងកូដ Code.gs ត្រង់នេះ' : 'View and copy Code.gs script here'}</span>
                    </button>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div className="space-y-2 flex-1">
                    <span className="font-semibold block text-slate-900">{t.step4}</span>
                    <p className="text-xs text-slate-600">
                      {language === 'km' 
                        ? 'ចុចប៊ូតុងពណ៌ខៀវ "Deploy" (នៅជ្រុងខាងស្តាំលើ) > ជ្រើសយក "New deployment" > ចុចរូបសញ្ញាកង់ធ្មេញ ⚙️ រួចជ្រើសរើស "Web app"។'
                        : 'Click the blue "Deploy" button at the top right > "New deployment" > click the gear icon ⚙️ and select "Web app".'}
                    </p>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">5</span>
                  <div className="space-y-2 flex-1">
                    <span className="font-semibold block text-slate-900">{t.step5}</span>
                    
                    <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 shrink-0 w-28">• Execute as:</span>
                        <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {language === 'km' ? 'Me (អ៊ីមែល Google របស់អ្នក)' : 'Me (your Google email)'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 shrink-0 w-28">• Who has access:</span>
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          {language === 'km' ? 'Anyone (អ្នកណាក៏បាន - សំខាន់បំផុត!)' : 'Anyone (Crucial!)'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-700 shrink-0 w-28">• Description:</span>
                        <span className="text-slate-500">
                          {language === 'km' ? 'អាចវាយ "Student API" ឬទុកនៅទទេក៏បាន' : 'Optional (e.g. Student API)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">6</span>
                  <div className="space-y-1">
                    <span className="font-semibold block text-slate-900">{t.step6}</span>
                    <p className="text-xs text-slate-500">
                      {language === 'km' 
                        ? 'ចុច Deploy > បើមានផ្ទាំង Authorize access សូមចុច Email > Advanced > Go to Untitled project (unsafe) > Allow រួចចម្លង Web app URL យកមក Paste ដាក់ក្នុងប្រអប់ខាងលើ។'
                        : 'Click Deploy > If prompted for permissions, click Authorize access > Advanced > Go to project > Allow, then copy the Web app URL.'}
                    </p>
                  </div>
                </li>
              </ol>

              {/* FAQ / Clarification Card on Key and Value */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    {language === 'km' 
                      ? '💡 ចុះត្រង់ "Key" និង "Value" (Script Properties) ត្រូវបំពេញយ៉ាងដូចម្តេច?' 
                      : '💡 Do you need to set "Key" & "Value" (Script Properties)?'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed pl-6">
                  {language === 'km' ? (
                    <>
                      <strong>ចម្លើយ៖ មិនបាច់បំពេញអ្វីទាំងអស់ (ទុកឱ្យនៅទទេ - Leave Empty)!</strong><br />
                      ដោយសារតែកូដ <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-mono">Code.gs</code> របស់យើងត្រូវបានបើកចេញពី Google Sheet ផ្ទាល់ (Extensions &gt; Apps Script) វានឹងស្គាល់ និងតភ្ជាប់ទៅកាន់ Sheet ដោយស្វ័យប្រវត្តិតាមរយៈ <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-mono">SpreadsheetApp.getActiveSpreadsheet()</code> ១០០%។ អ្នកមិនចាំបាច់ទៅបន្ថែម Key ឬ Value ក្នុង Script Properties នោះឡើយ!
                    </>
                  ) : (
                    <>
                      <strong>Answer: Leave it completely empty!</strong><br />
                      Because this script is created directly inside your Google Sheet (Extensions &gt; Apps Script), it automatically links to your sheet using <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-mono">SpreadsheetApp.getActiveSpreadsheet()</code>. No Script Properties (Key/Value) are needed!
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CODE.GS SCRIPT */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Google Apps Script (Code.gs)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.copyScript}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
                <pre>{GOOGLE_APPS_SCRIPT_TEMPLATE}</pre>
              </div>

              <p className="text-xs text-slate-500 italic">
                {language === 'km' 
                  ? '* កូដនេះបង្កើតសន្លឹកកិច្ចការ (Sheet) ឈ្មោះ "Students" ដោយស្វ័យប្រវត្តិ រួមទាំង headers និង handle CORS យ៉ាងត្រឹមត្រូវ។'
                  : '* This script automatically creates the "Students" sheet, initializes headers, and handles CORS for full CRUD operations.'}
              </p>
            </div>
          )}

          {/* TAB 4: MOBILE SYNC (📱 ភ្ជាប់ទូរស័ព្ទ) */}
          {activeTab === 'mobile' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Alert / Highlight Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                    <span>📱 ភ្ជាប់ Google Sheets ជាមួយទូរស័ព្ទដៃ (Mobile Sync)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">Auto-Connect</span>
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    ជ្រើសរើសវិធីងាយស្រួលណាមួយខាងក្រោមដើម្បីភ្ជាប់ Google Sheets ជាមួយទូរស័ព្ទដៃរបស់អ្នកដោយស្វ័យប្រវត្តិ។
                  </p>
                </div>
              </div>

              {/* វិធីទី ១: ស្កេន QR Code - ស្រួល និងលឿនបំផុត */}
              <div className="p-5 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      1
                    </span>
                    <h5 className="font-bold text-sm text-indigo-950">
                      វិធីទី ១ (ស្កេន QR Code - ស្រួល និងលឿនបំផុត)
                    </h5>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Recommended ⭐
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                  {/* Left: Step-by-step Instructions */}
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        ១
                      </div>
                      <p className="leading-relaxed">
                        នៅលើកុំព្យូទ័រ សូមចុចបើក <strong>"ភ្ជាប់ Google Sheet"</strong> រួចចូលទៅកាន់ tab <strong>"📱 ភ្ជាប់ទូរស័ព្ទ (Mobile Sync)"</strong>។
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        ២
                      </div>
                      <p className="leading-relaxed">
                        លើកទូរស័ព្ទដៃ បើកកាមេរ៉ា (Camera) ឬកម្មវិធីស្កេន QR <strong>ស្កេនរូប QR Code</strong> ដែលបង្ហាញនៅខាងស្ដាំនេះ។
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        ៣
                      </div>
                      <p className="leading-relaxed">
                        ចុចលើតំណភ្ជាប់ដែលបង្ហាញលើទូរស័ព្ទ នោះប្រព័ន្ធនឹងបើកកម្មវិធីលើទូរស័ព្ទ ហើយ <strong>Auto-Connect Google Sheet & Sync ទិន្នន័យស្វ័យប្រវត្តិ ១០០% ភ្លាមៗ</strong> ដោយមិនបាច់វាយ URL អ្វីទាំងអស់!
                      </p>
                    </div>
                  </div>

                  {/* Right: QR Code Visual Display */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    {qrCodeUrl ? (
                      <div className="relative p-2 bg-white rounded-2xl shadow-md border border-slate-200">
                        <img 
                          src={qrCodeUrl} 
                          alt="Quick-Connect QR Code" 
                          className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                        />
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 whitespace-nowrap">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Scan to Auto-Connect</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                    <span className="text-[11px] text-slate-500 mt-4 font-medium">
                      ស្កេនដោយប្រើ Camera iPhone / Android
                    </span>
                  </div>
                </div>
              </div>

              {/* វិធីទី ២: ផ្ញើតំណភ្ជាប់ Quick-Connect */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <h5 className="font-bold text-sm text-slate-900">
                    វិធីទី ២ (ផ្ញើតំណភ្ជាប់ Quick-Connect)
                  </h5>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  នៅលើកុំព្យូទ័រ ចុចប៊ូតុង <strong>"ចម្លងតំណភ្ជាប់ Quick-Connect"</strong> រួចផ្ញើតាម Telegram ឬ Messenger ទៅកាន់ទូរស័ព្ទដៃ។ ពេលចុចបើក link នោះលើទូរស័ព្ទ ទូរស័ព្ទនឹងចងចាំការតភ្ជាប់ជារៀងរហូត។
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(quickConnectUrl);
                      setCopiedQuickLink(true);
                      setTimeout(() => setCopiedQuickLink(false), 2500);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {copiedQuickLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedQuickLink ? 'បានចម្លងតំណភ្ជាប់រួចរាល់!' : 'ចម្លងតំណភ្ជាប់ Quick-Connect'}</span>
                  </button>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(quickConnectUrl)}&text=${encodeURIComponent('ភ្ជាប់ Google Sheets សម្រាប់ប្រព័ន្ធសិស្ស លិស៊ីង (Quick-Connect)')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>ផ្ញើតាម Telegram</span>
                  </a>

                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.share({
                          title: 'Student Management Quick-Connect',
                          text: 'ចុច link នេះលើទូរស័ព្ទដើម្បីភ្ជាប់ Google Sheets ដោយស្វ័យប្រវត្តិ',
                          url: quickConnectUrl,
                        }).catch(() => {});
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                    >
                      <Share2 className="w-4 h-4 text-slate-500" />
                      <span>Share</span>
                    </button>
                  )}
                </div>
              </div>

              {/* វិធីទី ៣: Paste ដោយដៃ */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    3
                  </span>
                  <h5 className="font-bold text-sm text-slate-900">
                    វិធីទី ៣ (Paste ដោយដៃ)
                  </h5>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  ចម្លង Apps Script Web App URL ទៅបិទភ្ជាប់ (Paste) ក្នុង Google Sheets Settings លើទូរស័ព្ទដៃតែម្តងគត់។
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={url || 'https://script.google.com/macros/s/.../exec'}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 font-mono text-xs text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      setCopiedManualUrl(true);
                      setTimeout(() => setCopiedManualUrl(false), 2500);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    {copiedManualUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedManualUrl ? 'បានចម្លង!' : 'ចម្លង URL'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs"
          >
            {t.saveConfig}
          </button>
        </div>

      </div>
    </div>
  );
};
