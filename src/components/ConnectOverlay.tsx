import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PROFILE } from '../data/profile';

interface ConnectOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectOverlay({ isOpen, onClose }: ConnectOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [inquiryType, setInquiryType] = useState('Software Development');

  useEffect(() => {
    if (!isOpen) return;

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.65, ease: 'power4.out' }
      );
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hello Ajay,\nMy name is ${name || 'a visitor'}.\nInquiry: ${inquiryType}\nDetails: ${message || 'I would like to discuss a project with you.'}`
    );
    window.open(`https://wa.me/919488001018?text=${text}`, '_blank');
  };

  const handleEmailSend = () => {
    const subject = encodeURIComponent(`Project Inquiry: ${inquiryType} - ${name || 'New Client'}`);
    const body = encodeURIComponent(`Hello Ajay,\n\n${message || 'I would like to discuss working together.'}\n\nFrom: ${name}`);
    window.location.href = `mailto:${PROFILE.contacts.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#0b0b0b]/95 backdrop-blur-xl flex flex-col overflow-y-auto custom-scrollbar select-text text-[#cee49f]"
    >
      {/* Top Header */}
      <div className="sticky top-0 z-20 flex justify-between items-center px-6 md:px-16 py-6 bg-[#0b0b0b]/80 backdrop-blur-md border-b border-[#cee49f]/15">
        <div className="flex items-center gap-4">
          <span className="mono text-[calc(10*var(--px))] text-[#cee49f] opacity-60">
            CONNECT / DISPATCH
          </span>
          <span className="opacity-30">/</span>
          <span className="mono text-[calc(10*var(--px))] text-[#cee49f] uppercase tracking-wider">
            DIRECT CHANNELS
          </span>
        </div>

        <button
          onClick={onClose}
          className="pill flex items-center gap-2 hover:bg-[#cee49f] hover:text-[#0b0b0b] transition-colors"
          aria-label="Close connect"
        >
          <span>CLOSE</span>
          <span className="text-xs">✕</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="max-w-5xl mx-auto w-full px-6 md:px-12 py-12 md:py-20">
        <div className="mb-12">
          <div className="mono text-xs text-[#cee49f]/60 uppercase tracking-widest mb-4">
            AVAILABILITY: OPEN FOR DIRECT CONTRACTS
          </div>
          <h1 className="font-sans-bold text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight leading-[0.9]">
            LET'S TALK
          </h1>
          <p className="font-serif-light text-xl md:text-2xl opacity-80 mt-4 max-w-2xl">
            Whether you need a custom software tool, complete office network setup, or reliable local technical support.
          </p>
        </div>

        {/* Direct Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* WhatsApp Card */}
          <a
            href={PROFILE.contacts.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="p-6 md:p-8 bg-[#cee49f]/5 border border-[#cee49f]/20 hover:border-[#cee49f] rounded-[2px] transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="mono text-[10px] uppercase tracking-widest text-[#cee49f]/60">
                  FASTEST RESPONSE · &lt; 2 HRS
                </div>
                <h3 className="font-sans-bold text-2xl uppercase mt-2 group-hover:text-white transition-colors">
                  WhatsApp Direct
                </h3>
                <p className="mono text-sm mt-1 text-[#cee49f]/90">
                  {PROFILE.contacts.primaryPhone}
                </p>
              </div>
              <span className="text-xl">↗</span>
            </div>
            <p className="text-xs opacity-70 mt-6">
              Chat directly in Tamil or English. No ticketing queues or bots.
            </p>
          </a>

          {/* Email Card */}
          <a
            href={`mailto:${PROFILE.contacts.email}`}
            className="p-6 md:p-8 bg-[#cee49f]/5 border border-[#cee49f]/20 hover:border-[#cee49f] rounded-[2px] transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="mono text-[10px] uppercase tracking-widest text-[#cee49f]/60">
                  FORMAL SPECIFICATIONS
                </div>
                <h3 className="font-sans-bold text-2xl uppercase mt-2 group-hover:text-white transition-colors">
                  Email Dispatch
                </h3>
                <p className="mono text-sm mt-1 text-[#cee49f]/90">
                  {PROFILE.contacts.email}
                </p>
              </div>
              <span className="text-xl">↗</span>
            </div>
            <p className="text-xs opacity-70 mt-6">
              Send project briefs, RFP documents, or technical requirements.
            </p>
          </a>

          {/* Phone Call Card */}
          <a
            href={`tel:${PROFILE.contacts.primaryPhone.replace(/\s+/g, '')}`}
            className="p-6 bg-[#cee49f]/5 border border-[#cee49f]/20 hover:border-[#cee49f] rounded-[2px] transition-colors"
          >
            <div className="mono text-[10px] uppercase tracking-widest opacity-60">
              VOICE CALL
            </div>
            <div className="font-sans-bold text-xl uppercase mt-1">
              {PROFILE.contacts.primaryPhone}
            </div>
            <div className="mono text-xs opacity-60 mt-1">
              Alt: {PROFILE.contacts.secondaryPhone}
            </div>
          </a>

          {/* Location Card */}
          <div className="p-6 bg-[#cee49f]/5 border border-[#cee49f]/20 rounded-[2px]">
            <div className="mono text-[10px] uppercase tracking-widest opacity-60">
              PHYSICAL BASE
            </div>
            <div className="font-sans-bold text-xl uppercase mt-1">
              Tirunelveli, Tamil Nadu
            </div>
            <div className="mono text-xs opacity-60 mt-1">
              India · IST (UTC +5:30)
            </div>
          </div>
        </div>

        {/* Interactive Direct Dispatch Form */}
        <div className="p-8 md:p-10 border border-[#cee49f]/30 rounded-[2px] bg-[#0b0b0b]">
          <h3 className="font-sans-bold text-2xl uppercase tracking-tight mb-2">
            Send an Instant Brief
          </h3>
          <p className="mono text-xs opacity-70 mb-6">
            Fill in your details to launch directly in WhatsApp or Email.
          </p>

          <form onSubmit={handleWhatsAppSend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mono text-xs uppercase tracking-wider block opacity-70 mb-2">
                  Your Name / Business
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh / Royal Builders"
                  className="w-full px-4 py-3 bg-[#161616] border border-[#cee49f]/25 rounded-[2px] text-[#cee49f] font-mono text-sm focus:outline-none focus:border-[#cee49f]"
                />
              </div>

              <div>
                <label className="mono text-xs uppercase tracking-wider block opacity-70 mb-2">
                  Inquiry Nature
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-4 py-3 bg-[#161616] border border-[#cee49f]/25 rounded-[2px] text-[#cee49f] font-mono text-sm focus:outline-none focus:border-[#cee49f]"
                >
                  <option value="Software Development">Software Development (Custom Tool)</option>
                  <option value="LedgeSoft License">LedgeSoft Inquiries (Construction)</option>
                  <option value="Network & IT Infrastructure">Network & Wi-Fi Setup</option>
                  <option value="Annual Maintenance">Annual Maintenance (AMC)</option>
                  <option value="General Consultation">General Technical Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mono text-xs uppercase tracking-wider block opacity-70 mb-2">
                Project Overview / Requirements
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your current setup, problem, or vision..."
                className="w-full px-4 py-3 bg-[#161616] border border-[#cee49f]/25 rounded-[2px] text-[#cee49f] font-mono text-sm focus:outline-none focus:border-[#cee49f]"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#cee49f] text-[#0b0b0b] font-mono-medium font-bold text-xs uppercase tracking-wider rounded-[2px] hover:opacity-90 transition-opacity"
              >
                DISPATCH VIA WHATSAPP ↗
              </button>
              <button
                type="button"
                onClick={handleEmailSend}
                className="px-8 py-3.5 border border-[#cee49f] text-[#cee49f] font-mono-medium text-xs uppercase tracking-wider rounded-[2px] hover:bg-[#cee49f]/10 transition-colors"
              >
                DISPATCH VIA EMAIL ↗
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
