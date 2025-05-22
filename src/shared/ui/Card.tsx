import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Card = ({ className, children, ...props }: CardProps) => {
    return (
        <div
            className={`bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
