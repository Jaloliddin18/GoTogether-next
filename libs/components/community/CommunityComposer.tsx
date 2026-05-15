import React, { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { CreateTwitInput } from '../../types/twit/twit.input';
import { REACT_APP_API_URL } from '../../config';
import { getJwtToken } from '../../auth';
import axios from 'axios';
import { sweetMixinErrorAlert } from '../../sweetAlert';

interface CommunityComposerProps {
	user: CustomJwtPayload;
	loading: boolean;
	onSubmit: (input: CreateTwitInput) => Promise<void>;
	onLogin: () => void;
}

const CommunityComposer = ({ user, loading, onSubmit, onLogin }: CommunityComposerProps) => {
	const [text, setText] = useState<string>('');
	const [imagePath, setImagePath] = useState<string>('');
	const [uploading, setUploading] = useState<boolean>(false);
	const token = getJwtToken();

	const getMemberImage = (imageUrl: string | undefined) => {
		if (!imageUrl) return '/img/profile/defaultUser.svg';
		if (imageUrl.startsWith('/img') || imageUrl.startsWith('http')) return imageUrl;
		return `${REACT_APP_API_URL}/${imageUrl}`;
	};

	const submitHandler = async () => {
		await onSubmit({ text, image: imagePath || undefined });
		setText('');
		setImagePath('');
	};

	const normalizeImagePath = (path: string) => {
		if (path.startsWith('http') || path.startsWith('/')) return path;
		return `/${path}`;
	};

	const uploadImage = async (file: File) => {
		try {
			if (!file) return;

			setUploading(true);
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
						imagesUploader(files: $files, target: $target)
					}`,
					variables: {
						files: [null],
						target: 'twits',
					},
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.files.0'] }));
			formData.append('0', file);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const uploadedImages = response?.data?.data?.imagesUploader ?? [];
			if (!uploadedImages?.length) throw new Error('Image upload failed');
			setImagePath(uploadedImages[0]);
		} catch (err: any) {
			console.log('ERROR, uploadImage:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setUploading(false);
		}
	};

	const imageChangeHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (!selectedFile) return;
		await uploadImage(selectedFile);
		event.target.value = '';
	};

	if (!user?._id) {
		return (
			<Stack className="community-composer login-required">
				<Typography className="composer-title">Join the Smart Library conversation</Typography>
				<Typography className="composer-copy">Log in to read your community feed and share updates.</Typography>
				<Button className="composer-submit" onClick={onLogin}>
					Login
				</Button>
			</Stack>
		);
	}

	return (
		<Stack className="community-composer">
			<img src={getMemberImage(user?.memberImage)} alt="" className="composer-avatar" />
			<Stack className="composer-body">
				<TextField
					value={text}
					onChange={(event) => setText(event.target.value)}
					multiline
					minRows={3}
					placeholder="Share a library update..."
					variant="standard"
					InputProps={{
						disableUnderline: true,
					}}
					className="composer-input"
				/>
				<Stack className="composer-footer">
					<Typography className="composer-hint">{text.length}/500</Typography>
					<Stack className="composer-tools">
						<input type="file" id="community-twit-image" accept="image/*" onChange={imageChangeHandler} hidden />
						<Button className="composer-upload" disabled={uploading} onClick={() => document.getElementById('community-twit-image')?.click()}>
							{uploading ? 'Uploading...' : 'Image'}
						</Button>
						<Button
							className="composer-submit"
							disabled={loading || uploading || !text.trim() || text.length > 500}
							onClick={submitHandler}
						>
							Post
						</Button>
					</Stack>
				</Stack>
				{imagePath && (
					<Stack className="composer-preview">
						<img src={normalizeImagePath(imagePath)} alt="" />
						<Button className="composer-remove-image" onClick={() => setImagePath('')}>
							Remove
						</Button>
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export default CommunityComposer;
