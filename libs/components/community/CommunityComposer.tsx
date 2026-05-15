import React, { useRef, useState } from 'react';
import { Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { CreateTwitInput } from '../../types/twit/twit.input';
import { REACT_APP_API_URL } from '../../config';
import { getJwtToken } from '../../auth';
import axios from 'axios';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const MAX_IMAGES = 3;

interface CommunityComposerProps {
	user: CustomJwtPayload;
	loading: boolean;
	onSubmit: (input: CreateTwitInput) => Promise<boolean>;
	onLogin: () => void;
}

const CommunityComposer = ({ user, loading, onSubmit, onLogin }: CommunityComposerProps) => {
	const [text, setText] = useState<string>('');
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [uploading, setUploading] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const token = getJwtToken();

	const getMemberImage = (imageUrl: string | undefined) => {
		if (!imageUrl) return '/img/profile/defaultUser.svg';
		if (imageUrl.startsWith('/img') || imageUrl.startsWith('http')) return imageUrl;
		return `${REACT_APP_API_URL}/${imageUrl}`;
	};

	const fileChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		if (!files.length) return;
		const combined = [...selectedFiles, ...files];
		if (combined.length > MAX_IMAGES) {
			sweetMixinErrorAlert(`You can attach up to ${MAX_IMAGES} images.`).then();
			setSelectedFiles(combined.slice(0, MAX_IMAGES));
		} else {
			setSelectedFiles(combined);
		}
		event.target.value = '';
	};

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const uploadFiles = async (files: File[]): Promise<string[]> => {
		const formData = new FormData();
		const nulls = files.map(() => null);
		const mapObj: Record<string, string[]> = {};
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
					imagesUploader(files: $files, target: $target)
				}`,
				variables: { files: nulls, target: 'twits' },
			}),
		);
		files.forEach((file, i) => {
			mapObj[String(i)] = [`variables.files.${i}`];
		});
		formData.append('map', JSON.stringify(mapObj));
		files.forEach((file, i) => formData.append(String(i), file));

		const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
				Authorization: `Bearer ${token}`,
			},
		});
		const uploaded: string[] = response?.data?.data?.imagesUploader ?? [];
		if (!uploaded.length) throw new Error('Image upload failed');
		return uploaded;
	};

	const submitHandler = async () => {
		if (loading || submitting || uploading || !text.trim() || text.length > 500) return;
		setSubmitting(true);
		try {
			let images: string[] | undefined;
			if (selectedFiles.length) {
				setUploading(true);
				try {
					images = await uploadFiles(selectedFiles);
				} finally {
					setUploading(false);
				}
			}
			const isSuccess = await onSubmit({ text, images });
			if (!isSuccess) return;
			setText('');
			setSelectedFiles([]);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSubmitting(false);
		}
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
					onChange={(e) => setText(e.target.value)}
					multiline
					minRows={2}
					placeholder="Share a library update..."
					variant="standard"
					InputProps={{ disableUnderline: true }}
					className="composer-input"
				/>
				{selectedFiles.length > 0 && (
					<Stack className="composer-preview-grid" direction="row" flexWrap="wrap" gap="6px" pt="8px">
						{selectedFiles.map((file, i) => (
							<Stack key={i} className="composer-preview-thumb" position="relative">
								<img src={URL.createObjectURL(file)} alt="" />
								<IconButton
									className="composer-preview-remove"
									size="small"
									onClick={() => removeFile(i)}
									aria-label="Remove image"
								>
									<CloseIcon fontSize="small" />
								</IconButton>
							</Stack>
						))}
					</Stack>
				)}
				<Stack className="composer-footer">
					<Typography className="composer-hint">{text.length}/500</Typography>
					<Stack className="composer-tools">
						<input
							ref={fileInputRef}
							type="file"
							id="community-twit-image"
							accept="image/*"
							multiple
							onChange={fileChangeHandler}
							hidden
						/>
						<IconButton
							className="composer-icon-btn"
							aria-label="Add image"
							disabled={uploading || loading || submitting || selectedFiles.length >= MAX_IMAGES}
							onClick={() => fileInputRef.current?.click()}
						>
							<ImageOutlinedIcon />
						</IconButton>
						<IconButton className="composer-icon-btn" aria-label="Add emoji" disabled>
							<EmojiEmotionsOutlinedIcon />
						</IconButton>
						<IconButton className="composer-icon-btn" aria-label="Add location" disabled>
							<LocationOnOutlinedIcon />
						</IconButton>
						<Button
							className="composer-submit"
							disabled={loading || submitting || uploading || !text.trim() || text.length > 500}
							onClick={submitHandler}
						>
							{loading || submitting ? 'Posting...' : uploading ? 'Uploading...' : 'Post'}
						</Button>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityComposer;
