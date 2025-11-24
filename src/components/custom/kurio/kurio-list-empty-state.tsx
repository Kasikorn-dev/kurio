"use client"

import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"
import { smoothTransition } from "@/lib/animations/variants"

export function KurioListEmptyState() {
	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			initial={{ opacity: 0, y: 20 }}
			transition={smoothTransition}
		>
			<Empty className="py-12">
				<EmptyHeader>
					<motion.div
						animate={{ scale: 1, rotate: 0 }}
						initial={{ scale: 0, rotate: -180 }}
						transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
					>
						<EmptyMedia variant="icon">
							<BookOpen className="size-8" />
						</EmptyMedia>
					</motion.div>
					<EmptyTitle>No kurios yet</EmptyTitle>
					<EmptyDescription>
						Create your first Kurio to start your learning journey
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<motion.div
						animate={{ opacity: 1 }}
						initial={{ opacity: 0 }}
						transition={{ delay: 0.2 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Link href="/create-kurio">
							<Button className="sm:size-default" size="sm">
								Create your first Kurio
							</Button>
						</Link>
					</motion.div>
				</EmptyContent>
			</Empty>
		</motion.div>
	)
}
