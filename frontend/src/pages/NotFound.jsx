import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-6">
      <div className="max-w-xl text-center">
        {/* 404 */}
        <h1 className="text-[120px] sm:text-[170px] font-extrabold leading-none bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Sorry, the page you're looking for doesn't exist or may have been
          moved.
        </p>

        {/* Button */}
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium shadow-sm transition-colors duration-200 hover:bg-blue-700"
          >
            Go Home
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;