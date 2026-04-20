import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Uncaught error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
                    <p className="text-lg font-bold text-slate-800">Something went wrong</p>
                    <p className="text-sm text-slate-500">Please refresh the page to try again.</p>
                    <button
                        type="button"
                        onClick={() => location.reload()}
                        className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                    >
                        Refresh
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
