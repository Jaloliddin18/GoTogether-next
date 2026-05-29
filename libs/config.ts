export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? `${API_BASE_URL}/graphql`;
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3009';

export const availableOptions = ['propertyBarter', 'propertyRent'];

const thisYear = new Date().getFullYear();

export const propertyYears: any = [];

for (let i = 1970; i <= thisYear; i++) {
	propertyYears.push(String(i));
}

export const propertySquare = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500];

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topPropertyRank = 2;
