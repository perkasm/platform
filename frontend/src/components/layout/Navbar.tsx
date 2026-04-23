import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEdit } from "@/contexts/EditContext";
import { useNavigate } from "react-router-dom";
import { LogOut, X, Sun, Moon, Pencil, Check, Building2, Trash2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useTellerConnect } from "@/hooks/use-teller-connect";
import { tellerService, TellerEnrollment } from "@/services/teller.service";

export function Navbar() {
  const { user, logout } = useAuth();
  const { isEditMode, toggleEditMode } = useEdit();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [enrollments, setEnrollments] = useState<TellerEnrollment[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const refreshEnrollments = () => {
    tellerService.listEnrollments().then(setEnrollments).catch(() => {});
  };

  const { open: openTellerConnect } = useTellerConnect({
    onEnrollmentSaved: () => {
      setMenuOpen(false);
      refreshEnrollments();
    },
  });

  useEffect(() => {
    if (menuOpen) refreshEnrollments();
  }, [menuOpen]);

  const handleDisconnect = async (enrollmentId: number) => {
    await tellerService.deleteEnrollment(enrollmentId);
    refreshEnrollments();
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "ME";

  const displayName = user?.full_name ?? user?.email ?? "Account";

  const handleConfirmLogout = () => {
    logout();
    setMenuOpen(false);
    setConfirming(false);
    navigate("/");
  };

  const isDark = theme === "dark";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="bg-luxury-bg/80 backdrop-blur-xl border-b border-luxury-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-luxury-accent-indigo to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-glow-indigo">
            <span className="text-white text-sm font-bold font-display">P</span>
          </div>
          <span className="text-luxury-text-primary font-display font-bold text-[18px] tracking-tight">
            Perkasm
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit mode toggle */}
          <motion.button
            onClick={toggleEditMode}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isEditMode
                ? "bg-luxury-elevated text-luxury-accent-indigo"
                : "text-luxury-text-secondary hover:bg-luxury-elevated"
            }`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title={isEditMode ? "Save changes" : "Edit dashboard data"}
          >
            {isEditMode ? <Check size={17} /> : <Pencil size={17} />}
          </motion.button>

          {/* Dark mode toggle */}
          <motion.button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-luxury-text-secondary hover:bg-luxury-elevated transition-colors"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Sun size={17} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Moon size={17} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Avatar + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => { setMenuOpen(!menuOpen); setConfirming(false); }}
              title="Account"
              className="w-9 h-9 bg-gradient-to-br from-luxury-accent-indigo to-purple-600 rounded-full flex items-center justify-center shadow-md shadow-glow-indigo hover:scale-105 transition-all duration-200"
            >
              <span className="text-white text-xs font-bold">{initials}</span>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-luxury-surface border border-luxury-border shadow-xl shadow-black/40 overflow-hidden"
                >
                  {!confirming ? (
                    <>
                      <div className="px-4 py-3 border-b border-luxury-border">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-luxury-accent-indigo to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-luxury-text-primary truncate">{displayName}</p>
                            {user?.email && user.full_name && (
                              <p className="text-xs text-luxury-text-secondary truncate">{user.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Connected banks section */}
                      <div className="px-4 pt-3 pb-1 border-b border-luxury-border">
                        <p className="text-xs font-semibold text-luxury-text-muted uppercase tracking-wider mb-2">Connected Banks</p>
                        {enrollments.length === 0 ? (
                          <p className="text-xs text-luxury-text-muted pb-2">No banks connected yet.</p>
                        ) : (
                          <div className="space-y-1 mb-2">
                            {enrollments.map((e) => (
                              <div key={e.id} className="flex items-center justify-between gap-2 py-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-luxury-accent-indigo to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Building2 size={12} className="text-white" />
                                  </div>
                                  <span className="text-xs font-medium text-luxury-text-primary truncate">
                                    {e.institution_name ?? "Bank"}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDisconnect(e.id)}
                                  className="text-luxury-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                                  title="Disconnect"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => { openTellerConnect(); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 mb-1 text-xs text-luxury-accent-indigo hover:bg-luxury-elevated rounded-lg transition-colors"
                        >
                          <Plus size={13} />
                          Add bank account
                        </button>
                      </div>
                      <button
                        onClick={() => setConfirming(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-luxury-text-primary hover:bg-luxury-elevated transition-colors"
                      >
                        <LogOut size={15} className="text-luxury-text-muted" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-luxury-text-primary">Sign out?</p>
                        <button
                          onClick={() => setConfirming(false)}
                          className="text-luxury-text-muted hover:text-luxury-text-primary transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <p className="text-xs text-luxury-text-secondary mb-4">
                        You'll be returned to the home page.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirming(false)}
                          className="flex-1 py-2 rounded-lg text-xs font-medium text-luxury-text-primary border border-luxury-border hover:bg-luxury-elevated transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmLogout}
                          className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-luxury-accent-indigo to-purple-600 hover:opacity-90 transition-opacity"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
