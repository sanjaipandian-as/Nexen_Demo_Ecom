import { useNavigate } from 'react-router-dom';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaYoutube,
    FaLinkedinIn,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCreditCard,
    FaTruck,
    FaShieldAlt,
    FaHeadset
} from 'react-icons/fa';

const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Contact Us', path: '/contact' },
            { name: 'Press & Media', path: '/press' },
            { name: 'Our Stores', path: '/stores' }
        ],
        help: [
            { name: 'Customer Support', path: '/support' },
            { name: 'Shipping & Delivery', path: '/shipping' },
            { name: 'Returns & Refunds', path: '/returns' },
            { name: 'Track Order', path: '/track-order' },
            { name: 'FAQs', path: '/faqs' }
        ],
        policy: [
            { name: 'Sell on APK Crackers', path: '/seller-register' },
            { name: 'Sell under APK Crackers Accelerator', path: '/Affiliate' },
            { name: 'Protect and Build Your Brand', path: '/BrandRegistry' },
            { name: 'Become an Affiliate', path: '/affiliate' },
            { name: 'Advertise Your Products', path: '/advertise' }
        ]
    };

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-3">
                                APK Crackers
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Your trusted destination for premium quality crackers and fireworks
                            </p>
                        </div>

                        {/* Social Media Links */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 text-gray-300">Follow Us</h4>
                            <div className="flex gap-2">
                                {[
                                    { icon: FaFacebookF, color: 'hover:bg-blue-600', label: 'Facebook' },
                                    { icon: FaTwitter, color: 'hover:bg-sky-500', label: 'Twitter' },
                                    { icon: FaInstagram, color: 'hover:bg-pink-600', label: 'Instagram' },
                                    { icon: FaYoutube, color: 'hover:bg-red-600', label: 'YouTube' },
                                    { icon: FaLinkedinIn, color: 'hover:bg-blue-700', label: 'LinkedIn' }
                                ].map((social, index) => (
                                    <button
                                        key={index}
                                        aria-label={social.label}
                                        className={`w-9 h-9 rounded-lg bg-gray-800 ${social.color} flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 border border-gray-700 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white">Company</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm hover:translate-x-1 inline-block transform duration-200 focus:outline-none focus:text-orange-400"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help & Support */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white">Help & Support</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.help.map((link, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm hover:translate-x-1 inline-block transform duration-200 focus:outline-none focus:text-orange-400"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Make Money with Us */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white">Make Money with Us</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.policy.map((link, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm hover:translate-x-1 inline-block transform duration-200 focus:outline-none focus:text-orange-400"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-base font-bold mb-4 text-white">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                                <span className="text-gray-400 text-sm leading-relaxed">
                                    123 Sivakasi Main Road,<br />
                                    Tamil Nadu, India - 626123
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                <a
                                    href="tel:+911234567890"
                                    className="text-gray-400 hover:text-orange-400 text-sm transition-colors focus:outline-none focus:text-orange-400"
                                >
                                    +91 12345 67890
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                <a
                                    href="mailto:support@apkcrackers.com"
                                    className="text-gray-400 hover:text-orange-400 text-sm transition-colors focus:outline-none focus:text-orange-400"
                                >
                                    support@apkcrackers.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800"></div>

            {/* Features Bar */}
            <div className="bg-gray-800/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: FaTruck, title: 'Free Delivery', desc: 'On every order' },
                            { icon: FaShieldAlt, title: '100% Safe', desc: 'Certified products' },
                            { icon: FaCreditCard, title: 'Secure Payment', desc: 'Multiple options' },
                            { icon: FaHeadset, title: '24/7 Support', desc: 'Always here to help' }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <feature.icon className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-white">{feature.title}</p>
                                    <p className="text-xs text-gray-400">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800"></div>

            {/* Payment Methods */}
            <div className="bg-gray-800/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <p className="text-xs font-semibold text-gray-300 mb-2">We Accept</p>
                            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                                {[
                                    { src: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg', alt: 'Visa' },
                                    { src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', alt: 'Mastercard' },
                                    { src: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', alt: 'PayPal' },
                                    { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg', alt: 'UPI' },
                                    { src: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg', alt: 'Paytm' },
                                    { src: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg', alt: 'Google Pay' }
                                ].map((payment, index) => (
                                    <div key={index} className="bg-white rounded px-2 py-1 shadow-sm hover:shadow-md transition-shadow">
                                        <img src={payment.src} alt={payment.alt} className="h-4 w-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-xs font-semibold text-gray-300 mb-2">Certified By</p>
                            <div className="flex items-center gap-2 justify-center sm:justify-end">
                                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                                    ISO 9001
                                </div>
                                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                                    BIS Certified
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800"></div>

            {/* Bottom Bar */}
            <div className="bg-gray-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-400 text-center md:text-left">
                            © {currentYear} <span className="text-orange-400 font-semibold">APK Crackers</span>. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-500 text-center md:text-right">
                            Made with ❤️ in India
                        </p>
                    </div>
                </div>
            </div>

            {/* Safety Warning */}
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-t border-orange-800/50 pb-16 md:pb-0">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <p className="text-xs text-center text-orange-200 leading-relaxed">
                        ⚠️ <span className="font-semibold">Safety First:</span> Always follow safety guidelines when using crackers and fireworks. Keep away from children. Use in open areas only.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
