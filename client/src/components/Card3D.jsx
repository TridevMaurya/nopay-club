import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
var Card3D = function (_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? "" : _b;
    var ref = useRef(null);
    // Motion values for tracking mouse position
    var x = useMotionValue(0);
    var y = useMotionValue(0);
    // Spring animations for smoother movement
    var rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 300, damping: 30 });
    var rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 300, damping: 30 });
    var scale = useSpring(1);
    var handleMouseMove = function (e) {
        if (!ref.current)
            return;
        var rect = ref.current.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };
    var handleMouseEnter = function () {
        scale.set(1.03);
    };
    var handleMouseLeave = function () {
        x.set(0);
        y.set(0);
        scale.set(1);
    };
    return (<motion.div ref={ref} className={"card-3d ".concat(className)} style={{
            rotateX: rotateX,
            rotateY: rotateY,
            scale: scale,
            transformStyle: "preserve-3d",
            perspective: 1000,
        }} onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>);
};
export default Card3D;
