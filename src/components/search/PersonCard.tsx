"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Eye, CheckSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PersonCardProps {
	id: number;
	username: string;
	name: string;
	headline?: string;
	imageUrl?: string | null;
	location?: string;
	skills?: string[]; // small subset
	inList?: boolean;
	onToggleSave?: () => void;
	onOpen?: () => void;
	onCompare?: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ id, username, name, headline, imageUrl, location, skills = [], inList, onToggleSave, onOpen, onCompare }) => {
	const initials = React.useMemo(() => name.split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase(), [name]);
	const maxSkills = 4;
	const shown = skills.slice(0, maxSkills);
	const overflow = skills.length - shown.length;
	return (
		<motion.div layout whileHover={{ scale: 1.015 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
			className={cn('group relative rounded-lg border border-border/60 bg-surfaceAlt/70 backdrop-blur-sm p-4 shadow-sm hover:shadow-elevation2 transition-colors cursor-pointer')}
			onClick={onOpen}
		>
			<div className="flex items-start gap-3">
				<div className="h-12 w-12 shrink-0 rounded-md bg-brand-primary/15 text-brand-primary flex items-center justify-center font-semibold text-sm overflow-hidden ring-1 ring-brand-primary/20">
					{imageUrl ? <img src={imageUrl} loading="lazy" decoding="async" alt={name} className="h-full w-full object-cover opacity-0 transition-opacity duration-500" onLoad={(e)=>{ (e.currentTarget as HTMLImageElement).style.opacity='1'; }} /> : initials}
				</div>
				<div className="min-w-0 flex-1 space-y-1">
					<div className="flex items-start justify-between gap-2">
						<h3 className="text-sm font-medium leading-tight line-clamp-2 pr-6">{name}</h3>
					</div>
					<p className="text-[11px] text-muted-subtle line-clamp-2 min-h-[28px]">{headline || '—'}</p>
					<div className="flex flex-wrap gap-1 pt-1">
						{location && <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border/60 text-muted-subtle">{location}</span>}
						{shown.map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border/50">{s}</span>)}
						{overflow>0 && <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border/50">+{overflow}</span>}
					</div>
				</div>
			</div>
			<div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<IconButton label={inList? 'Unsave':'Save'} onClick={(e)=>{ e.stopPropagation(); onToggleSave?.(); }} active={!!inList} icon={<Bookmark className="h-3.5 w-3.5" />} />
				<IconButton label="Open" onClick={(e)=>{ e.stopPropagation(); onOpen?.(); }} icon={<Eye className="h-3.5 w-3.5" />} />
				<IconButton label="Compare" onClick={(e)=>{ e.stopPropagation(); onCompare?.(); }} icon={<CheckSquare className="h-3.5 w-3.5" />} />
			</div>
		</motion.div>
	);
};

const IconButton: React.FC<{ label: string; onClick?: React.MouseEventHandler; icon: React.ReactNode; active?: boolean }> = ({ label, onClick, icon, active }) => (
	<button onClick={onClick} title={label} className={cn('h-7 w-7 inline-flex items-center justify-center rounded-md border text-[10px] transition-colors', active? 'bg-brand-primary/20 border-brand-primary text-brand-primary hover:bg-brand-primary/30':'bg-surface/60 border-border/60 text-muted-subtle hover:text-foreground hover:border-brand-primary/60')}>{icon}</button>
);

export default PersonCard;
