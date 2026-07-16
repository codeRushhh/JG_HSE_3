import React, { useEffect, useRef, useState } from "react";
import { Eraser, Check, Upload } from "lucide-react";

const BRAND_BLUE = "#1B3C74";

function slug(name) {
  return (name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function sigKey(personName) {
  return "signature_" + slug(personName);
}

// A signature capture box: draw with a finger/mouse/stylus right on the
// device, or reuse a signature you've saved before (keyed by the name typed
// into the field above it). Fully self-contained — drop it in next to any
// "name" field and wire its value into the report you're saving.
export default function SignaturePad({ label, personName, value, onChange }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const fileInputRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPtRef = useRef(null);
  const [mode, setMode] = useState(value ? "image" : "draw"); // "draw" | "image"
  const [hasSaved, setHasSaved] = useState(false);
  const [remember, setRemember] = useState(false);
  const [checking, setChecking] = useState(false);

  // Keep the visible mode in sync if the parent's value is reset (e.g. Clear
  // Answers / new report) or pre-filled (e.g. editing an existing report).
  useEffect(() => {
    setMode(value ? "image" : "draw");
  }, [value]);

  // Look up whether a saved signature already exists for whatever name is
  // currently typed above, so we can offer "Use my saved signature".
  useEffect(() => {
    let cancelled = false;
    const name = (personName || "").trim();
    if (!name || !window.storage) { setHasSaved(false); return; }
    setChecking(true);
    window.storage.get(sigKey(name), true)
      .then((res) => { if (!cancelled) setHasSaved(!!res); })
      .catch(() => { if (!cancelled) setHasSaved(false); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [personName]);

  function setupCanvas() {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ratio = window.devicePixelRatio || 1;
    const width = wrap.clientWidth;
    const height = 130;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a2e";
  }

  useEffect(() => {
    if (mode !== "draw") return;
    setupCanvas();
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mode]);

  function pointFromEvent(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPtRef.current = pointFromEvent(e);
  }

  function handlePointerMove(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pt = pointFromEvent(e);
    const last = lastPtRef.current;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPtRef.current = pt;
  }

  async function handlePointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    onChange && onChange(dataUrl);
    if (remember && (personName || "").trim()) {
      await saveSignature(dataUrl);
    }
  }

  async function saveSignature(dataUrl) {
    const name = (personName || "").trim();
    if (!name || !window.storage) return;
    try {
      await window.storage.set(sigKey(name), JSON.stringify({ name, dataUrl, savedAt: new Date().toISOString() }), true);
      setHasSaved(true);
    } catch (e) {
      // non-fatal — the signature is still attached to this report either way
    }
  }

  async function useSaved() {
    const name = (personName || "").trim();
    if (!name || !window.storage) return;
    try {
      const res = await window.storage.get(sigKey(name), true);
      if (res) {
        const parsed = JSON.parse(res.value);
        onChange && onChange(parsed.dataUrl);
        setMode("image");
      }
    } catch (e) {
      alert("Could not load your saved signature.");
    }
  }

  function triggerUpload() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    // allow choosing the same file again later
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (photo or picture of a signature).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("That image is too large. Please choose a photo under 8MB.");
      return;
    }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      onChange && onChange(dataUrl);
      setMode("image");
      if (remember && (personName || "").trim()) {
        await saveSignature(dataUrl);
      }
    } catch (e) {
      alert("Could not read that image. Please try a different file.");
    }
  }

  function clearSignature() {
    onChange && onChange("");
    setMode("draw");
    // give the freshly-rendered canvas a tick to mount before wiping it
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setupCanvas();
    }, 0);
  }

  const boxStyle = {
    border: "1.5px dashed #d8d5cc", borderRadius: 10, background: "#fff",
    padding: mode === "draw" ? 0 : 10, overflow: "hidden",
  };

  return (
    <div style={{ marginTop: 8 }}>
      {label && <div style={{ fontSize: 11.5, color: "#8a8778", fontWeight: 500, marginBottom: 4 }}>{label}</div>}

      <div ref={wrapRef} style={boxStyle}>
        {mode === "draw" ? (
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: 130, touchAction: "none", cursor: "crosshair" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        ) : (
          <img src={value} alt="Signature" style={{ display: "block", height: 90, maxWidth: "100%", objectFit: "contain" }} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <button
          type="button"
          onClick={triggerUpload}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "transparent",
            color: BRAND_BLUE, border: "1px solid " + BRAND_BLUE, borderRadius: 8, fontSize: 11.5, cursor: "pointer",
          }}
        >
          <Upload size={12} /> Upload from device
        </button>

        <button
          type="button"
          onClick={clearSignature}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "transparent",
            color: "#8a8778", border: "1px solid #d8d5cc", borderRadius: 8, fontSize: 11.5, cursor: "pointer",
          }}
        >
          <Eraser size={12} /> Clear
        </button>

        {hasSaved && !checking && (
          <button
            type="button"
            onClick={useSaved}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "transparent",
              color: BRAND_BLUE, border: "1px solid " + BRAND_BLUE, borderRadius: 8, fontSize: 11.5, cursor: "pointer",
            }}
          >
            <Check size={12} /> Use my saved signature
          </button>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#8a8778", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={remember}
            onChange={async (e) => {
              setRemember(e.target.checked);
              if (e.target.checked && value) await saveSignature(value);
            }}
          />
          Remember this signature for next time
        </label>
      </div>
    </div>
  );
}
