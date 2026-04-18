import { Link } from "react-router-dom";
import { getAuthCookie } from "../utils/auth-cookie";
import NavigationBar from "./NavigationBar";

export default function Home() {
    const authUser = getAuthCookie();
    const displayName = authUser?.email?.split("@")[0] || "User";

    return (
        <div className="min-h-screen bg-gray-100 p-6 pb-28">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6">
                Hi, {displayName}! 👋
            </h1>

            <Link to="/app" className="text-blue-500 hover:underline">
                Go to Map
            </Link>

            <NavigationBar />
        </div>

    )
}
