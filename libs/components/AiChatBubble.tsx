import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'next-i18next';

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

interface StoredChatState {
	messages: ChatMsg[];
	updatedAt: number;
}

const CHAT_API = `${API_BASE_URL}/chat/message`;
const BOOK_FALLBACK_IMAGE = '/img/profile/defaultUser.svg';
const CHAT_STORAGE_KEY = 'gachi_go_ai_chat_state';
const CHAT_TTL_MS = 15 * 60 * 1000;
const QUICK_PROMPT_KEYS = ['chat_suggest_1', 'chat_suggest_2', 'chat_suggest_3', 'chat_suggest_4'] as const;

const resolveBookImage = (image?: string): string => {
	if (!image) return BOOK_FALLBACK_IMAGE;
	if (image.startsWith('http')) return image;
	if (image.startsWith('/img/')) return image;

	const normalized = image.startsWith('/') ? image.slice(1) : image;
	return `${API_BASE_URL}/${normalized}`;
};

const formatBookLabel = (value?: string): string => {
	if (!value) return '';
	return value
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

const loadStoredMessages = (): ChatMsg[] => {
	if (typeof window === 'undefined') return [];

	try {
		const raw = localStorage.getItem(CHAT_STORAGE_KEY);
		if (!raw) return [];

		const stored = JSON.parse(raw) as StoredChatState;
		if (!stored?.updatedAt || Date.now() - stored.updatedAt > CHAT_TTL_MS) {
			localStorage.removeItem(CHAT_STORAGE_KEY);
			return [];
		}

		return Array.isArray(stored.messages) ? stored.messages : [];
	} catch {
		localStorage.removeItem(CHAT_STORAGE_KEY);
		return [];
	}
};

const saveStoredMessages = (messages: ChatMsg[]): void => {
	if (typeof window === 'undefined') return;

	if (messages.length === 0) {
		localStorage.removeItem(CHAT_STORAGE_KEY);
		return;
	}

	localStorage.setItem(
		CHAT_STORAGE_KEY,
		JSON.stringify({
			messages,
			updatedAt: Date.now(),
		}),
	);
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
	const { t } = useTranslation('common');
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMsg[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const quickPrompts = QUICK_PROMPT_KEYS.map((key) => t(key));
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		setMessages(loadStoredMessages());
	}, []);

	useEffect(() => {
		saveStoredMessages(messages);
	}, [messages]);

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
			setMessages([...updatedHistory, { role: 'assistant', content: t('chat_error') }]);
		} finally {
			setLoading(false);
		}
	};

	const openBookDetail = (bookId: string) => {
		router.push(`/books/detail?id=${bookId}`).then();
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
				<button className="ai-chat-bubble-btn" onClick={() => setOpen((v) => !v)} aria-label={t('chat_open')}>
					<Image src="/img/logo/final_favicon1.png" alt={t('chat_assistant_alt')} width={40} height={40} />
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
										<Image src="/img/logo/final_favicon1.png" alt={t('chat_assistant_alt')} width={34} height={34} />
									</div>
									<div>
										<div className="ai-chat-title">{t('chat_title')}</div>
										<div className="ai-chat-status">{t('chat_status')}</div>
									</div>
								</div>
							<div className="ai-chat-header-actions">
								{messages.length > 0 && (
									<button
										onClick={() => {
											setMessages([]);
											saveStoredMessages([]);
										}}
										aria-label={t('chat_clear')}
										title={t('chat_clear')}
									>
										<TrashIcon />
									</button>
								)}
								<button onClick={() => setOpen(false)} aria-label={t('chat_close')}>
									<CloseIcon />
								</button>
							</div>
						</div>

						<div className="ai-chat-messages">
								{messages.length === 0 && !loading ? (
									<div className="ai-chat-welcome">
										<div className="ai-welcome-icon">
											<Image src="/img/logo/final_favicon1.png" alt={t('chat_assistant_alt')} width={42} height={42} />
										</div>
										<p>{t('chat_welcome')}</p>
										<div className="ai-chat-quick-prompts">
										{quickPrompts.map((prompt) => (
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
																					<em>{t('chat_open_book')}</em>
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
												<small>{t('chat_searching')}</small>
											</div>
										</div>
									)}
								</>
							)}
							<div ref={messagesEndRef} />
						</div>

						<div className="ai-chat-input-row">
							<textarea
								ref={inputRef}
								rows={1}
								placeholder={t('chat_placeholder')}
								value={input}
								onChange={(e) => {
									setInput(e.target.value);
									e.target.style.height = 'auto';
									e.target.style.height = e.target.scrollHeight + 'px';
								}}
								onKeyDown={handleKeyDown}
								disabled={loading}
							/>
							<button className="ai-chat-send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading} aria-label={t('send')}>
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
