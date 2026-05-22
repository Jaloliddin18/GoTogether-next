# Groq AI Chatbot — Replace Group Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current broadcast group-chat WebSocket panel with a Groq-powered AI library assistant chatbot that helps students find books, understand delivery, and navigate the app.

**Architecture:** The frontend `AiChatBubble` component sends REST POST requests to a new NestJS `/chat/message` endpoint, which builds a dynamic system prompt from the live book catalog and calls Groq's `llama-3.3-70b-versatile` model. The old WebSocket chat gateway is removed; the robot WebSocket gateway stays untouched.

**Tech Stack:** Next.js 14 (Pages Router) · React 18 · TypeScript · framer-motion (already installed) · axios (already installed) · react-markdown (install) · NestJS 10 · @nestjs/axios (already installed) · Mongoose · Groq API (llama-3.3-70b-versatile) · SCSS variables

---

## File Map

### Delete
| File | Reason |
|------|--------|
| `libs/components/Chat.tsx` | Old group chat component — replaced by AiChatBubble |
| `apps/nestar-api/src/socket/socket.gateway.ts` (remove provider only) | Chat gateway no longer needed |

### Create
| File | Purpose |
|------|---------|
| `libs/components/AiChatBubble.tsx` | AI chatbot component (button + panel + API call) |
| `scss/pc/chat/ai-chat.scss` | All SCSS for the chatbot UI |
| `apps/nestar-api/src/components/chat/chat.service.ts` | Groq API call + book context injection |
| `apps/nestar-api/src/components/chat/chat.controller.ts` | POST /chat/message REST endpoint |
| `apps/nestar-api/src/components/chat/chat.module.ts` | NestJS module wiring |

### Modify
| File | Change |
|------|--------|
| `scss/pc/main.scss` | Add `@import '/scss/pc/chat/ai-chat.scss';` |
| `libs/components/layout/LayoutHome.tsx` | Swap `<Chat />` → `<AiChatBubble />` |
| `libs/components/layout/LayoutFull.tsx` | Swap `<Chat />` → `<AiChatBubble />` |
| `libs/components/layout/LayoutBasic.tsx` | Swap `<Chat />` → `<AiChatBubble />` |
| `apps/nestar-api/src/socket/socket.module.ts` | Remove `SocketGateway` provider |
| `apps/nestar-api/src/components/components.module.ts` | Import and register `ChatModule` |

---

## Task 1 — Install react-markdown in the frontend

**Files:**
- Modify: `package.json` (via yarn)

- [ ] **Step 1: Install react-markdown**

```bash
cd /Users/khonimkulovjaloliddin/Desktop/같이Go-next
yarn add react-markdown
```

Expected output ends with: `Done in ...`

- [ ] **Step 2: Verify install**

```bash
grep '"react-markdown"' package.json
```

Expected: `"react-markdown": "^9.x.x"` (or similar)

---

## Task 2 — Create backend chat service

**Files:**
- Create: `apps/nestar-api/src/components/chat/chat.service.ts`

This service fetches up to 15 ACTIVE books from MongoDB and builds a library-focused system prompt before calling Groq.

- [ ] **Step 1: Create the file**

Create `/Users/khonimkulovjaloliddin/Desktop/같이Go/apps/nestar-api/src/components/chat/chat.service.ts` with this exact content:

