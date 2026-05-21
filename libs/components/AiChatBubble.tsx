import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useMutation, useReactiveVar } from '@apollo/client';
import { REACT_APP_API_URL } from '../config';
import { CREATE_DELIVERY_REQUEST } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { RequestType } from '../enums/request.enum';

interface ChatBookSuggestion {
	bookId: string;
	title: string;
	author: string;
	image?: string;
	category?: string;
	callNumber?: string;
	isBorrowable: boolean;
	isPurchasable: boolean;
}

interface ChatMsg {
	role: 'user' | 'assistant';
	content: string;
	books?: ChatBookSuggestion[];
}

interface PendingBookAction {
	book: ChatBookSuggestion;
	type: RequestType;
}

const CHAT_API = `${REACT_APP_API_URL}/chat/message`;
const BOOK_FALLBACK_IMAGE = '/img/profile/defaultUser.svg';
const CHAT_SESSION_KEY = 'gachi_go_chat_session_id';
const DEFAULT_BORROW_DESTINATION = {
	destinationDeskId: 'DESK_A',
	destination: {
		floorId: 'demo_floor',
		x: 0.72,
		y: 0.18,
		theta: 0,
	},
};
const QUICK_PROMPTS = [
	'Recommend borrowable engineering books',
	'Find Korean language study books',
	'Which books can I purchase?',
	'What does READY mean for robot delivery?',
];

const resolveBookImage = (image?: string): string => {
	if (!image) return BOOK_FALLBACK_IMAGE;
	if (image.startsWith('http')) return image;
	if (image.startsWith('/img/')) return image;

	const normalized = image.startsWith('/') ? image.slice(1) : image;
	return `${REACT_APP_API_URL}/${normalized}`;
};

const formatBookLabel = (value?: string): string => {
	if (!value) return '';
	return value
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

const getChatSessionId = (): string => {
	if (typeof window === 'undefined') return '';

	const existing = localStorage.getItem(CHAT_SESSION_KEY);
	if (existing) return existing;

	const created = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
	localStorage.setItem(CHAT_SESSION_KEY, created);
	return created;
};

const SendIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
		<line x1="22" y1="2" x2="11" y2="13" />
		<polygon points="22 2 15 22 11 13 2 9 22 2" />
	</svg>
);

const CloseIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

const TrashIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<polyline points="3 6 5 6 21 6" />
		<path d="M19 6l-1 14H6L5 6" />
		<path d="M10 11v6M14 11v6" />
		<path d="M9 6V4h6v2" />
	</svg>
);

