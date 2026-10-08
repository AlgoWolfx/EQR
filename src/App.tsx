import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { LanguageSelector, useLanguage } from './i18n/react';
import { initialKind } from './site/config';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Globe,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Star,
  Sun,
  Upload,
  UserRound,
  Wifi,
  X,
} from 'lucide-react';
import { encodePayload, formats, PayloadError, type QRKind, type Values } from './lib/payloads';
import {
  defaultSettings,
  download,
  pngBlob,
  readLogo,
  renderSVG,
  svgURL,
  type QRSettings,
} from './lib/qr';
import { batchEntries, exportBatch, printSheet } from './lib/export';
const icons = {
  url: Globe,
  text: FileText,
  wifi: Wifi,
  contact: UserRound,
  email: Mail,
  phone: Phone,
  sms: MessageCircle,
  whatsapp: MessageCircle,
  location: MapPin,
  review: Star,
};
const swatches = ['#254a36', '#20252b', '#5a3b85', '#164e87', '#8c303b'];
type Theme = 'light' | 'dark';
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem('eqr-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* Storage may be disabled. */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export function App() {
  const { t, language } = useLanguage();
  const [kind, setKind] = useState<QRKind>(() => initialKind(window.location.search));
  const [values, setValues] = useState<Record<QRKind, Values>>(
    () =>
      Object.fromEntries(formats.map((f) => [f.id, { ...f.defaults }])) as Record<QRKind, Values>,
  );
  const [settings, setSettings] = useState<QRSettings>({ ...defaultSettings });
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [batchOpen, setBatchOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const logoInput = useRef<HTMLInputElement>(null);
  const format = formats.find((f) => f.id === kind)!;
  const data = values[kind];
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', theme === 'dark' ? '#171819' : '#fafaf9');
    });
    try {
      localStorage.setItem('eqr-theme', theme);
    } catch {
      /* No payloads are stored. */
    }
  }, [theme]);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const result = useMemo(() => {
    try {
      const payload = encodePayload(kind, data);
      return { payload, svg: renderSVG(payload, settings), error: '', field: '' };
    } catch (error) {
      return {
        payload: '',
        svg: '',
        error: (error as Error).message,
        field: error instanceof PayloadError ? error.field : '',
      };
    }
  }, [kind, data, settings]);
  function update(key: string, value: string) {
    setActionError('');
    setValues((v) => ({ ...v, [kind]: { ...v[kind], [key]: value } }));
  }
  function customize<K extends keyof QRSettings>(key: K, value: QRSettings[K]) {
    setActionError('');
    setSettings((s) => ({ ...s, [key]: value }));
  }
  async function action(work: () => Promise<void>) {
    setBusy(true);
    setActionError('');
    try {
      await work();
    } catch (error) {
      setActionError((error as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    await action(async () => {
      const logo = await readLogo(file);
      setSettings((s) => ({ ...s, logo }));
      setToast('Logo added. Error correction is set to High.');
    });
  }
  async function save(type: 'png' | 'svg') {
    if (!result.svg) return;
    await action(async () => {
      const blob =
        type === 'svg'
          ? new Blob([result.svg], { type: 'image/svg+xml' })
          : await pngBlob(result.svg, settings.size);
      download(blob, `eqr-${kind}.${type}`);
      setToast(`${type.toUpperCase()} downloaded.`);
    });
  }
  const canCopy = typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;
  return (
    <>
      {createPortal(<LanguageSelector />, document.getElementById('language-control')!)}
      {createPortal(
        <button
          className="icon-button theme-toggle"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={t(theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme')}
        >
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
        </button>,
        document.getElementById('theme-control')!,
      )}
      {createPortal(
        <span className="footer-status">
          {t(
            !online
              ? 'Working offline'
              : offlineReady
                ? 'Ready for offline use'
                : 'Created on your device',
          )}
        </span>,
        document.getElementById('offline-status')!,
      )}
      <div className="studio-toolbar">
        <p className="tool-hint">{t('Your preview updates as you type.')}</p>
        <button className="text-button" onClick={() => setBatchOpen(true)}>
          <Layers size={16} />
          {t('Batch create')}
          <ArrowRight size={14} />
        </button>
      </div>
      <div className="studio-grid">
        <aside className="formats" aria-label={t('QR code type')}>
          <h2 className="sr-only">{t('Choose a QR code type')}</h2>
          <div className="format-list">
            {formats.map((f) => {
              const Icon = icons[f.id];
              return (
                <button
                  key={f.id}
                  aria-pressed={kind === f.id}
                  onClick={() => {
                    setKind(f.id);
                    setActionError('');
                  }}
                  className={`format-button ${kind === f.id ? 'active' : ''}`}
                >
                  <Icon size={18} strokeWidth={1.7} />
                  <span>{t(f.name)}</span>
                  {kind === f.id && <ArrowRight size={15} />}
                </button>
              );
            })}
          </div>
        </aside>
        <section className="editor-card" aria-labelledby="content-heading">
          <div className="step-heading">
            <h2 id="content-heading">{t(format.title)}</h2>
            <button
              className="icon-button reset-button"
              aria-label={t('Reset this QR code')}
              title={t('Reset this QR code')}
              onClick={() => {
                setValues((v) => ({ ...v, [kind]: { ...format.defaults } }));
                setSettings({ ...defaultSettings });
                setActionError('');
              }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
          <p className="editor-description">{t(format.description)}</p>
          <div className="content-fields">
            {format.fields
              .filter(
                (field) =>
                  !(kind === 'wifi' && data.security === 'nopass' && field.key === 'password'),
              )
              .map((field) => {
                const invalid = result.field === field.key;
                const props = {
                  id: `field-${field.key}`,
                  value: data[field.key] ?? '',
                  onChange: (
                    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
                  ) => update(field.key, e.target.value),
                  'aria-invalid': invalid,
                  'aria-required': !field.optional,
                  'aria-describedby': invalid
                    ? 'qr-error'
                    : field.hint
                      ? `hint-${field.key}`
                      : undefined,
                };
                return (
                  <div className="field" key={`${kind}-${field.key}`}>
                    <label htmlFor={props.id}>
                      {t(field.label)}
                      {field.optional && <span>{t('Optional')}</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        {...props}
                        dir="auto"
                        placeholder={field.placeholder ? t(field.placeholder) : undefined}
                        rows={4}
                      />
                    ) : field.type === 'select' ? (
                      <div className="select-wrap">
                        <select {...props}>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {t(option.label)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    ) : (
                      <div className={`input-wrap ${kind === 'url' ? 'with-icon' : ''}`}>
                        {kind === 'url' && <Globe size={17} />}
                        <input
                          {...props}
                          type={field.type ?? 'text'}
                          placeholder={field.placeholder ? t(field.placeholder) : undefined}
                          autoComplete="off"
                          spellCheck={false}
                          dir={
                            [
                              'url',
                              'website',
                              'email',
                              'phone',
                              'latitude',
                              'longitude',
                              'placeId',
                            ].includes(field.key)
                              ? 'ltr'
                              : 'auto'
                          }
                        />
                      </div>
                    )}
                    {field.hint && (
                      <p className="field-hint" id={`hint-${field.key}`}>
                        {t(field.hint)}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
          <details className="customization">
            <summary>
              {t('Customize your code')}
              <ChevronDown size={16} />
            </summary>
            <div className="customization-fields">
              <div className="color-settings">
                <div className="color-field">
                  <label htmlFor="foreground">{t('Code color')}</label>
                  <div className="color-picker">
                    <input
                      id="foreground"
                      type="color"
                      value={settings.foreground}
                      onChange={(e) => customize('foreground', e.target.value)}
                    />
                    <span>{settings.foreground.toUpperCase()}</span>
                  </div>
                </div>
                <div className="color-field">
                  <label htmlFor="background">{t('Background')}</label>
                  <div className="color-picker">
                    <input
                      id="background"
                      type="color"
                      value={settings.background}
                      onChange={(e) => customize('background', e.target.value)}
                    />
                    <span>{settings.background.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="swatches" aria-label={t('Code color presets')}>
                {swatches.map((color) => (
                  <button
                    key={color}
                    style={{ background: color }}
                    className={settings.foreground === color ? 'selected' : ''}
                    aria-label={t('Use {color} code color', { color })}
                    aria-pressed={settings.foreground === color}
                    onClick={() => customize('foreground', color)}
                  >
                    {settings.foreground === color && <Check size={12} />}
                  </button>
                ))}
                <span>{t('Choose a preset color')}</span>
              </div>
              <div className="style-row">
                <span className="setting-label">{t('Code shape')}</span>
                <div className="segmented">
                  {(['square', 'rounded'] as const).map((style) => (
                    <button
                      key={style}
                      aria-pressed={settings.style === style}
                      className={settings.style === style ? 'selected' : ''}
                      onClick={() => customize('style', style)}
                    >
                      <span className={`module-icon ${style}`} />
                      {t(style === 'square' ? 'Square' : 'Rounded')}
                    </button>
                  ))}
                </div>
              </div>
              <input
                className="sr-only"
                type="file"
                ref={logoInput}
                tabIndex={-1}
                aria-label={t('Upload logo file')}
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <div
                className={`logo-upload ${settings.logo ? 'has-logo' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void upload(e.dataTransfer.files[0]);
                }}
              >
                {settings.logo ? (
                  <>
                    <img src={settings.logo} alt={t('Your logo')} />
                    <span>
                      <strong>{t('Your logo')}</strong>
                      <small>{t('High error correction \u00B7 14% logo size')}</small>
                    </span>
                    <button
                      className="icon-button"
                      aria-label={t('Remove logo')}
                      onClick={() => customize('logo', undefined)}
                    >
                      <X size={17} />
                    </button>
                  </>
                ) : (
                  <button disabled={busy} onClick={() => logoInput.current?.click()}>
                    <span className="upload-icon">
                      <Plus size={18} />
                    </span>
                    <span>
                      <strong>{t('Add a logo')}</strong>
                      <small>{t('Drop or choose a PNG, JPG, or WebP \u00B7 Max 2 MB')}</small>
                    </span>
                    <Upload size={16} />
                  </button>
                )}
              </div>
              <details className="advanced">
                <summary>
                  {t('More QR settings')}
                  <ChevronDown size={15} />
                </summary>
                <div className="advanced-fields">
                  <div className="field">
                    <label htmlFor="correction">{t('Error correction')}</label>
                    <select
                      id="correction"
                      value={settings.logo ? 'H' : settings.correction}
                      disabled={!!settings.logo}
                      onChange={(e) =>
                        customize('correction', e.target.value as QRSettings['correction'])
                      }
                    >
                      <option value="L">{t('Low \u00B7 7%')}</option>
                      <option value="M">{t('Medium \u00B7 15%')}</option>
                      <option value="Q">{t('Quartile \u00B7 25%')}</option>
                      <option value="H">{t('High \u00B7 30%')}</option>
                    </select>
                    <p className="field-hint">
                      {t(
                        'More correction tolerates damage but makes a denser code. Logos always use High.',
                      )}
                    </p>
                  </div>
                  <div className="field">
                    <label htmlFor="margin">
                      {t('Quiet zone')}
                      <span>{t('{count} modules', { count: settings.margin })}</span>
                    </label>
                    <input
                      id="margin"
                      type="range"
                      min="4"
                      max="12"
                      step="1"
                      value={settings.margin}
                      onChange={(e) => customize('margin', Number(e.target.value))}
                    />
                    <p className="field-hint">
                      {t('Keep the border clear so scanners can find your code.')}
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </details>
        </section>
        <section className="preview-card" aria-labelledby="preview-heading">
          <div className="step-heading">
            <h2 id="preview-heading">{t('Preview & download')}</h2>
          </div>
          <div className="preview-stage">
            <div className="qr-paper">
              {result.svg ? (
                <img
                  className="qr-preview"
                  src={svgURL(result.svg)}
                  alt={t('{type} QR code preview', { type: t(format.name) })}
                />
              ) : (
                <div className="empty-preview">
                  <QrCode size={68} strokeWidth={1} />
                  <span>{t('No QR code to preview')}</span>
                  <small>{t('Check the message below to continue.')}</small>
                </div>
              )}
            </div>
          </div>
          <div className="preview-status">
            {result.error ? (
              <p id="qr-error" className="error-message" role="alert">
                {t(result.error)}
              </p>
            ) : (
              <>
                <span>
                  <Check size={14} />
                  {t('Your QR code is ready')}
                </span>
                <small>{t('Test it with your camera before sharing.')}</small>
              </>
            )}
          </div>
          {settings.logo && (
            <p className="scan-note">
              {t('Test logo codes on several devices at the size you plan to print.')}
            </p>
          )}
          <div className="export-settings">
            <label htmlFor="size">{t('Export size')}</label>
            <select
              id="size"
              value={settings.size}
              onChange={(e) => customize('size', Number(e.target.value))}
            >
              {[256, 512, 1024, 2048].map((size) => (
                <option key={size} value={size}>
                  {t('{size} × {size} px', { size })}
                </option>
              ))}
            </select>
          </div>
          <button
            className="download-primary"
            disabled={!result.svg || busy}
            onClick={() => void save('png')}
          >
            <ArrowDownToLine size={19} />
            <span>{t('Download PNG')}</span>
            <ArrowRight size={17} />
          </button>
          <button
            className="download-secondary"
            disabled={!result.svg || busy}
            onClick={() => void save('svg')}
          >
            <Download size={16} />
            {t('Download SVG')} <span>{t('Scalable vector')}</span>
          </button>
          <div className="extra-actions">
            <button
              disabled={!result.svg || busy || !canCopy}
              title={t(
                !canCopy
                  ? 'Image copying requires a supported browser and HTTPS. Download PNG instead.'
                  : 'Copy a PNG image',
              )}
              onClick={() =>
                void action(async () => {
                  try {
                    await navigator.clipboard.write([
                      new ClipboardItem({ 'image/png': pngBlob(result.svg, settings.size) }),
                    ]);
                  } catch {
                    throw new Error(
                      'Could not copy the image. Allow clipboard access or download PNG instead.',
                    );
                  }
                  setToast('QR image copied to your clipboard.');
                })
              }
            >
              <Copy size={15} />
              {t('Copy image')}
            </button>
            <span />
            <button
              disabled={!result.svg || busy}
              onClick={() =>
                void action(() =>
                  printSheet(
                    Array.from({ length: 6 }, () => ({
                      svg: result.svg,
                      label:
                        kind === 'url' ? data.url : t('{type} · Scan me', { type: t(format.name) }),
                    })),
                    language,
                  ),
                )
              }
            >
              <Printer size={15} />
              {t('Print sheet')}
            </button>
          </div>
          <p className="export-note">{t('PNG for images. SVG for resizing and print.')}</p>
          {actionError && (
            <p className="error-message" role="alert">
              {t(actionError)}
            </p>
          )}
        </section>
      </div>
      <div className="privacy-strip">
        <p>
          <ShieldCheck size={16} />
          {t('Generated in your browser. Your content stays on your device.')}
        </p>
        <button className="text-button" onClick={() => setPrivacyOpen(true)}>
          {t('How privacy works')}
        </button>
      </div>
      <div className="toast" role="status" aria-live="polite">
        {toast && (
          <>
            <Check size={16} />
            {t(toast)}
            <button
              className="icon-button"
              aria-label={t('Dismiss notification')}
              onClick={() => setToast('')}
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>
      {needRefresh && (
        <div className="update-banner" role="status">
          {t('An EQR update is ready.')}{' '}
          <button
            onClick={() => {
              if (window.confirm(t('Reload EQR? Your current QR content will be cleared.')))
                void updateServiceWorker(true);
            }}
          >
            {t('Update & reload')}
          </button>
        </div>
      )}
      {batchOpen && <BatchDialog settings={settings} onClose={() => setBatchOpen(false)} />}
      {privacyOpen && (
        <Modal title={t('How EQR handles your data')} onClose={() => setPrivacyOpen(false)}>
          <div className="privacy-content">
            <ShieldCheck size={38} />
            <p>
              {t(
                'Your QR content and logo stay in this browser\u2019s memory. We don\u2019t send them to a server, and they are cleared when you reload.',
              )}
            </p>
            <p>
              {t(
                'Only your theme and language preferences are saved. Offline mode caches the app itself, never your QR content. There are no analytics, external fonts, or account requirements.',
              )}
            </p>
            <p>
              {t(
                'When someone scans your code, their device may open its destination website or app. That service has its own privacy policy.',
              )}
            </p>
            <button className="download-primary" onClick={() => setPrivacyOpen(false)}>
              {t('Back to the studio')}
              <Check size={17} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const box = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < box.left ||
            e.clientX > box.right ||
            e.clientY < box.top ||
            e.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-heading">
        <h2 id="modal-title">{t(title)}</h2>
        <button className="icon-button" onClick={onClose} aria-label={t('Close dialog')}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function BatchDialog({ settings, onClose }: { settings: QRSettings; onClose: () => void }) {
  const { t, language } = useLanguage();
  const [text, setText] = useState('');
  const [type, setType] = useState<'url' | 'text'>('url');
  const [output, setOutput] = useState<'png' | 'svg'>('png');
  const [operation, setOperation] = useState<'zip' | 'print' | null>(null);
  const busy = operation !== null;
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const batch = useMemo(() => {
    try {
      return { entries: batchEntries(text, type, settings), error: '' };
    } catch (e) {
      return { entries: [], error: (e as Error).message };
    }
  }, [text, type, settings]);
  async function run(operation: 'zip' | 'print', work: () => Promise<void>) {
    setOperation(operation);
    setError('');
    setDone(false);
    try {
      await work();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOperation(null);
    }
  }
  return (
    <Modal
      title={t('Create QR codes in bulk')}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <p className="modal-description">
        {t(
          'Enter one link or message per line, up to 50 lines. All codes use your current style and logo. Everything stays on your device.',
        )}
      </p>
      <fieldset disabled={busy}>
        <div className="batch-selects">
          <div className="field">
            <label htmlFor="batch-type">{t('Content type')}</label>
            <select
              id="batch-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'url' | 'text');
                setDone(false);
              }}
            >
              <option value="url">{t('Website URLs')}</option>
              <option value="text">{t('Plain text')}</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="batch-output">{t('Export format')}</label>
            <select
              id="batch-output"
              value={output}
              onChange={(e) => setOutput(e.target.value as 'png' | 'svg')}
            >
              <option value="png">{t('PNG images')}</option>
              <option value="svg">{t('SVG vectors')}</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="batch-content">
            {t(type === 'url' ? 'Your links' : 'Your text')}
            <span>{t('One per line')}</span>
          </label>
          <textarea
            id="batch-content"
            dir={type === 'url' ? 'ltr' : 'auto'}
            rows={6}
            placeholder={
              type === 'url'
                ? 'https://example.com\nhttps://your-next-idea.com'
                : t('Your first message\nYour next message')
            }
            value={text}
            aria-describedby="batch-result"
            onChange={(e) => {
              setText(e.target.value);
              setDone(false);
              setError('');
            }}
          />
        </div>
      </fieldset>
      <div id="batch-result" className="batch-result">
        {batch.entries.length ? (
          <>
            <span>
              <Check size={15} />{' '}
              {batch.entries.length === 1
                ? t('1 QR code ready')
                : t('{count} QR codes ready', { count: batch.entries.length })}
            </span>
            <div className="batch-thumbnails">
              {batch.entries.slice(0, 4).map((entry, i) => (
                <img
                  key={i}
                  src={svgURL(entry.svg)}
                  alt={t('Batch QR code {number}', { number: i + 1 })}
                />
              ))}
              {batch.entries.length > 4 && (
                <span>
                  {t('+')}
                  {batch.entries.length - 4}
                </span>
              )}
            </div>
          </>
        ) : (
          <p
            className={text.trim() ? 'error-message' : 'field-hint'}
            role={text.trim() ? 'alert' : undefined}
          >
            {t(batch.error)}
          </p>
        )}
      </div>
      {error && (
        <p className="error-message" role="alert">
          {t(error)}
        </p>
      )}
      <button
        className="download-primary"
        disabled={!batch.entries.length || busy}
        onClick={() =>
          void run('zip', async () => {
            await exportBatch(batch.entries, output, settings.size, setProgress);
            setDone(true);
          })
        }
      >
        <Layers size={18} />
        {operation === 'zip'
          ? t('Creating ZIP: {progress} of {count}…', { progress, count: batch.entries.length })
          : operation === 'print'
            ? t('Preparing print sheet…')
            : t('Download ZIP')}
        <ArrowDownToLine size={18} />
      </button>
      <button
        className="batch-print"
        disabled={!batch.entries.length || busy}
        onClick={() => void run('print', () => printSheet(batch.entries, language))}
      >
        <Printer size={16} />
        {t('Print this batch')}
      </button>
      <p className="export-note" role="status">
        {done
          ? t('Your ZIP has been downloaded.')
          : t('Export size: {size} × {size} px · No watermarks', { size: settings.size })}
      </p>
    </Modal>
  );
}
