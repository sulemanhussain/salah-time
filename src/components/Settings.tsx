import NavigationBar from "./NavigationBar";

export default function Settings() {
    return (
        <div className="min-h-screen bg-slate-100 p-6 pb-28">
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                <p className="mt-2 text-sm text-slate-600">
                    This is a placeholder settings page. We can add profile, notifications, and app preferences here.
                </p>

                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
                    <p className="text-sm font-medium text-slate-700">Coming soon</p>
                    <p className="mt-1 text-xs text-slate-500">
                        Account controls, theme preferences, and privacy options will appear here.
                    </p>
                </div>
            </div>

            <NavigationBar />
        </div>
    );
}
