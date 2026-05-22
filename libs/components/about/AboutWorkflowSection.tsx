import React, { useMemo, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import PinDropRoundedIcon from '@mui/icons-material/PinDropRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const WORKFLOW_STEPS = [
	{
		id: 'browse',
		step: '01',
		title: 'Browse the Library',
		description: 'Search books by title, author, category, type, or availability from one student-friendly catalog.',
		Icon: SearchRoundedIcon,
		previewTitle: 'Search-ready catalog',
		previewMeta: 'Title · Author · Category · Availability',
		status: 'Catalog open',
		rows: ['Advanced book search', 'Availability-aware results', 'Fast route to book detail'],
	},
	{
		id: 'choose',
		step: '02',
		title: 'Choose Borrow or Purchase',
		description: 'Borrowing and purchasing follow different inventory and destination flows, but students choose with one clear action.',
		Icon: ShoppingCartCheckoutRoundedIcon,
		previewTitle: 'Two request modes',
		previewMeta: 'Borrow for desk delivery · Purchase for reception',
		status: 'Request type selected',
		rows: ['Borrow from library inventory', 'Purchase from commercial inventory', 'Clear next-step confirmation'],
	},
	{
		id: 'destination',
		step: '03',
		title: 'Confirm Desk or Pickup Destination',
		description: 'Borrowed books go to student desk coordinates. Purchased books are prepared for reception pickup.',
		Icon: PinDropRoundedIcon,
		previewTitle: 'Destination routing',
		previewMeta: 'Desk coordinates or reception handoff',
		status: 'Destination confirmed',
		rows: ['Desk-based borrowing', 'Reception pickup for purchases', 'Student-facing destination summary'],
	},
	{
		id: 'robot',
		step: '04',
		title: 'Robot Receives the Delivery Task',
		description: 'The service prepares the delivery task and sends the robot the information it needs to retrieve the book.',
		Icon: SmartToyRoundedIcon,
		previewTitle: 'Robot task handoff',
		previewMeta: 'Book location · pickup details · destination',
		status: 'Robot assigned',
		rows: ['Task created by backend', 'Pickup details prepared', 'Robot starts the route'],
	},
	{
		id: 'track',
		step: '05',
		title: 'Track Delivery Status',
		description: 'Students can follow request progress as the robot moves through assignment, navigation, pickup, and ready states.',
		Icon: TrackChangesRoundedIcon,
		previewTitle: 'Live delivery status',
		previewMeta: 'Assigned · Navigating · Pickup · Ready',
		status: 'Tracking live',
		rows: ['Status updates in the app', 'Robot movement visibility', 'Clear ready-for-pickup signal'],
	},
	{
		id: 'receive',
		step: '06',
		title: 'Receive the Book',
		description: 'The final step is simple: pick up the book at the desk delivery point or reception, depending on request type.',
		Icon: CheckCircleRoundedIcon,
		previewTitle: 'Book ready',
		previewMeta: 'Student pickup complete',
		status: 'Ready for student',
		rows: ['Book arrives at destination', 'Student receives confirmation', 'Flow ends with a clear status'],
	},
] as const;

type WorkflowStep = (typeof WORKFLOW_STEPS)[number];

const WorkflowPreview = ({ step }: { step: WorkflowStep }) => {
	const Icon = step.Icon;

	return (
		<article className={'workflow-preview-card'} aria-label={`${step.title} preview`}>
			<div className={'preview-card-top'}>
				<span className={'preview-status'}>{step.status}</span>
				<span className={'preview-step'}>Step {step.step}</span>
			</div>

			<div className={'preview-icon-wrap'}>
				<Icon />
			</div>

			<h3>{step.previewTitle}</h3>
			<p>{step.previewMeta}</p>

			<div className={'preview-flow-lines'}>
				{step.rows.map((row) => (
					<div className={'preview-flow-line'} key={row}>
						<span className={'line-dot'} />
						<span>{row}</span>
					</div>
				))}
			</div>
		</article>
	);
};

const AboutWorkflowSection = () => {
	const [activeId, setActiveId] = useState<WorkflowStep['id']>('browse');
	const activeStep = useMemo(
		() => WORKFLOW_STEPS.find((step) => step.id === activeId) ?? WORKFLOW_STEPS[0],
		[activeId],
	);

	return (
		<section id={'about-workflow'} className={'about-workflow-section'} aria-labelledby={'about-workflow-title'}>
			<div className={'container'}>
				<div className={'workflow-heading'}>
					<span className={'workflow-eyebrow'}>How 같이Go Works</span>
					<h2 id={'about-workflow-title'}>From book search to robot-assisted pickup</h2>
					<p>
						같이Go connects library search, inventory decisions, and robot delivery into a clear flow students can follow
						without learning the operations behind it.
					</p>
				</div>

				<div className={'workflow-layout'}>
					<div className={'workflow-accordion'} role={'list'}>
						{WORKFLOW_STEPS.map((step) => {
							const Icon = step.Icon;
							const isActive = activeId === step.id;
							const panelId = `about-workflow-panel-${step.id}`;
							const buttonId = `about-workflow-trigger-${step.id}`;

							return (
								<article className={`workflow-item${isActive ? ' active' : ''}`} key={step.id} role={'listitem'}>
									<button
										type={'button'}
										id={buttonId}
										className={'workflow-trigger'}
										aria-expanded={isActive}
										aria-controls={panelId}
										onClick={() => setActiveId(step.id)}
									>
										<span className={'workflow-step-icon'}>
											<Icon />
										</span>
										<span className={'workflow-trigger-copy'}>
											<span className={'workflow-step-label'}>Step {step.step}</span>
											<strong>{step.title}</strong>
										</span>
										<KeyboardArrowDownRoundedIcon className={'workflow-chevron'} />
									</button>

									<div
										id={panelId}
										className={'workflow-panel'}
										role={'region'}
										aria-labelledby={buttonId}
										hidden={!isActive}
									>
										<p>{step.description}</p>
										<div className={'workflow-mobile-preview'}>
											<WorkflowPreview step={step} />
										</div>
									</div>
								</article>
							);
						})}
					</div>

					<div className={'workflow-preview'} aria-live={'polite'}>
						<WorkflowPreview step={activeStep} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default AboutWorkflowSection;
