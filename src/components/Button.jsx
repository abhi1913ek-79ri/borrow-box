export default function Button({
    children,
    className = "",
    variant = "primary",
    type = "button",
    ...props
}) {
    const baseClass =
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98]";

    const variantClasses = {
        primary:
            "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
        secondary:
            "border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        ghost:
            "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
    };

    return (
        <button
            type={type}
            className={`${baseClass} ${variantClasses[variant] || variantClasses.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
