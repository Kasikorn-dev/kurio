/**
 * Reusable animation variants for framer motion
 */

export const fadeInUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
}

export const fadeInDown = {
	initial: { opacity: 0, y: -20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 20 },
}

export const scaleIn = {
	initial: { scale: 0, rotate: -180 },
	animate: { scale: 1, rotate: 0 },
	exit: { scale: 0, rotate: 180 },
}

export const slideInLeft = {
	initial: { opacity: 0, x: -20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: 20 },
}

export const slideInRight = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
}

export const slideTransition = {
	duration: 0.3,
	ease: "easeInOut",
}

export const springTransition = {
	type: "spring",
	stiffness: 200,
	damping: 20,
}

export const smoothTransition = {
	duration: 0.3,
	ease: "easeOut",
}

export const buttonHover = {
	scale: 1.05,
	transition: { type: "spring", stiffness: 400, damping: 17 },
}

export const buttonTap = {
	scale: 0.95,
	transition: { type: "spring", stiffness: 400, damping: 17 },
}