```typescript
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
	role: string;
	content: string;
}

const BASE_SYSTEM_PROMPT =
	'You are a helpful library assistant for 같이Go Smart Library at Inha University, Korea. ' +
	'You help students find books, check availability, understand how to borrow or purchase books, ' +
	'and learn about the robot delivery system. ' +
	'The library uses robots with fixed grippers to retrieve books from shelves and deliver them to students. ' +
	'Key app pages: book catalog at /library/books, request history at /library/requests, ' +
	'live robot tracking at /library/tracking, community at /library/community. ' +
	'READY status means the book has been delivered and is ready for student pickup — it is not the same as COMPLETED. ' +
	'Keep responses concise, warm, and helpful. Never invent book details not found in the catalog below.';

@Injectable()
export class ChatService {
	constructor(
		private readonly httpService: HttpService,
		@InjectModel('Book') private readonly bookModel: Model<any>,
	) {}

	async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
		const apiKey = process.env.GROQ_API_KEY;
		if (!apiKey) throw new InternalServerErrorException('GROQ_API_KEY is not configured');

		const books = await this.bookModel
			.find({ bookStatus: 'ACTIVE' })
			.limit(15)
			.select('bookTitle bookAuthor bookCategory bookType bookLanguage bookAudience isBorrowable isPurchasable')
			.lean();

		const bookContext = books
			.map(
				(b: any) =>
					`- **${b.bookTitle}** by ${b.bookAuthor} | Category: ${b.bookCategory} | Type: ${b.bookType} | Language: ${b.bookLanguage} | Borrow: ${b.isBorrowable ? 'Yes' : 'No'} | Purchase: ${b.isPurchasable ? 'Yes' : 'No'}`,
			)
			.join('\n');

		const systemPrompt =
			BASE_SYSTEM_PROMPT +
			`\n\nCurrently available books:\n${bookContext}\n` +
			`When recommending books use real titles from the list above. ` +
			`Format book titles in **bold**. Use bullet points for multiple recommendations.`;

		const messages = [
			{ role: 'system', content: systemPrompt },
			...history.map((m) => ({ role: m.role, content: m.content })),
			{ role: 'user', content: message },
		];

		try {
			const response = await firstValueFrom(
				this.httpService.post(
					'https://api.groq.com/openai/v1/chat/completions',
					{
						model: 'llama-3.3-70b-versatile',
						messages,
						max_tokens: 500,
						temperature: 0.7,
					},
					{
						headers: {
							Authorization: `Bearer ${apiKey}`,
							'Content-Type': 'application/json',
						},
					},
				),
			);
			return response.data.choices[0].message.content as string;
		} catch (err: any) {
			const detail = err?.response?.data?.error?.message ?? err.message;
			throw new InternalServerErrorException(`Groq API error: ${detail}`);
		}
	}
}
```

---

## Task 3 — Create backend chat controller

**Files:**
- Create: `apps/nestar-api/src/components/chat/chat.controller.ts`

- [ ] **Step 1: Create the file**

Create `/Users/khonimkulovjaloliddin/Desktop/같이Go/apps/nestar-api/src/components/chat/chat.controller.ts`:

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

class ChatMessageDto {
	message: string;
	history: Array<{ role: string; content: string }>;
}

@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Post('message')
	async message(@Body() body: ChatMessageDto): Promise<{ reply: string }> {
		const reply = await this.chatService.sendMessage(body.message, body.history ?? []);
		return { reply };
	}
}
```

---

## Task 4 — Create backend chat module

**Files:**
- Create: `apps/nestar-api/src/components/chat/chat.module.ts`

- [ ] **Step 1: Create the file**

Create `/Users/khonimkulovjaloliddin/Desktop/같이Go/apps/nestar-api/src/components/chat/chat.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import BookSchema from '../../schemas/Book.model';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
	imports: [
		HttpModule,
		MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }]),
	],
	controllers: [ChatController],
	providers: [ChatService],
})
export class ChatModule {}
```

---

## Task 5 — Register ChatModule and remove SocketGateway

**Files:**
- Modify: `apps/nestar-api/src/components/components.module.ts`
- Modify: `apps/nestar-api/src/socket/socket.module.ts`

- [ ] **Step 1: Add ChatModule to components.module.ts**

In `/Users/khonimkulovjaloliddin/Desktop/같이Go/apps/nestar-api/src/components/components.module.ts`, add the import and registration:

Replace the file content with:

```typescript
import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BookModule } from './book/book.module';
import { BookInventoryModule } from './book-inventory/book-inventory.module';
import { RobotModule } from './robot/robot.module';
import { RequestModule } from './request/request.module';
import { TwitModule } from './twit/twit.module';
import { TwitCommentModule } from './twit-comment/twit-comment.module';
import { ChatModule } from './chat/chat.module';

@Module({
	imports: [
		MemberModule,
		AuthModule,
		CommentModule,
		LikeModule,
		ViewModule,
		FollowModule,
		BookModule,
		BookInventoryModule,
		RobotModule,
		RequestModule,
		TwitModule,
		TwitCommentModule,
		ChatModule,
	],
})
export class ComponentsModule {}
```

- [ ] **Step 2: Remove SocketGateway from socket.module.ts**

Replace `/Users/khonimkulovjaloliddin/Desktop/같이Go/apps/nestar-api/src/socket/socket.module.ts` with:

```typescript
import { Module } from '@nestjs/common';
import { RobotGateway } from './robot.gateway';