const AiChatBubble: React.FC = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMsg[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [pendingAction, setPendingAction] = useState<PendingBookAction | null>(null);
	const [actionLoading, setActionLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [createDeliveryRequest] = useMutation(CREATE_DELIVERY_REQUEST);

	useEffect(() => {
		if (open && inputRef.current) inputRef.current.focus();
	}, [open]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, loading]);

	const sendMessage = async (presetText?: string) => {
		const text = (presetText ?? input).trim();
		if (!text || loading) return;

		const userMsg: ChatMsg = { role: 'user', content: text };
		const updatedHistory = [...messages, userMsg];
		setMessages(updatedHistory);
		setInput('');
		if (inputRef.current) inputRef.current.style.height = 'auto';
		setLoading(true);

		try {
			const { data } = await axios.post(CHAT_API, {
				message: text,
				history: messages.map(({ role, content }) => ({ role, content })),
			});
			setMessages([...updatedHistory, { role: 'assistant', content: data.reply, books: data.books ?? [] }]);
		} catch {
			setMessages([...updatedHistory, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
		} finally {
			setLoading(false);
		}
	};

	const openBookDetail = (bookId: string) => {
		router.push(`/books/detail?id=${bookId}`).then();
	};

	const requestBookAction = (book: ChatBookSuggestion, type: RequestType) => {
		setPendingAction({ book, type });
	};

	const confirmBookAction = async () => {
		if (!pendingAction || actionLoading) return;

		const { book, type } = pendingAction;
		setActionLoading(true);

		try {
			const input =
				type === RequestType.BORROW
					? {
							bookId: book.bookId,
							requestType: type,
							...DEFAULT_BORROW_DESTINATION,
					  }
					: {
							bookId: book.bookId,
							requestType: type,
					  };
			const variables = user?._id ? { input } : { input: { ...input, sessionId: getChatSessionId() } };
			const { data } = await createDeliveryRequest({ variables });
			const request = data?.createDeliveryRequest;
			const status = request?.status ? formatBookLabel(request.status) : 'Created';

			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content:
						type === RequestType.BORROW
							? `Borrow request created for **${book.title}**. Status: **${status}**. You can follow it from My Page robot tracking.`
							: `Purchase request created for **${book.title}**. Status: **${status}**. Payment is handled at reception.`,
				},
			]);
			setPendingAction(null);
		} catch (err: any) {
			const message = err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Request failed';
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: `I could not create that request. ${message}`,
				},
			]);
		} finally {
			setActionLoading(false);
		}
	};

	const applyQuickPrompt = (prompt: string) => {
		sendMessage(prompt);
	};

	const handleBookCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, bookId: string) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openBookDetail(bookId);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<>
			<button className="ai-chat-bubble-btn" onClick={() => setOpen((v) => !v)} aria-label="Open library assistant">
				<Image src="/img/logo/final_favicon1.png" alt="Library Assistant" width={28} height={28} />
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						className="ai-chat-window"
						initial={{ opacity: 0, scale: 0.88, y: 16 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.88, y: 16 }}
						transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
					>
						<div className="ai-chat-header">
							<div className="ai-chat-header-left">
								<div className="ai-chat-avatar">
									<Image src="/img/logo/final_favicon1.png" alt="Library Assistant" width={26} height={26} />
								</div>
								<div>
									<div className="ai-chat-title">같이Go Assistant</div>
									<div className="ai-chat-status">Smart Library Help</div>
								</div>
							</div>
							<div className="ai-chat-header-actions">
								{messages.length > 0 && (
									<button onClick={() => setMessages([])} aria-label="Clear chat" title="Clear chat">
										<TrashIcon />
									</button>
								)}
								<button onClick={() => setOpen(false)} aria-label="Close chat">
									<CloseIcon />
								</button>
							</div>
						</div>

						<div className="ai-chat-messages">
							{messages.length === 0 && !loading ? (
								<div className="ai-chat-welcome">
									<div className="ai-welcome-icon">
										<Image src="/img/logo/final_favicon1.png" alt="Library Assistant" width={32} height={32} />
									</div>
									<p>Hi! I'm your 같이Go Library Assistant. Ask me about books, borrowing, robot delivery, or how to navigate the app.</p>
									<div className="ai-chat-quick-prompts">
										{QUICK_PROMPTS.map((prompt) => (
											<button key={prompt} type="button" onClick={() => applyQuickPrompt(prompt)}>
												{prompt}
											</button>
										))}
									</div>
								</div>
							) : (
								<>
									{messages.map((msg, i) => (
										<div key={i} className={`ai-chat-msg ${msg.role}`}>
											<div className="ai-chat-bubble">
												{msg.role === 'assistant' ? (
													<>
														<ReactMarkdown>{msg.content}</ReactMarkdown>
														{msg.books && msg.books.length > 0 && (
															<div className="ai-chat-book-list">
																{msg.books.map((book) => (
																	<div
																		key={book.bookId}
																		role="button"
																		tabIndex={0}
																		className="ai-chat-book-card"
																		onClick={() => openBookDetail(book.bookId)}
																		onKeyDown={(e) => handleBookCardKeyDown(e, book.bookId)}
																	>
																		<img src={resolveBookImage(book.image)} alt={book.title} />
																		<span className="ai-chat-book-meta">
																			<strong>{book.title}</strong>
																			<small>{book.author}</small>
																			<span className="ai-chat-book-tags">
																				{book.category && <em>{formatBookLabel(book.category)}</em>}
																				{book.callNumber && <em>{book.callNumber}</em>}
																			</span>
																			<span className="ai-chat-book-actions">
																				{book.isBorrowable && (
																					<button
																						type="button"
																						onClick={(e) => {
																							e.stopPropagation();
																							requestBookAction(book, RequestType.BORROW);
																						}}
																					>
																						Borrow
																					</button>
																				)}
																				{book.isPurchasable && (
																					<button
																						type="button"
																						onClick={(e) => {
																							e.stopPropagation();
																							requestBookAction(book, RequestType.PURCHASE);
																						}}
																					>
																						Purchase
																					</button>
																				)}
																				<em>Open</em>
																			</span>
																		</span>
																	</div>
																))}
															</div>
														)}
													</>
												) : (
													msg.content
												)}
											</div>
										</div>
									))}
									{loading && (
										<div className="ai-chat-msg assistant ai-chat-typing">
											<div className="ai-chat-bubble">
												<div className="ai-chat-typing-dots">
													<span />
													<span />
													<span />
												</div>
												<small>Searching the live catalog</small>
											</div>
										</div>
									)}
								</>
							)}
							<div ref={messagesEndRef} />
						</div>

						{pendingAction && (
							<div className="ai-chat-confirm">
								<div>
									<strong>
										{pendingAction.type === RequestType.BORROW ? 'Borrow' : 'Purchase'} {pendingAction.book.title}?
									</strong>
									<span>
										{pendingAction.type === RequestType.BORROW
											? 'Robot delivery will be sent to study desk A.'
											: 'The book will be delivered to reception for payment.'}
									</span>
								</div>
								<div className="ai-chat-confirm-actions">
									<button type="button" onClick={() => setPendingAction(null)} disabled={actionLoading}>
										Cancel
									</button>
									<button type="button" onClick={confirmBookAction} disabled={actionLoading}>
										{actionLoading ? 'Creating...' : 'Confirm'}
									</button>
								</div>
							</div>
						)}

						<div className="ai-chat-input-row">
							<textarea
								ref={inputRef}
								rows={1}
								placeholder="Ask about books, borrowing, delivery…"
								value={input}
								onChange={(e) => {
									setInput(e.target.value);
									e.target.style.height = 'auto';
									e.target.style.height = e.target.scrollHeight + 'px';
								}}
								onKeyDown={handleKeyDown}
								disabled={loading}
							/>
							<button className="ai-chat-send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading} aria-label="Send">
								<SendIcon />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default AiChatBubble;
