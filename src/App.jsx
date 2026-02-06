import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_ALIGN = { x: 0, y: 0, scale: 100 };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function UploadPanel({
  title,
  titleClassName,
  type,
  imageSrc,
  align,
  isDragOver,
  inputRef,
  onFileChange,
  onDrop,
  onDragStateChange,
}) {
  const transform = `translate(${align.x}%, ${align.y}%) scale(${align.scale / 100})`;

  const preventDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleZoneClick = (event) => {
    if (event.target === inputRef.current) return;
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col">
      <h2 className={`mb-2 text-center text-lg font-semibold ${titleClassName}`}>{title}</h2>
      <div
        className={`drop-zone rounded-lg border border-gray-200 bg-gray-50 p-4 ${isDragOver ? "is-dragover" : ""}`}
        onClick={handleZoneClick}
        onDragEnter={(event) => {
          preventDefaults(event);
          onDragStateChange(true);
        }}
        onDragOver={(event) => {
          preventDefaults(event);
          onDragStateChange(true);
        }}
        onDragLeave={(event) => {
          preventDefaults(event);
          onDragStateChange(false);
        }}
        onDrop={(event) => {
          preventDefaults(event);
          onDragStateChange(false);
          onDrop(event.dataTransfer.files?.[0], type);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-600"
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onFileChange(event, type)}
        />
        <div className="mt-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-200">
          {imageSrc ? (
            <img
              src={imageSrc}
              className="h-full w-full object-cover"
              style={{ transform, transformOrigin: "center center" }}
              alt={`${type} preview`}
            />
          ) : (
            <span className="text-sm text-gray-500">Preview</span>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">Drop image here or click to browse</p>
      </div>
    </div>
  );
}

export default function App() {
  const [beforeSrc, setBeforeSrc] = useState(null);
  const [afterSrc, setAfterSrc] = useState(null);
  const [labelBeforeText, setLabelBeforeText] = useState("BEFORE");
  const [labelAfterText, setLabelAfterText] = useState("AFTER");
  const [sliderOrientation, setSliderOrientation] = useState("vertical");
  const [alignTarget, setAlignTarget] = useState("before");
  const [alignState, setAlignState] = useState({
    before: { ...DEFAULT_ALIGN },
    after: { ...DEFAULT_ALIGN },
  });
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [sliderSplit, setSliderSplit] = useState(50);
  const [staticImageData, setStaticImageData] = useState("");
  const [dragOver, setDragOver] = useState({ before: false, after: false });

  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);
  const sliderContainerRef = useRef(null);
  const isDraggingRef = useRef(false);

  const canGenerate = Boolean(beforeSrc && afterSrc);

  const beforeTransform = `translate(${alignState.before.x}%, ${alignState.before.y}%) scale(${alignState.before.scale / 100})`;
  const afterTransform = `translate(${alignState.after.x}%, ${alignState.after.y}%) scale(${alignState.after.scale / 100})`;

  const overlayClipPath = useMemo(() => {
    if (sliderOrientation === "horizontal") {
      return `inset(0 0 ${100 - sliderSplit}% 0)`;
    }
    return `inset(0 ${100 - sliderSplit}% 0 0)`;
  }, [sliderOrientation, sliderSplit]);

  const handleFile = useCallback((file, type) => {
    if (!file || !file.type?.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result;
      if (!src) return;
      if (type === "before") {
        setBeforeSrc(src);
      } else {
        setAfterSrc(src);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = useCallback(
    (event, type) => {
      handleFile(event.target.files?.[0], type);
      event.target.value = "";
    },
    [handleFile],
  );

  const setDynamicHeight = useCallback(async () => {
    if (!beforeSrc || !afterSrc || !sliderContainerRef.current) return false;
    const [img1, img2] = await Promise.all([loadImage(beforeSrc), loadImage(afterSrc)]);
    const containerWidth = sliderContainerRef.current.offsetWidth;
    if (!containerWidth) return false;
    const ratio1 = img1.naturalHeight / img1.naturalWidth;
    const ratio2 = img2.naturalHeight / img2.naturalWidth;
    const calculatedHeight = Math.max(ratio1, ratio2) * containerWidth;
    sliderContainerRef.current.style.height = `${calculatedHeight}px`;
    return true;
  }, [beforeSrc, afterSrc]);

  const generateStaticImage = useCallback(async () => {
    if (!beforeSrc || !afterSrc) return;
    const [img1, img2] = await Promise.all([loadImage(beforeSrc), loadImage(afterSrc)]);

    const h = Math.max(img1.naturalHeight, img2.naturalHeight);
    const w1 = (img1.naturalWidth * h) / img1.naturalHeight;
    const w2 = (img2.naturalWidth * h) / img2.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w1 + w2;
    canvas.height = h + 80;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const beforeScale = alignState.before.scale / 100;
    const afterScale = alignState.after.scale / 100;
    const beforeOffsetX = (alignState.before.x / 100) * w1;
    const beforeOffsetY = (alignState.before.y / 100) * h;
    const afterOffsetX = (alignState.after.x / 100) * w2;
    const afterOffsetY = (alignState.after.y / 100) * h;

    ctx.drawImage(img1, beforeOffsetX, 80 + beforeOffsetY, w1 * beforeScale, h * beforeScale);
    ctx.drawImage(img2, w1 + afterOffsetX, 80 + afterOffsetY, w2 * afterScale, h * afterScale);

    ctx.font = "bold 50px sans-serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText(labelBeforeText || "BEFORE", w1 / 2, 55);
    ctx.fillText(labelAfterText || "AFTER", w1 + w2 / 2, 55);

    setStaticImageData(canvas.toDataURL("image/png"));
  }, [afterSrc, alignState, beforeSrc, labelAfterText, labelBeforeText]);

  const updateSliderFromClientPosition = useCallback(
    (clientX, clientY) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      if (sliderOrientation === "horizontal") {
        if (!rect.height) return;
        const clampedY = Math.max(0, Math.min(rawY, rect.height));
        setSliderSplit((clampedY / rect.height) * 100);
      } else {
        if (!rect.width) return;
        const clampedX = Math.max(0, Math.min(rawX, rect.width));
        setSliderSplit((clampedX / rect.width) * 100);
      }
    },
    [sliderOrientation],
  );

  useEffect(() => {
    if (!isResultVisible || !canGenerate) return;
    generateStaticImage();
  }, [canGenerate, generateStaticImage, isResultVisible]);

  useEffect(() => {
    if (!isResultVisible || !canGenerate) return;
    let frameOne = 0;
    let frameTwo = 0;
    let timeout = 0;

    const run = () => {
      setDynamicHeight().then((isReady) => {
        if (isReady) return;
        timeout = window.setTimeout(() => {
          setDynamicHeight().catch(() => {});
        }, 120);
      });
    };

    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(run);
    });

    const onResize = () => {
      setDynamicHeight().catch(() => {});
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(frameOne);
      window.cancelAnimationFrame(frameTwo);
      if (timeout) window.clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, [canGenerate, isResultVisible, setDynamicHeight]);

  const onGenerate = () => {
    if (!canGenerate) return;
    setIsResultVisible(true);
    setSliderSplit(50);
  };

  const onClear = () => {
    isDraggingRef.current = false;
    setBeforeSrc(null);
    setAfterSrc(null);
    setIsResultVisible(false);
    setSliderSplit(50);
    setStaticImageData("");
    setAlignTarget("before");
    setAlignState({
      before: { ...DEFAULT_ALIGN },
      after: { ...DEFAULT_ALIGN },
    });
    if (beforeInputRef.current) beforeInputRef.current.value = "";
    if (afterInputRef.current) afterInputRef.current.value = "";
    if (sliderContainerRef.current) sliderContainerRef.current.style.height = "";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 text-gray-900">
      <section className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl sm:p-10">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800 sm:text-4xl">Before & After Tool</h1>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
          <UploadPanel
            title="1. Upload Before"
            titleClassName="text-blue-600"
            type="before"
            imageSrc={beforeSrc}
            align={alignState.before}
            isDragOver={dragOver.before}
            inputRef={beforeInputRef}
            onFileChange={handleFileInputChange}
            onDrop={handleFile}
            onDragStateChange={(isOn) => setDragOver((prev) => ({ ...prev, before: isOn }))}
          />
          <UploadPanel
            title="2. Upload After"
            titleClassName="text-purple-600"
            type="after"
            imageSrc={afterSrc}
            align={alignState.after}
            isDragOver={dragOver.after}
            inputRef={afterInputRef}
            onFileChange={handleFileInputChange}
            onDrop={handleFile}
            onDragStateChange={(isOn) => setDragOver((prev) => ({ ...prev, after: isOn }))}
          />
        </div>

        <div className="mb-8 flex flex-col justify-center gap-4 border-b border-gray-200 pb-8 text-center sm:flex-row">
          <button
            className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white shadow transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            Generate Comparison
          </button>
          <button
            className="rounded-lg bg-gray-500 px-8 py-3 font-medium text-white shadow transition-all hover:bg-gray-600"
            onClick={onClear}
          >
            Clear All
          </button>
        </div>

        {isResultVisible && canGenerate && (
          <div className="space-y-12">
            <div className="flex flex-col items-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Interactive Preview</h2>
              <p className="mb-4 text-sm text-gray-500">Drag or hover to compare</p>

              <div className="mb-4 inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${
                    sliderOrientation === "vertical"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setSliderOrientation("vertical")}
                >
                  Vertical Split
                </button>
                <button
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${
                    sliderOrientation === "horizontal"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setSliderOrientation("horizontal")}
                >
                  Horizontal Split
                </button>
              </div>

              <div className="mb-5 w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-left text-sm font-semibold text-gray-700">Label Editor</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="text-sm text-gray-600">
                    Before Label
                    <input
                      type="text"
                      value={labelBeforeText}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      onChange={(event) => setLabelBeforeText(event.target.value)}
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    After Label
                    <input
                      type="text"
                      value={labelAfterText}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      onChange={(event) => setLabelAfterText(event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="mb-6 w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-left text-sm font-semibold text-gray-700">Alignment + Crop</h3>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                    <button
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                        alignTarget === "before" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => setAlignTarget("before")}
                    >
                      Adjust Before
                    </button>
                    <button
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                        alignTarget === "after" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => setAlignTarget("after")}
                    >
                      Adjust After
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { key: "x", label: "X Offset", min: -50, max: 50 },
                    { key: "y", label: "Y Offset", min: -50, max: 50 },
                    { key: "scale", label: "Zoom", min: 50, max: 150 },
                  ].map((control) => (
                    <label key={control.key} className="text-xs text-gray-600">
                      {control.label} ({alignState[alignTarget][control.key]}%)
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        value={alignState[alignTarget][control.key]}
                        className="mt-1 w-full"
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          setAlignState((prev) => ({
                            ...prev,
                            [alignTarget]: {
                              ...prev[alignTarget],
                              [control.key]: nextValue,
                            },
                          }));
                        }}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      setAlignTarget("before");
                      setAlignState({
                        before: { ...DEFAULT_ALIGN },
                        after: { ...DEFAULT_ALIGN },
                      });
                    }}
                  >
                    Reset Adjustments
                  </button>
                </div>
              </div>

              <div
                ref={sliderContainerRef}
                className={`slider-container w-full max-w-4xl rounded-xl bg-gray-200 shadow-xl ${
                  sliderOrientation === "horizontal" ? "is-horizontal" : ""
                }`}
                onPointerDown={(event) => {
                  isDraggingRef.current = true;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  updateSliderFromClientPosition(event.clientX, event.clientY);
                }}
                onPointerMove={(event) => {
                  if (!isDraggingRef.current && event.pointerType !== "mouse") return;
                  updateSliderFromClientPosition(event.clientX, event.clientY);
                }}
                onPointerUp={(event) => {
                  isDraggingRef.current = false;
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
                onPointerCancel={(event) => {
                  isDraggingRef.current = false;
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
              >
                <span className="slider-label label-after">{labelAfterText.trim() || "AFTER"}</span>
                <span className="slider-label label-before">{labelBeforeText.trim() || "BEFORE"}</span>

                <img
                  src={afterSrc}
                  alt="After"
                  className="slider-image"
                  style={{ transform: afterTransform, transformOrigin: "center center" }}
                />
                <div className="slider-overlay" style={{ clipPath: overlayClipPath }}>
                  <img
                    src={beforeSrc}
                    alt="Before"
                    className="slider-image"
                    style={{ transform: beforeTransform, transformOrigin: "center center" }}
                  />
                </div>
                <div
                  className="slider-handle"
                  style={
                    sliderOrientation === "horizontal"
                      ? { top: `${sliderSplit}%`, left: "50%" }
                      : { left: `${sliderSplit}%`, top: "50%" }
                  }
                >
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center border-t border-gray-200 pt-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Download Static Image</h2>
              <div className="mb-4 w-full max-w-2xl rounded-lg bg-gray-100 p-2">
                <img src={staticImageData} className="h-auto w-full rounded border border-gray-300" alt="Static result" />
              </div>
              <a
                href={staticImageData}
                download="comparison.png"
                className="transform rounded-lg bg-green-600 px-8 py-3 font-bold text-white shadow transition-all hover:scale-105 hover:bg-green-700"
              >
                Download Side-by-Side
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
