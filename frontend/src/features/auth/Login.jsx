import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Phone, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [noHp, setNoHp] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Mengambil rute sebelum login (jika ada)
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!noHp || !password) {
            setError('Nomor HP dan Password wajib diisi');
            setIsLoading(false);
            return;
        }

        const result = await login(noHp, password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-100/50 blur-3xl"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Wargatify Logo" className="w-16 h-16 rounded-2xl shadow-sm" />
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-emerald-950 tracking-tight">
                    Wargatify
                </h2>
                <p className="mt-2 text-center text-sm text-emerald-600/80">
                    Manajemen Warga Jadi Lebih Mudah
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm shadow-emerald-100/50 sm:rounded-2xl sm:px-10 border border-emerald-50 relative z-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="no_hp" className="block text-sm font-medium text-emerald-900">
                                Nomor Handphone
                            </label>
                            <div className="mt-2 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    id="no_hp"
                                    name="no_hp"
                                    type="text"
                                    required
                                    value={noHp}
                                    onChange={(e) => setNoHp(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/20 text-emerald-900 placeholder-emerald-300 transition-colors"
                                    placeholder="0811xxxx"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-emerald-900">
                                Password
                            </label>
                            <div className="mt-2 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-emerald-50/20 text-emerald-900 placeholder-emerald-300 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm shadow-emerald-200 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Memeriksa...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <LogIn size={18} />
                                        <span>Masuk ke Akun</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
