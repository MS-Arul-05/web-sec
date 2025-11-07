import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const generateCaptchaText = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [error, setError] = useState('');
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawCaptcha = useCallback((text: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 20; i++) {
            ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        ctx.font = 'bold 30px "Comic Sans MS", cursive, sans-serif';
        ctx.fillStyle = '#0369a1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.setTransform(1, -0.1, 0.1, 1, 0, 0);
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 5);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

    }, []);

    const refreshCaptcha = useCallback(() => {
        const newCaptcha = generateCaptchaText();
        setCaptchaText(newCaptcha);
        drawCaptcha(newCaptcha);
    }, [drawCaptcha]);

    useEffect(() => {
        refreshCaptcha();
    }, [refreshCaptcha]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
            setError('Captcha does not match. Please try again.');
            refreshCaptcha();
            setCaptchaInput('');
            return;
        }
        if (!name || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        onLogin({ name, email });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-sky-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-slate-800">Login to secure-web</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-slate-600">Name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                     <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-600">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                     <div>
                        <label htmlFor="password" className="text-sm font-medium text-slate-600">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                    </div>

                    <div>
                         <label htmlFor="captcha" className="text-sm font-medium text-slate-600">Captcha</label>
                         <div className="flex items-center gap-4 mt-1">
                            <canvas ref={canvasRef} width="150" height="40" className="border rounded-md cursor-pointer" onClick={refreshCaptcha} title="Click to refresh"></canvas>
                             <button type="button" onClick={refreshCaptcha} className="p-2 text-sky-700 hover:text-sky-500" title="Refresh CAPTCHA">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" /></svg>
                             </button>
                         </div>
                        <input id="captcha" type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <button type="submit" className="w-full py-2 px-4 bg-sky-500 text-white font-semibold rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">Login</button>
                </form>
            </div>
        </div>
    );
};