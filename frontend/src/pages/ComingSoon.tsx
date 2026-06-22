import { motion } from 'framer-motion';

interface ComingSoonProps {
  title: string;
  description: string;
  capabilities: string[];
  models: string[];
}

/**
 * Placeholder for the AI Image / Video scanners. The full pipeline (upload,
 * inference, heatmap/timeline visualization) ships with the Python AI
 * microservice in a follow-up milestone.
 */
export function ComingSoon({ title, description, capabilities, models }: ComingSoonProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <span className="inline-block rounded-full border border-cyber-border bg-cyber-purple/10 px-3 py-1 text-xs font-semibold text-cyber-purple">
          In Development
        </span>
        <h1 className="mt-3 text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-strong p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Planned Capabilities</h2>
          <ul className="space-y-2">
            {capabilities.map((c) => (
              <li key={c} className="flex items-center gap-2 text-slate-200">
                <span className="text-cyber-cyan">▹</span> {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-strong p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">AI Models</h2>
          <div className="flex flex-wrap gap-2">
            {models.map((m) => (
              <span key={m} className="rounded-full border border-cyber-border bg-cyber-surface px-3 py-1 text-sm text-slate-200">
                {m}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Served by a dedicated Python (FastAPI) inference microservice with GPU support.
          </p>
        </div>
      </div>

      <div className="glass flex items-center justify-center py-16 text-center text-slate-500">
        <div>
          <div className="mx-auto mb-4 h-16 w-16 animate-pulse-glow rounded-2xl bg-gradient-to-br from-cyber-indigo to-cyber-purple" />
          <p className="text-lg text-slate-300">Upload &amp; inference UI coming soon</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ImageScannerPage() {
  return (
    <ComingSoon
      title="AI Image Scanner"
      description="Detect AI-generated images and deepfakes with confidence scoring, heatmap visualization, and metadata analysis."
      capabilities={[
        'AI vs Human classification',
        'Deepfake analysis',
        'EXIF / metadata inspection',
        'Confidence score + probability graph',
        'Heatmap visualization',
        'Downloadable report',
      ]}
      models={['ResNet50', 'EfficientNet', 'CLIP', 'CNN Classifier']}
    />
  );
}

export function VideoScannerPage() {
  return (
    <ComingSoon
      title="AI Video Scanner"
      description="Frame-level deepfake and AI-video detection with face-consistency and lip-sync analysis."
      capabilities={[
        'Deepfake detection',
        'AI video detection',
        'Face consistency analysis',
        'Frame-by-frame analysis',
        'Lip-sync detection',
        'Timeline graph + report',
      ]}
      models={['XceptionNet', 'EfficientNet-B7', 'LSTM Temporal', 'MediaPipe FaceMesh']}
    />
  );
}
