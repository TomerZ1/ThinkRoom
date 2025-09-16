import React, { useRef, useState, useEffect, useCallback } from "react";
import styles from "./sketch.module.css";
import useSketch from "../../../hooks/useSketch";
import { useSettings } from "../../../context/SettingsContext";

const SketchCanvas = ({ sessionId, color, lineWidth, mode }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pointsBuffer, setPointsBuffer] = useState([]);

  const { sketch, sendSketchUpdate } = useSketch(sessionId);

  const { settings } = useSettings();
  const { bgColor, showGrid, gridSize } = settings.sketch;

  // Keep latest sketch for redraw after resize
  const sketchRef = useRef(sketch);
  useEffect(() => {
    sketchRef.current = sketch;
  }, [sketch]);

  // Central redraw helper (replays all actions)
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const action of sketchRef.current) {
      if (action.type !== "stroke" || !Array.isArray(action.points)) continue;

      ctx.save();
      if (action.mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = action.color || "black";
      }
      ctx.lineWidth = action.lineWidth ?? 2;
      ctx.lineCap = "round";

      ctx.beginPath();
      action.points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.stroke();
      ctx.restore();
    }
  }, []);

  // Hi-DPI & responsive sizing: resizing clears bitmap, so redraw immediately
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.lineCap = "round";
      redrawAll(); // repaint after size change
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redrawAll]);

  // Redraw when sketch updates normally
  useEffect(() => {
    redrawAll();
  }, [sketch, redrawAll]);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.globalCompositeOperation =
      mode === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = mode === "erase" ? "rgba(0,0,0,1)" : color;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(
      (e.nativeEvent.clientX - rect.left) * scaleX,
      (e.nativeEvent.clientY - rect.top) * scaleY
    );
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation =
      mode === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = mode === "erase" ? "rgba(0,0,0,1)" : color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(
      (e.nativeEvent.clientX - rect.left) * scaleX,
      (e.nativeEvent.clientY - rect.top) * scaleY
    );
    ctx.stroke();

    setPointsBuffer((prev) => [
      ...prev,
      {
        x: (e.nativeEvent.clientX - rect.left) * scaleX,
        y: (e.nativeEvent.clientY - rect.top) * scaleY,
      },
    ]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (pointsBuffer.length > 0) {
      sendSketchUpdate({
        type: "stroke",
        points: pointsBuffer,
        color,
        lineWidth,
        mode,
      });
      setPointsBuffer([]);
    }
  };

  // Background color + optional grid via CSS
  const canvasStyle = {
    backgroundColor: bgColor,
    backgroundImage: showGrid
      ? `
        linear-gradient(to right, rgba(0,0,0,0.09) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.09) 1px, transparent 1px)
      `
      : "none",
    backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : undefined,
    backgroundPosition: "0 0",
  };

  return (
    <canvas
      className={styles["sketch-canvas"]}
      ref={canvasRef}
      style={canvasStyle}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default SketchCanvas;
