import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { NextSeo } from 'next-seo';
import { buildCanonicalUrl, buildOpenGraph } from '../../libs/config/seo';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'layout', 'account'])),
	},
});

const EyeOpen = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const EyeOff = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
		<line x1="1" y1="1" x2="23" y2="23" />
	</svg>
);

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useTranslation('account');
	const pageTitle = 'Account Access | 같이Go Smart Library';
	const pageDescription = 'Log in or create an account to use 같이Go Smart Library services.';
	const [input, setInput] = useState({ nick: '', password: '', phone: '' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState(false);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		if (input.nick.length < 3 || input.nick.length > 12) {
			await sweetMixinErrorAlert(t('err_nickname_length'));
			return;
		}
		if (input.password.length < 5 || input.password.length > 12) {
			await sweetMixinErrorAlert(t('err_password_length'));
			return;
		}

		const success = await logIn(input.nick, input.password);
		if (success) {
			await router.push(`${router.query.referrer ?? '/'}`);
		}
	}, [input, router]);

	const doSignUp = useCallback(async () => {
		if (input.nick.length < 3 || input.nick.length > 12) {
			await sweetMixinErrorAlert(t('err_nickname_length'));
			return;
		}
		if (input.password.length < 5 || input.password.length > 12) {
			await sweetMixinErrorAlert(t('err_password_length'));
			return;
		}
		if (!input.phone) {
			await sweetMixinErrorAlert(t('err_phone_required'));
			return;
		}

		const success = await signUp(input.nick, input.password, input.phone);
		if (success) {
			await router.push(`${router.query.referrer ?? '/'}`);
		}
	}, [input, router]);

	if (device === 'mobile') {
		return (
			<>
				<NextSeo
					title={pageTitle}
					description={pageDescription}
					canonical={buildCanonicalUrl('/account/join')}
					openGraph={buildOpenGraph(pageTitle, pageDescription, '/account/join')}
					noindex
					nofollow
				/>
				<div>LOGIN MOBILE</div>
			</>
		);
	} else {
		return (
			<>
				<NextSeo
					title={pageTitle}
					description={pageDescription}
					canonical={buildCanonicalUrl('/account/join')}
					openGraph={buildOpenGraph(pageTitle, pageDescription, '/account/join')}
					noindex
					nofollow
				/>
				<Stack className={'join-page'}>
					<Stack className={'container'}>
						<Stack className={'main'}>
						<Stack className={'left'}>
							<Box className={'info'}>
								<span>{loginView ? t('tab_login') : t('tab_signup')}</span>
								<p>
									{loginView
										? t('login_subtitle')
										: t('signup_subtitle')}
								</p>
							</Box>
							<Box className={'input-wrap'}>
								<div className={'input-box'}>
									<span>{t('nickname_label')}</span>
									<input
										type="text"
										placeholder={t('nickname_placeholder')}
										onChange={(e) => handleInput('nick', e.target.value)}
										required={true}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								<div className={'input-box'}>
									<span>{t('password_label')}</span>
									<div className={'password-wrap'}>
										<input
											type={showPassword ? 'text' : 'password'}
											placeholder={t('password_placeholder')}
											onChange={(e) => handleInput('password', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter' && loginView) doLogin();
												if (event.key == 'Enter' && !loginView) doSignUp();
											}}
										/>
										<button
											type="button"
											className={'eye-toggle'}
											onClick={() => setShowPassword((v) => !v)}
											aria-label={t(showPassword ? 'aria_hide_password' : 'aria_show_password')}
										>
											{showPassword ? <EyeOpen /> : <EyeOff />}
										</button>
									</div>
								</div>
								{!loginView && (
									<div className={'input-box'}>
										<span>{t('phone_label')}</span>
										<input
											type="text"
											placeholder={t('phone_placeholder')}
											onChange={(e) => handleInput('phone', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key == 'Enter') doSignUp();
											}}
										/>
									</div>
								)}
							</Box>
							<Box className={'register'}>
								{loginView && (
									<div className={'remember-info'}>
										<FormGroup>
											<FormControlLabel control={<Checkbox defaultChecked size="small" />} label={t('remember_me')} />
										</FormGroup>
										<a>{t('forgot_password')}</a>
									</div>
								)}

								{loginView ? (
									<Button
										variant="contained"
										endIcon={<img src="/img/icons/rightup.svg" alt="" />}
										disabled={input.nick == '' || input.password == ''}
										onClick={doLogin}
									>
										{t('btn_login')}
									</Button>
								) : (
									<Button
										variant="contained"
										disabled={input.nick == '' || input.password == '' || input.phone == ''}
										onClick={doSignUp}
										endIcon={<img src="/img/icons/rightup.svg" alt="" />}
									>
										{t('btn_signup')}
									</Button>
								)}
							</Box>
							<Box className={'ask-info'}>
								{loginView ? (
									<p>
										{t('not_registered')}
										<b
											onClick={() => {
												viewChangeHandler(false);
											}}
										>
											{t('link_signup')}
										</b>
									</p>
								) : (
									<p>
										{t('already_account')}
										<b onClick={() => viewChangeHandler(true)}> {t('link_login')}</b>
									</p>
								)}
							</Box>
						</Stack>
							<Stack className={'right'}>
								<img src="/img/banner/login-page_cover.jpeg" alt="Library" />
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</>
		);
	}
};

export default withLayoutBasic(Join);
