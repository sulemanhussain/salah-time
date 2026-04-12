import { Link } from "react-router-dom";

export default function Home() {

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6">
                Hi, userName! 👋
            </h1>

            <Link to="/app" className="text-blue-500 hover:underline">
                Go to Map
            </Link>
        </div>

    )
}