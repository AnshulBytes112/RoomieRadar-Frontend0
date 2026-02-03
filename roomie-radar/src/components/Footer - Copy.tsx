import { Button, Input } from "@/components/ui"
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    ArrowRight
} from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
    return (
        <footer className="bg-[#0b0b1a] text-white border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Newsletter Section */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8 md:p-12 mb-20 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
                    <div className="md:w-1/2">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">Stay in the loop</h3>
                        <p className="text-gray-400">Join our newsletter to get the latest listings and roommate tips delivered to your inbox.</p>
                    </div>
                    <div className="md:w-1/2 w-full flex gap-4">
                        <Input
                            placeholder="Enter your email"
                            className="bg-[#181836] border-white/10 text-white h-12 focus:ring-blue-500 rounded-xl"
                        />
                        <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 rounded-xl">
                            Subscribe
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                            {/* Logo placeholder - using text for now */}
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                RoomieRadar
                            </span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Find your perfect room and compatible roommates in Bangalore with our AI-powered platform. Safe, secure, and simple.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-blue-400 transition-all">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-pink-400 transition-all">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-blue-600 transition-all">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Home</Link></li>
                            <li><Link to="/find-room" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Find a Room</Link></li>
                            <li><Link to="/list-room" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">List Your Room</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Support</h4>
                        <ul className="space-y-4">
                            <li><Link to="/help" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Help Center</Link></li>
                            <li><Link to="/terms" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Privacy Policy</Link></li>
                            <li><Link to="/safety" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">Safety Tips</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start">
                                <MapPin className="h-6 w-6 text-blue-400 mr-3 flex-shrink-0" />
                                <span className="text-gray-400">Dayananda Sagar College Of Engineering,Bangalore-560078</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                                <span className="text-gray-400">+91 9430150069</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                                <span className="text-gray-400">roomieradar2@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">© 2024 RoomieRadar. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="#" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
