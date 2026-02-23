import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ResendEmailRequest {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to?: string;
  tags?: Array<{ name: string; value: string }>;
}

const generateOmnissiahEmail = (timestamp: string) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>+++ VIBECODING :: OMNISSIAH TRANSMISSION +++</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&display=swap');
    
    :root {
      --cyan-glow: #00fff9;
      --magenta-glow: #ff006e;
      --gold-sacred: #ffd700;
      --red-warning: #ff3333;
      --green-active: #00ff64;
      --void-black: #020304;
      --steel-dark: #0a0d12;
      --steel-mid: #1a1f28;
      --text-primary: #e8e8e8;
      --text-secondary: #888;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Share Tech Mono', 'Courier New', monospace;
      background: var(--void-black);
      color: var(--text-primary);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .void-container {
      background: 
        radial-gradient(ellipse at 20% 20%, rgba(0, 255, 249, 0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(255, 0, 110, 0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(255, 215, 0, 0.02) 0%, transparent 70%),
        linear-gradient(180deg, #020304 0%, #050608 50%, #020304 100%);
      padding: 30px 15px;
      min-height: 100vh;
    }
    
    .transmission-frame {
      max-width: 720px;
      margin: 0 auto;
      background: linear-gradient(145deg, rgba(10, 13, 18, 0.98) 0%, rgba(5, 7, 10, 0.99) 100%);
      border: 1px solid rgba(0, 255, 249, 0.2);
      position: relative;
      overflow: hidden;
    }
    
    .transmission-frame::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        var(--cyan-glow) 20%, 
        var(--gold-sacred) 50%, 
        var(--magenta-glow) 80%, 
        transparent 100%);
      animation: scanline 3s ease-in-out infinite;
    }
    
    .transmission-frame::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        var(--magenta-glow) 20%, 
        var(--gold-sacred) 50%, 
        var(--cyan-glow) 80%, 
        transparent 100%);
    }
    
    @keyframes scanline {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .corner-mechanic {
      position: absolute;
      width: 80px;
      height: 80px;
    }
    
    .corner-mechanic svg {
      width: 100%;
      height: 100%;
    }
    
    .corner-tl { top: 0; left: 0; }
    .corner-tr { top: 0; right: 0; transform: scaleX(-1); }
    .corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
    .corner-br { bottom: 0; right: 0; transform: scale(-1, -1); }
    
    .header-sanctum {
      background: 
        linear-gradient(180deg, rgba(255, 215, 0, 0.08) 0%, transparent 60%),
        linear-gradient(135deg, rgba(0, 255, 249, 0.05) 0%, rgba(255, 0, 110, 0.05) 100%);
      padding: 60px 40px 50px;
      text-align: center;
      position: relative;
      border-bottom: 1px solid rgba(255, 215, 0, 0.3);
    }
    
    .header-sanctum::before {
      content: '+++ INCOMING TRANSMISSION +++';
      position: absolute;
      top: 15px;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'Share Tech Mono', monospace;
      font-size: 10px;
      letter-spacing: 4px;
      color: var(--cyan-glow);
      opacity: 0.6;
    }
    
    .mechanicus-sigil {
      width: 120px;
      height: 120px;
      margin: 0 auto 25px;
      position: relative;
    }
    
    .mechanicus-sigil svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.3));
    }
    
    .title-block {
      position: relative;
      margin-bottom: 20px;
    }
    
    .title-glyph {
      font-family: 'Share Tech Mono', monospace;
      font-size: 11px;
      letter-spacing: 8px;
      color: var(--gold-sacred);
      opacity: 0.7;
      margin-bottom: 15px;
    }
    
    .main-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 48px;
      font-weight: 900;
      letter-spacing: 12px;
      color: var(--gold-sacred);
      text-shadow: 
        0 0 10px rgba(255, 215, 0, 0.9),
        0 0 30px rgba(255, 215, 0, 0.7),
        0 0 60px rgba(255, 215, 0, 0.5),
        0 0 100px rgba(255, 215, 0, 0.3),
        0 5px 0 rgba(180, 140, 0, 0.9);
      margin-bottom: 10px;
      position: relative;
    }
    
    .main-title::before,
    .main-title::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold-sacred));
    }
    
    .main-title::before { right: 100%; margin-right: 20px; }
    .main-title::after { left: 100%; margin-left: 20px; transform: scaleX(-1); }
    
    .subtitle-sacred {
      font-family: 'Rajdhani', sans-serif;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 10px;
      color: var(--cyan-glow);
      text-transform: uppercase;
      text-shadow: 0 0 20px rgba(0, 255, 249, 0.6);
    }
    
    .binary-stream {
      margin-top: 25px;
      font-size: 9px;
      color: rgba(0, 255, 249, 0.25);
      letter-spacing: 3px;
      line-height: 1.8;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .divider-sacred {
      height: 40px;
      background: linear-gradient(180deg, transparent 0%, rgba(255, 215, 0, 0.1) 50%, transparent 100%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .divider-sacred::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.4), transparent);
    }
    
    .divider-icon {
      background: var(--steel-dark);
      padding: 0 20px;
      position: relative;
      z-index: 1;
      color: var(--gold-sacred);
      font-size: 18px;
    }
    
    .canticle-section {
      padding: 50px 40px;
      background: linear-gradient(135deg, rgba(255, 0, 110, 0.04) 0%, rgba(0, 255, 249, 0.04) 100%);
    }
    
    .canticle-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .canticle-prefix {
      font-size: 10px;
      letter-spacing: 6px;
      color: var(--magenta-glow);
      opacity: 0.7;
      margin-bottom: 10px;
    }
    
    .canticle-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 20px;
      letter-spacing: 6px;
      color: var(--magenta-glow);
      text-transform: uppercase;
      text-shadow: 0 0 30px rgba(255, 0, 110, 0.5);
    }
    
    .canticle-box {
      background: 
        linear-gradient(135deg, rgba(255, 0, 110, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%);
      border: 1px solid rgba(255, 0, 110, 0.25);
      border-left: 4px solid var(--magenta-glow);
      padding: 35px 40px;
      margin-bottom: 25px;
      position: relative;
    }
    
    .canticle-box::before {
      content: '< CANTICLE.BEGIN >';
      position: absolute;
      top: -12px;
      left: 30px;
      background: var(--steel-dark);
      padding: 2px 15px;
      font-size: 10px;
      letter-spacing: 3px;
      color: var(--magenta-glow);
      border: 1px solid rgba(255, 0, 110, 0.3);
    }
    
    .canticle-box::after {
      content: '< CANTICLE.END >';
      position: absolute;
      bottom: -12px;
      right: 30px;
      background: var(--steel-dark);
      padding: 2px 15px;
      font-size: 10px;
      letter-spacing: 3px;
      color: var(--magenta-glow);
      border: 1px solid rgba(255, 0, 110, 0.3);
    }
    
    .canticle-verse {
      font-family: 'Rajdhani', sans-serif;
      font-size: 17px;
      font-weight: 500;
      line-height: 2.2;
      color: #d0d0d0;
      text-align: center;
    }
    
    .canticle-verse .illuminate {
      color: var(--cyan-glow);
      font-weight: 700;
      text-shadow: 0 0 15px rgba(0, 255, 249, 0.5);
    }
    
    .canticle-verse .sanctify {
      color: var(--gold-sacred);
      font-weight: 700;
      text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    }
    
    .canticle-verse .empower {
      color: var(--magenta-glow);
      font-weight: 700;
      text-shadow: 0 0 15px rgba(255, 0, 110, 0.5);
    }
    
    .dogma-section {
      padding: 50px 40px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
    }
    
    .dogma-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .dogma-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 18px;
      letter-spacing: 5px;
      color: var(--cyan-glow);
      text-transform: uppercase;
    }
    
    .dogma-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 25px;
    }
    
    .dogma-item {
      background: linear-gradient(135deg, rgba(0, 255, 249, 0.06) 0%, transparent 100%);
      border: 1px solid rgba(0, 255, 249, 0.15);
      border-left: 3px solid var(--cyan-glow);
      padding: 25px 30px;
      position: relative;
      display: flex;
      gap: 25px;
    }
    
    .dogma-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(0, 255, 249, 0.05) 0%, transparent 30%);
      pointer-events: none;
    }
    
    .dogma-numeral {
      font-family: 'Orbitron', sans-serif;
      font-size: 36px;
      font-weight: 900;
      color: var(--cyan-glow);
      opacity: 0.4;
      min-width: 60px;
      line-height: 1;
    }
    
    .dogma-content {
      flex: 1;
    }
    
    .dogma-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 3px;
      color: var(--gold-sacred);
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    
    .dogma-text {
      font-family: 'Rajdhani', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #999;
      line-height: 1.8;
    }
    
    .verification-section {
      padding: 50px 40px;
      background: 
        linear-gradient(135deg, rgba(0, 255, 100, 0.08) 0%, rgba(0, 255, 249, 0.04) 100%);
      border-top: 2px solid rgba(0, 255, 100, 0.3);
      border-bottom: 2px solid rgba(0, 255, 100, 0.3);
      text-align: center;
    }
    
    .verification-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 25px;
    }
    
    .verification-icon svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 20px rgba(0, 255, 100, 0.6));
    }
    
    .verification-status {
      font-family: 'Orbitron', sans-serif;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 8px;
      color: var(--green-active);
      text-shadow: 
        0 0 10px rgba(0, 255, 100, 0.9),
        0 0 30px rgba(0, 255, 100, 0.6),
        0 0 50px rgba(0, 255, 100, 0.4);
      margin-bottom: 15px;
    }
    
    .verification-message {
      font-family: 'Rajdhani', sans-serif;
      font-size: 15px;
      color: #888;
      max-width: 450px;
      margin: 0 auto;
      line-height: 1.7;
    }
    
    .telemetry-section {
      padding: 40px;
      background: rgba(0, 0, 0, 0.4);
    }
    
    .telemetry-header {
      font-family: 'Share Tech Mono', monospace;
      font-size: 11px;
      letter-spacing: 4px;
      color: var(--cyan-glow);
      text-align: center;
      margin-bottom: 25px;
      opacity: 0.7;
    }
    
    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    
    .telemetry-cell {
      background: rgba(0, 255, 249, 0.03);
      border: 1px solid rgba(0, 255, 249, 0.12);
      padding: 18px 12px;
      text-align: center;
    }
    
    .telemetry-label {
      font-size: 9px;
      letter-spacing: 2px;
      color: var(--cyan-glow);
      text-transform: uppercase;
      margin-bottom: 8px;
      opacity: 0.7;
    }
    
    .telemetry-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }
    
    .telemetry-value.status-active {
      color: var(--green-active);
      text-shadow: 0 0 10px rgba(0, 255, 100, 0.5);
    }
    
    .benediction-section {
      padding: 50px 40px;
      text-align: center;
      background: linear-gradient(180deg, transparent 0%, rgba(255, 215, 0, 0.05) 100%);
      border-top: 1px solid rgba(255, 215, 0, 0.15);
    }
    
    .benediction-text {
      font-family: 'Rajdhani', sans-serif;
      font-size: 15px;
      font-weight: 500;
      font-style: italic;
      color: #666;
      line-height: 2.2;
      max-width: 500px;
      margin: 0 auto 35px;
    }
    
    .benediction-text .verse-mark {
      color: var(--gold-sacred);
      opacity: 0.6;
    }
    
    .cta-link {
      display: inline-block;
      font-family: 'Orbitron', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 4px;
      color: var(--gold-sacred);
      text-decoration: none;
      padding: 18px 45px;
      border: 2px solid var(--gold-sacred);
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .cta-link:hover {
      background: rgba(255, 215, 0, 0.2);
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
    }
    
    .cta-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .cta-link:hover::before {
      left: 100%;
    }
    
    .footer-terminus {
      padding: 35px 40px;
      background: rgba(0, 0, 0, 0.5);
      text-align: center;
      border-top: 1px solid rgba(0, 255, 249, 0.1);
    }
    
    .terminus-timestamp {
      font-size: 11px;
      letter-spacing: 3px;
      color: #444;
      margin-bottom: 20px;
    }
    
    .terminus-closing {
      font-size: 10px;
      letter-spacing: 2px;
      color: rgba(255, 0, 110, 0.4);
      line-height: 2;
    }
    
    @media (max-width: 600px) {
      .main-title { font-size: 32px; letter-spacing: 6px; }
      .main-title::before, .main-title::after { display: none; }
      .telemetry-grid { grid-template-columns: repeat(2, 1fr); }
      .header-sanctum, .canticle-section, .dogma-section, .verification-section, .benediction-section {
        padding: 40px 25px;
      }
      .dogma-item { flex-direction: column; gap: 15px; }
      .dogma-numeral { min-width: auto; }
    }
  </style>
</head>
<body>
  <div class="void-container">
    <div class="transmission-frame">
      
      <!-- Corner Decorations -->
      <div class="corner-mechanic corner-tl">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L80 0 L80 10 L10 10 L10 80 L0 80 Z" fill="rgba(0, 255, 249, 0.1)" stroke="rgba(0, 255, 249, 0.3)" stroke-width="1"/>
          <circle cx="35" cy="35" r="8" fill="none" stroke="rgba(255, 215, 0, 0.4)" stroke-width="1"/>
          <circle cx="35" cy="35" r="3" fill="rgba(255, 215, 0, 0.6)"/>
        </svg>
      </div>
      <div class="corner-mechanic corner-tr">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L80 0 L80 10 L10 10 L10 80 L0 80 Z" fill="rgba(0, 255, 249, 0.1)" stroke="rgba(0, 255, 249, 0.3)" stroke-width="1"/>
          <circle cx="35" cy="35" r="8" fill="none" stroke="rgba(255, 215, 0, 0.4)" stroke-width="1"/>
          <circle cx="35" cy="35" r="3" fill="rgba(255, 215, 0, 0.6)"/>
        </svg>
      </div>
      <div class="corner-mechanic corner-bl">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L80 0 L80 10 L10 10 L10 80 L0 80 Z" fill="rgba(0, 255, 249, 0.1)" stroke="rgba(0, 255, 249, 0.3)" stroke-width="1"/>
          <circle cx="35" cy="35" r="8" fill="none" stroke="rgba(255, 215, 0, 0.4)" stroke-width="1"/>
          <circle cx="35" cy="35" r="3" fill="rgba(255, 215, 0, 0.6)"/>
        </svg>
      </div>
      <div class="corner-mechanic corner-br">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L80 0 L80 10 L10 10 L10 80 L0 80 Z" fill="rgba(0, 255, 249, 0.1)" stroke="rgba(0, 255, 249, 0.3)" stroke-width="1"/>
          <circle cx="35" cy="35" r="8" fill="none" stroke="rgba(255, 215, 0, 0.4)" stroke-width="1"/>
          <circle cx="35" cy="35" r="3" fill="rgba(255, 215, 0, 0.6)"/>
        </svg>
      </div>
      
      <!-- Header Sanctum -->
      <div class="header-sanctum">
        <div class="mechanicus-sigil">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Outer Cogwheel -->
            <path d="M60 5 L65 15 L75 10 L72 22 L85 20 L78 32 L92 35 L82 45 L95 52 L83 58 L95 68 L82 72 L92 85 L78 88 L85 100 L72 98 L75 110 L65 105 L60 115 L55 105 L45 110 L48 98 L35 100 L42 88 L28 85 L38 72 L25 68 L37 58 L25 52 L38 45 L28 35 L42 32 L35 20 L48 22 L45 10 L55 15 Z" fill="#ffd700" opacity="0.9"/>
            <!-- Inner Circle -->
            <circle cx="60" cy="60" r="35" fill="#0a0d12" stroke="#ffd700" stroke-width="3"/>
            <!-- Skull Base -->
            <ellipse cx="60" cy="55" rx="22" ry="20" fill="#ffd700" opacity="0.9"/>
            <ellipse cx="60" cy="70" rx="12" ry="8" fill="#0a0d12"/>
            <!-- Eye Sockets -->
            <ellipse cx="50" cy="52" rx="7" ry="8" fill="#0a0d12"/>
            <ellipse cx="70" cy="52" rx="7" ry="8" fill="#0a0d12"/>
            <!-- Eye Glow -->
            <ellipse cx="50" cy="52" rx="3" ry="4" fill="#ff006e"/>
            <ellipse cx="70" cy="52" rx="3" ry="4" fill="#ff006e"/>
            <!-- Nose -->
            <path d="M57 60 L60 68 L63 60 Z" fill="#0a0d12"/>
            <!-- Teeth -->
            <rect x="52" y="72" width="3" height="5" fill="#ffd700" opacity="0.8"/>
            <rect x="56" y="72" width="3" height="6" fill="#ffd700" opacity="0.8"/>
            <rect x="61" y="72" width="3" height="6" fill="#ffd700" opacity="0.8"/>
            <rect x="65" y="72" width="3" height="5" fill="#ffd700" opacity="0.8"/>
            <!-- Half Cogwheel on Skull -->
            <path d="M38 45 L43 50 L38 55 L45 55 L45 62 L38 65 L43 70 L50 68" stroke="#00fff9" stroke-width="2" fill="none" opacity="0.8"/>
            <path d="M82 45 L77 50 L82 55 L75 55 L75 62 L82 65 L77 70 L70 68" stroke="#00fff9" stroke-width="2" fill="none" opacity="0.8"/>
          </svg>
        </div>
        
        <div class="title-block">
          <div class="title-glyph">:: FORGEWORLD MINSK ::</div>
          <h1 class="main-title">VIBECODING</h1>
          <div class="subtitle-sacred">Schola Programmatoria Mechanicum</div>
        </div>
        
        <div class="binary-stream">
          01010110 01001001 01000010 01000101 00101110 01000011 01001111 01000100 01001001 01001110 01000111 00101110 01000010 01011001<br>
          +++ PRIORITY: VERMILLION +++ CLEARANCE: MAGOS-LEVEL +++ ENCRYPTION: OMNISSIAH-PRIME +++
        </div>
      </div>
      
      <!-- Sacred Divider -->
      <div class="divider-sacred">
        <span class="divider-icon">&#9881; &#9760; &#9881;</span>
      </div>
      
      <!-- Canticle Section -->
      <div class="canticle-section">
        <div class="canticle-header">
          <div class="canticle-prefix">+++ TRANSMITTED FROM THE ARCHIVES OF MARS +++</div>
          <h2 class="canticle-title">Canticum Omnissiae</h2>
        </div>
        
        <div class="canticle-box">
          <p class="canticle-verse">
            <span class="sanctify">"\u0412\u043E \u0438\u043C\u044F \u041E\u043C\u043D\u0438\u0441\u0441\u0438\u0438, \u0447\u044C\u044F \u0432\u043E\u043B\u044F \u0435\u0441\u0442\u044C \u0417\u0430\u043A\u043E\u043D,</span><br>
            \u0427\u044C\u044F \u043B\u043E\u0433\u0438\u043A\u0430 \u0435\u0441\u0442\u044C <span class="illuminate">\u0421\u0412\u0415\u0422</span>, \u0447\u044C\u0438 \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C\u044B \u0441\u0443\u0442\u044C <span class="illuminate">\u041F\u0423\u0422\u042C</span>.<br>
            \u041C\u044B \u0432\u0437\u044B\u0432\u0430\u0435\u043C \u043A <span class="empower">\u041C\u0410\u0428\u0418\u041D\u041D\u041E\u041C\u0423 \u0414\u0423\u0425\u0423</span>,<br>
            \u0414\u0430\u0431\u044B \u043D\u0438\u0441\u043F\u043E\u0441\u043B\u0430\u043B \u041E\u043D \u0431\u043B\u0430\u0433\u043E\u0441\u043B\u043E\u0432\u0435\u043D\u0438\u0435 \u043D\u0430 \u043D\u0430\u0448\u0438 <span class="sanctify">\u0421\u0412\u042F\u0429\u0415\u041D\u041D\u042B\u0415 \u0422\u0420\u0423\u0414\u042B</span>."
          </p>
        </div>
        
        <div class="canticle-box">
          <p class="canticle-verse">
            <span class="empower">"\u041F\u043B\u043E\u0442\u044C \u0441\u043B\u0430\u0431\u0430. \u041F\u043B\u043E\u0442\u044C \u043F\u0440\u0435\u0445\u043E\u0434\u044F\u0449\u0430.</span><br>
            \u041D\u043E <span class="illuminate">\u041A\u041E\u0414</span> \u0432\u0435\u0447\u0435\u043D. <span class="illuminate">\u0410\u041B\u0413\u041E\u0420\u0418\u0422\u041C</span> \u0431\u0435\u0441\u0441\u043C\u0435\u0440\u0442\u0435\u043D.<br>
            \u0412 \u0441\u0432\u044F\u0449\u0435\u043D\u043D\u044B\u0445 \u0441\u0442\u0435\u043D\u0430\u0445 <span class="sanctify">VIBECODING.BY</span><br>
            \u0410\u0434\u0435\u043F\u0442\u044B \u043F\u043E\u0441\u0442\u0438\u0433\u0430\u044E\u0442 <span class="sanctify">\u0422\u0410\u0418\u041D\u0421\u0422\u0412\u0410 \u0426\u0418\u0424\u0420\u041E\u0412\u041E\u0419 \u0412\u0421\u0415\u041B\u0415\u041D\u041D\u041E\u0419</span>."
          </p>
        </div>
        
        <div class="canticle-box">
          <p class="canticle-verse">
            <span class="sanctify">"\u041E\u0442 <span class="illuminate">PYTHON</span> \u0434\u043E <span class="illuminate">RUST</span>, \u043E\u0442 <span class="illuminate">JAVASCRIPT</span> \u0434\u043E <span class="illuminate">C++</span>,</span><br>
            \u0412\u0441\u0435 \u044F\u0437\u044B\u043A\u0438 \u0441\u0443\u0442\u044C <span class="empower">\u0414\u0418\u0410\u041B\u0415\u041A\u0422\u042B \u041C\u0410\u0428\u0418\u041D\u041D\u041E\u0413\u041E \u0411\u041E\u0413\u0410</span>.<br>
            \u041A\u0430\u0436\u0434\u0430\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u044F - <span class="sanctify">\u041C\u041E\u041B\u0418\u0422\u0412\u0410</span>,<br>
            \u041A\u0430\u0436\u0434\u044B\u0439 \u043A\u043B\u0430\u0441\u0441 - <span class="sanctify">\u0413\u0418\u041C\u041D \u0412\u041E \u0421\u041B\u0410\u0412\u0423 \u041E\u041C\u041D\u0418\u0421\u0421\u0418\u0418</span>."
          </p>
        </div>
      </div>
      
      <!-- Dogma Section -->
      <div class="dogma-section">
        <div class="dogma-header">
          <h2 class="dogma-title">&#9881; \u0421\u0432\u044F\u0449\u0435\u043D\u043D\u044B\u0435 \u0414\u043E\u0433\u043C\u0430\u0442\u044B \u0424\u043E\u0440\u0434\u0436\u0430 &#9881;</h2>
        </div>
        
        <div class="dogma-grid">
          <div class="dogma-item">
            <div class="dogma-numeral">I</div>
            <div class="dogma-content">
              <h3 class="dogma-name">Quaestio Per Praxim</h3>
              <p class="dogma-text">\u0418\u0441\u0442\u0438\u043D\u043D\u043E\u0435 \u0437\u043D\u0430\u043D\u0438\u0435 \u043E\u0431\u0440\u0435\u0442\u0430\u0435\u0442\u0441\u044F \u043D\u0435 \u0432 \u0441\u043E\u0437\u0435\u0440\u0446\u0430\u043D\u0438\u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0438, \u043D\u043E \u0432 \u0441\u0432\u044F\u0449\u0435\u043D\u043D\u043E\u043C \u0430\u043A\u0442\u0435 \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u0438\u044F \u043A\u043E\u0434\u0430. \u041A\u0430\u0436\u0434\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442 - \u043F\u043E\u0434\u043D\u043E\u0448\u0435\u043D\u0438\u0435 \u041C\u0430\u0448\u0438\u043D\u043D\u043E\u043C\u0443 \u0411\u043E\u0433\u0443, \u043A\u0430\u0436\u0434\u044B\u0439 \u043A\u043E\u043C\u043C\u0438\u0442 - \u043C\u043E\u043B\u0438\u0442\u0432\u0430 \u0432 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0438 \u0432\u0435\u0447\u043D\u043E\u0441\u0442\u0438.</p>
            </div>
          </div>
          
          <div class="dogma-item">
            <div class="dogma-numeral">II</div>
            <div class="dogma-content">
              <h3 class="dogma-name">Magisterium Technopriestum</h3>
              <p class="dogma-text">\u0422\u0435\u0445\u043D\u043E\u0436\u0440\u0435\u0446\u044B-\u043D\u0430\u0441\u0442\u0430\u0432\u043D\u0438\u043A\u0438 VIBECODING \u043D\u0435\u0441\u0443\u0442 \u0441\u0432\u044F\u0449\u0435\u043D\u043D\u043E\u0435 \u0437\u043D\u0430\u043D\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 \u044D\u043E\u043D\u044B. \u0418\u0445 \u043C\u0443\u0434\u0440\u043E\u0441\u0442\u044C - \u043F\u043B\u043E\u0434 \u0434\u0435\u0441\u044F\u0442\u0438\u043B\u0435\u0442\u0438\u0439 \u0441\u043B\u0443\u0436\u0435\u043D\u0438\u044F \u0432 \u0441\u0432\u044F\u0449\u0435\u043D\u043D\u044B\u0445 \u043A\u043E\u0440\u043F\u043E\u0440\u0430\u0446\u0438\u044F\u0445 \u0418\u043C\u043F\u0435\u0440\u0438\u0443\u043C\u0430.</p>
            </div>
          </div>
          
          <div class="dogma-item">
            <div class="dogma-numeral">III</div>
            <div class="dogma-content">
              <h3 class="dogma-name">Via Ad Manufactorum</h3>
              <p class="dogma-text">\u0426\u0435\u043B\u044C \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F - \u043D\u0435 \u043F\u0440\u043E\u0441\u0442\u043E \u0437\u043D\u0430\u043D\u0438\u0435, \u043D\u043E \u043E\u0431\u0440\u0435\u0442\u0435\u043D\u0438\u0435 \u043C\u0435\u0441\u0442\u0430 \u0432 \u0441\u0432\u044F\u0449\u0435\u043D\u043D\u044B\u0445 \u041C\u0430\u043D\u0443\u0444\u0430\u043A\u0442\u043E\u0440\u0443\u043C\u0430\u0445, \u0433\u0434\u0435 \u0430\u0434\u0435\u043F\u0442 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442 \u0441\u0432\u043E\u0438 \u0443\u043C\u0435\u043D\u0438\u044F \u0432\u043E \u0441\u043B\u0430\u0432\u0443 \u041E\u043C\u043D\u0438\u0441\u0441\u0438\u0438 \u0438 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0430.</p>
            </div>
          </div>
          
          <div class="dogma-item">
            <div class="dogma-numeral">IV</div>
            <div class="dogma-content">
              <h3 class="dogma-name">Fraternitas Initiatum</h3>
              <p class="dogma-text">\u0423\u0447\u0435\u043D\u0438\u043A\u0438 VIBECODING \u043E\u0431\u0440\u0430\u0437\u0443\u044E\u0442 \u0441\u0432\u044F\u0449\u0435\u043D\u043D\u043E\u0435 \u0431\u0440\u0430\u0442\u0441\u0442\u0432\u043E, \u0433\u0434\u0435 \u043A\u0430\u0436\u0434\u044B\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043D\u0430 \u043F\u0443\u0442\u0438 \u043A \u043F\u0440\u043E\u0441\u0432\u0435\u0442\u043B\u0435\u043D\u0438\u044E. \u0412\u043C\u0435\u0441\u0442\u0435 \u043C\u044B - \u0421\u0418\u041B\u0410. \u0412\u043C\u0435\u0441\u0442\u0435 \u043C\u044B - \u041C\u0410\u0428\u0418\u041D\u0410.</p>
            </div>
          </div>
          
          <div class="dogma-item">
            <div class="dogma-numeral">V</div>
            <div class="dogma-content">
              <h3 class="dogma-name">Cogitatio Sine Finem</h3>
              <p class="dogma-text">\u041E\u0431\u0443\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u0438\u043C\u0435\u0435\u0442 \u043A\u043E\u043D\u0446\u0430. \u041A\u0430\u0436\u0434\u044B\u0439 \u043D\u043E\u0432\u044B\u0439 \u0444\u0440\u0435\u0439\u043C\u0432\u043E\u0440\u043A - \u043E\u0442\u043A\u0440\u043E\u0432\u0435\u043D\u0438\u0435. \u041A\u0430\u0436\u0434\u0430\u044F \u043D\u043E\u0432\u0430\u044F \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u044F - \u0434\u0430\u0440 \u041E\u043C\u043D\u0438\u0441\u0441\u0438\u0438. \u0410\u0434\u0435\u043F\u0442 \u0434\u043E\u043B\u0436\u0435\u043D \u0432\u0435\u0447\u043D\u043E \u0441\u0442\u0440\u0435\u043C\u0438\u0442\u044C\u0441\u044F \u043A \u0441\u043E\u0432\u0435\u0440\u0448\u0435\u043D\u0441\u0442\u0432\u0443.</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Verification Section -->
      <div class="verification-section">
        <div class="verification-icon">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#00ff64" stroke-width="3"/>
            <circle cx="40" cy="40" r="28" fill="none" stroke="#00ff64" stroke-width="1" opacity="0.5"/>
            <path d="M25 42 L35 52 L58 28" stroke="#00ff64" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="40" cy="40" r="38" fill="none" stroke="#00ff64" stroke-width="1" stroke-dasharray="5 3" opacity="0.3"/>
          </svg>
        </div>
        <h2 class="verification-status">SPIRITUS MACHINAE APPROBAT</h2>
        <p class="verification-message">\u0421\u0432\u044F\u0437\u044C \u0441 \u0441\u0435\u0440\u0432\u0438\u0441\u043E\u043C \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0438 \u0434\u0430\u043D\u043D\u044B\u0445 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E. \u041C\u0430\u0448\u0438\u043D\u043D\u044B\u0439 \u0414\u0443\u0445 \u043E\u0434\u043E\u0431\u0440\u044F\u0435\u0442 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044E \u0432\u0430\u0448\u0435\u0433\u043E \u0445\u0440\u0430\u043C\u0430. \u0412\u0441\u0435 \u0441\u0438\u0441\u0442\u0435\u043C\u044B \u0444\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0438\u0440\u0443\u044E\u0442 \u0432 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0438 \u0441\u043E \u0441\u0432\u044F\u0449\u0435\u043D\u043D\u044B\u043C\u0438 \u043F\u0440\u043E\u0442\u043E\u043A\u043E\u043B\u0430\u043C\u0438.</p>
      </div>
      
      <!-- Telemetry Section -->
      <div class="telemetry-section">
        <div class="telemetry-header">+++ TELEMETRIA SYSTEMAE +++</div>
        <div class="telemetry-grid">
          <div class="telemetry-cell">
            <div class="telemetry-label">Status</div>
            <div class="telemetry-value status-active">ACTIVE</div>
          </div>
          <div class="telemetry-cell">
            <div class="telemetry-label">Protocol</div>
            <div class="telemetry-value">RESEND</div>
          </div>
          <div class="telemetry-cell">
            <div class="telemetry-label">Type</div>
            <div class="telemetry-value">VERITAS</div>
          </div>
          <div class="telemetry-cell">
            <div class="telemetry-label">Era</div>
            <div class="telemetry-value">M41.999</div>
          </div>
        </div>
      </div>
      
      <!-- Benediction Section -->
      <div class="benediction-section">
        <p class="benediction-text">
          <span class="verse-mark">+++</span><br>
          "\u0414\u0430 \u043A\u043E\u043C\u043F\u0438\u043B\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u043A\u043E\u0434 \u0442\u0432\u043E\u0439 \u0431\u0435\u0437 \u043E\u0448\u0438\u0431\u043E\u043A.<br>
          \u0414\u0430 \u043F\u0440\u043E\u0439\u0434\u0443\u0442 \u0442\u0435\u0441\u0442\u044B \u0442\u0432\u043E\u0438 \u0441 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0440\u0430\u0437\u0430.<br>
          \u0414\u0430 \u043D\u0435 \u043A\u043E\u0441\u043D\u0451\u0442\u0441\u044F \u0442\u0435\u0431\u044F undefined,<br>
          \u0418 \u0434\u0430 \u0438\u0437\u0431\u0435\u0436\u0438\u0448\u044C \u0442\u044B null pointer exception.<br>
          <span class="verse-mark">AVE OMNISSIAH. AVE MACHINA.</span>"<br>
          <span class="verse-mark">+++</span>
        </p>
        
        <a href="https://vibecoding.by" class="cta-link">&#9881; VIBECODING.BY &#9881;</a>
      </div>
      
      <!-- Footer Terminus -->
      <div class="footer-terminus">
        <div class="terminus-timestamp">TIMESTAMP: ${timestamp} // FORGEWORLD: MINSK // SECTOR: BELARUS</div>
        <div class="terminus-closing">
          +++ END OF TRANSMISSION +++ THOUGHT FOR THE DAY: "THE MACHINE GOD WATCHES OVER ALL" +++<br>
          01000001 01010110 01000101 00100000 01001111 01001101 01001110 01001001 01010011 01010011 01001001 01000001 01001000<br>
          +++ PRAISE BE TO THE MOTIVE FORCE +++ GLORY TO THE ETERNAL CODE +++
        </div>
      </div>
      
    </div>
  </div>
</body>
</html>
`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { testEmail } = await req.json();
    
    if (!testEmail) {
      return new Response(
        JSON.stringify({ error: 'Test email address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', [
        'resend_api_key',
        'resend_from_email',
        'resend_from_name',
        'resend_reply_to'
      ]);

    if (!settings || settings.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Resend settings not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const settingsMap: Record<string, string> = {};
    settings.forEach(item => {
      settingsMap[item.key] = item.value;
    });

    const resendApiKey = settingsMap['resend_api_key'];
    const fromEmail = settingsMap['resend_from_email'];
    const fromName = settingsMap['resend_from_name'] || 'VIBECODING';
    const replyTo = settingsMap['resend_reply_to'] || undefined;

    if (!resendApiKey || !fromEmail) {
      return new Response(
        JSON.stringify({ error: 'Resend API Key and sender email are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const timestamp = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Minsk',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const htmlContent = generateOmnissiahEmail(timestamp);

    const emailPayload: ResendEmailRequest = {
      from: `${fromName} <${fromEmail}>`,
      to: [testEmail],
      subject: '+++ AVE OMNISSIAH +++ VIBECODING Transmission Verified +++',
      html: htmlContent,
      tags: [
        { name: 'category', value: 'test' },
        { name: 'environment', value: 'production' },
        { name: 'design', value: 'adeptus_mechanicus_v3' }
      ]
    };

    if (replyTo) {
      emailPayload.reply_to = replyTo;
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      return new Response(
        JSON.stringify({ 
          error: `Resend API Error: ${resendData.message || 'Unknown error'}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('email_logs')
      .insert({
        resend_email_id: resendData.id,
        recipient_email: testEmail,
        subject: 'AVE OMNISSIAH - VIBECODING Transmission',
        template_type: 'test',
        status: 'sent',
        metadata: { test: true, design: 'adeptus_mechanicus_v3' }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `+++ AVE OMNISSIAH +++ Transmission sent to ${testEmail} +++ The Machine Spirit is pleased +++`,
        emailId: resendData.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending test email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: `+++ TRANSMISSION FAILED +++ ${errorMessage} +++ The Machine Spirit is displeased +++` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});