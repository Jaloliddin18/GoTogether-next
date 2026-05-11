import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';

const Footer = () => {
	const device = useDeviceDetect();

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
							<span>Library Help Desk</span>
							<p>INHA University Library</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Robot Support</span>
							<p>24/7 Autonomous Service</p>
							<span>같이Go is always on duty.</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>follow us on social media</p>
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
								<strong>Popular Search</strong>
								<span>Search Book Catalog</span>
								<span>Request Book Delivery</span>
								<span>Track My Delivery</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>How It Works</span>
								<span>About 같이Go</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Discover</strong>
								<span>1F — General Collection</span>
								<span>2F — Reference & Journals</span>
								<span>3F — Digital Media</span>
								<span>4F — Study Rooms</span>
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
							<span>Library Help Desk</span>
							<p>INHA University Library</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Robot Support</span>
							<p>24/7 Autonomous Service</p>
							<span>같이Go is always on duty.</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>follow us on social media</p>
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
							<strong>Stay Updated with 같이Go</strong>
							<div style={{ backgroundColor: '#fff' }}>
								<input type="text" placeholder={'Your Email'} style={{ backgroundColor: '#fff', color: '#000' }} />
								<span
									style={{
										color: '#fff',
										backgroundColor: '#2E86DE',
										padding: '10px 14px',
										borderRadius: '8px',
										fontWeight: 600,
									}}
								>
									Subscribe
								</span>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular Search</strong>
								<span>Search Book Catalog</span>
								<span>Request Book Delivery</span>
								<span>Track My Delivery</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>How It Works</span>
								<span>About 같이Go</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Discover</strong>
								<span>1F — General Collection</span>
								<span>2F — Reference & Journals</span>
								<span>3F — Digital Media</span>
								<span>4F — Study Rooms</span>
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
