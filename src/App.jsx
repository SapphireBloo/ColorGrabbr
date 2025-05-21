// src/App.jsx
import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import "./App.css";
import logo from "./assets/logo.png";
import {
  hexToRgb,
  hexToHsl,
  getContrast,
  getColorName,
  getBestTextColor
} from "./Utils/colorUtils";
import { motion, AnimatePresence } from "framer-motion";
import { signUp, logIn } from "./utils/firebaseAuth";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";



function App() {
  const [color, setColor] = useState("#aabbcc");
  const [imageURL, setImageURL] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [copiedSwatchIndex, setCopiedSwatchIndex] = useState(null);
const [showSignupModal, setShowSignupModal] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
// Signup/Login form inputs
const [signupEmail, setSignupEmail] = useState("");
const [signupPassword, setSignupPassword] = useState("");
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [authError, setAuthError] = useState("");
const [user, setUser] = useState(null);



  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("colorHistory")) || [];
  });

  const [colorFormat, setColorFormat] = useState("hex");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const displayColor =
      colorFormat === "hex"
        ? color
        : colorFormat === "hsl"
        ? hexToHsl(color)
        : hexToRgb(color);
    navigator.clipboard.writeText(displayColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const handleSignup = async () => {
  if (!signupEmail || !signupPassword) {
    setAuthError("Please fill in both fields.");
    return;
  }

  console.log("Signing up with:", signupEmail, signupPassword);  // Check if values are correct

  const result = await signUp(signupEmail, signupPassword);
  if (result.error) {
    setAuthError(result.error);  // Display any error messages
  } else {
    setAuthError("");
    setShowSignupModal(false);
    // Optionally set user state if needed
    console.log("Account created successfully!");
  }
};


const handleLogin = async () => {
  const result = await logIn(loginEmail, loginPassword);
  if (result.error) {
    setAuthError(result.error);
  } else {
    setAuthError("");
    setShowLoginModal(false);
    // optionally show welcome message or set user state
  }
};


  const setColorAndSave = (newColor) => {
    setColor(newColor);

    setHistory((prev) => {
      const updated = [newColor, ...prev.filter((c) => c !== newColor)].slice(0, 10);
      localStorage.setItem("colorHistory", JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Image file handling
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageURL(e.target.result);
    reader.readAsDataURL(file);
  };
  const handleInputChange = (e) => handleFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Pick pixel color from canvas
  const handleCanvasClick = (e) => {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const { left, top } = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - left);
    const y = Math.floor(e.clientY - top);
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
     const pickedHex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  setColorAndSave(pickedHex);
  };

  const handleFormatChange = (fmt) => setColorFormat(fmt);
  const displayColor =
    colorFormat === "hex"
      ? color
      : colorFormat === "hsl"
      ? hexToHsl(color)
      : hexToRgb(color);

      useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
  return () => unsubscribe(); // Clean up on unmount
}, []);

const handleLogout = async () => {
  try {
    await signOut(getAuth());
    setUser(null);
  } catch (err) {
    console.error("Logout error:", err);
  }
};

  return (
    <>
    <div className="top-banner">
  <div className="logo-wrapper">
    <img src={logo} alt="Logo" className="logo" />
  </div>

  {/* Left-aligned toggle */}
  <div className="toggle-wrapper">
    <label className="dark-mode-toggle">
      <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
      <span className="slider"></span>
      <span className="mode-label">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
    </label>
  </div>

 <div className="auth-buttons">
  {user ? (
    <div className="user-info">
      <span className="user-email">{user.email}</span>
      <button className="auth-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  ) : (
    <>
      <button className="auth-btn" onClick={() => setShowSignupModal(true)}>
        Sign Up
      </button>
      <button className="auth-btn" onClick={() => setShowLoginModal(true)}>
        Login
      </button>
    </>
  )}
</div>


</div>


      <div className={`app ${isDarkMode ? "dark" : "light"}`}>
        <h1>Simple, Sleek, Useful</h1>

        <HexColorPicker color={color} onChange={setColorAndSave} />

        <p>      
  Color Name: <strong>{getColorName(color)}</strong>
</p>
<p>
  Color Value:{" "}
  <span className="rotating-color" style={{ color: displayColor }}>
    {displayColor}
  </span>
</p>
        <div className="contrast-info">
          <p>Contrast vs white: {getContrast(color, "#ffffff")} The higher the value the better!</p>
          <p>Contrast vs black: {getContrast(color, "#000000")} The higher the value the better!</p>
        </div>

        {history.length > 0 && (
          <div className="color-history">
            <div className="history-header">
              <h3 className="rotating-color">Recent Colors</h3>
              <button onClick={() => setIsHistoryCollapsed(prev => !prev)} className="collapse-btn">
                {isHistoryCollapsed ? "Show" : "Hide"}
              </button>
            </div>

            {!isHistoryCollapsed && (
      <div className="history-swatches">
  {history.map((c, index) => {
  const textColor = getBestTextColor(c);
  const isCopied = copiedSwatchIndex === index;

  return (
    <div
      key={index}
      className="swatch"
      style={{ backgroundColor: c }}
      onClick={() => setColorAndSave(c)}
    >
      <span
        className="swatch-title"
        style={{ color: textColor }}
      >
        {getColorName(c)}
      </span>

      <div className="copy-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="copy-icon"
          onClick={() => {
            navigator.clipboard.writeText(c);
            setCopiedSwatchIndex(index);
            setTimeout(() => setCopiedSwatchIndex(null), 1500);
          }}
          title="Copy color"
        >
          📋
        </button>

        {isCopied && <div className="copy-tooltip">Copied!</div>}
      </div>
    </div>
  );
})}

</div>


            )}
          </div>
        )}

        <button onClick={handleCopy} className="copy-button">
          {copied ? "Copied!" : "Copy"}
        </button>

        <div className="color-box" style={{ backgroundColor: color }} />

        <div className="format-buttons">
          {["hex", "hsl", "rgb"].map((fmt) => (
            <button
              key={fmt}
              className={colorFormat === fmt ? "active" : ""}
              onClick={() => handleFormatChange(fmt)}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>

        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("fileInput").click()}
          tabIndex={0}
        >
          <p>
            <strong>Drag &amp; drop an image here</strong> or click to browse
          </p>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
        </div>

        {imageURL && (
          <>
            <img
              id="uploadedImage"
              src={imageURL}
              alt="uploaded"
              style={{ display: "none" }}
              onLoad={() => {
                const canvas = document.querySelector("canvas");
                const ctx = canvas?.getContext("2d");
                const img = document.getElementById("uploadedImage");

                if (!canvas || !ctx || !img) return;

                const CANVAS_WIDTH = 600;
                const scale = CANVAS_WIDTH / img.naturalWidth;
                const scaledHeight = img.naturalHeight * scale;

                canvas.width = CANVAS_WIDTH;
                canvas.height = scaledHeight;

                ctx.drawImage(img, 0, 0, CANVAS_WIDTH, scaledHeight);
              }}
            />
            <canvas
              onClick={handleCanvasClick}
              tabIndex={0}
              style={{
                maxWidth: "100%",
                height: "auto",
                border: "1px solid #ccc",
                cursor: "crosshair"
              }}
            />
          </>
        )}

     <AnimatePresence>
  {showSignupModal && (
    <motion.div
      className="modal-overlay"
      onClick={() => setShowSignupModal(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      >
        <h2>Sign Up</h2>
      <input
  type="email"
  placeholder="Email"
  value={signupEmail}
  onChange={(e) => setSignupEmail(e.target.value)}
/>
<input
  type="password"
  placeholder="Password"
  value={signupPassword}
  onChange={(e) => setSignupPassword(e.target.value)}
/>
{authError && <p className="error-msg">{authError}</p>}
<button className="modal-btn" onClick={handleSignup}>
  Create Account
</button>

        <button className="modal-close" onClick={() => setShowSignupModal(false)}>Close</button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {showLoginModal && (
    <motion.div
      className="modal-overlay"
      onClick={() => setShowLoginModal(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      >
        <h2>Login</h2>
        <input
  type="email"
  placeholder="Email"
  value={loginEmail}
  onChange={(e) => setLoginEmail(e.target.value)}
/>
<input
  type="password"
  placeholder="Password"
  value={loginPassword}
  onChange={(e) => setLoginPassword(e.target.value)}
/>
{authError && <p className="error-msg">{authError}</p>}
<button className="modal-btn" onClick={handleLogin}>
  Log In
</button>

        <button className="modal-close" onClick={() => setShowLoginModal(false)}>Close</button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>



        <footer className="footer-banner">
  <p>&copy; {new Date().getFullYear()} ColorGrabbr.com</p>
  <div className="footer-links">
    <a href="mailto:feedback@example.com" target="_blank" rel="noopener noreferrer">Send Suggestion</a>
    <a href="https://example.com/reviews" target="_blank" rel="noopener noreferrer">Leave a Review</a>
  </div>
</footer>

      </div>
    </>
  );
}

export default App;
