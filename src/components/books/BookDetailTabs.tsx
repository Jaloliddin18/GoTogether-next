import React, { useState } from 'react';
import { Avatar, Box, Button, Pagination as MuiPagination, Rating, Stack, TextField, Typography } from '@mui/material';
import Moment from 'react-moment';
import { Book } from '../../../libs/types/book/book';
import { Comment } from '../../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../../libs/types/comment/comment.input';
import { resolveMediaUrl } from '../../../libs/utils';

interface BookDetailTabsProps {
	book: Book | null;
	bookComments: Comment[];
	commentTotal: number;
	commentInquiry: CommentsInquiry;
	reviewRating: number | null;
	setReviewRating: React.Dispatch<React.SetStateAction<number | null>>;
	insertCommentData: CommentInput;
	setInsertCommentData: React.Dispatch<React.SetStateAction<CommentInput>>;
	createCommentHandler: () => Promise<void>;
	commentPaginationChangeHandler: (_event: React.ChangeEvent<unknown>, value: number) => void;
	user: any;
	isMobile: boolean;
}

const C = {
	ink: '#1A1A2E',
	muted: '#64748B',
	navy: '#1B3A6B',
	border: '#E2E8F0',
	page: '#F8FAFC',
};

const formatLabel = (value?: string | number | null): string => {
	if (value === undefined || value === null || value === '') return '—';
	return String(value)
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const sectionTitleSx = {
	fontSize: { xs: 20, md: 24 },
	fontWeight: 800,
	color: C.ink,
	letterSpacing: '-0.02em',
};

function InfoRow({
	label,
	value,
	isLast,
}: {
	label: string;
	value: string;
	isLast?: boolean;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<div
			style={{
				display: 'flex',
				padding: '12px 0',
				borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
				background: hovered ? C.page : 'transparent',
				transition: 'background 150ms ease',
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<span
				style={{
					width: 200,
					minWidth: 200,
					fontSize: 14,
					fontWeight: 600,
					color: C.ink,
				}}
			>
				{label}
			</span>
			<span style={{ fontSize: 14, color: C.muted }}>{value}</span>
		</div>
	);
}

function SectionSubheader({ title }: { title: string }) {
	return (
		<div
			style={{
				paddingTop: 24,
				paddingBottom: 8,
				fontSize: 12,
				fontWeight: 600,
				color: C.muted,
				textTransform: 'uppercase',
				letterSpacing: '0.05em',
			}}
		>
			{title}
		</div>
	);
}

export default function BookDetailTabs(props: BookDetailTabsProps) {
	const {
		book,
		bookComments,
		commentTotal,
		commentInquiry,
		reviewRating,
		setReviewRating,
		insertCommentData,
		setInsertCommentData,
		createCommentHandler,
		commentPaginationChangeHandler,
		user,
	} = props;

	const [activeTab, setActiveTab] = useState<0 | 1>(0);
	const [hoveredTab, setHoveredTab] = useState<number | null>(null);

	const reviewLabel = `${commentTotal} Review${commentTotal === 1 ? '' : 's'}`;

	return (
		<div>
			{/* Tab bar */}
			<div
				style={{
					width: '100%',
					display: 'flex',
					alignItems: 'flex-end',
					position: 'relative',
					borderBottom: `1px solid ${C.border}`,
				}}
			>
					{(['Library Information', 'Reviews'] as const).map((label, idx) => {
					const isActive = activeTab === idx;
					const isHovered = hoveredTab === idx;
					const isLast = idx === 1;
					return (
						<button
							key={label}
							onClick={() => setActiveTab(idx as 0 | 1)}
							onMouseEnter={() => setHoveredTab(idx)}
							onMouseLeave={() => setHoveredTab(null)}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								padding: '12px 32px',
								fontSize: 16,
								fontWeight: isActive ? 600 : 500,
								cursor: 'pointer',
								border: `1px solid ${C.border}`,
								borderBottom: isActive ? '1px solid #FFFFFF' : `1px solid ${C.border}`,
								borderRadius: '12px 12px 0 0',
								color: isActive ? C.navy : isHovered ? C.ink : C.muted,
								background: isActive ? '#FFFFFF' : isHovered ? '#e8eef7' : '#f0f5fc',
								transition: 'background 150ms ease, color 150ms ease',
								outline: 'none',
								position: 'relative',
								zIndex: isActive ? 10 : 1,
								marginBottom: isActive ? -1 : 0,
								marginRight: isLast ? 0 : 4,
							}}
						>
							{label}
						</button>
					);
				})}
			</div>

			{/* Tab content */}
			<div
				style={{
					background: '#FFFFFF',
					border: `1px solid ${C.border}`,
					borderTop: 'none',
					borderRadius: '0 0 12px 12px',
					padding: 24,
					marginBottom: 24,
				}}
			>
				{activeTab === 0 && (
					<div>
						<SectionSubheader title="CATALOG RECORD" />
						<InfoRow label="Category" value={formatLabel(book?.bookCategory)} />
						<InfoRow label="Type" value={formatLabel(book?.bookType)} />
						<InfoRow label="Format" value={formatLabel(book?.bookFormat)} />
						<InfoRow label="Language" value={formatLabel(book?.bookLanguage)} />
						<InfoRow label="Audience" value={formatLabel(book?.bookAudience)} />
						<InfoRow
							label="Pages"
							value={book?.bookPages ? `${book.bookPages.toLocaleString()} pages` : '—'}
						/>
						<InfoRow
							label="Published Year"
							value={book?.bookPublishedYear ? String(book.bookPublishedYear) : '—'}
						/>
						<InfoRow label="ISBN" value={book?.bookIsbn ?? '—'} />
						<InfoRow label="Call Number" value={book?.bookCallNumber ?? '—'} isLast />

						<SectionSubheader title="PHYSICAL DETAILS" />
						<InfoRow
							label="Width"
							value={book?.bookDimensions?.widthCm ? `${book.bookDimensions.widthCm} cm` : '—'}
					/>
							<InfoRow
								label="Height"
								value={book?.bookDimensions?.heightCm ? `${book.bookDimensions.heightCm} cm` : '—'}
							/>
							<InfoRow
								label="Weight"
								value={book?.bookDimensions?.weightGrams ? `${book.bookDimensions.weightGrams} g` : '—'}
								isLast
							/>
						</div>
					)}

			{activeTab === 1 && (
				<Box sx={{ pt: 0 }}>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						justifyContent="space-between"
						alignItems={{ xs: 'flex-start', sm: 'center' }}
						gap={1.5}
						mb={2.5}
					>
						<Box>
							<Typography sx={sectionTitleSx}>Reviews</Typography>
							<Typography sx={{ color: C.muted, fontWeight: 600 }}>{reviewLabel}</Typography>
						</Box>
					</Stack>

					<Stack spacing={1.5} mb={3}>
						{bookComments.length === 0 ? (
							<Box
								sx={{
									p: { xs: 2.5, md: 3 },
									borderRadius: '22px',
									background: C.page,
									border: `1px dashed ${C.border}`,
									textAlign: 'center',
								}}
							>
								<Typography sx={{ color: C.ink, fontWeight: 900, mb: 0.5 }}>No reviews yet</Typography>
								<Typography sx={{ color: C.muted }}>Be the first reader to leave a note about this book.</Typography>
							</Box>
						) : (
							bookComments.map((comment: Comment) => {
								const avatarSrc = resolveMediaUrl(comment?.memberData?.memberImage, '/img/profile/defaultUser.svg');
								return (
									<Stack
										key={comment._id}
										direction={{ xs: 'column', sm: 'row' }}
										spacing={1.7}
										sx={{
											p: 2,
											background: C.page,
											border: `1px solid ${C.border}`,
											borderRadius: '22px',
										}}
									>
										<Avatar
											src={avatarSrc}
											alt={comment.memberData?.memberNick ?? 'User'}
											sx={{ width: 48, height: 48 }}
										/>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Stack
												direction={{ xs: 'column', sm: 'row' }}
												justifyContent="space-between"
												gap={0.5}
												mb={0.6}
											>
												<Typography sx={{ color: C.ink, fontWeight: 900 }}>
													{comment.memberData?.memberNick ?? 'Anonymous'}
												</Typography>
												<Typography sx={{ color: '#93a3b8', fontSize: 13, fontWeight: 700 }}>
													<Moment format="DD MMM, YYYY">{comment.createdAt}</Moment>
												</Typography>
											</Stack>
											<Typography sx={{ color: C.muted, lineHeight: 1.7 }}>
												{comment.commentContent}
											</Typography>
										</Box>
									</Stack>
								);
							})
						)}
					</Stack>

					{commentTotal > commentInquiry.limit && (
						<Stack alignItems="center" mb={3}>
							<MuiPagination
								page={commentInquiry.page}
								count={Math.ceil(commentTotal / commentInquiry.limit)}
								onChange={commentPaginationChangeHandler}
								shape="circular"
								color="primary"
							/>
						</Stack>
					)}

					<Box
						sx={{
							p: { xs: 2, md: 2.5 },
							borderRadius: '24px',
							background: C.page,
							border: `1px solid ${C.border}`,
						}}
					>
						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.7} alignItems="flex-start">
							<Avatar
								src={resolveMediaUrl(user?.memberImage, '/img/profile/defaultUser.svg')}
								alt={user?.memberNick ?? 'Reader'}
								sx={{ width: 48, height: 48 }}
							/>
							<Stack spacing={1.4} sx={{ flex: 1, width: '100%' }}>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									justifyContent="space-between"
									gap={1}
								>
									<Box>
										<Typography sx={{ color: C.ink, fontSize: 18, fontWeight: 900 }}>Leave Review</Typography>
										<Typography sx={{ color: C.muted, fontSize: 13 }}>
											Share a useful note for the next reader.
										</Typography>
									</Box>
									<Rating
										value={reviewRating}
										onChange={(_event, value) => setReviewRating(value)}
										sx={{
											'& .MuiRating-iconEmpty': { color: C.border },
											'& .MuiRating-iconFilled': { color: '#F59E0B' },
										}}
									/>
								</Stack>
								<TextField
									multiline
									minRows={4}
									placeholder="Share your thoughts about this book..."
									value={insertCommentData.commentContent}
									onChange={({ target: { value } }) =>
										setInsertCommentData((prev) => ({ ...prev, commentContent: value }))
									}
									sx={{
										'& .MuiOutlinedInput-root': {
											height: 'auto',
											alignItems: 'flex-start',
											borderRadius: '18px',
											background: '#fff',
											'& fieldset': { borderColor: C.border },
											'&:hover fieldset': { borderColor: C.navy },
											'&.Mui-focused fieldset': { borderColor: C.navy, borderWidth: '2px' },
										},
									}}
								/>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									justifyContent="space-between"
									alignItems={{ xs: 'stretch', sm: 'center' }}
									gap={1.2}
								>
									{!user?._id && (
										<Typography sx={{ fontSize: 13, color: C.muted }}>
											Please log in to leave a review.
										</Typography>
									)}
									<Button
										variant="contained"
										disabled={!insertCommentData.commentContent.trim() || !user?._id}
										onClick={createCommentHandler}
										sx={{
											ml: { sm: 'auto' },
											px: 3,
											py: 1.35,
											background: C.navy,
											borderRadius: '16px',
											textTransform: 'none',
											fontWeight: 900,
											'&:hover': { background: '#142d52' },
											'&.Mui-disabled': { background: '#cbd8e8', color: '#fff' },
										}}
									>
										Submit Review
									</Button>
								</Stack>
							</Stack>
						</Stack>
					</Box>
				</Box>
			)}
			</div>
		</div>
	);
}
