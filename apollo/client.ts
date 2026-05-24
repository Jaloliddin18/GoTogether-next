import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;
// global variable: apolloClients

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}
// STEP 2
const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

// Custom WebSocket client
class LoggingWebSocket {
	private socket: WebSocket;
	constructor(url: string) {
		this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
		socketVar(this.socket);

		this.socket.onopen = () => {
			console.log('WebSocket connection!');
		};

		this.socket.onmessage = (msg) => {
			console.log('WebSocket messgae:', msg.data);
		};

		this.socket.onerror = (err) => {
			console.log('WebSocket error:', err);
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	// createApolloClient calls: createIsomorphicLink()
	// A link chain is like an assembly line where your GraphQL request passes through multiple steps before reaching the server.
	// @ts-ignore
	const uploadLink = new createUploadLink({
		uri: process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + '/graphql' : 'http://localhost:3007/graphql',
	});

	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({
			headers: {
				...headers,
				...getHeaders(),
			},
		}));
		console.warn('requesting.. ', operation);
		return forward(operation);
	});

	// ApolloClient must always receive a link (including SSR).
	if (typeof window === 'undefined') {
		return from([tokenRefreshLink, authLink.concat(uploadLink)]);
	}

	if (typeof window !== 'undefined') {
		/* WEBSOCKET SUBSCRIPTION LINK */
		const wsLink = new WebSocketLink({
			uri: process.env.NEXT_PUBLIC_API_URL
				? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws')
				: 'ws://127.0.0.1:3007',
			options: {
				reconnect: false,
				timeout: 30000,
				connectionParams: () => {
					return { headers: getHeaders() };
				},
			},
			webSocketImpl: LoggingWebSocket,
		});
		// STEP 1
		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					if (!message.includes('input')) sweetErrorAlert(message);
				});
			}
			if (networkError) console.log(`[Network error]: ${networkError}`);
			// @ts-ignore
			if (networkError?.statusCode === 401) {
			}
		});
		// STEP 3
		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				// getMainDefinition() is a helper function that extracts the main operation from it.
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
				// 'OperationDefinition' - a query, mutation, OR subscription
				// In GraphQL, there are 3 types of operations: query, mutation, and subscription - listen for real-time updates
			},
			wsLink,
			authLink.concat(uploadLink),
		);

		return from([errorLink, tokenRefreshLink, splitLink]); // !errror => token time check => split the request
	}
}

function createApolloClient() {
	// initializeApollo calls: createApolloClient()
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache({
			// MongoDB ObjectIds arrive as objects in some NestJS setups — coerce to string
			dataIdFromObject(obj) {
				const raw = (obj as any)._id ?? (obj as any).id;
				if (raw == null) return undefined;
				const strId =
					typeof raw === 'string' || typeof raw === 'number'
						? String(raw)
						: (raw as any)?._id?.toString?.() ?? raw?.toString?.() ?? JSON.stringify(raw);
				return `${obj.__typename}:${strId}`;
			},
		}), //  Creates empty cache, then auto-stores query results
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	// useApollo calls: initializeApollo(initialState)
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	// Copy server's fetched data into browser's cache (avoids duplicate fetch)
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	// _app.tsx calls: useApollo(pageProps)
	return useMemo(() => initializeApollo(initialState), [initialState]);
	// useMemo remembers a value and only recalculates it when initialState is updated
}

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/
