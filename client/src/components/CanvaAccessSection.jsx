import React, { useState } from "react";
import { motion } from "framer-motion";
import AdModal from "./AdModal";
import Card3D from "./Card3D";
import { canvaLinks } from "@/lib/canvaLinks";
var getButtonStyles = function (color) {
    var styles = {
        green: {
            borderColor: "#4dff8e",
            textColor: "#4dff8e",
            shadowColor: "rgba(77,255,142,0.6)"
        },
        purple: {
            borderColor: "#b56eff",
            textColor: "#b56eff",
            shadowColor: "rgba(181,110,255,0.6)"
        },
        blue: {
            borderColor: "#00c2ff",
            textColor: "#00c2ff",
            shadowColor: "rgba(0,194,255,0.6)"
        },
        pink: {
            borderColor: "#ec4899",
            textColor: "#ec4899",
            shadowColor: "rgba(236,72,153,0.6)"
        },
        teal: {
            borderColor: "#2dd4bf",
            textColor: "#2dd4bf",
            shadowColor: "rgba(45,212,191,0.6)"
        },
        orange: {
            borderColor: "#f97316",
            textColor: "#f97316",
            shadowColor: "rgba(249,115,22,0.6)"
        },
        yellow: {
            borderColor: "#facc15",
            textColor: "#facc15",
            shadowColor: "rgba(250,204,21,0.6)"
        },
        red: {
            borderColor: "#ef4444",
            textColor: "#ef4444",
            shadowColor: "rgba(239,68,68,0.6)"
        },
        cyan: {
            borderColor: "#22d3ee",
            textColor: "#22d3ee",
            shadowColor: "rgba(34,211,238,0.6)"
        },
        amber: {
            borderColor: "#f59e0b",
            textColor: "#f59e0b",
            shadowColor: "rgba(245,158,11,0.6)"
        }
    };
    return styles[color] || styles.blue;
};
var CanvaButton = function (_a) {
    var buttonData = _a.buttonData, onButtonClick = _a.onButtonClick;
    var styles = getButtonStyles(buttonData.color);
    var _b = useState(false), isHovered = _b[0], setIsHovered = _b[1];
    // Intensify the glow effect on hover - using multiple layers for stronger effect
    var boxShadow = isHovered
        ? "0 0 10px ".concat(styles.shadowColor, ", 0 0 20px ").concat(styles.shadowColor, ", 0 0 30px ").concat(styles.shadowColor, ", inset 0 0 15px ").concat(styles.shadowColor)
        : "0 0 10px ".concat(styles.shadowColor, ", 0 0 20px ").concat(styles.shadowColor, ", inset 0 0 8px ").concat(styles.shadowColor);
    return (<Card3D className="rounded-xl overflow-hidden">
      <div className="bg-space-blue p-6 rounded-xl h-full" style={{
            border: "3px solid ".concat(styles.borderColor),
            boxShadow: boxShadow,
            transition: 'all 0.3s ease'
        }} onMouseEnter={function () { return setIsHovered(true); }} onMouseLeave={function () { return setIsHovered(false); }}>
        <motion.button className="w-full font-space text-center font-bold" style={{
            color: styles.textColor,
            textShadow: isHovered ? "0 0 12px ".concat(styles.shadowColor) : "0 0 8px ".concat(styles.shadowColor)
        }} onClick={function () { return onButtonClick(buttonData); }} whileTap={{ scale: 0.95 }} whileHover={{
            scale: 1.03,
            transition: { duration: 0.2 }
        }}>
          Get Canva Team #{buttonData.id}
        </motion.button>
      </div>
    </Card3D>);
};
var CanvaAccessSection = function () {
    var _a = useState(false), isModalOpen = _a[0], setIsModalOpen = _a[1];
    var _b = useState(null), selectedLink = _b[0], setSelectedLink = _b[1];
    var handleCanvaButtonClick = function (linkData) {
        setSelectedLink(linkData.link);
        setIsModalOpen(true);
    };
    var handleCloseModal = function () {
        setIsModalOpen(false);
        setSelectedLink(null);
    };
    return (<>
      <motion.section className="py-12 px-4 md:px-12 relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
        <div className="container mx-auto">
          <div className="glass-panel rounded-2xl p-6 md:p-10 max-w-5xl mx-auto relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-green opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <motion.h2 className="font-space font-bold text-3xl md:text-5xl mb-4 text-center neon-text-blue" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              Get Canva Pro Access <span className="text-text-light">For Free</span>
            </motion.h2>
            <motion.p className="text-center text-text-light opacity-80 max-w-2xl mx-auto mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
              Unlock premium design tools without spending a penny. Support our community by watching an ad and following us on Instagram to get instant access.
            </motion.p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {canvaLinks.map(function (linkData) { return (<CanvaButton key={linkData.id} buttonData={linkData} onButtonClick={handleCanvaButtonClick}/>); })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Ad Modal */}
      <AdModal isOpen={isModalOpen} onClose={handleCloseModal} canvaLink={selectedLink || undefined}/>
    </>);
};
export default CanvaAccessSection;