@Module({
	providers: [RobotGateway],
	exports: [RobotGateway],
})
export class SocketModule {}
```

Note: `AuthModule` import is removed along with `SocketGateway` — `RobotGateway` does not depend on `AuthModule`.

- [ ] **Step 3: Verify RobotGateway has no AuthService dependency**

```bash
grep "AuthService\|AuthModule" /Users/khonimkulovjaloliddin/Desktop/같이Go/apps/nestar-api/src/socket/robot.gateway.ts
```

Expected: no output (RobotGateway doesn't use Auth). If it does, keep `AuthModule` in the imports array.

---

## Task 6 — Verify backend builds

**Files:** (no changes)

- [ ] **Step 1: Run backend build**

```bash
cd /Users/khonimkulovjaloliddin/Desktop/같이Go
yarn build 2>&1 | tail -20
```

Expected: build completes without TypeScript errors. Fix any errors before continuing.

---

## Task 7 — Create SCSS file for AI chat

**Files:**
- Create: `scss/pc/chat/ai-chat.scss`

- [ ] **Step 1: Create the directory and file**

Create `/Users/khonimkulovjaloliddin/Desktop/같이Go-next/scss/pc/chat/ai-chat.scss`:

```scss
@import '/scss/variables.scss';

.ai-chat-bubble-btn {
  border: none;
  position: fixed;
  bottom: 90px;
  right: 30px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: $color-white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 1100;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
}

.ai-chat-window {
  position: fixed;
  right: 28px;
  bottom: 160px;
  width: 380px;
  height: 480px;
  display: flex;
  flex-direction: column;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  z-index: 1100;
  overflow: hidden;
  font-family: $font;
}

.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: $color-primary;
  color: $color-white;
}

.ai-chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $color-white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ai-chat-title {
  font-family: $font;
  font-weight: 600;
  font-size: 14px;
  color: $color-white;
}

