import { Button, Input } from "@/components/ui"
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    Rocket
} from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
    return (
        <footer className="bg-[#050505] text-white border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-trae-green rounded-lg flex items-center justify-center">
                                <Rocket className="w-6 h-6 text-black fill-current" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">RoomieRadar</span>
                        </Link>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Find your perfect room and compatible roommates in Bangalore with our tech-forward platform.
                        </p>
                        <div className="flex space-x-4">
                            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-trae-green hover:text-black transition-all border border-white/10 group">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="text-trae-green font-mono text-sm uppercase tracking-[0.2em] mb-8 font-bold">Product</h4>
                        <ul className="space-y-4">
                            {['Pricing', 'Blog', 'Docs', 'Changelog'].map((link) => (
                                <li key={link}><Link to="#" className="text-gray-400 hover:text-white transition-colors text-lg font-medium">{link}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-trae-green font-mono text-sm uppercase tracking-[0.2em] mb-8 font-bold">Support</h4>
                        <ul className="space-y-4">
                            {['Help Center', 'Terms', 'Privacy', 'Safety'].map((link) => (
                                <li key={link}><Link to="#" className="text-gray-400 hover:text-white transition-colors text-lg font-medium">{link}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-trae-green font-mono text-sm uppercase tracking-[0.2em] mb-8 font-bold">Stay Connected</h4>
                        <p className="text-gray-400 mb-6 font-medium">Get the latest updates delivered to your inbox.</p>
                        <div className="space-y-4">
                            <Input
                                placeholder="Email address"
                                className="bg-[#0a0a0a] border-white/10 text-white h-12 rounded-xl focus:border-trae-green/50 px-4"
                            />
                            <Button className="w-full h-12 bg-white text-black hover:bg-trae-green transition-all font-bold rounded-xl uppercase tracking-widest text-xs">
                                Subscribe Now
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8 text-sm text-gray-500 font-medium">
                        <p>© 2026 RoomieRadar</p>
                        <Link to="#" className="hover:text-trae-green transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-trae-green transition-colors">Terms of Service</Link>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <div className="w-2 h-2 bg-trae-green rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-gray-400">SERVER_STATUS: OPERATIONAL</span>
                    </div>
                </div>
            </div>

            {/* Bottom glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />
        </footer>
    )
}

export default Footer
