import React from "react";
import { Link } from "react-router-dom";
import errorImage from "../assets/404-error.png";

const NotFound = () => {
    return (
        <div className="relative min-h-screen w-full bg-[#f8fafc] overflow-hidden font-inter flex flex-col items-center justify-center">
            {/* High-Resolution Full-Screen Illustration */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={errorImage}
                    alt="404 Background"
                    className="w-full h-full object-cover opacity-60 md:opacity-80"
                    style={{
                        filter: "contrast(1.05) brightness(1.02)",
                        objectPosition: "center 20%"
                    }}
                />
                {/* Elegant Gradient Overlays for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/40 to-white/90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
            </div>

            {/* Professional Content Overlay */}
            <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">
                {/* Subtle Brand Tag */}
                <div className="mb-8 animate-slideDown">
                    <span className="px-4 py-1.5 rounded-full bg-secondary/5 border border-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest">
                        Error Code 404
                    </span>
                </div>

                {/* Large Clean Typography */}
                <div className="space-y-4 mb-12 animate-fadeIn">
                    <h1 className="text-8xl md:text-[180px] font-black text-secondary/10 leading-none select-none font-plus absolute -top-16 left-1/2 transform -translate-x-1/2 -z-10 opacity-40">
                        404
                    </h1>
                    <h2 className="text-4xl md:text-6xl font-extrabold text-secondary tracking-tight font-plus">
                        Page Not Found
                    </h2>
                    <p className="text-[#475569] text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                        The resource you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center animate-slideUp">
                    <Link
                        to="/"
                        className="w-full sm:w-auto px-12 py-4 text-base font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transform hover:-translate-y-1 transition-all duration-300 shadow-[0_15px_30px_rgba(0,129,255,0.2)] hover:shadow-[0_20px_40px_rgba(0,129,255,0.3)] flex items-center justify-center gap-2 group"
                    >
                        <svg
                            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Homepage
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-12 py-4 text-base font-bold text-secondary bg-white border border-secondary/10 rounded-lg hover:bg-secondary/5 transform hover:-translate-y-1 transition-all duration-300 shadow-sm"
                    >
                        Previous Page
                    </button>
                </div>

                {/* Quick Help Links */}
                <div className="mt-16 pt-8 border-t border-secondary/5 w-full max-w-md flex justify-center gap-8 text-sm font-semibold text-secondary/60 animate-fadeIn">
                    <Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
                    <Link to="/faqs" className="hover:text-primary transition-colors">Help Center</Link>
                    <Link to="/search" className="hover:text-primary transition-colors">Search Shop</Link>
                </div>
            </div>

            <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-slideDown { animation: slideDown 0.8s ease-out forwards; }
      `}</style>
        </div>
    );
};

export default NotFound;
