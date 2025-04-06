import React, { useState } from "react";
import { motion } from "framer-motion";
import AdModal from "./AdModal";
import Card3D from "./Card3D";
import { canvaLinks, type CanvaLinkData } from "@/lib/canvaLinks";

interface CanvaButtonProps {
  buttonData: CanvaLinkData;
  onButtonClick: (linkData: CanvaLinkData) => void;
}

const getButtonStyles = (color: string): {
  borderColor: string;
  textColor: string;
  shadowColor: string;
} => {
  const styles = {
    green: {
      borderColor: "#4dff8e",
      textColor: "#4dff8e",
      shadowColor: "rgba(77,255,142,0.6)",
    },
    purple: {
      borderColor: "#b56eff",
      textColor: "#b56eff",
      shadowColor: "rgba(181,110,255,0.6)",
    },
    blue: {
      borderColor: "#00c2ff",
      textColor: "#00c2ff",
      shadowColor: "rgba(0,194,255,0.6)",
    },
    pink: {
      borderColor: "#ec4899",
      textColor: "#ec4899",
      shadowColor: "rgba(236,72,153,0.6)",
    },
    teal: {
      borderColor: "#2dd4bf",
      textColor: "#2dd4bf",
      shadowColor: "rgba(45,212,191,0.6)",
    },
    orange: {
      borderColor: "#f97316",
      textColor: "#f97316",
      shadowColor: "rgba(249,115,22,0.6)",
    },
    yellow: {
      borderColor: "#eab308",
      textColor: "#eab308",
      shadowColor: "rgba(234,179,8,0.6)",
    },
  };
  return styles[color as keyof typeof styles] || styles.green;
};

const CanvaButton: React.FC<CanvaButtonProps> = ({ buttonData, onButtonClick }) => {
  const styles = getButtonStyles(buttonData.color);
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onButtonClick(buttonData)}
      className="border-2 font-semibold px-6 py-2 rounded-xl transition duration-300"
      style={{
        borderColor: styles.borderColor,
        color: styles.textColor,
        boxShadow: `0 0 15px ${styles.shadowColor}`,
      }}
    >
      {buttonData.label}
    </motion.button>
  );
};

const CanvaAccessSection: React.FC = () => {
  const [selectedLink, setSelectedLink] = useState<CanvaLinkData | null>(null);

  const handleButtonClick = (linkData: CanvaLinkData) => {
    setSelectedLink(linkData);
  };

  return (
    <section id="canva-section" className="py-16 px-4 md:px-20">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-space neon-text-green">
        CANVA TEAM ACCESS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {canvaLinks.map((link, idx) => (
          <Card3D key={idx}>
            <CanvaButton buttonData={link} onButtonClick={handleButtonClick} />
          </Card3D>
        ))}
      </div>
      {selectedLink && (
        <AdModal
          linkData={selectedLink}
          onClose={() => setSelectedLink(null)}
        />
      )}
    </section>
  );
};

export default CanvaAccessSection;