.ai-chat-status {
  font-family: $font;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.ai-chat-header-actions {
  display: flex;
  gap: 6px;

  button {
    background: none;
    border: none;
    color: $color-white;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    opacity: 0.85;

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  gap: 12px;
  color: $color-muted;
  font-family: $font;
  font-size: 13px;
  line-height: 1.5;

  p {
    margin: 0;
  }
}

.ai-welcome-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ai-chat-msg {
  display: flex;

  &.user {
    justify-content: flex-end;

    .ai-chat-bubble {
      background: $color-primary;
      color: $color-white;
      border-radius: 16px 16px 4px 16px;
    }
  }

  &.assistant {
    justify-content: flex-start;

    .ai-chat-bubble {
      background: $color-bg;
      color: $color-dark;
      border-radius: 16px 16px 16px 4px;
    }
  }
}

.ai-chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  font-family: $font;
  font-size: 13px;
  line-height: 1.5;

  p {
    margin: 4px 0;
  }

  ul {
    padding-left: 16px;
    margin: 4px 0;
  }

  li {
    margin: 2px 0;
  }

  strong {
    font-weight: 600;
  }
}

.ai-chat-typing {
  .ai-chat-bubble {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;

    span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: $color-muted;
      animation: ai-dot-bounce 1.2s infinite ease-in-out;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes ai-dot-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.ai-chat-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid $color-border;

  textarea {
    flex: 1;
    resize: none;
    border: 1px solid $color-border;
    border-radius: 20px;
    padding: 10px 14px;
    font-family: $font;
    font-size: 13px;
    line-height: 1.4;
    max-height: 100px;
    outline: none;
    background: $color-bg;
    color: $color-dark;

    &:focus {
      border-color: $color-primary;
    }

    &:disabled {
      opacity: 0.6;
    }
  }
}

.ai-chat-send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: $color-primary;
  color: $color-white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: $color-primary-hover;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

---

## Task 8 — Import ai-chat.scss in main.scss

**Files:**
- Modify: `scss/pc/main.scss`

- [ ] **Step 1: Add SCSS import**

In `/Users/khonimkulovjaloliddin/Desktop/같이Go-next/scss/pc/main.scss`, after the existing `@import '/scss/pc/member/memberProperties.scss';` line (the last existing import), add:

```scss
@import '/scss/pc/chat/ai-chat.scss';
```

---

## Task 9 — Create AiChatBubble frontend component

**Files:**
- Create: `libs/components/AiChatBubble.tsx`

- [ ] **Step 1: Create the component**

Create `/Users/khonimkulovjaloliddin/Desktop/같이Go-next/libs/components/AiChatBubble.tsx`:

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { REACT_APP_API_URL } from '../config';

interface ChatMsg {
	role: 'user' | 'assistant';
	content: string;
}

const CHAT_API = `${REACT_APP_API_URL}/chat/message`;

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
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMsg[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (open && inputRef.current) inputRef.current.focus();
	}, [open]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, loading]);

	const sendMessage = async () => {
		const text = input.trim();
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
				history: messages,
			});
			setMessages([...updatedHistory, { role: 'assistant', content: data.reply }]);
		} catch {
			setMessages([...updatedHistory, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
		} finally {
			setLoading(false);
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
				<Image src="/img/final_favicon1.png" alt="Library Assistant" width={28} height={28} />
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
									<Image src="/img/final_favicon1.png" alt="Library Assistant" width={26} height={26} />
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
										<Image src="/img/final_favicon1.png" alt="Library Assistant" width={32} height={32} />
									</div>
									<p>Hi! I'm your 같이Go Library Assistant. Ask me about books, borrowing, robot delivery, or how to navigate the app.</p>
								</div>
							) : (
								<>
									{messages.map((msg, i) => (
										<div key={i} className={`ai-chat-msg ${msg.role}`}>
											<div className="ai-chat-bubble">
												{msg.role === 'assistant' ? (
													<ReactMarkdown>{msg.content}</ReactMarkdown>
												) : (
													msg.content
												)}
											</div>
										</div>
									))}
									{loading && (
										<div className="ai-chat-msg assistant ai-chat-typing">
											<div className="ai-chat-bubble">
												<span />
												<span />
												<span />
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
							<button className="ai-chat-send-btn" onClick={sendMessage} disabled={!input.trim() || loading} aria-label="Send">
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
```

---

## Task 10 — Update layouts to use AiChatBubble

**Files:**
- Modify: `libs/components/layout/LayoutHome.tsx` (Chat at line 11 import, line 84 usage)
- Modify: `libs/components/layout/LayoutFull.tsx` (Chat at line 9 import, line 68 usage)
- Modify: `libs/components/layout/LayoutBasic.tsx` (Chat at line 9 import, line 148 usage)

- [ ] **Step 1: Update LayoutHome.tsx**

In `libs/components/layout/LayoutHome.tsx`:
- Replace `import Chat from '../Chat';` with `import AiChatBubble from '../AiChatBubble';`
- Replace `<Chat />` with `<AiChatBubble />`

- [ ] **Step 2: Update LayoutFull.tsx**

In `libs/components/layout/LayoutFull.tsx`:
- Replace `import Chat from '../Chat';` with `import AiChatBubble from '../AiChatBubble';`
- Replace `<Chat />` with `<AiChatBubble />`

- [ ] **Step 3: Update LayoutBasic.tsx**

In `libs/components/layout/LayoutBasic.tsx`:
- Replace `import Chat from '../Chat';` with `import AiChatBubble from '../AiChatBubble';`
- Replace `<Chat />` with `<AiChatBubble />`

---

## Task 11 — Delete old Chat component

**Files:**
- Delete: `libs/components/Chat.tsx`

- [ ] **Step 1: Confirm no remaining imports**

```bash
grep -r "from '../Chat'\|from './Chat'\|import Chat" /Users/khonimkulovjaloliddin/Desktop/같이Go-next/libs --include="*.tsx" --include="*.ts"
```

Expected: no output (all layouts already updated in Task 10).

- [ ] **Step 2: Delete the file**

```bash
rm /Users/khonimkulovjaloliddin/Desktop/같이Go-next/libs/components/Chat.tsx
```

---

## Task 12 — Run frontend build and fix TypeScript errors

**Files:** (no changes unless errors found)

- [ ] **Step 1: Run build**

```bash
cd /Users/khonimkulovjaloliddin/Desktop/같이Go-next
yarn build 2>&1 | tail -30
```

Expected: build completes with no TypeScript errors. Common issues to watch for:
- `react-markdown` types — if types error occurs run `yarn add @types/react-markdown` (v9+ ships its own types so this should not be needed)
- Any `socketVar` usage warning — `socketVar` in `apollo/store.ts` and `apollo/client.ts` can stay; it's set but no longer read, which causes no build error

- [ ] **Step 2: Fix any TypeScript errors before reporting done**

---

## Notes on what is NOT changed

- `apollo/client.ts` — The `LoggingWebSocket` and `socketVar` initialization stays untouched. The WebSocketLink is still needed for any future GraphQL subscriptions. The socket will connect to the backend but no chat events will be processed since `SocketGateway` is removed — this produces no error.
- `apollo/store.ts` — `socketVar` stays in the store; it's unused but harmless.
- `apps/nestar-api/src/socket/robot.gateway.ts` — Never touched. Robot tracking WebSocket is isolated and remains fully functional.
- `.env` — `GROQ_API_KEY` is already present in both projects.

---

## Env var reference

| Var | Location | Purpose |
|-----|----------|---------|
| `GROQ_API_KEY` | `같이Go-api/.env` | Already present — Groq API authentication |
| `NEXT_PUBLIC_API_URL` | `같이Go-next/.env.local` | Frontend API base URL (exported as `REACT_APP_API_URL` from `libs/config.ts`) |
