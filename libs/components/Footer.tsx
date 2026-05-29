import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import { useTranslation } from 'next-i18next';

const Footer = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('layout');

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img
								src="/img/logo/logo_capstone.png"
								alt="같이Go Smart Library"
								style={{ height: '70px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
							/>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>{t('footer_helpdesk')}</span>
							<p>{t('footer_university')}</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>{t('footer_robot_support')}</span>
							<p>{t('footer_service')}</p>
							<span>{t('footer_tagline')}</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>{t('footer_social')}</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>{t('footer_popular')}</strong>
								<span>{t('footer_search_catalog')}</span>
								<span>{t('footer_request_delivery')}</span>
								<span>{t('footer_track')}</span>
							</div>
							<div>
								<strong>{t('footer_quick_links')}</strong>
								<span>{t('footer_terms')}</span>
								<span>{t('footer_privacy')}</span>
								<span>{t('footer_how')}</span>
								<span>{t('footer_about')}</span>
								<span>{t('footer_contact')}</span>
								<span>{t('footer_faqs')}</span>
							</div>
							<div>
								<strong>{t('footer_discover')}</strong>
								<span>{t('footer_floor_1')}</span>
								<span>{t('footer_floor_2')}</span>
								<span>{t('footer_floor_3')}</span>
								<span>{t('footer_floor_4')}</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© 같이Go — INHA University Smart Library. 2026</span>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img
								src="/img/logo/logo_capstone.png"
								alt="같이Go Smart Library"
								style={{ height: '70px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
							/>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>{t('footer_helpdesk')}</span>
							<p>{t('footer_university')}</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>{t('footer_robot_support')}</span>
							<p>{t('footer_service')}</p>
							<span>{t('footer_tagline')}</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>{t('footer_social')}</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'top'}>
							<strong>{t('footer_newsletter')}</strong>
							<div style={{ backgroundColor: '#fff' }}>
								<input type="text" placeholder={t('footer_email_placeholder')} style={{ backgroundColor: '#fff', color: '#000' }} />
								<span
									style={{
										color: '#fff',
										backgroundColor: '#2E86DE',
										padding: '10px 14px',
										borderRadius: '8px',
										fontWeight: 600,
									}}
								>
									{t('footer_subscribe')}
								</span>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>{t('footer_popular')}</strong>
								<span>{t('footer_search_catalog')}</span>
								<span>{t('footer_request_delivery')}</span>
								<span>{t('footer_track')}</span>
							</div>
							<div>
								<strong>{t('footer_quick_links')}</strong>
								<span>{t('footer_terms')}</span>
								<span>{t('footer_privacy')}</span>
								<span>{t('footer_how')}</span>
								<span>{t('footer_about')}</span>
								<span>{t('footer_contact')}</span>
								<span>{t('footer_faqs')}</span>
							</div>
							<div>
								<strong>{t('footer_discover')}</strong>
								<span>{t('footer_floor_1')}</span>
								<span>{t('footer_floor_2')}</span>
								<span>{t('footer_floor_3')}</span>
								<span>{t('footer_floor_4')}</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© 같이Go — INHA University Smart Library. 2026</span>
					<span>Privacy · Terms · Sitemap</span>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
