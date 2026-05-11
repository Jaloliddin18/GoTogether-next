import React, { CSSProperties, useState } from 'react';

interface ChronicleButtonProps {
	text: string;
	onClick?: () => void;
	style?: CSSProperties & {
		hoverColor?: string;
		hoverForeground?: string;
	};
	className?: string;
}

export const ChronicleButton = ({
	text,
	onClick,
	style,
	className,
}: ChronicleButtonProps) => {
	const [isHovered, setIsHovered] = useState(false);

	const {
		hoverColor,
		hoverForeground,
		backgroundColor,
		color,
		transition,
		...restStyle
	} = style || {};

	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={className}
			style={{
				padding: '12px 24px',
				border: 'none',
				cursor: 'pointer',
				fontSize: '16px',
				fontWeight: 600,
				lineHeight: 1,
				backgroundColor: isHovered ? hoverColor || backgroundColor : backgroundColor,
				color: isHovered ? hoverForeground || color : color,
				transition: transition || 'all 0.25s ease-in-out',
				...restStyle,
			}}
		>
			{text}
		</button>
	);
};
