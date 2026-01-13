interface ProgressBarProps {
    progress: number;
    label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-300 font-medium">{Math.round(progress)}%</span>
                </div>
            )}
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
        </div>
    );
}
