import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';

const BIO_MAX = 200;

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberImage: user.memberImage,
			memberDesc: user.memberDesc ?? '',
		});
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: { file: null, target: 'member' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', image);

			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			setUpdateData({ ...updateData, memberImage: responseImage });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message ?? 'Image upload failed').then();
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			const result = await updateMember({ variables: { input: { ...updateData, _id: user._id } } });
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			await sweetMixinSuccessAlert('Profile updated successfully');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData, user]);

	const isDisabled = () => {
		const nick = updateData.memberNick?.trim() ?? '';
		return nick.length < 3 || nick.length > 12;
	};

	if (device === 'mobile') return <>MY PROFILE PAGE MOBILE</>;

	return (
		<div id="my-profile-page">
			<Stack className="panel-header">
				<Typography className="panel-title">My Profile</Typography>
				<Typography className="panel-subtitle">Manage your account information</Typography>
			</Stack>

			<Stack className="profile-form">
				<Stack className="profile-photo-section">
					<Typography className="field-label">Photo</Typography>
					<Stack className="photo-row">
						<div className="avatar-preview">
							<img
								src={updateData?.memberImage ? `${REACT_APP_API_URL}/${updateData.memberImage}` : '/img/profile/defaultUser.svg'}
								alt="avatar"
							/>
						</div>
						<Stack className="upload-info">
							<input type="file" hidden id="profile-upload" onChange={uploadImage} accept="image/jpg, image/jpeg, image/png" />
							<label htmlFor="profile-upload" className="upload-btn">
								Change Photo
							</label>
							<Typography className="upload-hint">JPG, JPEG or PNG — max 2MB</Typography>
						</Stack>
					</Stack>
				</Stack>

				<Stack className="profile-fields-grid">
					<Stack className="field-group">
						<Typography className="field-label">Username</Typography>
						<input
							type="text"
							className="profile-input"
							placeholder="Your username"
							value={updateData.memberNick ?? ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
						/>
					</Stack>
					<Stack className="field-group">
						<Typography className="field-label">Phone</Typography>
						<input
							type="text"
							className="profile-input"
							placeholder="Your phone number"
							value={updateData.memberPhone ?? ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
						/>
					</Stack>
				</Stack>

				<Stack className="field-group full-width">
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography className="field-label">Bio</Typography>
						<Typography className="char-counter">
							{(updateData.memberDesc ?? '').length}/{BIO_MAX}
						</Typography>
					</Stack>
					<textarea
						className="profile-textarea"
						placeholder="Tell people a bit about yourself..."
						maxLength={BIO_MAX}
						rows={4}
						value={updateData.memberDesc ?? ''}
						onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
					/>
				</Stack>

				<Button className="profile-update-btn" onClick={updateProfileHandler} disabled={isDisabled()}>
					Save Changes
				</Button>
			</Stack>
		</div>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberDesc: '',
	},
};

export default MyProfile;
