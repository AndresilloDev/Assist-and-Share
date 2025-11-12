"use client";

type AlertType = "success" | "error" | "info";

interface AlertMessageProps {
  type: AlertType;
  title?: string;
  message: string;
  icon?: React.ReactNode;
}

export default function AlertMessage({ type, title, message, icon }: AlertMessageProps) {
  const styles = {
    success: {
      container: "bg-green-900/50 border-green-700",
      text: "text-green-200",
      iconColor: "text-green-400",
    },
    error: {
      container: "bg-red-900/50 border-red-700",
      text: "text-red-200",
      iconColor: "text-red-400",
    },
    info: {
      container: "bg-blue-900/50 border-blue-700",
      text: "text-blue-200",
      iconColor: "text-blue-400",
    },
  };

  const style = styles[type];

  const defaultIcon = type === "success" ? (
    <svg
      className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ) : null;

  return (
    <div className={`${style.container} border p-4 rounded-2xl mb-6`}>
      {title || icon || defaultIcon ? (
        <div className="flex items-start gap-3">
          {icon || defaultIcon}
          <div className={`${style.text} text-sm`}>
            {title && <p className="font-medium mb-1">{title}</p>}
            <p>{message}</p>
          </div>
        </div>
      ) : (
        <div className={`${style.text} text-sm`}>{message}</div>
      )}
    </div>
  );
}