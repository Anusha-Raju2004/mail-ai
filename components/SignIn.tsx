"use client";

import React, { useState } from "react";

interface SignInProps {
  onSignIn: (email: string) => void;
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "email") {
      if (email.trim()) {
        setStep("password");
      }
    } else {
      if (password.trim()) {
        onSignIn(email);
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-sky-50/50 p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 shadow-xl shadow-sky-100/50">
        <div className="mb-8 flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 via-sky-500 to-teal-400 text-white shadow-md">
            <span className="text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-teal-950">Mail AI</h1>
          <p className="text-sm text-teal-700/80">
            {step === "email" ? "Sign in to continue to Mail AI" : `Welcome back`}
          </p>
        </div>

        <form onSubmit={handleNext} className="space-y-6">
          {step === "email" ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">
                Email or phone
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-sky-200 bg-sky-50/30 px-4 py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>
          ) : (
            <div>
              <div className="mb-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-900 border border-teal-100 flex justify-between items-center">
                <span className="font-medium truncate">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  Change
                </button>
              </div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-teal-700 mb-2">
                Enter your password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-sky-200 bg-sky-50/30 px-4 py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            {step === "email" ? (
              <a href="#" className="text-xs font-semibold text-teal-600 hover:underline">
                Forgot email?
              </a>
            ) : (
              <a href="#" className="text-xs font-semibold text-teal-600 hover:underline">
                Forgot password?
              </a>
            )}

            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-all"
            >
              {step === "email" ? "Next" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}