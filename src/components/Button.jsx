export default function Button({
    children,
    className = "",
    variant = "primary",
    type = "button",
    ...props
}) {
    const baseClass =
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100";

    const variantClasses = {
        primary:
            "bg-primary text-bg shadow-primary/30 hover:shadow-md hover:shadow-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        secondary:
            "border border-accent/25 bg-card text-text hover:bg-accent/10",
        ghost:
            "text-text hover:bg-accent/10",
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
